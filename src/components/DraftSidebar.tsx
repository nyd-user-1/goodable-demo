import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LegislativeDraft } from "@/types/legislation";
import { FileText, Plus, Trash2, Calendar, ChevronDown, ChevronUp, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DraftSidebarProps {
  currentDraft: LegislativeDraft | null;
  onDraftSelect: (draft: LegislativeDraft) => void;
  onSaveDraft?: () => void;
}

export const DraftSidebar = ({ currentDraft, onDraftSelect, onSaveDraft }: DraftSidebarProps) => {
  const [drafts, setDrafts] = useState<LegislativeDraft[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const savedDrafts = JSON.parse(localStorage.getItem('legislativeDrafts') || '[]');
    setDrafts(savedDrafts);
  };

  const createNewDraft = () => {
    const newDraft: LegislativeDraft = {
      id: crypto.randomUUID(),
      title: "New Draft",
      type: 'technology',
      originalIdea: "",
      improvedIdea: "",
      draftContent: "",
      analysis: {
        fiscalImpact: "",
        implementationTimeline: "",
        similarLegislation: [],
        stakeholders: []
      },
      votes: {
        rating: 0,
        totalVotes: 0,
        starCounts: [0, 0, 0, 0, 0]
      },
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedDrafts = [...drafts, newDraft];
    setDrafts(updatedDrafts);
    localStorage.setItem('legislativeDrafts', JSON.stringify(updatedDrafts));
    onDraftSelect(newDraft);

    toast({
      title: "New draft created",
      description: "Start by entering your legislative idea.",
    });
  };

  const deleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('legislativeDrafts', JSON.stringify(updatedDrafts));

    if (currentDraft?.id === draftId) {
      onDraftSelect(updatedDrafts[0] || null);
    }

    toast({
      title: "Draft deleted",
      description: "Draft has been permanently removed.",
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technology': return 'bg-blue-100 text-blue-800';
      case 'environment': return 'bg-green-100 text-green-800';
      case 'tax': return 'bg-yellow-100 text-yellow-800';
      case 'social services': return 'bg-purple-100 text-purple-800';
      case 'labor': return 'bg-orange-100 text-orange-800';
      case 'human rights': return 'bg-red-100 text-red-800';
      case 'digital rights': return 'bg-cyan-100 text-cyan-800';
      case 'education': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="border-b bg-background">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="container px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Button onClick={createNewDraft} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New
                </Button>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Drafts ({drafts.length})
                  {isOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              {onSaveDraft && (
                <Button onClick={onSaveDraft} variant="outline" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              )}
            </div>
          </div>
          
          <CollapsibleContent className="mt-4">
            {drafts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground text-center">No drafts yet</p>
                  <p className="text-xs text-muted-foreground text-center">Create your first legislative draft</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {drafts.map((draft) => (
                  <Card 
                    key={draft.id} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      currentDraft?.id === draft.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onDraftSelect(draft)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium truncate flex-1 mr-2">
                          {draft.title || 'Untitled Draft'}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => deleteDraft(draft.id, e)}
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <Badge variant="outline" className={`text-xs ${getTypeColor(draft.type)}`}>
                          {draft.type}
                        </Badge>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(draft.updatedAt)}
                        </div>
                        
                        {draft.originalIdea && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {draft.originalIdea.substring(0, 80)}...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};