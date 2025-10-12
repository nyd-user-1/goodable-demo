import { X, Download, Printer, Share2, FileText, Loader2, MessageSquare, Bookmark, FileEdit, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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

const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

export const BillPDFSheet = ({ isOpen, onClose, billNumber, billTitle }: BillPDFSheetProps) => {
  // Clean bill number for URL (remove periods and lowercase)
  const cleanBillNumber = billNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
  const pdfUrl = `https://legislation.nysenate.gov/pdf/bills/2025/${cleanBillNumber}`;
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch PDF through CORS proxy when sheet opens
  useEffect(() => {
    if (!isOpen || !cleanBillNumber) return;

    const fetchPDF = async () => {
      setLoading(true);
      setError('');

      // Try each CORS proxy
      for (const proxy of CORS_PROXIES) {
        try {
          const response = await fetch(proxy + encodeURIComponent(pdfUrl));
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            setPdfBlobUrl(blobUrl);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn(`Failed to fetch with proxy ${proxy}:`, err);
        }
      }

      // If all proxies fail, set error
      setError('Unable to load PDF. Click Download to view in a new tab.');
      setLoading(false);
    };

    fetchPDF();

    // Cleanup blob URL when component unmounts or bill changes
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [isOpen, cleanBillNumber, pdfUrl]);

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
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold">
                Bill {billNumber}
              </SheetTitle>
              {billTitle && (
                <SheetDescription className="mt-1.5 text-sm line-clamp-2">
                  {billTitle}
                </SheetDescription>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="Download PDF"
                className="h-9 w-9"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrint}
                title="Print"
                className="h-9 w-9"
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                title="Share"
                className="h-9 w-9"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                title="Close"
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-muted/10 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="flex flex-col items-center gap-4 px-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">{error}</p>
                  <Button onClick={handleDownload} variant="default">
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          )}

          {pdfBlobUrl && !loading && !error && (
            <iframe
              id="pdf-iframe"
              src={pdfBlobUrl}
              className="w-full h-full"
              title={`Bill ${billNumber} PDF`}
              style={{ border: 'none' }}
            />
          )}
        </div>

        {/* Quick Actions Bar */}
        <div className="px-6 py-3.5 border-t bg-muted/30 flex gap-2 items-center">
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Comment
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="h-3.5 w-3.5" />
            Bookmark
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileEdit className="h-3.5 w-3.5" />
            Notes
          </Button>
          <Button variant="default" size="sm" className="ml-auto gap-2">
            <CheckCircle className="h-3.5 w-3.5" />
            Mark Reviewed
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
