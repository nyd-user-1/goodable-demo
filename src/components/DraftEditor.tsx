import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LegislativeDraft, DraftProgress } from "@/types/legislation";
import { detectLegislativeCategory, extractTitleFromIdea } from "@/utils/legislativeHelpers";
import { ProblemGenerator } from "./ProblemGenerator";
import { DraftGenerator } from "./DraftGenerator";
import { DraftDisplay } from "./DraftDisplay";
import { MediaPlanning } from "./MediaPlanning";
import { Newspaper } from "lucide-react";

interface DraftEditorProps {
  draft: LegislativeDraft | null;
  onDraftChange: (draft: LegislativeDraft) => void;
  onProgressChange?: (progress: DraftProgress) => void;
  saveTrigger?: number;
}

export const DraftEditor = ({ draft, onDraftChange, onProgressChange, saveTrigger }: DraftEditorProps) => {
  const [idea, setIdea] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [showMediaPlanning, setShowMediaPlanning] = useState(false);
  const { toast } = useToast();
  
  const ideationRef = useRef<HTMLDivElement>(null);
  const mediaPlanningRef = useRef<HTMLDivElement>(null);

  const smoothScrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start',
      inline: 'nearest'
    });
  };

  useEffect(() => {
    if (draft) {
      setIdea(draft.originalIdea);
      setDraftContent(draft.draftContent);
    }
  }, [draft]);

  useEffect(() => {
    if (saveTrigger && saveTrigger > 0) {
      saveDraft();
    }
  }, [saveTrigger]);

  const saveDraft = () => {
    const detectedCategory = detectLegislativeCategory(idea);
    const newDraft: LegislativeDraft = {
      id: draft?.id || crypto.randomUUID(),
      title: extractTitleFromIdea(idea) || "Untitled Draft",
      type: detectedCategory,
      originalIdea: idea,
      improvedIdea: "",
      draftContent,
      analysis: {
        fiscalImpact: "Analysis pending",
        implementationTimeline: "Timeline pending",
        similarLegislation: [],
        stakeholders: []
      },
      votes: draft?.votes || {
        rating: 0,
        totalVotes: 0,
        starCounts: [0, 0, 0, 0, 0]
      },
      isPublic: true,
      createdAt: draft?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onDraftChange(newDraft);
    
    // Save to localStorage
    const existingDrafts = JSON.parse(localStorage.getItem('legislativeDrafts') || '[]');
    const updatedDrafts = draft 
      ? existingDrafts.map((d: LegislativeDraft) => d.id === draft.id ? newDraft : d)
      : [...existingDrafts, newDraft];
    localStorage.setItem('legislativeDrafts', JSON.stringify(updatedDrafts));

    toast({
      title: "Draft saved!",
      description: "Your work has been saved successfully.",
    });
  };

  const handleDraftBill = (problemStatement: string) => {
    setProblemStatement(problemStatement);
    setIdea(problemStatement);
    setTimeout(() => smoothScrollTo(ideationRef), 100);
  };

  const handleEnterPressroom = () => {
    setShowMediaPlanning(true);
    setTimeout(() => smoothScrollTo(mediaPlanningRef), 100);
  };

  const handleProblemGenerated = (problem: string) => {
    setProblemStatement(problem);
  };

  const handleSaveAndSubmit = () => {
    saveDraft();
    // TODO: Add submit to public gallery functionality
    toast({
      title: "Draft saved and submitted!",
      description: "Your draft has been saved and submitted to the public gallery.",
    });
  };

  return (
    <div className="space-y-6 workflow-container smooth-scroll">
      <ProblemGenerator 
        onProblemGenerated={handleProblemGenerated} 
        onDraftBill={handleDraftBill}
      />
      
      <div ref={ideationRef}>
        <DraftGenerator
          idea={idea}
          onIdeaChange={setIdea}
          onDraftGenerated={setDraftContent}
          onProgressChange={(progress) => onProgressChange?.(progress)}
        />
      </div>

      <DraftDisplay draftContent={draftContent} />

      {(idea || draftContent) && (
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-3">
            <Button onClick={saveDraft} variant="outline" className="touch-manipulation">
              Save
            </Button>
            <Button onClick={handleSaveAndSubmit} className="touch-manipulation">
              Save and Submit
            </Button>
          </div>
          
          <Button 
            onClick={handleEnterPressroom}
            variant="outline"
            className="touch-manipulation"
          >
            <Newspaper className="mr-2 h-4 w-4" />
            Media Kit
          </Button>
        </div>
      )}

      {showMediaPlanning && (
        <div ref={mediaPlanningRef}>
          <MediaPlanning 
            problemStatement={problemStatement}
            legislativeIdea={idea}
            shouldPopulateInput={showMediaPlanning}
          />
        </div>
      )}
    </div>
  );
};