import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";

interface MobileEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: string;
  title?: string;
  onContentChange?: (content: string) => void;
  onTitleChange?: (title: string) => void;
}

export const MobileEditorDrawer = ({
  open,
  onOpenChange,
  initialContent = "",
  title = "",
  onContentChange,
  onTitleChange,
}: MobileEditorDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle>Legislation Draft</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <RichTextEditor
            initialContent={initialContent}
            title={title}
            onContentChange={onContentChange}
            onTitleChange={onTitleChange}
            className="h-full border-0 rounded-none"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};