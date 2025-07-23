
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

interface PolicyDraft {
  id: string;
  title: string;
  persona: string;
  userInput: string;
  aiOutput: string;
  createdAt: string;
}

interface PolicyDraftDialogProps {
  draft: PolicyDraft | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PolicyDraftDialog = ({ draft, open, onOpenChange }: PolicyDraftDialogProps) => {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard.",
    });
  };

  if (!draft) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle className="text-left">{draft.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Created with {draft.persona} • {format(new Date(draft.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[85%]">
                  <div className="text-xs text-blue-100 mb-1">You</div>
                  <p className="text-sm whitespace-pre-wrap">{draft.userInput}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {format(new Date(draft.createdAt), "h:mm a")}
                  </p>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg max-w-[85%] relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(draft.aiOutput)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-60 hover:opacity-100"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  <div className="text-xs text-muted-foreground mb-1">{draft.persona}</div>
                  <div className="text-sm prose prose-sm max-w-none dark:prose-invert pr-8">
                    <ReactMarkdown>{draft.aiOutput}</ReactMarkdown>
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {format(new Date(draft.createdAt), "h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
