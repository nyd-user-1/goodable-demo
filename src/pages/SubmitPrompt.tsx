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

export default function SubmitPrompt() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

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
        setFetchFailed(true);
        return;
      }

      setTitle((prev) => (prev.trim() ? prev : extracted));
    } catch {
      setFetchFailed(true);
    } finally {
      setFetchingTitle(false);
    }
  }, []);

  const domain = useMemo(() => getDomain(url), [url]);
  const faviconUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit a prompt.",
        variant: "destructive",
      });
      navigate("/auth");
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
  };

  const handleReset = () => {
    setTitle("");
    setUrl("");
    setSubmitted(false);
    setFetchFailed(false);
    setEditingTitle(false);
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
                      {title || "Your headline appears here"}
                    </h4>
                    <span className="text-xs text-blue-400">0 chats</span>
                  </div>
                </div>
                {/* Bottom row: favicon left, arrow right */}
                <div className="flex items-end justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {faviconUrl ? (
                      <img
                        src={faviconUrl}
                        alt="Site favicon"
                        className="h-7 w-7 rounded-lg object-cover border border-white/20"
                      />
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
                When someone clicks it, NYSgpt summarizes the article.
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

                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="Paste the article URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData('text').trim();
                        if (pasted && getDomain(pasted) && !title.trim()) {
                          setTimeout(() => fetchPageTitle(pasted), 100);
                        }
                      }}
                      onBlur={() => {
                        if (url.trim() && !title.trim()) fetchPageTitle(url);
                      }}
                    />
                  </div>

                  {/* Title: auto-fetched display OR manual input */}
                  {fetchingTitle && (
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Fetching title...
                    </p>
                  )}

                  {!fetchingTitle && title.trim() && !editingTitle && (
                    <div className="space-y-1">
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

                  {!fetchingTitle && (editingTitle || (!title.trim() && (fetchFailed || !domain))) && (
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="What's the headline?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={120}
                        autoFocus={editingTitle}
                      />
                    </div>
                  )}

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
