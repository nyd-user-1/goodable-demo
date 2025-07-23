import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LegislativeDraft } from "@/types/legislation";
import { FileText, Download, Copy, Share, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportPanelProps {
  draft: LegislativeDraft | null;
}

export const ExportPanel = ({ draft }: ExportPanelProps) => {
  const { toast } = useToast();

  if (!draft) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Select or create a draft to export</p>
        </CardContent>
      </Card>
    );
  }

  const handleExportPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export functionality would be implemented here. Consider connecting to Supabase for server-side PDF generation.",
    });
  };

  const handleExportWord = () => {
    toast({
      title: "Word Export",
      description: "Word document export functionality would be implemented here.",
    });
  };

  const handleExportText = () => {
    const content = `${draft.title}\n\n${draft.draftContent}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Text Export",
      description: "Draft exported as text file successfully.",
    });
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(draft.draftContent);
      toast({
        title: "Copied to clipboard!",
        description: "Draft content has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    toast({
      title: "Share Draft",
      description: "Sharing functionality would be implemented here. Consider Supabase for secure draft sharing.",
    });
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Legislative Draft: ${draft.title}`);
    const body = encodeURIComponent(`Please find the legislative draft below:\n\n${draft.draftContent}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-6">
      {/* Draft Information */}
      <Card>
        <CardHeader>
          <CardTitle>Draft Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="font-medium">{draft.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <Badge variant="outline">{draft.type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(draft.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Modified</p>
              <p className="text-sm">{new Date(draft.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleExportPDF} className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>Export as PDF</span>
            </Button>
            <Button onClick={handleExportWord} variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>Export as Word</span>
            </Button>
            <Button onClick={handleExportText} variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>Export as Text</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Sharing Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleCopyToClipboard} variant="outline" className="h-16 flex-col space-y-1">
              <Copy className="h-5 w-5" />
              <span>Copy to Clipboard</span>
            </Button>
            <Button onClick={handleShare} variant="outline" className="h-16 flex-col space-y-1">
              <Share className="h-5 w-5" />
              <span>Share Link</span>
            </Button>
            <Button onClick={handleEmail} variant="outline" className="h-16 flex-col space-y-1">
              <Mail className="h-5 w-5" />
              <span>Email Draft</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-muted/50 p-6 rounded-lg max-h-96 overflow-y-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
              onClick={handleCopyToClipboard}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <div className="prose max-w-none font-serif text-sm pr-12">
              <pre className="whitespace-pre-wrap font-serif">{draft.draftContent}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};