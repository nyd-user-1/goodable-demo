import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, FileText, MoreHorizontal, Bold, Italic, Underline, Strikethrough, Link2, AlignLeft, Code, List, ListOrdered, Indent, Outdent, Table2, ChevronDown, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNotePersistence, ChatNote } from "@/hooks/useNotePersistence";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  // Load note data
  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) return;
      setLoading(true);

      const data = await fetchNoteById(noteId);
      setNote(data);
      if (data) {
        setEditContent(data.content);
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

  const handleSave = async () => {
    if (!noteId || !note) return;

    const success = await updateNote(noteId, { content: editContent });
    if (success) {
      setNote({ ...note, content: editContent });
      setIsEditing(false);
      toast({ title: "Note saved" });
    } else {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

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
              <h1 className="font-medium truncate">{note.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
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
            {/* Note Title */}
            <h1 className="text-3xl font-bold mb-8">{note.title}</h1>

            {/* Note Content - Editable or Rendered */}
            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[500px] text-base leading-relaxed resize-none border-0 shadow-none focus-visible:ring-0 p-0"
                placeholder="Start writing..."
              />
            ) : (
              <div
                className="prose prose-lg dark:prose-invert max-w-none cursor-text"
                onClick={() => setIsEditing(true)}
              >
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </div>
            )}

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

        {/* Rich Text Toolbar */}
        <div className="border-t bg-background px-4 py-2">
          <div className="max-w-[800px] mx-auto flex items-center gap-0.5">
            {/* Text Style Dropdown */}
            <Select defaultValue="paragraph">
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
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Underline className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Strikethrough className="h-4 w-4" />
            </Button>

            {/* Text Color */}
            <Button variant="ghost" size="sm" className="h-8 px-2 gap-0.5">
              <span className="text-sm font-medium border-b-2 border-foreground">A</span>
              <ChevronDown className="h-3 w-3" />
            </Button>

            {/* Link */}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Link2 className="h-4 w-4" />
            </Button>

            {/* Alignment */}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AlignLeft className="h-4 w-4" />
            </Button>

            {/* Code */}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Code className="h-4 w-4" />
            </Button>

            {/* Lists */}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Outdent className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Indent className="h-4 w-4" />
            </Button>

            {/* Table */}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Table2 className="h-4 w-4" />
            </Button>

            {/* Save button when editing */}
            {isEditing && (
              <>
                <div className="flex-1" />
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  setEditContent(note.content);
                  setIsEditing(false);
                }}>
                  Cancel
                </Button>
              </>
            )}
          </div>
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
