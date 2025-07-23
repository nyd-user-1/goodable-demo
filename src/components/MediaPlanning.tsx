import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pen, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useModel } from "@/contexts/ModelContext";

interface MediaPlanningProps {
  problemStatement: string;
  legislativeIdea: string;
  shouldPopulateInput?: boolean;
}

export const MediaPlanning = ({ problemStatement, legislativeIdea, shouldPopulateInput }: MediaPlanningProps) => {
  const [planningInput, setPlanningInput] = useState("");
  const [mediaContent, setMediaContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { selectedModel } = useModel();

  // Auto-populate input when component is shown
  useEffect(() => {
    if (shouldPopulateInput && (problemStatement || legislativeIdea)) {
      const populatedContent = `Problem Statement: ${problemStatement}\n\nLegislative Idea: ${legislativeIdea}`;
      setPlanningInput(populatedContent);
    }
  }, [shouldPopulateInput, problemStatement, legislativeIdea]);

  const generateMediaContent = async () => {
    if (!planningInput.trim() && !problemStatement && !legislativeIdea) {
      toast({
        title: "No content to work with",
        description: "Please provide media planning input or complete the legislative process first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setMediaContent(""); // Clear previous content
    
    try {
      const prompt = `You are an expert political communications strategist and media planner. When generating media content, create:

**Press Release Structure:**
- Compelling headline with strong action verbs
- Lead paragraph answering who, what, when, where, why
- Supporting quotes from key stakeholders/officials
- Background context and supporting data
- Clear call-to-action and next steps
- Professional boilerplate conclusion

**Talking Points Format:**
- 3-5 key messages in bullet format
- Each point should be 1-2 sentences maximum
- Include anticipated counterarguments with responses
- Provide relevant statistics and sound bites
- Frame messaging for target audiences (voters, media, stakeholders)

**Social Media Post:**
- Platform-appropriate length and tone
- Include relevant hashtags (#legislation #policy)
- Compelling hook in first line
- Clear value proposition
- Call-to-action (contact representatives, share, etc.)
- Consider visual content suggestions

**Tone & Style:**
- Professional yet accessible language
- Avoid political jargon, use plain English
- Focus on real-world impact and benefits
- Maintain nonpartisan, solution-focused approach
- Emphasize urgency and importance of the issue

Generate all three deliverables as distinct, clearly labeled sections. Base content on the provided problem statement and legislative context:

${planningInput}`;

      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { prompt, type: 'media', model: selectedModel }
      });

      if (error) {
        throw new Error('Failed to generate media content');
      }

      const content = data.generatedText || "Media content generation failed. Please try again.";
      setMediaContent(content);

      toast({
        title: "Media content generated!",
        description: "Your media materials are ready for review.",
      });
      
    } catch (error) {
      toast({
        title: "Error generating media content", 
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMediaContent = async () => {
    if (!mediaContent) return;
    
    try {
      await navigator.clipboard.writeText(mediaContent);
      toast({
        title: "Copied to clipboard!",
        description: "Media content has been copied.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pen className="h-5 w-5" />
          Media Planning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="planning">Begin media planning</Label>
          <Textarea
            id="planning"
            placeholder="Prepare talking points, draft a press release, and draw up a social media post...all at once."
            value={planningInput}
            onChange={(e) => setPlanningInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                generateMediaContent();
              }
            }}
            className="textarea-auto resize-none form-input"
          />
        </div>

        <Button
          onClick={generateMediaContent}
          disabled={isGenerating}
          className="button-generate touch-manipulation"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Drawing It Up...
            </>
          ) : (
            <>
              <Pen className="mr-2 h-4 w-4" />
              Draw It Up
            </>
          )}
        </Button>

        {mediaContent && (
          <div className="space-y-2">
            <Label>Generated Media Content</Label>
            <div className="bg-muted/50 p-4 rounded-lg border output-container relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyMediaContent}
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-70 hover:opacity-100 z-10"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <ScrollArea className="h-[400px] w-full pr-10">
                <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {mediaContent}
                </pre>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};