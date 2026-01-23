import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, FileText, MoreHorizontal, Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link2, AlignLeft, AlignCenter, AlignRight, Code, List, ListOrdered, Indent, Outdent, Table2, ChevronDown, X, MessageSquare, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNotePersistence, ChatNote } from "@/hooks/useNotePersistence";
import { supabase } from "@/integrations/supabase/client";
import { TipTapEditor, TipTapEditorRef, editorCommands, isFormatActive, TEXT_COLORS } from "@/components/TipTapEditor";
import { ensureHtml } from "@/utils/markdownUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface BillData {
  bill_number: string;
  title: string;
  status_desc: string;
  description?: string;
  committee?: string;
  session_id?: number;
}

const NoteView = () => {
  const navigate = useNavigate();
  const { noteId } = useParams<{ noteId: string }>();
  const { toast } = useToast();
  const { fetchNoteById, deleteNote, updateNote } = useNotePersistence();

  const [note, setNote] = useState<ChatNote | null>(null);
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [editableTitle, setEditableTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [, forceUpdate] = useState(0); // For re-rendering toolbar state
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<TipTapEditorRef>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Get editor instance for toolbar
  const editor = editorRef.current?.editor;

  // Load note data
  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) return;
      setLoading(true);

      const data = await fetchNoteById(noteId);
      setNote(data);
      if (data) {
        // Convert markdown to HTML if needed for TipTap
        const html = ensureHtml(data.content);
        setHtmlContent(html);
        setEditableTitle(data.title);
      }

      // Fetch associated bill if exists
      if (data?.bill_id) {
        const { data: billData } = await supabase
          .from("Bills")
          .select("bill_number, title, status_desc, description, committee, session_id")
          .eq("bill_id", data.bill_id)
          .single();
        if (billData) {
          setBill(billData);
        }
      }

      setLoading(false);
    };

    loadNote();
  }, [noteId, fetchNoteById]);

  const handleDelete = async () => {
    if (!noteId) return;

    const success = await deleteNote(noteId);
    if (success) {
      toast({ title: "Note deleted" });
      window.dispatchEvent(new CustomEvent("refresh-sidebar-notes"));
      navigate("/new-chat");
    } else {
      toast({
        title: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = useCallback(async (content: string, showToast = false) => {
    if (!noteId || !note) return;
    setIsSaving(true);

    const success = await updateNote(noteId, { content });
    if (success) {
      setNote(prev => prev ? { ...prev, content } : null);
      setHasUnsavedChanges(false);
      if (showToast) {
        toast({ title: "Note saved" });
      }
    } else {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setIsSaving(false);
  }, [noteId, note, updateNote, toast]);

  // Handle content change from TipTap editor
  const handleContentChange = useCallback((newHtml: string) => {
    setHtmlContent(newHtml);
    setHasUnsavedChanges(true);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (1.5 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newHtml, false);
    }, 1500);
  }, [handleSave]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle title change with auto-save
  const handleTitleChange = useCallback((newTitle: string) => {
    setEditableTitle(newTitle);
    setHasUnsavedChanges(true);

    // Clear existing timeout
    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
    }

    // Auto-save title after 1.5 seconds
    titleSaveTimeoutRef.current = setTimeout(async () => {
      if (!noteId || !note) return;
      setIsSaving(true);
      const success = await updateNote(noteId, { title: newTitle });
      if (success) {
        setNote(prev => prev ? { ...prev, title: newTitle } : null);
        setHasUnsavedChanges(false);
        // Refresh sidebar to show updated title
        window.dispatchEvent(new CustomEvent("refresh-sidebar-notes"));
      }
      setIsSaving(false);
    }, 1500);
  }, [noteId, note, updateNote]);

  // Handle blur - save immediately if there are unsaved changes
  const handleEditorBlur = useCallback(() => {
    if (hasUnsavedChanges && htmlContent) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      handleSave(htmlContent, false);
    }
  }, [hasUnsavedChanges, htmlContent, handleSave]);

  // Handle title blur - save immediately
  const handleTitleBlur = useCallback(() => {
    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
    }
    if (editableTitle && editableTitle !== note?.title) {
      (async () => {
        if (!noteId) return;
        setIsSaving(true);
        const success = await updateNote(noteId, { title: editableTitle });
        if (success) {
          setNote(prev => prev ? { ...prev, title: editableTitle } : null);
          setHasUnsavedChanges(false);
          window.dispatchEvent(new CustomEvent("refresh-sidebar-notes"));
        }
        setIsSaving(false);
      })();
    }
  }, [editableTitle, note?.title, noteId, updateNote]);

  // Force re-render to update toolbar active states
  useEffect(() => {
    if (!editor) return;
    const updateToolbar = () => forceUpdate(n => n + 1);
    editor.on('selectionUpdate', updateToolbar);
    editor.on('transaction', updateToolbar);
    return () => {
      editor.off('selectionUpdate', updateToolbar);
      editor.off('transaction', updateToolbar);
    };
  }, [editor]);

  // Handle link insertion
  const handleLinkClick = useCallback(() => {
    if (!editor) return;
    const currentUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL:', currentUrl);
    if (url === null) return; // Cancelled
    if (url === '') {
      editorCommands.unsetLink(editor);
    } else {
      editorCommands.setLink(editor, url);
    }
  }, [editor]);

  // Handle heading selection
  const handleHeadingChange = useCallback((value: string) => {
    if (!editor) return;
    if (value === 'paragraph') {
      editorCommands.setParagraph(editor);
    } else {
      const level = parseInt(value.replace('h', '')) as 1 | 2 | 3;
      editorCommands.setHeading(editor, level);
    }
  }, [editor]);

  // Get current heading value for select
  const getCurrentHeadingValue = useCallback((): string => {
    if (!editor) return 'paragraph';
    if (isFormatActive.heading(editor, 1)) return 'h1';
    if (isFormatActive.heading(editor, 2)) return 'h2';
    if (isFormatActive.heading(editor, 3)) return 'h3';
    return 'paragraph';
  }, [editor]);

  // Handle text color change
  const handleColorChange = useCallback((color: string | null) => {
    if (!editor) return;
    if (color === null) {
      editorCommands.unsetColor(editor);
    } else {
      editorCommands.setColor(editor, color);
    }
  }, [editor]);

  // Get current text color
  const getCurrentColor = useCallback((): string | null => {
    return isFormatActive.textColor(editor);
  }, [editor]);

  // Toolbar drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!toolbarRef.current) return;
    e.preventDefault();

    const rect = toolbarRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;

      // Keep toolbar within viewport bounds
      const maxX = window.innerWidth - (toolbarRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (toolbarRef.current?.offsetHeight || 0);

      setToolbarPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Initialize toolbar position at bottom center
  useEffect(() => {
    const updatePosition = () => {
      const toolbarWidth = toolbarRef.current?.offsetWidth || 500;
      setToolbarPosition({
        x: (window.innerWidth - toolbarWidth) / 2,
        y: window.innerHeight - 80,
      });
    };

    // Small delay to ensure toolbar is rendered
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading note...</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-muted-foreground">Note not found</div>
        <Button variant="outline" onClick={() => navigate("/new-chat")}>
          Go to Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={handleBack} className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h1 className="font-medium truncate">{editableTitle || note.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Save indicator */}
            <span className="text-xs text-muted-foreground mr-2">
              {isSaving ? "Saving..." : hasUnsavedChanges ? "Unsaved changes" : "Saved"}
            </span>

            {/* Chat Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatOpen(!chatOpen)}
              className={chatOpen ? "bg-muted" : ""}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete note
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[800px] mx-auto py-12 px-8">
            {/* Note Title - Editable */}
            <input
              type="text"
              value={editableTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-3xl font-bold mb-8 w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0"
              placeholder="Untitled"
            />

            {/* Note Content - WYSIWYG TipTap Editor */}
            <TipTapEditor
              ref={editorRef}
              content={htmlContent}
              onChange={handleContentChange}
              onBlur={handleEditorBlur}
              editable={true}
              className="min-h-[400px]"
            />

            {/* Associated Bill (if exists) */}
            {bill && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Related Bill</h3>
                <div
                  className="p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/bills/${bill.bill_number}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-primary">{bill.bill_number}</p>
                      <p className="text-sm text-muted-foreground mt-1">{bill.title}</p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{bill.status_desc}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Draggable Rich Text Toolbar */}
      <div
        ref={toolbarRef}
        className="fixed z-50"
        style={{
          left: toolbarPosition.x,
          top: toolbarPosition.y,
          cursor: isDragging ? 'grabbing' : 'auto',
        }}
      >
        <div className="flex items-center gap-0.5 bg-background border rounded-lg shadow-lg px-2 py-2 w-fit">
          {/* Grip Handle - Draggable */}
          <div
            className="flex items-center px-1 cursor-grab text-muted-foreground/50 hover:text-muted-foreground"
            onMouseDown={handleDragStart}
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Text Style Dropdown */}
          <Select value={getCurrentHeadingValue()} onValueChange={handleHeadingChange}>
            <SelectTrigger className="w-[140px] h-8 text-sm border-0 shadow-none hover:bg-muted focus:ring-0">
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">Aa</span>
                <SelectValue placeholder="Regular text" />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraph">Regular text</SelectItem>
              <SelectItem value="h1">Heading 1</SelectItem>
              <SelectItem value="h2">Heading 2</SelectItem>
              <SelectItem value="h3">Heading 3</SelectItem>
            </SelectContent>
          </Select>

          {/* Format Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isFormatActive.bold(editor) ? 'bg-muted' : ''}`}
            onClick={() => editorCommands.toggleBold(editor)}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isFormatActive.italic(editor) ? 'bg-muted' : ''}`}
            onClick={() => editorCommands.toggleItalic(editor)}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isFormatActive.underline(editor) ? 'bg-muted' : ''}`}
            onClick={() => editorCommands.toggleUnderline(editor)}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isFormatActive.strike(editor) ? 'bg-muted' : ''}`}
            onClick={() => editorCommands.toggleStrike(editor)}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          {/* Text Color Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-0.5">
                <span
                  className="text-sm font-medium border-b-2"
                  style={{ borderColor: getCurrentColor() || 'currentColor' }}
                >
                  A
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[120px]">
              {TEXT_COLORS.map((item) => (
                <DropdownMenuItem
                  key={item.name}
                  onClick={() => handleColorChange(item.color)}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`w-4 h-4 rounded-full border ${item.color ? '' : 'bg-background'}`}
                    style={item.color ? { backgroundColor: item.color } : undefined}
                  />
                  {item.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Link */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isFormatActive.link(editor) ? 'bg-muted' : ''}`}
            onClick={handleLinkClick}
          >
            <Link2 className="h-4 w-4" />
          </Button>

          {/* Alignment */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isFormatActive.textAlign(editor, 'center') ? (
                  <AlignCenter className="h-4 w-4" />
                ) : isFormatActive.textAlign(editor, 'right') ? (
                  <AlignRight className="h-4 w-4" />
                ) : (
                  <AlignLeft className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => editorCommands.setTextAlign(editor, 'left')}>
                <AlignLeft className="h-4 w-4 mr-2" />
                Left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editorCommands.setTextAlign(editor, 'center')}>
                <AlignCenter className="h-4 w-4 mr-2" />
                Center
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editorCommands.setTextAlign(editor, 'right')}>
                <AlignRight className="h-4 w-4 mr-2" />
                Right
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Code */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isFormatActive.code(editor) ? 'bg-muted' : ''}`}
            onClick={() => editorCommands.toggleCode(editor)}
          >
            <Code className="h-4 w-4" />
          </Button>

          {/* Lists */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isFormatActive.bulletList(editor) ? 'bg-muted' : ''}`}
            onClick={() => editorCommands.toggleBulletList(editor)}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isFormatActive.orderedList(editor) ? 'bg-muted' : ''}`}
            onClick={() => editorCommands.toggleOrderedList(editor)}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editorCommands.outdent(editor)}
          >
            <Outdent className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editorCommands.indent(editor)}
          >
            <Indent className="h-4 w-4" />
          </Button>

          {/* Table */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editorCommands.insertTable(editor)}
          >
            <Table2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Side Chat Sheet */}
      <Sheet open={chatOpen} onOpenChange={setChatOpen} modal={false}>
        <SheetContent
          side="right"
          className="w-[400px] sm:w-[450px] p-0 border-l shadow-lg"
          style={{ position: 'relative' }}
        >
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <SheetHeader className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-base font-medium">Chat</SheetTitle>
                <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">Ask questions about this note</p>
                <p className="text-xs mt-1">Chat functionality coming soon</p>
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Textarea
                  placeholder="Ask this note a question..."
                  className="min-h-[40px] max-h-[120px] resize-none"
                  rows={1}
                />
                <Button size="icon" disabled>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NoteView;
