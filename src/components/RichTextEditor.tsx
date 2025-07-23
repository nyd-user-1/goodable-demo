import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Copy,
  Download,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RichTextEditorProps {
  initialContent?: string;
  title?: string;
  onTitleChange?: (title: string) => void;
  onContentChange?: (content: string) => void;
  className?: string;
}

export const RichTextEditor = ({
  initialContent = "",
  title = "",
  onTitleChange,
  onContentChange,
  className = "",
}: RichTextEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [documentTitle, setDocumentTitle] = useState(title);
  const [wordCount, setWordCount] = useState(0);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    // Calculate word count
    const text = editorRef.current?.innerText || "";
    const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      // Save current state to undo stack
      setUndoStack((prev) => [...prev, content]);
      setRedoStack([]); // Clear redo stack on new change
      setContent(newContent);
      onContentChange?.(newContent);
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousContent = undoStack[undoStack.length - 1];
      setRedoStack((prev) => [...prev, content]);
      setUndoStack((prev) => prev.slice(0, -1));
      setContent(previousContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = previousContent;
      }
      onContentChange?.(previousContent);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[redoStack.length - 1];
      setUndoStack((prev) => [...prev, content]);
      setRedoStack((prev) => prev.slice(0, -1));
      setContent(nextContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = nextContent;
      }
      onContentChange?.(nextContent);
    }
  };

  const handleCopy = () => {
    const text = editorRef.current?.innerText || "";
    navigator.clipboard.writeText(text);
    toast({
      description: "Content copied to clipboard",
    });
  };

  const handleExport = () => {
    const text = editorRef.current?.innerText || "";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentTitle || "legislation-draft"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      description: "Draft exported successfully",
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setDocumentTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  return (
    <div className={`flex flex-col h-full bg-card border border-border rounded-lg ${className}`}>
      {/* Title Input */}
      <div className="p-4 border-b border-border">
        <Input
          value={documentTitle}
          onChange={handleTitleChange}
          placeholder="Enter legislation title..."
          className="text-lg font-semibold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("bold")}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("italic")}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("insertUnorderedList")}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("insertOrderedList")}
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-6">
        <div
          ref={editorRef}
          contentEditable
          className="min-h-full outline-none prose prose-sm max-w-none"
          onInput={handleContentChange}
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            lineHeight: "1.6",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Draft Legislation</span>
        </div>
        <span>{wordCount} words</span>
      </div>
    </div>
  );
};