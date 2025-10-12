import { X, Download, Printer, Share2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface BillPDFSheetProps {
  isOpen: boolean;
  onClose: () => void;
  billNumber: string;
  billTitle?: string;
}

export const BillPDFSheet = ({ isOpen, onClose, billNumber, billTitle }: BillPDFSheetProps) => {
  // Clean bill number for URL (remove periods and lowercase)
  const cleanBillNumber = billNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
  const pdfUrl = `https://legislation.nysenate.gov/pdf/bills/2025/${cleanBillNumber}`;

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  const handlePrint = () => {
    const iframe = document.getElementById('pdf-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.contentWindow?.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bill ${billNumber}`,
          text: billTitle || `View Bill ${billNumber}`,
          url: pdfUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(pdfUrl);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[800px] md:w-[900px] lg:w-[1000px] sm:max-w-[90vw] p-0 flex flex-col"
      >
        <SheetHeader className="px-6 py-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <SheetTitle>Bill {billNumber} - Full Text</SheetTitle>
                {billTitle && (
                  <SheetDescription className="mt-1 text-xs">
                    {billTitle}
                  </SheetDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrint}
                title="Print"
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-muted/10">
          <iframe
            id="pdf-iframe"
            src={pdfUrl}
            className="w-full h-full"
            title={`Bill ${billNumber} PDF`}
            style={{ border: 'none' }}
          />
        </div>

        {/* Quick Actions Bar */}
        <div className="px-6 py-3 border-t bg-background flex gap-2 items-center">
          <Button variant="outline" size="sm">
            💬 Add Comment
          </Button>
          <Button variant="outline" size="sm">
            🔖 Bookmark Section
          </Button>
          <Button variant="outline" size="sm">
            📝 Take Notes
          </Button>
          <Button variant="default" size="sm" className="ml-auto">
            ✅ Mark as Reviewed
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
