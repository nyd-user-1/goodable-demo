import { Download, FileText, Loader2, MessageSquare, ThumbsUp, ThumbsDown, Minus, StickyNote, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [quickReviewOpen, setQuickReviewOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [sheetWidth, setSheetWidth] = useState(900);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

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

  const handleQuickReview = (action: 'support' | 'oppose' | 'neutral' | 'note') => {
    console.log(`Quick review action: ${action} for bill ${billNumber}`);
    // TODO: Save to favorites module
    setQuickReviewOpen(false);
  };

  // Handle panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      setSheetWidth(Math.max(400, Math.min(newWidth, window.innerWidth - 200)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="p-0 flex flex-col gap-0"
        style={{ width: `${sheetWidth}px`, maxWidth: '95vw' }}
      >
        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/20 group flex items-center justify-center"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="w-1 h-12 bg-border group-hover:bg-primary rounded-full transition-colors" />
        </div>

        <div className="px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold">
            Bill {billNumber} - Full Text
          </h2>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-4 px-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium mb-3">{error}</p>
                  <Button onClick={handleDownload} size="sm">
                    <Download className="h-4 w-4 mr-2" />
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

        {/* Floating AI Chat Button */}
        <button
          onClick={() => setChatOpen(true)}
          className="absolute bottom-20 left-6 bg-background border rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm"
        >
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="font-medium">Ask AI about this bill</span>
        </button>

        {/* Floating Quick Review Button */}
        <Popover open={quickReviewOpen} onOpenChange={setQuickReviewOpen}>
          <PopoverTrigger asChild>
            <button className="absolute bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all">
              <span className="text-2xl">+</span>
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-auto p-2">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => handleQuickReview('support')}
              >
                <ThumbsUp className="h-4 w-4 text-green-600" />
                Support
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => handleQuickReview('oppose')}
              >
                <ThumbsDown className="h-4 w-4 text-red-600" />
                Oppose
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => handleQuickReview('neutral')}
              >
                <Minus className="h-4 w-4 text-gray-600" />
                Neutral
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => handleQuickReview('note')}
              >
                <StickyNote className="h-4 w-4 text-yellow-600" />
                Add Note
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </SheetContent>
    </Sheet>
  );
};
