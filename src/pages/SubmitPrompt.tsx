import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/ChatHeader";
import FooterSimple from "@/components/marketing/FooterSimple";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield,
  CheckCircle2,
  Send,
  ArrowUp,
  Pencil,
  Flashlight,
  FileText,
} from "lucide-react";

function decodeHtmlEntities(str: string): string {
  const textarea = document.createElement('textarea');
  let decoded = str;
  let prev = '';
  // Loop to handle double/triple-encoded entities like &amp;amp;
  while (decoded !== prev) {
    prev = decoded;
    textarea.innerHTML = decoded;
    decoded = textarea.value;
  }
  return decoded;
}

function getDomain(url: string): string | null {
  try {
    return new URL(url.trim()).hostname;
  } catch {
    return null;
  }
}

// Extract a readable title from URL path slug
function extractTitleFromUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url.trim());
    // Get the last meaningful path segment
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    // Take the last segment (most likely the article slug)
    let slug = segments[segments.length - 1];

    // Remove common file extensions
    slug = slug.replace(/\.(html?|php|aspx?)$/i, '');

    // Strip trailing hash/ID suffixes (e.g. "readable-slug-V43C40k0QyuP6ZLK")
    slug = slug.replace(/-[A-Za-z0-9]{10,}$/, (match) => {
      // Only strip if it looks like a hash (mixed case/digits, no vowels pattern)
      const candidate = match.slice(1); // remove leading dash
      const hasUpper = /[A-Z]/.test(candidate);
      const hasLower = /[a-z]/.test(candidate);
      const hasDigit = /\d/.test(candidate);
      if ((hasUpper && hasDigit) || (hasUpper && hasLower && hasDigit)) return '';
      return match; // Keep it — probably a real word
    });

    // Skip if it looks like gibberish (UUIDs, hashes, numeric IDs)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) return null; // UUID
    if (/^[0-9a-f]{20,}$/i.test(slug)) return null; // Long hex hash
    if (/^\d+$/.test(slug)) return null; // Pure numeric ID
    if (slug.length < 5) return null; // Too short to be meaningful

    // Convert slug to title case
    const title = slug
      .replace(/[-_]/g, ' ')  // Replace dashes/underscores with spaces
      .replace(/\s+/g, ' ')   // Collapse multiple spaces
      .trim()
      .split(' ')
      .map(word => {
        // Handle common acronyms/abbreviations
        const upper = word.toUpperCase();
        if (['NYS', 'NYC', 'USA', 'FBI', 'CIA', 'DOJ', 'EPA', 'FDA', 'AI', 'CEO', 'CFO'].includes(upper)) {
          return upper;
        }
        // Title case for regular words
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');

    // Skip if result is too short or still looks like gibberish
    if (title.length < 10) return null;
    if (!/[aeiou]/i.test(title)) return null; // No vowels = likely gibberish

    return title;
  } catch {
    return null;
  }
}

const AVATAR_OPTIONS = [
  '/avatars/profile-1.avif',
  '/avatars/profile-2.avif',
  '/avatars/profile-3.avif',
  '/avatars/profile-4.avif',
  '/avatars/profile-5.avif',
  '/avatars/profile-6.avif',
];

export default function SubmitPrompt() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Shared state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Mode: which form section is active
  const [mode, setMode] = useState<'url' | 'custom'>('url');

  // URL mode state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  // Custom mode state
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  // Garbage titles from bot-challenge pages
  const JUNK_TITLES = [
    'just a moment',
    'attention required',
    'access denied',
    'please wait',
    'verify you are human',
    'one more step',
    'checking your browser',
    'security check',
    'forbidden',
    'error',
  ];

  const isJunkTitle = (t: string) =>
    JUNK_TITLES.some((junk) => t.toLowerCase().startsWith(junk));

  const fetchPageTitle = useCallback(async (pageUrl: string) => {
    const d = getDomain(pageUrl);
    if (!d) return;

    setFetchingTitle(true);
    setFetchFailed(false);
    try {
      const res = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(pageUrl.trim())}`
      );
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      const html: string = json.contents || '';

      let extracted: string | null = null;

      // Try og:title first (both attribute orderings)
      const ogMatch =
        html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
      if (ogMatch?.[1]) {
        extracted = decodeHtmlEntities(ogMatch[1].trim());
      }

      // Fall back to <title>
      if (!extracted) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch?.[1]) {
          extracted = decodeHtmlEntities(titleMatch[1].trim());
        }
      }

      if (!extracted || isJunkTitle(extracted)) {
        // Fallback: try to extract title from URL slug
        const slugTitle = extractTitleFromUrl(pageUrl);
        if (slugTitle) {
          setTitle((prev) => (prev.trim() ? prev : slugTitle));
        } else {
          setFetchFailed(true);
        }
        return;
      }

      setTitle((prev) => (prev.trim() ? prev : extracted));
    } catch {
      // Fallback: try to extract title from URL slug
      const slugTitle = extractTitleFromUrl(pageUrl);
      if (slugTitle) {
        setTitle((prev) => (prev.trim() ? prev : slugTitle));
      } else {
        setFetchFailed(true);
      }
    } finally {
      setFetchingTitle(false);
    }
  }, []);

  const domain = useMemo(() => getDomain(url), [url]);
  const faviconUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    : null;

  // Google auth avatar
  const googleAvatar = user?.user_metadata?.avatar_url as string | undefined;

  // Mode switching helpers
  const switchToUrl = () => {
    if (mode !== 'url') {
      setMode('url');
      setCustomPrompt("");
      setSelectedAvatar(null);
    }
  };

  const switchToCustom = () => {
    if (mode !== 'custom') {
      setMode('custom');
      setUrl("");
      setTitle("");
      setFetchFailed(false);
      setEditingTitle(false);
    }
  };

  // Preview values based on mode
  const previewTitle = mode === 'url' ? title : customPrompt;
  const previewIcon = mode === 'url'
    ? faviconUrl
    : selectedAvatar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit a prompt.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (mode === 'url') {
      if (!title.trim() || !url.trim()) {
        toast({
          title: "Missing fields",
          description: "Please provide a title and URL.",
          variant: "destructive",
        });
        return;
      }

      if (!getDomain(url)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL (e.g. https://example.com/article).",
          variant: "destructive",
        });
        return;
      }

      setSubmitting(true);
      try {
        const generatedPrompt = `Summarize '${title.trim()}'`;

        const { error } = await (supabase.from as any)("submitted_prompts").insert({
          user_id: user.id,
          title: title.trim(),
          prompt: generatedPrompt,
          url: url.trim(),
          category: null,
        });

        if (error) throw error;

        setSubmitted(true);
        toast({
          title: "Prompt submitted!",
          description: "Your prompt has been submitted for review.",
        });
      } catch (err: any) {
        toast({
          title: "Submission failed",
          description: err.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    } else {
      // Custom mode
      if (!customPrompt.trim()) {
        toast({
          title: "Missing prompt",
          description: "Please write your prompt.",
          variant: "destructive",
        });
        return;
      }

      setSubmitting(true);
      try {
        const truncatedTitle = customPrompt.trim().length > 120
          ? customPrompt.trim().slice(0, 117) + '...'
          : customPrompt.trim();

        const { error } = await (supabase.from as any)("submitted_prompts").insert({
          user_id: user.id,
          title: truncatedTitle,
          prompt: customPrompt.trim(),
          url: null,
          category: null,
          avatar_url: selectedAvatar,
        });

        if (error) throw error;

        setSubmitted(true);
        toast({
          title: "Prompt submitted!",
          description: "Your prompt has been submitted for review.",
        });
      } catch (err: any) {
        toast({
          title: "Submission failed",
          description: err.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setTitle("");
    setUrl("");
    setCustomPrompt("");
    setSelectedAvatar(null);
    setSubmitted(false);
    setFetchFailed(false);
    setEditingTitle(false);
    setMode('url');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border shadow-lg">
            {/* Left Panel — Live Preview */}
            <div className="bg-black p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-center">
              {fetchingTitle && (
                <Shimmer duration={2} spread={1} className="text-neutral-400 text-sm mb-3 flex items-center gap-1.5">
                  <Flashlight className="h-4 w-4" />
                  Reading article...
                </Shimmer>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                Create a Prompt Card
              </h1>
              <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                See your card come to life as you fill in the form
              </p>

              {/* Live Preview Card */}
              <div className="group bg-white/10 rounded-2xl p-4 border border-white/10 transition-all duration-200 mb-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-white line-clamp-2">
                      {previewTitle || "Your headline appears here"}
                    </h4>
                    <span className="text-xs text-blue-400">0 chats</span>
                  </div>
                </div>
                {/* Bottom row: icon left, arrow right */}
                <div className="flex items-end justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {previewIcon ? (
                      <img
                        src={previewIcon}
                        alt=""
                        className="h-7 w-7 rounded-lg object-cover border border-white/20"
                      />
                    ) : mode === 'custom' ? (
                      <div className="h-7 w-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                        <FileText className="h-3.5 w-3.5 text-white/50" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-white/10 border border-white/20" />
                    )}
                  </div>
                  <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center">
                    <ArrowUp className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <p className="text-neutral-500 text-xs leading-relaxed">
                Your card will appear in the Community section after review.
                {mode === 'url'
                  ? ' When someone clicks it, NYSgpt summarizes the article.'
                  : ' When someone clicks it, NYSgpt responds to your prompt.'}
              </p>
            </div>

            {/* Right Panel — Form */}
            <div className="bg-background p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
              {submitted ? (
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Prompt Submitted!</h2>
                    <p className="text-muted-foreground text-sm">
                      Thanks for contributing! Our team will review your prompt and you'll
                      be notified once it's approved.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleReset} variant="outline">
                      Submit Another
                    </Button>
                    <Button onClick={() => navigate("/prompts#community")}>
                      Browse More
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Submit a Prompt</h2>
                    <p className="text-muted-foreground text-sm">
                      Share an article for the community to explore.
                    </p>
                  </div>

                  {/* ── URL Mode ── */}
                  <div
                    className={mode === 'custom' ? 'opacity-50 transition-opacity' : 'transition-opacity'}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="Paste the article URL"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          switchToUrl();
                        }}
                        onPaste={(e) => {
                          switchToUrl();
                          const pasted = e.clipboardData.getData('text').trim();
                          if (pasted && getDomain(pasted) && !title.trim()) {
                            setTimeout(() => fetchPageTitle(pasted), 100);
                          }
                        }}
                        onBlur={() => {
                          if (url.trim() && !title.trim()) fetchPageTitle(url);
                        }}
                        onFocus={switchToUrl}
                      />
                    </div>

                    {/* Title: auto-fetched display OR manual input */}
                    {mode === 'url' && fetchingTitle && (
                      <p className="text-sm text-muted-foreground animate-pulse mt-2">
                        Fetching title...
                      </p>
                    )}

                    {mode === 'url' && !fetchingTitle && title.trim() && !editingTitle && (
                      <div className="space-y-1 mt-2">
                        <Label>Title</Label>
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <p className="flex-1 text-sm font-medium line-clamp-2">{title}</p>
                          <button
                            type="button"
                            onClick={() => setEditingTitle(true)}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit title"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {mode === 'url' && !fetchingTitle && (editingTitle || (!title.trim() && (fetchFailed || !domain))) && (
                      <div className="space-y-2 mt-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="What's the headline?"
                          value={title}
                          onChange={(e) => { setTitle(e.target.value); setEditingTitle(true); }}
                          maxLength={120}
                          autoFocus={editingTitle}
                        />
                      </div>
                    )}
                  </div>

                  {/* ── OR Divider ── */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="border-border w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-background text-muted-foreground px-2">
                        OR
                      </span>
                    </div>
                  </div>

                  {/* ── Custom Mode ── */}
                  <div
                    className={mode === 'url' ? 'opacity-50 transition-opacity' : 'transition-opacity'}
                  >
                    <Label className="text-sm font-semibold mb-2 block">Write your own</Label>
                    <textarea
                      placeholder="Write your prompt..."
                      value={customPrompt}
                      onChange={(e) => {
                        setCustomPrompt(e.target.value);
                        switchToCustom();
                      }}
                      onFocus={switchToCustom}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />

                    {/* Avatar Picker */}
                    {mode === 'custom' && (
                      <div className="mt-3">
                        <Label className="text-xs text-muted-foreground mb-2 block">Choose an avatar (optional)</Label>
                        <div className="flex flex-wrap gap-2">
                          {googleAvatar && (
                            <button
                              type="button"
                              onClick={() => setSelectedAvatar(selectedAvatar === googleAvatar ? null : googleAvatar)}
                              className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                                selectedAvatar === googleAvatar
                                  ? 'border-foreground ring-2 ring-foreground/20'
                                  : 'border-transparent hover:border-border'
                              }`}
                            >
                              <img src={googleAvatar} alt="Your photo" className="w-full h-full object-cover" />
                            </button>
                          )}
                          {AVATAR_OPTIONS.map((avatar) => (
                            <button
                              key={avatar}
                              type="button"
                              onClick={() => setSelectedAvatar(selectedAvatar === avatar ? null : avatar)}
                              className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                                selectedAvatar === avatar
                                  ? 'border-foreground ring-2 ring-foreground/20'
                                  : 'border-transparent hover:border-border'
                              }`}
                            >
                              <img src={avatar} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      AI-assisted moderation is used to screen submissions.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-black/90"
                    disabled={submitting}
                  >
                    {submitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Prompt
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <FooterSimple />
    </div>
  );
}
