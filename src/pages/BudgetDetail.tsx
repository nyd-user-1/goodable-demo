import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Plus, ExternalLink, Command, Pencil, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { TABLE_MAP, reformatAgencyName, formatBudgetAmount, type BudgetTab } from "@/hooks/useBudgetSearch";
import { useBudgetNotes } from "@/hooks/useBudgetNotes";
import { NoteDialog } from "@/components/shared/NoteDialog";

const AGENCY_COL: Record<BudgetTab, string> = {
  appropriations: 'Agency Name',
  capital: 'Agency Name',
  spending: 'Agency',
};

const BudgetDetail = () => {
  const navigate = useNavigate();
  const { type, id } = useParams<{ type: string; id: string }>();
  const budgetType = (type as BudgetTab) || 'appropriations';
  const [budgetChats, setBudgetChats] = useState<Array<{ id: string; title: string; created_at: string }>>([]);

  // Notes state
  const { notes, addNote, updateNote, deleteNote } = useBudgetNotes(type, id);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{ id: string; content: string } | null>(null);

  // Fetch budget item by id
  const { data: item, isLoading, error } = useQuery({
    queryKey: ['budget-detail', type, id],
    queryFn: async () => {
      const table = TABLE_MAP[budgetType];
      if (!table) throw new Error('Invalid budget type');

      const { data, error } = await (supabase as any)
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!type && !!id,
  });

  // Fetch related chats
  useEffect(() => {
    const fetchBudgetChats = async () => {
      if (!type || !id) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("chat_sessions")
          .select("id, title, created_at")
          .eq("user_id", user.id)
          .ilike("title", `%[Budget:${type}:${id}]%`)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setBudgetChats(data);
        }
      } catch (error) {
        console.error("Error fetching budget chats:", error);
      }
    };

    fetchBudgetChats();
  }, [type, id]);

  const formatNoteDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getAgencyName = () => {
    if (!item) return 'Unknown Agency';
    const col = AGENCY_COL[budgetType];
    return reformatAgencyName(item[col] || 'Unknown Agency');
  };

  const getProgramName = () => {
    if (!item) return null;
    return item['Program Name'] || null;
  };

  const handleNewChat = async () => {
    if (!item || !type || !id) return;
    const agency = getAgencyName();
    let prompt = '';

    if (budgetType === 'appropriations') {
      const program = item['Program Name'] ? ` for "${item['Program Name']}"` : '';
      const amount = item['Appropriations Recommended 2026-27']
        ? ` with a recommended appropriation of ${formatBudgetAmount(item['Appropriations Recommended 2026-27'])}`
        : '';
      prompt = `[Budget:${type}:${id}] Tell me about the NYS budget appropriation for ${agency}${program}${amount}. What is this funding used for and how has it changed from the prior year?`;
    } else if (budgetType === 'capital') {
      const desc = item['Description'] ? ` described as "${item['Description']}"` : '';
      const amount = item['Appropriations Recommended 2026-27']
        ? ` with a recommended amount of ${formatBudgetAmount(item['Appropriations Recommended 2026-27'])}`
        : '';
      prompt = `[Budget:${type}:${id}] Tell me about the NYS capital appropriation for ${agency}${desc}${amount}. What is this capital project about?`;
    } else {
      const fn = item['Function'] ? ` under the "${item['Function']}" function` : '';
      const amount = item['2026-27 Estimates']
        ? ` with estimated spending of ${formatBudgetAmount(item['2026-27 Estimates'])}`
        : '';
      prompt = `[Budget:${type}:${id}] Tell me about NYS spending by ${agency}${fn}${amount}. How has this spending changed over recent years?`;
    }

    navigate(`/new-chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleBack = () => {
    navigate('/budget');
  };

  // Note handlers
  const handleAddNote = () => {
    setEditingNote(null);
    setNoteDialogOpen(true);
  };

  const handleEditNote = (note: { id: string; content: string }) => {
    setEditingNote(note);
    setNoteDialogOpen(true);
  };

  const handleSaveNote = (content: string) => {
    if (editingNote) {
      updateNote(editingNote.id, content);
    } else {
      addNote(content);
    }
    setNoteDialogOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
  };

  // Stats grid content varies by type
  const getStatsGrid = () => {
    if (!item) return [];

    if (budgetType === 'appropriations') {
      return [
        { label: 'Recommended 2026-27', value: formatBudgetAmount(item['Appropriations Recommended 2026-27']), highlight: true },
        { label: 'Available 2025-26', value: formatBudgetAmount(item['Appropriations Available 2025-26']) },
        { label: 'Reappropriations', value: formatBudgetAmount(item['Reappropriations Recommended 2026-27']) },
        { label: 'Category', value: item['Appropriation Category'] || 'N/A' },
        { label: 'Fund Type', value: item['Fund Type'] || 'N/A' },
        { label: 'Est. FTEs', value: item['Estimated FTEs 03/31/2027'] || 'N/A' },
      ];
    }

    if (budgetType === 'capital') {
      return [
        { label: 'Recommended 2026-27', value: formatBudgetAmount(item['Appropriations Recommended 2026-27']), highlight: true },
        { label: 'Reappropriations', value: formatBudgetAmount(item['Reappropriations Recommended 2026-27']) },
        { label: 'Encumbrance', value: formatBudgetAmount(item['Encumbrance as of 1/16/2026']) },
        { label: 'Financing Source', value: item['Financing Source'] || 'N/A' },
        { label: 'Reference #', value: item['Reference Number'] || 'N/A' },
        { label: 'Chapter/Section/Year', value: item['Chapter/Section/Year'] || 'N/A' },
      ];
    }

    // spending
    return [
      { label: 'Est. 2026-27', value: formatBudgetAmount(item['2026-27 Estimates']), highlight: true },
      { label: 'Est. 2025-26', value: formatBudgetAmount(item['2025-26 Estimates']) },
      { label: 'Actual 2024-25', value: formatBudgetAmount(item['2024-25 Actuals']) },
      { label: 'Actual 2023-24', value: formatBudgetAmount(item['2023-24 Actuals']) },
      { label: 'Actual 2022-23', value: formatBudgetAmount(item['2022-23 Actuals']) },
      { label: 'Function', value: item['Function'] || 'N/A' },
    ];
  };

  // Detail fields for two-column layout
  const getDetailFields = () => {
    if (!item) return [];
    const fields: Array<{ label: string; value: string }> = [];

    if (budgetType === 'appropriations') {
      if (item['Fund Name']) fields.push({ label: 'Fund Name', value: item['Fund Name'] });
      if (item['Fund Type']) fields.push({ label: 'Fund Type', value: item['Fund Type'] });
      if (item['Appropriation Category']) fields.push({ label: 'Category', value: item['Appropriation Category'] });
      if (item['Program Name']) fields.push({ label: 'Program', value: item['Program Name'] });
    } else if (budgetType === 'capital') {
      if (item['Fund Name']) fields.push({ label: 'Fund Name', value: item['Fund Name'] });
      if (item['Financing Source']) fields.push({ label: 'Financing Source', value: item['Financing Source'] });
      if (item['Description']) fields.push({ label: 'Description', value: item['Description'] });
      if (item['Program Name']) fields.push({ label: 'Program', value: item['Program Name'] });
      if (item['Reference Number']) fields.push({ label: 'Reference #', value: item['Reference Number'] });
      if (item['Chapter/Section/Year']) fields.push({ label: 'Chapter/Section/Year', value: item['Chapter/Section/Year'] });
    } else {
      if (item['Fund']) fields.push({ label: 'Fund', value: item['Fund'] });
      if (item['Fund Type']) fields.push({ label: 'Fund Type', value: item['Fund Type'] });
      if (item['Function']) fields.push({ label: 'Function', value: item['Function'] });
      if (item['FP Category']) fields.push({ label: 'FP Category', value: item['FP Category'] });
    }

    return fields;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
          <div className="h-32 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Button variant="outline" onClick={handleBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Budget
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Budget item not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = getStatsGrid();
  const details = getDetailFields();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Section */}
        <div className="pb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Budget</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Toggle theme
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', {
                      key: 'k',
                      metaKey: true,
                      ctrlKey: true,
                      bubbles: true
                    });
                    document.dispatchEvent(event);
                  }}
                >
                  <Command className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Command menu
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Header Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-6 relative">
              {/* Header */}
              <div className="pb-4 border-b">
                <h1 className="text-2xl font-semibold text-foreground">
                  {getAgencyName()}
                </h1>
                {getProgramName() && (
                  <p className="text-sm text-muted-foreground">
                    {getProgramName()}
                  </p>
                )}
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                    <div className={`font-semibold ${stat.highlight ? 'text-green-600 dark:text-green-400' : ''} ${stat.value && stat.value.length > 20 ? 'text-sm' : ''}`}>
                      {stat.value || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Two-column detail layout */}
              {details.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {details.filter((_, i) => i % 2 === 0).map((field, i) => (
                      <div key={i} className="space-y-1">
                        <div className="text-sm font-medium text-foreground">{field.label}</div>
                        <div className="text-sm text-muted-foreground">{field.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {details.filter((_, i) => i % 2 === 1).map((field, i) => (
                      <div key={i} className="space-y-1">
                        <div className="text-sm font-medium text-foreground">{field.label}</div>
                        <div className="text-sm text-muted-foreground">{field.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Notes Section */}
        <Card className="bg-card rounded-xl shadow-sm border">
          <CardHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  Your Notes
                </CardTitle>
                {notes.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddNote}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Note
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {notes.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                <span className="text-muted-foreground italic">No notes yet. Add a note to keep track of important information.</span>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {notes.map((note) => (
                  <AccordionItem key={note.id} value={note.id} className="border-b last:border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-xs text-muted-foreground">
                          {formatNoteDate(note.created_at)}
                        </span>
                        <span className="text-sm truncate max-w-[300px]">
                          {note.content.substring(0, 50)}{note.content.length > 50 ? '...' : ''}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
                        {note.content}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditNote(note)}
                          className="gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Related Chats Section */}
        <Card className="bg-card rounded-xl shadow-sm border">
          <CardHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  Related Chats
                </CardTitle>
                {budgetChats.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {budgetChats.length} {budgetChats.length === 1 ? 'chat' : 'chats'}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {budgetChats.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                <span className="text-muted-foreground italic">No chats yet. Start a conversation about this budget item.</span>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {budgetChats.map((chat) => (
                  <AccordionItem key={chat.id} value={chat.id} className="border-b last:border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-xs text-muted-foreground">
                          {formatNoteDate(chat.created_at)}
                        </span>
                        <span className="text-sm truncate max-w-[300px]">
                          {chat.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/c/${chat.id}`)}
                          className="gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open Chat
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Note Dialog */}
      <NoteDialog
        isOpen={noteDialogOpen}
        onClose={() => {
          setNoteDialogOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialNote={editingNote?.content || ''}
        placeholder="Add your notes about this budget item..."
      />
    </div>
  );
};

export default BudgetDetail;
