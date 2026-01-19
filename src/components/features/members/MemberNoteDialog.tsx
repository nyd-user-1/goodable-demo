import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MemberNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialNote?: string;
}

export const MemberNoteDialog = ({
  isOpen,
  onClose,
  onSave,
  initialNote = '',
}: MemberNoteDialogProps) => {
  const [noteText, setNoteText] = useState(initialNote);

  // Sync with props when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNoteText(initialNote);
    }
  }, [isOpen, initialNote]);

  const handleSave = () => {
    if (noteText.trim()) {
      onSave(noteText);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-lg shadow-lg sm:max-w-[525px] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {initialNote ? 'Edit Note' : 'Add Note'}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Textarea
            placeholder="Add your notes about this member..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-[120px] font-mono text-sm"
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={!noteText.trim()}
            >
              Save Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
