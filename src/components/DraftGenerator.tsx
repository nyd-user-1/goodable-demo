
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wand2, FileText, Lightbulb } from "lucide-react";
import { MorphingHeartLoader } from "@/components/ui/MorphingHeartLoader";
import { DraftProgress } from "@/types/legislation";
import { detectLegislativeCategory, generateLegislativeDraft } from "@/utils/legislativeHelpers";
import { supabase } from "@/integrations/supabase/client";
import { useModel } from "@/contexts/ModelContext";

interface DraftGeneratorProps {
  idea: string;
  onIdeaChange: (idea: string) => void;
  onDraftGenerated: (draft: string) => void;
  onProgressChange: (progress: DraftProgress) => void;
}

export const DraftGenerator = ({ idea, onIdeaChange, onDraftGenerated, onProgressChange }: DraftGeneratorProps) => {
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const { toast } = useToast();
  const { selectedModel } = useModel();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [idea]);

  const generateDraft = async () => {
    if (!idea.trim()) {
      toast({
        title: "Please enter an idea first",
        description: "You need to provide an idea before generating a draft",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDraft(true);
    try {
      // Automatically detect the legislative category from the content
      const detectedCategory = detectLegislativeCategory(idea);
      
      const prompt = `Generate a complete legislative bill based on this idea:

Legislative Idea: ${idea}

Category: ${detectedCategory}

Please create a well-structured bill that includes:
1. Proper bill title and number placeholder
2. Short title section
3. Findings and purpose section explaining the need for this legislation
4. Definitions section for key terms
5. Operative provisions that address the legislative idea
6. Enforcement mechanisms and penalties if applicable
7. Funding provisions
8. Effective date
9. Severability clause

Use proper legislative language and formatting. Make it comprehensive but focused on the core idea provided.`;

      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { prompt, type: 'draft', model: selectedModel }
      });

      if (error) {
        throw new Error('Failed to generate legislative draft');
      }

      const draft = data.generatedText || generateLegislativeDraft(idea, detectedCategory);
      onDraftGenerated(draft);
      
      onProgressChange({
        currentStep: 3,
        totalSteps: 4,
        stepNames: ["Idea Input", "Analysis", "Draft Generation", "Review & Export"]
      });

      toast({
        title: "Draft generated successfully!",
        description: "Your legislative draft is ready for review.",
      });
    } catch (error) {
      toast({
        title: "Error generating draft",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Ideation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            id="idea"
            placeholder="Enter your idea for legislation or policy here. Be as detailed as possible and include a problem statement."
            value={idea}
            onChange={(e) => onIdeaChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                generateDraft();
              }
            }}
            className="min-h-[100px] overflow-hidden form-input"
            style={{ resize: 'none' }}
          />
        </div>

        <Button
          onClick={generateDraft}
          disabled={isGeneratingDraft}
          className="button-generate touch-manipulation"
        >
          {isGeneratingDraft ? (
            <>
              <MorphingHeartLoader size={16} className="mr-2 text-white" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
