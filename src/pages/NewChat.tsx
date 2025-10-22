import { useState, useRef, useEffect } from "react";
import { Paperclip, ArrowUp, Search as SearchIcon, FileText, Users, Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';
import { useModel } from "@/contexts/ModelContext";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CitationText } from "@/components/CitationText";
import { CitationTabs } from "@/components/CitationTabs";
import { PerplexityCitation, extractCitationNumbers } from "@/utils/citationParser";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Featuring real bills from our database
const samplePrompts = [
  {
    title: "How would Assemblywoman Solages' bill A00405 improve childcare affordability by providing diaper assistance for families receiving safety net support?",
    category: "Child Care Policy"
  },
  {
    title: "What protections does Assemblyman Bores' A00768, the 'NY Artificial Intelligence Consumer Protection Act', establish against algorithmic discrimination?",
    category: "AI & Technology"
  }
];

interface BillCitation {
  bill_number: string;
  title: string;
  status_desc: string;
  description?: string;
  committee?: string;
  session_id?: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  streamedContent?: string;
  searchQueries?: string[];
  reviewedInfo?: string;
  citations?: BillCitation[];
  perplexityCitations?: PerplexityCitation[];
  isPerplexityResponse?: boolean;
}

const NewChat = () => {
  const [query, setQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedModel } = useModel();

  // Selected items state
  const [selectedBills, setSelectedBills] = useState<BillCitation[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [selectedCommittees, setSelectedCommittees] = useState<any[]>([]);

  // Dialog state
  const [billsDialogOpen, setBillsDialogOpen] = useState(false);
  const [billsSearch, setBillsSearch] = useState("");
  const [availableBills, setAvailableBills] = useState<BillCitation[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);

  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [membersSearch, setMembersSearch] = useState("");
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [committeesDialogOpen, setCommitteesDialogOpen] = useState(false);
  const [committeesSearch, setCommitteesSearch] = useState("");
  const [availableCommittees, setAvailableCommittees] = useState<any[]>([]);
  const [committeesLoading, setCommitteesLoading] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Fetch bills for dialog
  const fetchBillsForSelection = async () => {
    setBillsLoading(true);
    try {
      const { data, error } = await supabase
        .from("Bills")
        .select("bill_number, title, status_desc, description, committee, session_id")
        .order("bill_number", { ascending: true })
        .limit(100);

      if (error) throw error;
      setAvailableBills(data || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setBillsLoading(false);
    }
  };

  // Load bills when dialog opens
  useEffect(() => {
    if (billsDialogOpen && availableBills.length === 0) {
      fetchBillsForSelection();
    }
  }, [billsDialogOpen]);

  // Fetch members for dialog
  const fetchMembersForSelection = async () => {
    setMembersLoading(true);
    try {
      const { data, error } = await supabase
        .from("People")
        .select("people_id, name, party, chamber, district")
        .eq("archived", false)
        .order("name", { ascending: true })
        .limit(100);

      if (error) throw error;
      setAvailableMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setMembersLoading(false);
    }
  };

  // Load members when dialog opens
  useEffect(() => {
    if (membersDialogOpen && availableMembers.length === 0) {
      fetchMembersForSelection();
    }
  }, [membersDialogOpen]);

  // Fetch committees for dialog
  const fetchCommitteesForSelection = async () => {
    setCommitteesLoading(true);
    try {
      const { data, error } = await supabase
        .from("Committees")
        .select("committee_id, committee_name, chamber, chair_name")
        .order("committee_name", { ascending: true })
        .limit(100);

      if (error) throw error;
      setAvailableCommittees(data || []);
    } catch (error) {
      console.error("Error fetching committees:", error);
    } finally {
      setCommitteesLoading(false);
    }
  };

  // Load committees when dialog opens
  useEffect(() => {
    if (committeesDialogOpen && availableCommittees.length === 0) {
      fetchCommitteesForSelection();
    }
  }, [committeesDialogOpen]);

  // Note: Real streaming is now handled by the edge functions
  // The fake client-side streaming has been removed for better performance

  // Fetch full bill data from NYS Legislature API
  const fetchFullBillData = async (billNumber: string, sessionYear: number = 2025) => {
    try {
      // Call NYS API edge function to get full bill details
      const { data, error } = await supabase.functions.invoke('nys-legislation-search', {
        body: {
          action: 'get-bill-detail',
          billNumber: billNumber,
          sessionYear: sessionYear
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching full bill data for ${billNumber}:`, error);
      return null;
    }
  };

  // Fetch relevant bills from database to use as citations
  const fetchRelevantBills = async (query: string): Promise<BillCitation[]> => {
    try {
      // Extract bill numbers (e.g., A00405, S12345, etc.)
      const billNumberPattern = /[ASK]\d{5,}/gi;
      const billNumbers = query.match(billNumberPattern) || [];

      // If specific bill numbers are mentioned, fetch those first
      if (billNumbers.length > 0) {
        const { data: exactBills, error } = await supabase
          .from("Bills")
          .select("bill_number, title, status_desc, description, committee, session_id")
          .in("bill_number", billNumbers.map(b => b.toUpperCase()))
          .limit(5);

        if (error) throw error;

        // If we found the exact bills, return them
        if (exactBills && exactBills.length > 0) {
          return exactBills;
        }
      }

      // Otherwise, extract keywords and search by content
      // Remove common words and extract meaningful keywords
      const stopWords = ['how', 'would', 'does', 'what', 'the', 'is', 'in', 'to', 'for', 'by', 'and', 'or', 'of', 'a', 'an'];
      const keywords = query
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.includes(word))
        .slice(0, 5); // Take top 5 keywords

      if (keywords.length > 0) {
        // Build search conditions for keywords
        const keywordSearches = keywords.map(kw =>
          `title.ilike.%${kw}%,description.ilike.%${kw}%`
        ).join(',');

        const { data, error } = await supabase
          .from("Bills")
          .select("bill_number, title, status_desc, description, committee, session_id")
          .or(keywordSearches)
          .limit(5);

        if (error) throw error;
        return data || [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching bills:", error);
      return [];
    }
  };

  const handlePromptClick = (prompt: string) => {
    setQuery(prompt);
    handleSubmit(null, prompt);
  };

  const handleSubmit = async (e: React.FormEvent | null, promptText?: string) => {
    if (e) e.preventDefault();

    const userQuery = promptText || query.trim();
    if (!userQuery) return;

    // Start chat interface
    setChatStarted(true);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userQuery,
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsTyping(true);

    try {
      // Fetch relevant bills while AI generates response
      const relevantBills = await fetchRelevantBills(userQuery);

      // Extract bill numbers from query to fetch full data
      const billNumberPattern = /[ASK]\d{5,}/gi;
      const billNumbers = userQuery.match(billNumberPattern) || [];

      // Fetch full bill data from NYS API for specific bills mentioned
      let fullBillData = null;
      if (billNumbers.length > 0) {
        // Get the first bill's full data from NYS API
        const billNumber = billNumbers[0].toUpperCase();
        fullBillData = await fetchFullBillData(billNumber);
      }

      // Format bill data as context for Claude
      let billContext = null;

      if (fullBillData && fullBillData.result) {
        // Use full bill data from NYS API (rich context)
        const bill = fullBillData.result;
        billContext =
          `\n# FULL LEGISLATIVE DATA FROM NY STATE LEGISLATURE\n\n` +
          `## Bill ${bill.printNo || bill.basePrintNo}\n` +
          `**Session Year:** ${bill.session}\n` +
          `**Title:** ${bill.title || 'N/A'}\n` +
          `**Status:** ${bill.status?.statusDesc || 'Unknown'}\n` +
          `**Sponsor:** ${bill.sponsor?.member?.fullName || 'Unknown'}\n` +
          `**Committee:** ${bill.status?.committeeDesc || 'Not assigned'}\n\n` +
          `### Bill Summary\n${bill.summary || 'No summary available'}\n\n` +
          `### Full Bill Text\n${bill.fullText || bill.amendmentVersions?.[0]?.fullText || 'Full text not available'}\n\n` +
          `### Sponsor Memo\n${bill.amendmentVersions?.[0]?.memo || 'No sponsor memo available'}\n`;
      } else if (relevantBills.length > 0) {
        // Fallback to database metadata
        billContext = relevantBills.map(bill =>
            `\n## Bill ${bill.bill_number}\n` +
            `**Title:** ${bill.title}\n` +
            `**Status:** ${bill.status_desc || 'Unknown'}\n` +
            `**Committee:** ${bill.committee || 'Not assigned'}\n` +
            `**Session:** ${bill.session_id || 'N/A'}\n` +
            `**Description:** ${bill.description || 'No description available'}\n`
          ).join('\n');
      }

      // Determine which edge function to call based on model
      const isClaudeModel = selectedModel.startsWith('claude-');
      const isPerplexityModel = selectedModel.includes('sonar');
      const edgeFunction = isClaudeModel
        ? 'generate-with-claude'
        : isPerplexityModel
          ? 'generate-with-perplexity'
          : 'generate-with-openai';

      // Get Supabase URL from the client (avoids env var issues)
      const supabaseUrl = supabase.supabaseUrl;
      const { data: { session } } = await supabase.auth.getSession();

      // Create placeholder streaming message
      const messageId = `assistant-${Date.now()}`;
      const streamingMessage: Message = {
        id: messageId,
        role: "assistant",
        content: "",
        isStreaming: true,
        streamedContent: "",
        searchQueries: [
          `Searched for "${userQuery.substring(0, 60)}${userQuery.length > 60 ? '...' : ''}" in NY State Legislature`,
          `Searched for "${userQuery.substring(0, 60)}${userQuery.length > 60 ? '...' : ''}" in NY State Bills Database`,
        ],
      };
      setMessages(prev => [...prev, streamingMessage]);

      // Call edge function with streaming via direct fetch
      const response = await fetch(`${supabaseUrl}/functions/v1/${edgeFunction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
        },
        body: JSON.stringify({
          prompt: userQuery,
          type: 'default',
          context: billContext,
          stream: true,
          model: selectedModel
        }),
      });

      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status}`);
      }

      // Read streaming response
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

                // Handle different streaming formats
                let content = '';
                if (parsed.choices?.[0]?.delta?.content) {
                  // OpenAI/Perplexity format
                  content = parsed.choices[0].delta.content;
                } else if (parsed.delta?.text) {
                  // Claude format
                  content = parsed.delta.text;
                }

                if (content) {
                  aiResponse += content;
                  // Update UI with streamed content
                  setMessages(prev => prev.map(msg =>
                    msg.id === messageId
                      ? { ...msg, streamedContent: aiResponse }
                      : msg
                  ));
                }
              } catch (e) {
                // Skip invalid JSON chunks
                console.debug('Skipping chunk:', line);
              }
            }
          }
        }
      }

      if (!aiResponse) {
        aiResponse = 'I apologize, but I encountered an error. Please try again.';
      }

      // Extract Perplexity citations if this is a Perplexity response
      let perplexityCitations: PerplexityCitation[] = [];
      if (isPerplexityModel && aiResponse) {
        // Extract citation numbers from the response
        const citationNumbers = extractCitationNumbers(aiResponse);

        // Create mock citation data
        // TODO: Replace with actual citation data from Perplexity API response
        perplexityCitations = citationNumbers.map(num => ({
          number: num,
          url: `https://example.com/source-${num}`,
          title: `Source ${num}`,
          excerpt: ''
        }));

        console.log('Extracted Perplexity citations:', perplexityCitations);
      }

      // Extract bill numbers from AI response to fetch accurate citations
      let responseCitations = relevantBills; // Default to query-based search
      if (aiResponse) {
        const responseBillNumbers = aiResponse.match(/[ASK]\d{4,}/gi) || [];
        if (responseBillNumbers.length > 0) {
          try {
            // Fetch the exact bills mentioned in the AI response
            const { data: mentionedBills, error } = await supabase
              .from("Bills")
              .select("bill_number, title, status_desc, description, committee, session_id")
              .in("bill_number", responseBillNumbers.map(b => b.toUpperCase()))
              .limit(10);

            if (!error && mentionedBills && mentionedBills.length > 0) {
              responseCitations = mentionedBills;
              console.log(`Found ${mentionedBills.length} bills mentioned in AI response`);
            }
          } catch (error) {
            console.error("Error fetching bills from AI response:", error);
            // Fall back to relevantBills
          }
        }
      }

      // Finalize the streaming message with all metadata
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              content: aiResponse,
              isStreaming: false,
              streamedContent: aiResponse,
              reviewedInfo: `Reviewed ${responseCitations.length} bills: ${
                responseCitations.length > 0
                  ? `Found relevant legislation including ${responseCitations[0]?.bill_number || 'pending bills'} related to your query.`
                  : 'No directly matching bills found, providing general legislative context.'
              }`,
              citations: responseCitations,
              perplexityCitations: isPerplexityModel ? perplexityCitations : undefined,
              isPerplexityResponse: isPerplexityModel
            }
          : msg
      ));

      setIsTyping(false);

    } catch (error) {
      console.error('Error generating response:', error);

      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an error generating a response. Please try again.",
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-32">
        {!chatStarted ? (
          /* Initial State - Prompt Cards */
          <div className="flex flex-col items-center justify-center min-h-full px-4">
            <h1 className="text-4xl md:text-5xl font-semibold text-center mb-12 tracking-tight">
              What are you researching?
            </h1>

            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {samplePrompts.map((prompt, index) => (
                <Card
                  key={index}
                  className={cn(
                    "p-5 cursor-pointer transition-all duration-200 border",
                    "hover:border-primary hover:shadow-md",
                    hoveredCard === index && "border-primary shadow-md"
                  )}
                  onClick={() => handlePromptClick(prompt.title)}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    {prompt.category}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {prompt.title}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Chat State - Messages */
          <div className="pt-8 pb-16 px-4">
            <div className="w-full max-w-[720px] mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {message.role === "user" ? (
                  <div className="bg-muted/40 rounded-lg p-4 border-0">
                    <p className="text-base leading-relaxed">{message.content}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Enhanced Searched and Reviewed Section with Process Content */}
                    {(message.searchQueries || message.reviewedInfo) && (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem
                          value="sources"
                          className="border-0 relative before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-dashed before:border-border/50 data-[state=open]:before:border-border/70 before:transition-colors before:duration-300"
                        >
                          <div className="relative p-0.5">
                            <AccordionTrigger className="hover:no-underline px-4 py-2.5 rounded-t-lg text-xs font-medium">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <SearchIcon className="h-3.5 w-3.5" />
                                <span>Searched and reviewed sources</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3 space-y-3">
                              {/* Searching Section */}
                              {message.searchQueries && (
                                <div className="space-y-1.5">
                                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <SearchIcon className={cn(
                                      "h-3 w-3",
                                      message.isStreaming ? "text-primary animate-pulse" : "text-muted-foreground"
                                    )} />
                                    Searching
                                  </h3>
                                  <div className="pl-5 space-y-1">
                                    {message.searchQueries.map((query, idx) => (
                                      <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <div className={cn(
                                          "w-1 h-1 rounded-full mt-1.5 flex-shrink-0",
                                          message.isStreaming ? "bg-primary animate-pulse" : "bg-muted-foreground/50"
                                        )} />
                                        <span>{query}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Reviewing Sources Section */}
                              {message.reviewedInfo && !message.isStreaming && (
                                <div className="space-y-1.5">
                                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <FileText className="h-3 w-3 text-muted-foreground" />
                                    Reviewing sources · {message.citations?.length || 0}
                                  </h3>
                                  <div className="pl-5">
                                    <p className="text-xs text-muted-foreground">{message.reviewedInfo}</p>
                                  </div>
                                </div>
                              )}

                              {/* Finished State */}
                              {!message.isStreaming && (
                                <div className="space-y-1.5">
                                  <h3 className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                                    </div>
                                    Finished
                                  </h3>
                                </div>
                              )}
                            </AccordionContent>
                          </div>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* AI Response */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {message.isPerplexityResponse && message.perplexityCitations ? (
                        // Render Perplexity response with inline citation badges
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => {
                              const textContent = String(children);
                              return (
                                <p className="mb-3 leading-relaxed text-foreground">
                                  <CitationText
                                    text={textContent}
                                    citations={message.perplexityCitations || []}
                                    onCitationClick={(num) => {
                                      console.log('Citation clicked:', num);
                                    }}
                                  />
                                </p>
                              );
                            },
                            strong: ({ children }) => (
                              <strong className="font-semibold text-foreground">
                                {children}
                              </strong>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-xl font-semibold mb-3 text-foreground">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-semibold mb-2 text-foreground">
                                {children}
                              </h2>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-5 mb-3 space-y-1">
                                {children}
                              </ul>
                            ),
                            li: ({ children }) => (
                              <li className="text-foreground text-sm">{children}</li>
                            ),
                          }}
                        >
                          {message.isStreaming ? message.streamedContent || '' : message.content}
                        </ReactMarkdown>
                      ) : (
                        // Standard markdown rendering
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-3 leading-relaxed text-foreground">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-foreground">
                                {children}
                              </strong>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-xl font-semibold mb-3 text-foreground">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-semibold mb-2 text-foreground">
                                {children}
                              </h2>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-5 mb-3 space-y-1">
                                {children}
                              </ul>
                            ),
                            li: ({ children }) => (
                              <li className="text-foreground text-sm">{children}</li>
                            ),
                          }}
                        >
                          {message.isStreaming ? message.streamedContent || '' : message.content}
                        </ReactMarkdown>
                      )}
                      {message.isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5">|</span>
                      )}
                    </div>

                    {/* Tabbed Citations (Bills + Research Sources) with Default Sources */}
                    {!message.isStreaming && (message.citations || message.perplexityCitations) && (
                      <CitationTabs
                        bills={message.citations || []}
                        sources={[
                          ...(message.perplexityCitations || []),
                          // Always include default sources
                          {
                            number: (message.perplexityCitations?.length || 0) + 1,
                            url: 'https://www.goodable.dev',
                            title: 'Goodable - Legislative Policy Platform',
                            excerpt: 'AI-powered legislative research and policy analysis platform.'
                          },
                          {
                            number: (message.perplexityCitations?.length || 0) + 2,
                            url: 'https://nyassembly.gov/',
                            title: 'New York State Assembly',
                            excerpt: 'Official website of the New York State Assembly with bill tracking and legislative information.'
                          },
                          {
                            number: (message.perplexityCitations?.length || 0) + 3,
                            url: 'https://www.nysenate.gov/',
                            title: 'New York State Senate',
                            excerpt: 'Official website of the New York State Senate with comprehensive legislative data.'
                          },
                        ]}
                        onCitationClick={(num) => {
                          console.log('Citation clicked:', num);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator - Only show before streaming starts */}
            {isTyping && !messages.some(msg => msg.isStreaming) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full"></div>
                  <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full delay-75"></div>
                  <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full delay-150"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Input Area - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-background z-[5]">
        <div className="w-full px-4 py-4">
          <div className="max-w-[720px] mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              {/* Larger input box - Fintool/Claude style */}
              <div className="rounded-2xl bg-muted/50 border-0 p-3 shadow-lg">
                {/* Selected Items Chips */}
                {(selectedBills.length > 0 || selectedMembers.length > 0 || selectedCommittees.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedBills.map((bill) => (
                      <div
                        key={bill.bill_number}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
                      >
                        <FileText className="h-3 w-3" />
                        <span>{bill.bill_number}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedBills(prev => prev.filter(b => b.bill_number !== bill.bill_number))}
                          className="hover:bg-primary/20 rounded-sm p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {selectedMembers.map((member) => (
                      <div
                        key={member.people_id}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded-md text-xs font-medium"
                      >
                        <Users className="h-3 w-3" />
                        <span>{member.name}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedMembers(prev => prev.filter(m => m.people_id !== member.people_id))}
                          className="hover:bg-green-500/20 rounded-sm p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {selectedCommittees.map((committee) => (
                      <div
                        key={committee.committee_id}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-md text-xs font-medium"
                      >
                        <Building2 className="h-3 w-3" />
                        <span>{committee.committee_name}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedCommittees(prev => prev.filter(c => c.committee_id !== committee.committee_id))}
                          className="hover:bg-orange-500/20 rounded-sm p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Input */}
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 min-h-[60px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 placeholder:text-muted-foreground/60"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                />

                {/* Bottom Row with Buttons */}
                <div className="flex items-center justify-between">
                  {/* Left Side - Attachment + Filter Buttons */}
                  <div className="flex gap-1">
                    {/* Attachment Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                      title="Attach files"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>

                    <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                          title="Select Members"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Select Members</DialogTitle>
                        </DialogHeader>

                        {/* Search Input */}
                        <div className="px-6 pb-4">
                          <Input
                            placeholder="Search members by name..."
                            value={membersSearch}
                            onChange={(e) => setMembersSearch(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        {/* Members Table */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                          {membersLoading ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                              Loading members...
                            </div>
                          ) : (
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                  <tr>
                                    <th className="text-left p-3 font-medium">Name</th>
                                    <th className="text-left p-3 font-medium">Party</th>
                                    <th className="text-left p-3 font-medium">Chamber</th>
                                    <th className="text-left p-3 font-medium">District</th>
                                    <th className="text-center p-3 font-medium w-20">Select</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {availableMembers
                                    .filter(member =>
                                      membersSearch === "" ||
                                      member.name.toLowerCase().includes(membersSearch.toLowerCase())
                                    )
                                    .map((member) => {
                                      const isSelected = selectedMembers.some(m => m.people_id === member.people_id);
                                      return (
                                        <tr
                                          key={member.people_id}
                                          className={cn(
                                            "border-t hover:bg-muted/30 cursor-pointer transition-colors",
                                            isSelected && "bg-green-500/5"
                                          )}
                                          onClick={() => {
                                            if (isSelected) {
                                              setSelectedMembers(prev => prev.filter(m => m.people_id !== member.people_id));
                                            } else {
                                              setSelectedMembers(prev => [...prev, member]);
                                            }
                                          }}
                                        >
                                          <td className="p-3 font-medium">{member.name}</td>
                                          <td className="p-3 text-muted-foreground">{member.party || 'N/A'}</td>
                                          <td className="p-3 text-muted-foreground">{member.chamber || 'N/A'}</td>
                                          <td className="p-3 text-muted-foreground">{member.district || 'N/A'}</td>
                                          <td className="p-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                if (isSelected) {
                                                  setSelectedMembers(prev => prev.filter(m => m.people_id !== member.people_id));
                                                } else {
                                                  setSelectedMembers(prev => [...prev, member]);
                                                }
                                              }}
                                              className="w-4 h-4 rounded"
                                            />
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Footer with selected count */}
                        <div className="px-6 py-3 border-t flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                          </span>
                          <Button onClick={() => setMembersDialogOpen(false)} size="sm">
                            Done
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={committeesDialogOpen} onOpenChange={setCommitteesDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                          title="Select Committees"
                        >
                          <Building2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Select Committees</DialogTitle>
                        </DialogHeader>

                        {/* Search Input */}
                        <div className="px-6 pb-4">
                          <Input
                            placeholder="Search committees by name..."
                            value={committeesSearch}
                            onChange={(e) => setCommitteesSearch(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        {/* Committees Table */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                          {committeesLoading ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                              Loading committees...
                            </div>
                          ) : (
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                  <tr>
                                    <th className="text-left p-3 font-medium">Committee Name</th>
                                    <th className="text-left p-3 font-medium">Chamber</th>
                                    <th className="text-left p-3 font-medium">Chair</th>
                                    <th className="text-center p-3 font-medium w-20">Select</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {availableCommittees
                                    .filter(committee =>
                                      committeesSearch === "" ||
                                      committee.committee_name.toLowerCase().includes(committeesSearch.toLowerCase())
                                    )
                                    .map((committee) => {
                                      const isSelected = selectedCommittees.some(c => c.committee_id === committee.committee_id);
                                      return (
                                        <tr
                                          key={committee.committee_id}
                                          className={cn(
                                            "border-t hover:bg-muted/30 cursor-pointer transition-colors",
                                            isSelected && "bg-orange-500/5"
                                          )}
                                          onClick={() => {
                                            if (isSelected) {
                                              setSelectedCommittees(prev => prev.filter(c => c.committee_id !== committee.committee_id));
                                            } else {
                                              setSelectedCommittees(prev => [...prev, committee]);
                                            }
                                          }}
                                        >
                                          <td className="p-3 font-medium">{committee.committee_name}</td>
                                          <td className="p-3 text-muted-foreground">{committee.chamber || 'N/A'}</td>
                                          <td className="p-3 text-muted-foreground">{committee.chair_name || 'N/A'}</td>
                                          <td className="p-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                if (isSelected) {
                                                  setSelectedCommittees(prev => prev.filter(c => c.committee_id !== committee.committee_id));
                                                } else {
                                                  setSelectedCommittees(prev => [...prev, committee]);
                                                }
                                              }}
                                              className="w-4 h-4 rounded"
                                            />
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Footer with selected count */}
                        <div className="px-6 py-3 border-t flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {selectedCommittees.length} committee{selectedCommittees.length !== 1 ? 's' : ''} selected
                          </span>
                          <Button onClick={() => setCommitteesDialogOpen(false)} size="sm">
                            Done
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={billsDialogOpen} onOpenChange={setBillsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                          title="Select Bills"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Select Bills</DialogTitle>
                        </DialogHeader>

                        {/* Search Input */}
                        <div className="px-6 pb-4">
                          <Input
                            placeholder="Search bills by number or title..."
                            value={billsSearch}
                            onChange={(e) => setBillsSearch(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        {/* Bills Table */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                          {billsLoading ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                              Loading bills...
                            </div>
                          ) : (
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                  <tr>
                                    <th className="text-left p-3 font-medium">Bill Number</th>
                                    <th className="text-left p-3 font-medium">Title</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-center p-3 font-medium w-20">Select</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {availableBills
                                    .filter(bill =>
                                      billsSearch === "" ||
                                      bill.bill_number.toLowerCase().includes(billsSearch.toLowerCase()) ||
                                      bill.title.toLowerCase().includes(billsSearch.toLowerCase())
                                    )
                                    .map((bill) => {
                                      const isSelected = selectedBills.some(b => b.bill_number === bill.bill_number);
                                      return (
                                        <tr
                                          key={bill.bill_number}
                                          className={cn(
                                            "border-t hover:bg-muted/30 cursor-pointer transition-colors",
                                            isSelected && "bg-primary/5"
                                          )}
                                          onClick={() => {
                                            if (isSelected) {
                                              setSelectedBills(prev => prev.filter(b => b.bill_number !== bill.bill_number));
                                            } else {
                                              setSelectedBills(prev => [...prev, bill]);
                                            }
                                          }}
                                        >
                                          <td className="p-3 font-medium">{bill.bill_number}</td>
                                          <td className="p-3 max-w-md truncate">{bill.title}</td>
                                          <td className="p-3 text-muted-foreground">{bill.status_desc || 'N/A'}</td>
                                          <td className="p-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                if (isSelected) {
                                                  setSelectedBills(prev => prev.filter(b => b.bill_number !== bill.bill_number));
                                                } else {
                                                  setSelectedBills(prev => [...prev, bill]);
                                                }
                                              }}
                                              className="w-4 h-4 rounded"
                                            />
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Footer with selected count */}
                        <div className="px-6 py-3 border-t flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {selectedBills.length} bill{selectedBills.length !== 1 ? 's' : ''} selected
                          </span>
                          <Button onClick={() => setBillsDialogOpen(false)} size="sm">
                            Done
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Right Side - Submit Button */}
                  <Button
                    type="submit"
                    size="icon"
                    className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50"
                    disabled={!query.trim()}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            {/* Disclaimer */}
            <div className="flex items-center justify-center gap-1 mt-3">
              <span className="text-xs text-muted-foreground/70">
                Goodable can make mistakes. Please double-check responses.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChat;
