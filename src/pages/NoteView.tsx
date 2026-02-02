import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import {
  ArrowLeft, Trash2, FileText, MoreHorizontal, Bold, Italic,
  Underline as UnderlineIcon, Strikethrough, Link2, AlignLeft,
  AlignCenter, AlignRight, Code, List, ListOrdered, Indent, Outdent,
  Table2, ChevronDown, MessageSquare, GripVertical, PanelLeft,
  PanelRight, ChevronRight, ExternalLink, Clock, Copy, Clipboard,
  Download, FileCode, FileType, ArrowUp, ArrowDown, Check, Square,
  Volume2, ListTree
} from "lucide-react";

// Model provider icons
const OpenAIIcon = ({ className }: { className?: string }) => (
  <img
    src="/OAI LOGO.png"
    alt="OpenAI"
    className={`object-contain ${className}`}
    style={{ maxWidth: '14px', maxHeight: '14px', width: 'auto', height: 'auto' }}
  />
);

const ClaudeIcon = ({ className }: { className?: string }) => (
  <img
    src="/claude-ai-icon-65aa.png"
    alt="Claude"
    className={`object-contain ${className}`}
    style={{ maxWidth: '14px', maxHeight: '14px', width: 'auto', height: 'auto' }}
  />
);

const PerplexityIcon = ({ className }: { className?: string }) => (
  <img
    src="/PPLX LOGO.png"
    alt="Perplexity"
    className={`object-contain ${className}`}
    style={{ maxWidth: '14px', maxHeight: '14px', width: 'auto', height: 'auto' }}
  />
);
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNotePersistence, ChatNote } from "@/hooks/useNotePersistence";
import { supabase } from "@/integrations/supabase/client";
import { TipTapEditor, TipTapEditorRef, editorCommands, isFormatActive, TEXT_COLORS } from "@/components/TipTapEditor";
import { ensureHtml, htmlToMarkdown } from "@/utils/markdownUtils";
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
  DropdownMenuLabel,
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
import { MobileMenuIcon, MobileNYSgpt } from '@/components/MobileMenuButton';
import { useModel, ModelType } from "@/contexts/ModelContext";
import ReactMarkdown from "react-markdown";

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
  const { user } = useAuth();
  const { fetchNoteById, deleteNote, updateNote } = useNotePersistence();

  const [note, setNote] = useState<ChatNote | null>(null);
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
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
  const [wordCountLimit, setWordCountLimit] = useState<number>(250);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { selectedModel, setSelectedModel } = useModel();
  const abortControllerRef = useRef<AbortController | null>(null);
  const documentContentRef = useRef<HTMLDivElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of document
  const scrollToBottom = useCallback(() => {
    if (documentContentRef.current) {
      documentContentRef.current.scrollTo({
        top: documentContentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Scroll to bottom of chat
  const scrollChatToBottom = useCallback(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTo({
        top: chatContentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Copy message to clipboard
  const copyMessageToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard" });
  }, [toast]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsChatLoading(false);
    }
  }, []);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<TipTapEditorRef>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = editorRef.current?.editor;

  // Enable sidebar transitions after mount to prevent flash
  useEffect(() => {
    // Small delay to ensure CSS is ready
    const timer = setTimeout(() => setSidebarMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

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
  const handleExportPDF = useCallback(async () => {
    const plainText = getPlainText(htmlContent);
    const { jsPDF } = await import('jspdf');
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

  // Send chat message about the note
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || !note) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: chatInput
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsChatLoading(true);

    // Create streaming message placeholder
    const assistantMessageId = crypto.randomUUID();
    const streamingMessage = {
      id: assistantMessageId,
      role: 'assistant' as const,
      content: ""
    };
    setChatMessages([...updatedMessages, streamingMessage]);

    try {
      const noteContent = getPlainText(htmlContent);
      const noteTitle = editableTitle || note.title;

      // Build a comprehensive prompt that includes the full note context
      const contextualPrompt = `I have a note titled "${noteTitle}" with the following content:

---
${noteContent}
---

Based on this note, please answer the following question (limit response to approximately ${wordCountLimit} words):

${chatInput}`;

      const supabaseUrl = supabase.supabaseUrl;
      const { data: { session } } = await supabase.auth.getSession();

      abortControllerRef.current = new AbortController();

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-with-openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
        },
        body: JSON.stringify({
          prompt: contextualPrompt,
          type: 'chat',
          stream: true,
          fastMode: true,
          context: {
            chatType: 'note',
            title: noteTitle,
            noteContent: noteContent.slice(0, 8000), // Limit context size
            previousMessages: chatMessages.slice(-5)
          }
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                let content = '';
                if (parsed.choices?.[0]?.delta?.content) {
                  content = parsed.choices[0].delta.content;
                } else if (parsed.delta?.text) {
                  content = parsed.delta.text;
                }

                if (content) {
                  aiResponse += content;
                  setChatMessages(prev => prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: aiResponse }
                      : msg
                  ));
                }
              } catch {
                // Skip invalid JSON chunks
              }
            }
          }
        }
      }

      if (!aiResponse) {
        aiResponse = 'Unable to generate response. Please try again.';
        setChatMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: aiResponse }
            : msg
        ));
      }

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
        // Remove streaming message on error
        setChatMessages(updatedMessages);
      }
    } finally {
      setIsChatLoading(false);
      abortControllerRef.current = null;
    }
  }, [chatInput, chatMessages, note, editableTitle, htmlContent, getPlainText, wordCountLimit, selectedModel, toast]);

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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Please log in to view notes.</p>
        <Button onClick={() => navigate("/auth-2")} className="font-semibold">
          Sign Up
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen md:p-2">
        <div className="w-full h-full md:rounded-2xl md:border bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Loading note...</div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-screen md:p-2">
        <div className="w-full h-full md:rounded-2xl md:border bg-background flex flex-col items-center justify-center gap-4">
          <div className="text-muted-foreground">Note not found</div>
          <Button variant="outline" onClick={() => navigate("/new-chat")}>
            Go to Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Left Sidebar - OUTSIDE container, slides in from off-screen */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm md:w-72 bg-background border-r z-50",
          sidebarMounted && "transition-transform duration-300 ease-in-out",
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NoteViewSidebar onClose={() => setLeftSidebarOpen(false)} />
      </div>

      {/* Backdrop overlay when sidebar is open */}
      {leftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

      {/* Main Container with padding */}
      <div className="h-full md:p-2 bg-muted/30">
        {/* Inner container with rounded corners and border */}
        <div
          ref={containerRef}
          className="w-full h-full md:rounded-2xl md:border bg-background overflow-hidden flex flex-col"
        >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Menu Icon */}
            <MobileMenuIcon onOpenSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)} />
            {/* Left Sidebar Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className={cn("hidden md:inline-flex flex-shrink-0", leftSidebarOpen && "bg-muted")}
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
            <MobileNYSgpt />
            {/* Save indicator */}
            <span className="text-xs text-muted-foreground mr-2">
              {isSaving ? "Saving..." : hasUnsavedChanges ? "Unsaved changes" : "Saved"}
            </span>

            {/* More Menu (three-dot) - now before sidebar toggle */}
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

            {/* Right Sidebar Toggle - now after three-dot menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={cn(rightSidebarOpen && "bg-muted")}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document Content */}
          <div ref={documentContentRef} className="flex-1 overflow-y-auto min-w-0 relative">
            <div className="max-w-[800px] mx-auto py-12 px-8">
              {/* Note Title - Editable (auto-grows and wraps) */}
              <textarea
                value={editableTitle}
                onChange={(e) => {
                  handleTitleChange(e.target.value);
                  // Auto-resize
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                rows={1}
                className="text-3xl font-bold mb-8 w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 resize-none overflow-hidden placeholder:text-muted-foreground/50"
                placeholder="Give it a title..."
              />

              {/* Note Content - WYSIWYG TipTap Editor */}
              <TipTapEditor
                ref={editorRef}
                content={htmlContent}
                onChange={handleContentChange}
                onBlur={handleEditorBlur}
                editable={true}
                className="min-h-[400px]"
                placeholder="Start writing..."
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

            {/* Scroll to bottom button */}
            <button
              onClick={scrollToBottom}
              className="sticky bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-background border rounded-full shadow-md flex items-center justify-center hover:bg-muted transition-colors z-10"
              title="Scroll to bottom"
            >
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Right Sidebar - Chat Panel */}
          <div
            className={cn(
              "border-l bg-background flex-shrink-0 overflow-hidden transition-all duration-300 flex flex-col",
              rightSidebarOpen ? "w-[500px]" : "w-0"
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
                    {/* Chat Header with Selector and Three-dot Menu */}
                    <div className="px-3 py-2 border-b flex items-center justify-between">
                      {/* Chat Selector Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 gap-1 font-normal max-w-[220px]">
                            <span className="truncate text-sm">
                              {chatMessages.length > 0
                                ? (chatMessages[0]?.content?.slice(0, 30) + (chatMessages[0]?.content?.length > 30 ? '...' : ''))
                                : "New chat"}
                            </span>
                            <ChevronDown className="h-3 w-3 flex-shrink-0 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64">
                          <DropdownMenuItem onClick={() => setChatMessages([])}>
                            New chat
                          </DropdownMenuItem>
                          {chatMessages.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="flex flex-col items-start gap-0.5">
                                <span className="text-xs text-muted-foreground">Current</span>
                                <span className="truncate w-full">
                                  {chatMessages[0]?.content?.slice(0, 40)}{chatMessages[0]?.content?.length > 40 ? '...' : ''}
                                </span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Three-dot Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setChatMessages([])}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            New chat
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const text = chatMessages.map(m => `${m.role}: ${m.content}`).join('\n\n');
                            navigator.clipboard.writeText(text);
                            toast({ title: "Messages copied" });
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy messages
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const text = chatMessages.map(m => `${m.role}: ${m.content}`).join('\n\n');
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `chat-${editableTitle || 'note'}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}>
                            <Download className="h-4 w-4 mr-2" />
                            Export messages
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Chat Content */}
                    <div ref={chatContentRef} className="flex-1 overflow-y-auto p-4 relative">
                      {/* Note Reference Card */}
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{editableTitle || note.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Source</p>
                      </div>

                      {/* Messages or Empty State */}
                      {chatMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] text-center text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                          <p className="text-sm">Ask questions about this note</p>
                        </div>
                      ) : (
                        <div className="space-y-4 pb-12">
                          {chatMessages.map((message, index) => (
                            <div key={message.id}>
                              {message.role === "user" ? (
                                /* User message - right-aligned light bubble with dark text */
                                <div className="flex justify-end">
                                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted/80 text-foreground text-sm border">
                                    {message.content}
                                  </div>
                                </div>
                              ) : (
                                /* Assistant message - full-width markdown, no bubble */
                                <div className="w-full">
                                  {!message.content && isChatLoading ? (
                                    /* Blinking typewriter cursor when waiting for response */
                                    <div className="text-sm py-2">
                                      <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1">|</span>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                                        <ReactMarkdown
                                          components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
                                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                            li: ({ children }) => <li className="text-sm">{children}</li>,
                                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                          }}
                                        >
                                          {message.content}
                                        </ReactMarkdown>
                                        {/* Streaming cursor - shows at end of content while loading */}
                                        {isChatLoading && index === chatMessages.length - 1 && message.content && (
                                          <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1">|</span>
                                        )}
                                      </div>

                                      {/* Footer Actions - only show when not streaming */}
                                      {!(isChatLoading && index === chatMessages.length - 1) && (
                                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-transparent hover:border-muted">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            title="Read aloud"
                                          >
                                            <Volume2 className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            onClick={() => copyMessageToClipboard(message.content)}
                                            title="Copy"
                                          >
                                            <Copy className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            title="List view"
                                          >
                                            <ListTree className="h-3.5 w-3.5" />
                                          </Button>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                              >
                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                              <DropdownMenuItem onClick={() => copyMessageToClipboard(message.content)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy message
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Share
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Scroll to bottom button - inside chat area */}
                      {chatMessages.length > 0 && (
                        <button
                          onClick={scrollChatToBottom}
                          className="sticky bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-background border rounded-full shadow-md flex items-center justify-center hover:bg-muted transition-colors z-10"
                          title="Scroll to bottom"
                        >
                          <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>

                    {/* Enhanced Chat Input */}
                    <div className="border-t p-3 flex-shrink-0">
                      <div className="border rounded-t-lg rounded-b-lg bg-background overflow-hidden">
                        {/* Note Reference Pill */}
                        <div className="px-3 py-2 border-b bg-muted/30 rounded-t-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">
                              {(editableTitle || note.title).slice(0, 50)}{(editableTitle || note.title).length > 50 ? '...' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Input Area */}
                        <Textarea
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendChatMessage();
                            }
                          }}
                          placeholder="Ask this note a question..."
                          className="min-h-[60px] max-h-[120px] resize-none border-0 border-x border-transparent focus-visible:ring-0 focus-visible:border-x focus-visible:border-transparent rounded-none bg-background"
                          rows={2}
                          disabled={isChatLoading}
                        />

                        {/* Toolbar */}
                        <div className="px-2 py-2 flex items-center justify-between border-t bg-background">
                          <div className="flex items-center gap-1">
                            {/* Model Selector */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs px-2">
                                  {/* Show provider icon based on selected model */}
                                  {selectedModel.startsWith("gpt") ? (
                                    <OpenAIIcon className="h-3.5 w-3.5" />
                                  ) : selectedModel.startsWith("claude") ? (
                                    <ClaudeIcon className="h-3.5 w-3.5" />
                                  ) : (
                                    <PerplexityIcon className="h-3.5 w-3.5" />
                                  )}
                                  <span className="hidden sm:inline">
                                    {selectedModel === "gpt-4o" ? "GPT-4o" :
                                     selectedModel === "gpt-4o-mini" ? "GPT-4o Mini" :
                                     selectedModel === "claude-sonnet-4-5-20250929" ? "Claude Sonnet" :
                                     selectedModel === "claude-haiku-4-5-20251001" ? "Claude Haiku" :
                                     selectedModel === "sonar" ? "Sonar" :
                                     selectedModel === "sonar-pro" ? "Sonar Pro" : "Model"}
                                  </span>
                                  <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-56">
                                {/* OpenAI Models */}
                                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">OpenAI</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setSelectedModel("gpt-4o")} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <OpenAIIcon className="h-4 w-4" />
                                    <span>GPT-4o</span>
                                  </div>
                                  {selectedModel === "gpt-4o" && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedModel("gpt-4o-mini")} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <OpenAIIcon className="h-4 w-4" />
                                    <span>GPT-4o Mini</span>
                                  </div>
                                  {selectedModel === "gpt-4o-mini" && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Anthropic Models */}
                                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Anthropic</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setSelectedModel("claude-sonnet-4-5-20250929")} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <ClaudeIcon className="h-4 w-4" />
                                    <span>Claude Sonnet</span>
                                  </div>
                                  {selectedModel === "claude-sonnet-4-5-20250929" && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedModel("claude-haiku-4-5-20251001")} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <ClaudeIcon className="h-4 w-4" />
                                    <span>Claude Haiku</span>
                                  </div>
                                  {selectedModel === "claude-haiku-4-5-20251001" && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Perplexity Models */}
                                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Perplexity</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setSelectedModel("sonar")} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <PerplexityIcon className="h-4 w-4" />
                                    <span>Sonar</span>
                                  </div>
                                  {selectedModel === "sonar" && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedModel("sonar-pro")} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <PerplexityIcon className="h-4 w-4" />
                                    <span>Sonar Pro</span>
                                  </div>
                                  {selectedModel === "sonar-pro" && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Word Count Selector */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs px-2">
                                  <span>{wordCountLimit} words</span>
                                  <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => setWordCountLimit(100)}>
                                  100 words
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setWordCountLimit(250)}>
                                  250 words
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setWordCountLimit(500)}>
                                  500 words
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Send/Stop Button */}
                          {isChatLoading ? (
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-7 w-7 rounded-full"
                              onClick={stopStreaming}
                            >
                              <Square className="h-3 w-3 fill-current" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              className="h-7 w-7 rounded-full bg-foreground hover:bg-foreground/90 text-background"
                              disabled={!chatInput.trim()}
                              onClick={sendChatMessage}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
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
