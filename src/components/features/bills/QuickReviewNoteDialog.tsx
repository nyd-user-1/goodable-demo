import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReviewStatus } from "@/hooks/useBillReviews";

interface QuickReviewNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: ReviewStatus, note: string) => void;
  initialStatus?: ReviewStatus;
  initialNote?: string;
  draggable?: boolean;
}

export const QuickReviewNoteDialog = ({
  isOpen,
  onClose,
  onSave,
  initialStatus = null,
  initialNote = '',
  draggable = false,
}: QuickReviewNoteDialogProps) => {
  const [noteText, setNoteText] = useState(initialNote);
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus>(initialStatus);

  // Sync with props when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNoteText(initialNote);
      setSelectedStatus(initialStatus);
    }
  }, [isOpen, initialNote, initialStatus]);

  const handleSave = () => {
    onSave(selectedStatus, noteText);
    onClose();
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggable) return;

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
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center pt-20 ${draggable ? 'pointer-events-none' : ''}`}
      onClick={draggable ? undefined : onClose}
    >
      <div
        className={`bg-background border rounded-lg shadow-lg sm:max-w-[525px] w-full mx-4 ${draggable ? 'pointer-events-auto' : ''}`}
        style={draggable ? { cursor: 'move' } : undefined}
        onClick={draggable ? undefined : (e) => e.stopPropagation()}
        onMouseDown={draggable ? handleDragStart : undefined}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick Review Note</h2>
            <button
              onClick={onClose}
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
            placeholder="Add your notes about this bill..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-[120px] font-mono text-sm"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSave}>
              Save Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
