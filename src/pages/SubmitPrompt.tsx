import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/ChatHeader";
import FooterSimple from "@/components/marketing/FooterSimple";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Lightbulb,
  Users,
  MessageSquare,
  Shield,
  CheckCircle2,
  Send,
} from "lucide-react";

const CATEGORIES = ["Bills", "Policy", "Advocacy", "Departments"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Bills: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Policy: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  Advocacy: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Departments: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

export default function SubmitPrompt() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !prompt.trim() || !category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields before submitting.",
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
      const { error } = await (supabase.from as any)("submitted_prompts").insert({
        user_id: user.id,
        title: title.trim(),
        prompt: prompt.trim(),
        category,
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
    setPrompt("");
    setCategory("");
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border shadow-lg">
            {/* Left Panel - Info */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                Share Your Prompt with the Community
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
                Help fellow New Yorkers navigate state government more effectively.
                Submit your best prompts and we'll review them for inclusion in the
                community prompt library.
              </p>

              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-yellow-500/20 p-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Share your expertise</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Your knowledge of NY government can help others ask better questions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-blue-500/20 p-2">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Build the community</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Approved prompts appear in the public library for everyone to use.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-green-500/20 p-2">
                    <MessageSquare className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Get feedback</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Our team reviews every submission and may refine prompts for clarity.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
                  Categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <span
                      key={cat}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[cat]}`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="bg-background p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
              {submitted ? (
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
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
                    <Button onClick={() => navigate("/prompts")}>
                      Back to Prompts
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Submit a Prompt</h2>
                    <p className="text-muted-foreground text-sm">
                      Fill out the details below to submit your prompt for review.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Compare two legislators' voting records"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={120}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="e.g. How did Senator [Name] and Assembly Member [Name] vote differently on education bills in the 2025 session?"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All submissions are reviewed by our team for quality and civility
                      before being published. AI-assisted moderation is used to screen
                      submissions.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
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
