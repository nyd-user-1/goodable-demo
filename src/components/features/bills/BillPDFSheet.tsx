import { Download, FileText, Loader2, MessageSquare, ThumbsUp, ThumbsDown, Minus, StickyNote, X, Check } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/integrations/supabase/types";
import { useBillReviews, ReviewStatus } from "@/hooks/useBillReviews";

type Bill = Tables<"Bills">;

interface BillPDFSheetProps {
  isOpen: boolean;
  onClose: () => void;
  billNumber: string;
  billTitle?: string;
  bill?: Bill | null;
}

const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

export const BillPDFSheet = ({ isOpen, onClose, billNumber, billTitle, bill }: BillPDFSheetProps) => {
  // Clean bill number for URL (remove periods and lowercase)
  const cleanBillNumber = billNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
  const pdfUrl = `https://legislation.nysenate.gov/pdf/bills/2025/${cleanBillNumber}`;
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [quickReviewOpen, setQuickReviewOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus>(null);
  const [sheetWidth, setSheetWidth] = useState(900);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Bill reviews hook
  const { getReviewForBill, setReviewStatus, saveReview } = useBillReviews();
  const currentReview = bill?.bill_id ? getReviewForBill(bill.bill_id) : undefined;

  // Initialize note and status from existing review when dialog opens
  useEffect(() => {
    if (noteDialogOpen && currentReview) {
      setNoteText(currentReview.note || '');
      setSelectedStatus(currentReview.review_status);
    } else if (noteDialogOpen) {
      setNoteText('');
      setSelectedStatus(null);
    }
  }, [noteDialogOpen, currentReview]);

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
    if (action === 'note') {
      setQuickReviewOpen(false);
      setNoteDialogOpen(true);
    } else {
      if (bill?.bill_id) {
        setReviewStatus(bill.bill_id, action);
      } else {
        console.warn('Quick Review: bill_id not available yet');
      }
      setQuickReviewOpen(false);
    }
  };

  const handleSaveNote = () => {
    if (bill?.bill_id) {
      saveReview(bill.bill_id, selectedStatus, noteText);
    }
    setNoteDialogOpen(false);
    setNoteText('');
    setSelectedStatus(null);
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
        {/* Resize Handle - positioned on the border */}
        <div
          ref={resizeRef}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-20 cursor-col-resize group flex items-center justify-center z-50"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="w-1 h-full bg-border group-hover:bg-primary rounded-full transition-colors" />
        </div>

        <div className="pl-4 pr-12 sm:pl-6 sm:pr-14 py-3 sm:py-4 border-b flex-shrink-0 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold">
            {billNumber}
          </h2>
          <div className="flex items-center gap-2">
            <Popover open={quickReviewOpen} onOpenChange={setQuickReviewOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Quick Review
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-auto p-2 z-[100]">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 hover:bg-muted w-full"
                    onClick={() => handleQuickReview('support')}
                  >
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    Support
                    {currentReview?.review_status === 'support' && (
                      <Check className="h-4 w-4 ml-auto text-green-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 hover:bg-muted w-full"
                    onClick={() => handleQuickReview('oppose')}
                  >
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    Oppose
                    {currentReview?.review_status === 'oppose' && (
                      <Check className="h-4 w-4 ml-auto text-red-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 hover:bg-muted w-full"
                    onClick={() => handleQuickReview('neutral')}
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                    Neutral
                    {currentReview?.review_status === 'neutral' && (
                      <Check className="h-4 w-4 ml-auto text-gray-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 hover:bg-muted w-full"
                    onClick={() => handleQuickReview('note')}
                  >
                    <StickyNote className="h-4 w-4 text-yellow-600" />
                    {currentReview?.note ? 'Edit Note' : 'Add Note'}
                    {currentReview?.note && (
                      <Check className="h-4 w-4 ml-auto text-yellow-600" />
                    )}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto relative">
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
            <div className="w-full h-full flex items-start justify-center">
              <iframe
                id="pdf-iframe"
                src={pdfBlobUrl}
                className="w-full h-full max-w-full"
                title={`${billNumber} PDF`}
                style={{
                  border: 'none',
                  minHeight: '100%',
                }}
              />
            </div>
          )}
        </div>
      </SheetContent>

      {/* Quick Review Note Dialog - Draggable without overlay */}
      {noteDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none"
        >
          <div
            className="bg-background border rounded-lg shadow-lg sm:max-w-[525px] w-full mx-4 pointer-events-auto"
            style={{
              cursor: 'move',
            }}
            onMouseDown={(e) => {
              const dialog = e.currentTarget;
              const startX = e.clientX - dialog.offsetLeft;
              const startY = e.clientY - dialog.offsetTop;

              const handleMouseMove = (e: MouseEvent) => {
                dialog.style.position = 'fixed';
                dialog.style.left = `${e.clientX - startX}px`;
                dialog.style.top = `${e.clientY - startY}px`;
                dialog.style.transform = 'none';
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Quick Review Note</h2>
                <button
                  onClick={() => setNoteDialogOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === 'support' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('support')}
                  className={selectedStatus === 'support' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Support
                </Button>
                <Button
                  variant={selectedStatus === 'oppose' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('oppose')}
                  className={selectedStatus === 'oppose' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  Oppose
                </Button>
                <Button
                  variant={selectedStatus === 'neutral' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('neutral')}
                  className={selectedStatus === 'neutral' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                >
                  <Minus className="h-3 w-3 mr-1" />
                  Neutral
                </Button>
              </div>

              <Textarea
                placeholder="No fiscal impact identified. Aligns with national initiatives. Check for similar past resolutions."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="default" onClick={handleSaveNote}>
                  Save Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
};
