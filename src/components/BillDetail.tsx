import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, User, Pencil, Plus, Trash2, ExternalLink, Command } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { BillSummary, BillKeyInformation, QuickReviewNoteDialog } from "./features/bills";
import { useBillReviews, ReviewStatus, BillNote } from "@/hooks/useBillReviews";

type Bill = Tables<"Bills">;
type HistoryEntry = Tables<"History Table">;
type Sponsor = Tables<"Sponsors">;
type Person = Tables<"People">;
type RollCall = Tables<"Roll Call">;
type Vote = Tables<"Votes">;

interface BillDetailProps {
  bill: Bill;
  onBack: () => void;
}

export const BillDetail = ({ bill, onBack }: BillDetailProps) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sponsors, setSponsors] = useState<(Sponsor & { person?: Person })[]>([]);
  const [rollCalls, setRollCalls] = useState<(RollCall & { votes?: (Vote & { person?: Person })[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<BillNote | null>(null);
  const [billChats, setBillChats] = useState<Array<{ id: string; title: string; created_at: string }>>([]);

  const { getReviewForBill, saveReview, addNote, updateNote, deleteNote } = useBillReviews();
  const billReview = getReviewForBill(bill.bill_id);
  const notes = billReview?.notes || [];

  const handleSaveReview = (status: ReviewStatus, note: string) => {
    if (bill?.bill_id) {
      saveReview(bill.bill_id, status, note);
    }
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteDialogOpen(true);
  };

  const handleEditNote = (note: BillNote) => {
    setEditingNote(note);
    setNoteDialogOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    if (bill?.bill_id) {
      deleteNote(bill.bill_id, noteId);
    }
  };

  const handleSaveNote = (status: ReviewStatus, noteContent: string) => {
    if (!bill?.bill_id) return;

    if (editingNote) {
      // Update existing note
      updateNote(bill.bill_id, editingNote.id, noteContent);
    } else {
      // Add new note
      addNote(bill.bill_id, noteContent);
    }

    // Also save the review status if provided
    if (status) {
      saveReview(bill.bill_id, status, '');
    }
  };

  const formatNoteDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchBillDetails();
    fetchBillChats();
  }, [bill.bill_id]);

  const fetchBillChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_sessions")
        .select("id, title, created_at")
        .eq("bill_id", bill.bill_id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBillChats(data);
      }
    } catch (error) {
      console.error("Error fetching bill chats:", error);
    }
  };

  const fetchBillDetails = async () => {
    try {
      setLoading(true);

      // Fetch history
      const { data: historyData } = await supabase
        .from("History Table")
        .select("*")
        .eq("bill_id", bill.bill_id)
        .order("date", { ascending: false });

      // Fetch sponsors and people data separately
      const { data: sponsorsData } = await supabase
        .from("Sponsors")
        .select("*")
        .eq("bill_id", bill.bill_id)
        .order("position");

      // Fetch people data for sponsors
      let sponsorsWithPeople: (Sponsor & { person?: Person })[] = [];
      if (sponsorsData && sponsorsData.length > 0) {
        const peopleIds = sponsorsData.map(s => s.people_id).filter(Boolean);
        
        if (peopleIds.length > 0) {
          const { data: peopleData } = await supabase
            .from("People")
            .select("*")
            .in("people_id", peopleIds);

          sponsorsWithPeople = sponsorsData.map(sponsor => ({
            ...sponsor,
            person: peopleData?.find(p => p.people_id === sponsor.people_id)
          }));
        } else {
          sponsorsWithPeople = sponsorsData.map(sponsor => ({ ...sponsor }));
        }
      }

      // Fetch roll call votes for this bill
      const { data: rollCallData } = await supabase
        .from("Roll Call")
        .select("*")
        .eq("bill_id", bill.bill_id)
        .order("date", { ascending: false });

      // Fetch detailed vote records for each roll call
      let rollCallsWithVotes: (RollCall & { votes?: (Vote & { person?: Person })[] })[] = [];
      if (rollCallData && rollCallData.length > 0) {
        rollCallsWithVotes = await Promise.all(
          rollCallData.map(async (rollCall) => {
            // Get votes for this roll call
            const { data: votesData } = await supabase
              .from("Votes")
              .select("*")
              .eq("roll_call_id", rollCall.roll_call_id);

            // Get person data for the votes
            let votesWithPeople: (Vote & { person?: Person })[] = [];
            if (votesData && votesData.length > 0) {
              const voterIds = votesData.map(v => v.people_id);
              const { data: votersData } = await supabase
                .from("People")
                .select("*")
                .in("people_id", voterIds);

              votesWithPeople = votesData.map(vote => ({
                ...vote,
                person: votersData?.find(p => p.people_id === vote.people_id)
              }));
            }

            return {
              ...rollCall,
              votes: votesWithPeople
            };
          })
        );
      }

      setHistory(historyData || []);
      setSponsors(sponsorsWithPeople);
      setRollCalls(rollCallsWithVotes);

    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const generateMemberSlug = (person: Person) => {
    if (!person.name) return '';
    return person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleAIAnalysis = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      // Create a new chat session for this bill
      const sessionData = {
        user_id: user.id,
        bill_id: bill.bill_id,
        title: `Chat about ${bill.bill_number || 'Bill'}`,
        messages: JSON.stringify([])
      };

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      // Navigate to the new chat with the initial prompt
      const initialPrompt = `Tell me about bill ${bill.bill_number}`;
      navigate(`/c/${data.id}?prompt=${encodeURIComponent(initialPrompt)}`);
    } catch (error) {
      console.error("Error creating chat session:", error);
    }
  };

  return (
    <div className="page-container min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Navigation Section */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onBack}
              className="btn-secondary font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bills
            </Button>

            {/* Right side controls */}
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

          {/* Bill Summary Section - Full Width */}
          <BillSummary
            bill={bill}
            sponsors={sponsors}
            reviewStatus={billReview?.review_status}
            hasNotes={notes.length > 0}
          />

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
                  <span className="text-muted-foreground italic">Add your notes here.</span>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {notes.map((note) => (
                    <AccordionItem key={note.id} value={note.id} className="border-b last:border-b-0">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3 text-left">
                          <span className="text-xs text-muted-foreground">
                            {formatNoteDate(note.updated_at || note.created_at)}
                          </span>
                          <span className="text-sm truncate max-w-[300px]">
                            {note.content.substring(0, 50)}{note.content.length > 50 ? '...' : ''}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap mb-3">
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

          {/* Bill Chat Section - Shows chats related to this bill */}
          <Card className="bg-card rounded-xl shadow-sm border">
            <CardHeader className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg font-semibold">
                    Bill Chats
                  </CardTitle>
                  {billChats.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {billChats.length} {billChats.length === 1 ? 'chat' : 'chats'}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAIAnalysis}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {billChats.length === 0 ? (
                <div className="bg-muted/30 rounded-lg p-4 text-sm">
                  <span className="text-muted-foreground italic">No chats yet. Start a conversation about this bill.</span>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {billChats.map((chat) => (
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

          {/* Bill Tabs Section */}
          <section>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted rounded-lg">
                <TabsTrigger value="overview" className="h-10 rounded-md text-sm font-medium">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="sponsors" className="h-10 rounded-md text-sm font-medium">
                  Sponsors
                </TabsTrigger>
                <TabsTrigger value="history" className="h-10 rounded-md text-sm font-medium">
                  History
                </TabsTrigger>
                <TabsTrigger value="votes" className="h-10 rounded-md text-sm font-medium">
                  Votes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Bill Key Information Section */}
                <BillKeyInformation bill={bill} sponsors={sponsors} totalSponsors={sponsors.length} />
              </TabsContent>

              <TabsContent value="sponsors" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Bill Sponsors</h2>
                    <Badge variant="secondary" className="text-xs">
                      {sponsors.length} {sponsors.length === 1 ? 'Sponsor' : 'Sponsors'}
                    </Badge>
                  </div>
                  <div>
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : sponsors.length === 0 ? (
                      <p className="text-muted-foreground text-center py-12">
                        No sponsors information available for this bill.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sponsors.map((sponsor, _index) => {
                          const memberSlug = sponsor.person ? generateMemberSlug(sponsor.person) : '';
                          const memberUrl = memberSlug ? `/members/${memberSlug}` : '#';

                          return sponsor.person && memberSlug ? (
                            <Link
                              key={sponsor.id}
                              to={memberUrl}
                              className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors block"
                            >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {sponsor.person?.photo_url && !failedImages.has(sponsor.people_id) ? (
                                  <img
                                    src={sponsor.person.photo_url}
                                    alt={sponsor.person?.name || 'Sponsor photo'}
                                    className="w-8 h-8 rounded-full object-cover bg-primary/10"
                                    onError={() => {
                                      console.log(`Failed to load image for sponsor: ${sponsor.person?.name}`);
                                      setFailedImages(prev => new Set([...prev, sponsor.people_id]));
                                    }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                  </div>
                                )}
                                {sponsor.position === 1 && (
                                  <Badge variant="default" className="text-xs">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              {sponsor.position && (
                                <span className="text-xs text-muted-foreground">#{sponsor.position}</span>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">
                                {sponsor.person?.name || 
                                 `${sponsor.person?.first_name || ''} ${sponsor.person?.last_name || ''}`.trim() ||
                                 `Person ID: ${sponsor.people_id}`}
                              </h4>
                              
                              <div className="flex flex-wrap gap-2">
                                {sponsor.person?.party && (
                                  <Badge variant="outline" className="text-xs">
                                    {sponsor.person.party}
                                  </Badge>
                                )}
                                {sponsor.person?.chamber && (
                                  <Badge variant="outline" className="text-xs">
                                    {sponsor.person.chamber}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-xs text-muted-foreground">
                                {sponsor.person?.role && (
                                  <p>{sponsor.person.role}</p>
                                )}
                                {sponsor.person?.district && (
                                  <p>District {sponsor.person.district}</p>
                                )}
                              </div>
                            </div>
                            </Link>
                          ) : (
                            <div key={sponsor.id} className="p-4 border border-border rounded-lg bg-muted/10">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                  </div>
                                  {sponsor.position === 1 && (
                                    <Badge variant="default" className="text-xs">
                                      Primary
                                    </Badge>
                                  )}
                                </div>
                                {sponsor.position && (
                                  <span className="text-xs text-muted-foreground">#{sponsor.position}</span>
                                )}
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-muted-foreground">
                                  Person ID: {sponsor.people_id}
                                </h4>
                                <p className="text-xs text-muted-foreground">Member information not available</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Legislative History</h2>
                    <Badge variant="secondary" className="text-xs">
                      {history.length} {history.length === 1 ? 'Action' : 'Actions'}
                    </Badge>
                  </div>
                  <div>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : history.length === 0 ? (
                      <p className="text-muted-foreground text-center py-12">
                        No legislative history available for this bill.
                      </p>
                    ) : (
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-6 top-6 bottom-6 w-px bg-border"></div>
                          
                          <div className="space-y-6">
                            {history.map((entry, _index) => (
                              <div key={`${entry.date}-${entry.sequence}`} className="relative flex gap-6">
                                {/* Timeline dot */}
                                <div className="flex-shrink-0 w-3 h-3 bg-primary rounded-full mt-2 relative z-10"></div>
                                
                                <div className="flex-1 pb-6">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-medium text-sm">
                                      {formatDate(entry.date)}
                                    </h4>
                                    {entry.chamber && (
                                      <Badge variant="outline" className="text-xs">
                                        {entry.chamber}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      Sequence {entry.sequence}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {entry.action || "No action recorded"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="votes" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Voting Records</h2>
                    <Badge variant="secondary" className="text-xs">
                      {rollCalls.length} {rollCalls.length === 1 ? 'Vote' : 'Votes'}
                    </Badge>
                  </div>
                  <div>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : rollCalls.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Voting Records</h3>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto">
                          No roll call votes have been recorded for this bill yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {rollCalls.map((rollCall, _index) => (
                          <div key={rollCall.roll_call_id} className="border border-border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium text-sm">
                                    {formatDate(rollCall.date)}
                                  </h4>
                                  {rollCall.chamber && (
                                    <Badge variant="outline" className="text-xs">
                                      {rollCall.chamber}
                                    </Badge>
                                  )}
                                </div>
                                {rollCall.description && (
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {rollCall.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="font-medium">{rollCall.yea || 0} Yes</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="font-medium">{rollCall.nay || 0} No</span>
                                  </div>
                                  {rollCall.absent && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-muted rounded-full"></div>
                                      <span className="font-medium">{rollCall.absent} Absent</span>
                                    </div>
                                  )}
                                  {rollCall.nv && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                      <span className="font-medium">{rollCall.nv} NV</span>
                                    </div>
                                  )}
                                  <div className="text-muted-foreground">
                                    Total: {rollCall.total || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {rollCall.votes && rollCall.votes.length > 0 && (
                              <div className="border-t border-border pt-4">
                                <h5 className="font-medium text-sm mb-3">Individual Votes</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                  {rollCall.votes.map((vote, _voteIndex) => (
                                    <div key={`${vote.people_id}-${vote.roll_call_id}`} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                                      <span className="font-medium">
                                        {vote.person?.name || `Person ${vote.people_id}`}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {vote.person?.party && (
                                          <Badge variant="outline" className="text-xs px-1 py-0">
                                            {vote.person.party}
                                          </Badge>
                                        )}
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          vote.vote_desc === 'Yes' || vote.vote_desc === 'Yea' ? 'bg-green-100 text-green-800' :
                                          vote.vote_desc === 'No' || vote.vote_desc === 'Nay' ? 'bg-red-100 text-red-800' :
                                          'bg-muted text-muted-foreground'
                                        }`}>
                                          {vote.vote_desc || 'Unknown'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>

      {/* Quick Review Note Dialog */}
      <QuickReviewNoteDialog
        isOpen={noteDialogOpen}
        onClose={() => {
          setNoteDialogOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialStatus={billReview?.review_status}
        initialNote={editingNote?.content || ''}
      />
    </div>
  );
};