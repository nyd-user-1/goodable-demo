import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import {
  ArrowLeft, Trash2, FileText, MoreHorizontal, Bold, Italic,
  Underline as UnderlineIcon, Strikethrough, Link2, AlignLeft,
  AlignCenter, AlignRight, Code, List, ListOrdered, Indent, Outdent,
  Table2, ChevronDown, MessageSquare, GripVertical, PanelLeft,
  PanelRight, ChevronRight, ExternalLink, Clock, Copy, Clipboard,
  Download, FileCode, FileType
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNotePersistence, ChatNote } from "@/hooks/useNotePersistence";
import { supabase } from "@/integrations/supabase/client";
import { TipTapEditor, TipTapEditorRef, editorCommands, isFormatActive, TEXT_COLORS } from "@/components/TipTapEditor";
import { ensureHtml, htmlToMarkdown } from "@/utils/markdownUtils";
import { jsPDF } from "jspdf";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { NoteViewSidebar } from "@/components/NoteViewSidebar";

interface BillData {
  bill_number: string;
  title: string;
  status_desc: string;
  description?: string;
  committee?: string;
  session_id?: number;
}

interface ChatSession {
  id: string;
  title: string;
}

const NoteView = () => {
  const navigate = useNavigate();
  const { noteId } = useParams<{ noteId: string }>();
  const { toast } = useToast();
  const { fetchNoteById, deleteNote, updateNote } = useNotePersistence();

  const [note, setNote] = useState<ChatNote | null>(null);
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [editableTitle, setEditableTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [, forceUpdate] = useState(0);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [parentChat, setParentChat] = useState<ChatSession | null>(null);
  const [toolbarInitialized, setToolbarInitialized] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<TipTapEditorRef>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = editorRef.current?.editor;

  // Load note data
  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) return;
      setLoading(true);

      const data = await fetchNoteById(noteId);
      setNote(data);
      if (data) {
        const html = ensureHtml(data.content);
        setHtmlContent(html);
        setEditableTitle(data.title);

        // Fetch parent chat if exists
        if (data.parent_session_id) {
          const { data: chatData } = await supabase
            .from("chat_sessions")
            .select("id, title")
            .eq("id", data.parent_session_id)
            .single();
          if (chatData) {
            setParentChat(chatData);
          }
        }
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

  const handleContentChange = useCallback((newHtml: string) => {
    setHtmlContent(newHtml);
    setHasUnsavedChanges(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newHtml, false);
    }, 1500);
  }, [handleSave]);

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

  const handleTitleChange = useCallback((newTitle: string) => {
    setEditableTitle(newTitle);
    setHasUnsavedChanges(true);

    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
    }

    titleSaveTimeoutRef.current = setTimeout(async () => {
      if (!noteId || !note) return;
      setIsSaving(true);
      const success = await updateNote(noteId, { title: newTitle });
      if (success) {
        setNote(prev => prev ? { ...prev, title: newTitle } : null);
        setHasUnsavedChanges(false);
        window.dispatchEvent(new CustomEvent("refresh-sidebar-notes"));
      }
      setIsSaving(false);
    }, 1500);
  }, [noteId, note, updateNote]);

  const handleEditorBlur = useCallback(() => {
    if (hasUnsavedChanges && htmlContent) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      handleSave(htmlContent, false);
    }
  }, [hasUnsavedChanges, htmlContent, handleSave]);

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

  const handleLinkClick = useCallback(() => {
    if (!editor) return;
    const currentUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL:', currentUrl);
    if (url === null) return;
    if (url === '') {
      editorCommands.unsetLink(editor);
    } else {
      editorCommands.setLink(editor, url);
    }
  }, [editor]);

  const handleHeadingChange = useCallback((value: string) => {
    if (!editor) return;
    if (value === 'paragraph') {
      editorCommands.setParagraph(editor);
    } else {
      const level = parseInt(value.replace('h', '')) as 1 | 2 | 3;
      editorCommands.setHeading(editor, level);
    }
  }, [editor]);

  const getCurrentHeadingValue = useCallback((): string => {
    if (!editor) return 'paragraph';
    if (isFormatActive.heading(editor, 1)) return 'h1';
    if (isFormatActive.heading(editor, 2)) return 'h2';
    if (isFormatActive.heading(editor, 3)) return 'h3';
    return 'paragraph';
  }, [editor]);

  const handleColorChange = useCallback((color: string | null) => {
    if (!editor) return;
    if (color === null) {
      editorCommands.unsetColor(editor);
    } else {
      editorCommands.setColor(editor, color);
    }
  }, [editor]);

  const getCurrentColor = useCallback((): string | null => {
    return isFormatActive.textColor(editor);
  }, [editor]);

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

  // Get plain text from HTML for word/character count
  const getPlainText = useCallback((html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }, []);

  // Calculate word and character count
  const wordCount = htmlContent ? getPlainText(htmlContent).trim().split(/\s+/).filter(Boolean).length : 0;
  const characterCount = htmlContent ? getPlainText(htmlContent).length : 0;

  // Export functions
  const handleExportPDF = useCallback(() => {
    const plainText = getPlainText(htmlContent);
    const doc = new jsPDF();
    const title = editableTitle || note?.title || 'Untitled';

    doc.setFontSize(18);
    doc.text(title, 20, 20);
    doc.setFontSize(12);

    // Split text into lines that fit the page width
    const lines = doc.splitTextToSize(plainText, 170);
    doc.text(lines, 20, 35);

    doc.save(`${title}.pdf`);
    toast({ title: "Exported as PDF" });
  }, [htmlContent, editableTitle, note?.title, getPlainText, toast]);

  const handleExportHTML = useCallback(() => {
    const title = editableTitle || note?.title || 'Untitled';
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { margin-bottom: 24px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${htmlContent}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as HTML" });
  }, [htmlContent, editableTitle, note?.title, toast]);

  const handleExportWord = useCallback(() => {
    const title = editableTitle || note?.title || 'Untitled';
    // Create a simple Word-compatible HTML document
    const wordHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  ${htmlContent}
</body>
</html>`;

    const blob = new Blob([wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as Word" });
  }, [htmlContent, editableTitle, note?.title, toast]);

  const handleExportMarkdown = useCallback(() => {
    const title = editableTitle || note?.title || 'Untitled';
    const markdown = `# ${title}\n\n${htmlToMarkdown(htmlContent)}`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as Markdown" });
  }, [htmlContent, editableTitle, note?.title, toast]);

  const handleCopyContents = useCallback(async () => {
    const plainText = getPlainText(htmlContent);
    await navigator.clipboard.writeText(plainText);
    toast({ title: "Contents copied to clipboard" });
  }, [htmlContent, getPlainText, toast]);

  const handleDuplicate = useCallback(() => {
    // For now, just show a toast - this would need backend support
    toast({ title: "Duplicate feature coming soon" });
  }, [toast]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;

      const maxX = containerRect.right - (toolbarRef.current?.offsetWidth || 0);
      const maxY = containerRect.bottom - (toolbarRef.current?.offsetHeight || 0);

      setToolbarPosition({
        x: Math.max(containerRect.left, Math.min(newX, maxX)),
        y: Math.max(containerRect.top, Math.min(newY, maxY)),
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

  // Initialize toolbar position: centered horizontally, bottom-aligned with 30px margin
  useEffect(() => {
    const initializePosition = () => {
      if (toolbarInitialized) return;

      const toolbarWidth = toolbarRef.current?.offsetWidth || 560;
      const toolbarHeight = toolbarRef.current?.offsetHeight || 48;

      // Center horizontally on viewport
      const x = (window.innerWidth - toolbarWidth) / 2;
      // Position at bottom of viewport with 30px margin
      const y = window.innerHeight - toolbarHeight - 30;

      setToolbarPosition({ x, y });
      setToolbarInitialized(true);
    };

    // Wait for toolbar to render
    const timer = setTimeout(initializePosition, 100);

    return () => clearTimeout(timer);
  }, [toolbarInitialized]);

  // Handle window resize - keep toolbar within bounds
  useEffect(() => {
    const handleResize = () => {
      if (!toolbarInitialized) return;

      const toolbarWidth = toolbarRef.current?.offsetWidth || 560;
      const toolbarHeight = toolbarRef.current?.offsetHeight || 48;

      setToolbarPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - toolbarWidth),
        y: Math.min(prev.y, window.innerHeight - toolbarHeight - 10),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [toolbarInitialized]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen p-2">
        <div className="w-full h-full rounded-2xl border bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Loading note...</div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-screen p-2">
        <div className="w-full h-full rounded-2xl border bg-background flex flex-col items-center justify-center gap-4">
          <div className="text-muted-foreground">Note not found</div>
          <Button variant="outline" onClick={() => navigate("/new-chat")}>
            Go to Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen p-2 bg-muted/30">
      {/* Main Container with rounded corners and border */}
      <div
        ref={containerRef}
        className="w-full h-full rounded-2xl border bg-background overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Left Sidebar Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className={cn("flex-shrink-0", leftSidebarOpen && "bg-muted")}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>

            {/* Title - clickable link back to parent chat */}
            {parentChat ? (
              <button
                onClick={() => navigate(`/c/${parentChat.id}`)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm truncate hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{editableTitle || note.title}</span>
              </button>
            ) : (
              <span className="text-sm truncate px-3">{editableTitle || note.title}</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Save indicator */}
            <span className="text-xs text-muted-foreground mr-2">
              {isSaving ? "Saving..." : hasUnsavedChanges ? "Unsaved changes" : "Saved"}
            </span>

            {/* Right Sidebar Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={cn(rightSidebarOpen && "bg-muted")}
            >
              <PanelRight className="h-4 w-4" />
            </Button>

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyContents}>
                  <Clipboard className="h-4 w-4 mr-2" />
                  Copy contents
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={handleExportPDF}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportHTML}>
                      <FileCode className="h-4 w-4 mr-2" />
                      Export as HTML
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportWord}>
                      <FileType className="h-4 w-4 mr-2" />
                      Export as Word
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportMarkdown}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export as Markdown
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

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

                <DropdownMenuSeparator />

                {/* Word and Character Count */}
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Word count</span>
                    <span>{wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Character count</span>
                    <span>{characterCount.toLocaleString()}</span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content Area with Sidebars */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div
            className={cn(
              "border-r bg-background flex-shrink-0 overflow-hidden transition-all duration-300",
              leftSidebarOpen ? "w-64" : "w-0"
            )}
          >
            {leftSidebarOpen && (
              <NoteViewSidebar parentChat={parentChat} />
            )}
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-y-auto min-w-0">
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

          {/* Right Sidebar - Chat Panel */}
          <div
            className={cn(
              "border-l bg-background flex-shrink-0 overflow-hidden transition-all duration-300 flex flex-col",
              rightSidebarOpen ? "w-80" : "w-0"
            )}
          >
            {rightSidebarOpen && (
              <>
                {/* Tabs Header */}
                <Tabs defaultValue="chat" className="flex flex-col h-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                    <TabsTrigger
                      value="chat"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Chat
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="related"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Related
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
                    {/* Chat Selection */}
                    <div className="p-4 border-b">
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a chat" />
                        </SelectTrigger>
                        <SelectContent>
                          {parentChat && (
                            <SelectItem value={parentChat.id}>{parentChat.title || "Original Chat"}</SelectItem>
                          )}
                          <SelectItem value="new">New chat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-sm">Ask questions about this note</p>
                        <p className="text-xs mt-1">Chat functionality coming soon</p>
                      </div>
                    </div>

                    {/* Chat Input */}
                    <div className="border-t p-4 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <Textarea
                          placeholder="Ask this note a question..."
                          className="min-h-[40px] max-h-[120px] resize-none"
                          rows={1}
                        />
                        <Button size="icon" disabled>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="flex-1 m-0 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Created</p>
                        <p className="text-sm">{new Date(note.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Last Updated</p>
                        <p className="text-sm">{new Date(note.updated_at).toLocaleDateString()}</p>
                      </div>
                      {parentChat && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Source Chat</p>
                          <NavLink
                            to={`/chats/${parentChat.id}`}
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {parentChat.title || "Original Chat"}
                            <ExternalLink className="h-3 w-3" />
                          </NavLink>
                        </div>
                      )}
                      {bill && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Related Bill</p>
                          <p className="text-sm text-primary">{bill.bill_number}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="related" className="flex-1 m-0 p-4 overflow-y-auto">
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm">Related notes will appear here</p>
                      <p className="text-xs mt-1">Coming soon</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
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
    </div>
  );
};

export default NoteView;
