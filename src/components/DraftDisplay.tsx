import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DraftDisplayProps {
  draftContent: string;
}

export const DraftDisplay = ({ draftContent }: DraftDisplayProps) => {
  const { toast } = useToast();

  const copyDraft = async () => {
    if (!draftContent) return;
    
    try {
      await navigator.clipboard.writeText(draftContent);
      toast({
        title: "Copied to clipboard!",
        description: "Legislative draft has been copied.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (!draftContent) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legislative Draft</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-lg border output-container relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyDraft}
            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-70 hover:opacity-100 z-10"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <ScrollArea className="h-[600px] w-full pr-10">
            <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
              {draftContent}
            </pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};