import { useState, useRef, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChatPersistence } from "@/hooks/useChatPersistence";
import { ArrowUp, ArrowDown, Square, Search as SearchIcon, FileText, Users, Building2, Wallet, Paperclip, X, ChevronLeft, ChevronRight, PanelLeft, HandCoins } from "lucide-react";
import { NoteViewSidebar } from "@/components/NoteViewSidebar";
import { Contract } from "@/types/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
// Safe sidebar hook that doesn't throw on public pages without SidebarProvider
import { createContext, useContext } from "react";

// Try to get sidebar context safely
const useSidebarSafe = () => {
  try {
    // Dynamic import to avoid the throw
    const { useSidebar } = require("@/components/ui/sidebar");
    return useSidebar();
  } catch {
    return { setOpen: () => {} };
  }
};
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';
import { useModel } from "@/contexts/ModelContext";
import { Textarea } from "@/components/ui/textarea";
import { ChatHeader } from "@/components/ChatHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CitationText } from "@/components/CitationText";
import { ChatResponseFooter } from "@/components/ChatResponseFooter";
import { PerplexityCitation, extractCitationNumbers } from "@/utils/citationParser";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EngineSelection } from "@/components/EngineSelection";
import { AskGoodableSelectionPopup } from "@/components/AskGoodableSelectionPopup";
import { useAIUsage, countWords } from "@/hooks/useAIUsage";
import { useToast } from "@/hooks/use-toast";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from "@/components/ai-elements/chain-of-thought";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  extractReasoning,
} from "@/components/ai-elements/reasoning";
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationSource,
  parseCitationMarkers,
  CitationSource,
} from "@/components/ai-elements/inline-citation";

// Thinking phrases that rotate per message instance
const thinkingPhrases = [
  "Thinking…",
  "Reflecting…",
  "Considering…",
  "Processing…",
  "Drafting a thought…",
  "Formulating a response…",
  "Gathering context…"
];

// Counter to track which phrase to use (increments with each message)
let thinkingPhraseIndex = 0;

const getNextThinkingPhrase = () => {
  const phrase = thinkingPhrases[thinkingPhraseIndex % thinkingPhrases.length];
  thinkingPhraseIndex++;
  return phrase;
};

// Convert PerplexityCitation to CitationSource format for inline citation rendering
const convertToCitationSources = (perplexityCitations: PerplexityCitation[]): CitationSource[] => {
  return perplexityCitations.map(c => ({
    url: c.url,
    title: c.title,
    description: c.excerpt,
  }));
};

// Helper to parse and separate clients section from message content
const parseClientsSection = (content: string): { mainContent: string; clients: string[] } => {
  const startMarker = '---CLIENTS_START---';
  const endMarker = '---CLIENTS_END---';

  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return { mainContent: content, clients: [] };
  }

  const mainContent = content.substring(0, startIndex).trim();
  const clientsSection = content.substring(startIndex + startMarker.length, endIndex).trim();

  // Parse bullet points (handles both "- " and "* " formats)
  const clients = clientsSection
    .split('\n')
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(line => line.length > 0);

  return { mainContent, clients };
};

// Helper to strip clients section from streaming content and detect loading state
const stripClientsSection = (content: string): { cleanContent: string; isLoadingClients: boolean; partialClients: string[] } => {
  const startMarker = '---CLIENTS_START---';
  const endMarker = '---CLIENTS_END---';

  const startIndex = content.indexOf(startMarker);

  // No clients section started yet
  if (startIndex === -1) {
    return { cleanContent: content, isLoadingClients: false, partialClients: [] };
  }

  const cleanContent = content.substring(0, startIndex).trim();
  const endIndex = content.indexOf(endMarker);

  // Clients section started but not complete - parse partial clients
  if (endIndex === -1) {
    const partialSection = content.substring(startIndex + startMarker.length);
    const partialClients = partialSection
      .split('\n')
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .filter(line => line.length > 0);

    return { cleanContent, isLoadingClients: true, partialClients };
  }

  // Section complete
  return { cleanContent, isLoadingClients: false, partialClients: [] };
};

// Featuring real bills from our database
const samplePrompts = [
  {
    title: "How would Assemblywoman Solages' bill A00405 improve childcare affordability by providing diaper assistance for families receiving safety net support?",
    category: "Child Care Policy"
  },
  {
    title: "What protections does Assemblyman Bores' A00768, the 'NY Artificial Intelligence Consumer Protection Act', establish against algorithmic discrimination?",
    category: "AI & Technology"
  },
  {
    title: "How does Senator Hoylman-Sigal's S00930 expand New York's climate leadership through the NY HEAT Act's building emissions standards?",
    category: "Environment & Climate"
  },
  {
    title: "What healthcare cost protections does Assemblymember Paulin's A02019 provide for patients through surprise billing reforms?",
    category: "Healthcare Policy"
  },
  {
    title: "How would Senator Gounardes' S01369 address housing affordability through good cause eviction protections for tenants?",
    category: "Housing & Tenant Rights"
  },
  {
    title: "What mental health parity requirements does Assemblymember Rosenthal's A01066 establish for insurance coverage of behavioral health services?",
    category: "Mental Health"
  },
  {
    title: "How does Senator Myrie's S01457 expand voting access through automatic voter registration at state agencies?",
    category: "Voting Rights"
  },
  {
    title: "What worker protections does Assemblymember Reyes' A02118 provide through warehouse worker safety standards and quota transparency?",
    category: "Labor Rights"
  }
];

// Context for the "What is NYSgpt?" prompt
const GOODABLE_CONTEXT = `You are answering "What is NYSgpt?" for a new user. NYSgpt is a civic engagement platform focused on New York State legislation. Describe it naturally and highlight these unique features:

- Research any bill and get AI-powered analysis with stakeholder impact, political context, and likelihood of passage
- Email legislators directly - send letters to bill sponsors and CC all co-sponsors with one click
- Generate support or opposition letters instantly using AI
- View official NYS Legislature bill PDFs right in the interface
- Track your position on bills (Support/Oppose/Neutral) and add personal notes via Quick Review
- Every response includes References, Related Bills, and Resources sections

Keep the tone helpful and practical, not preachy. Let the features speak for themselves. End with something like: "Every bill analysis includes tools to email sponsors, generate letters, view official documents, and track your positions."`;

interface BillCitation {
  bill_number: string;
  title: string;
  status_desc: string;
  description?: string;
  committee?: string;
  session_id?: number;
}

interface SchoolFundingCategory {
  name: string;
  baseYear: string;
  schoolYear: string;
  change: string;
  percentChange: string;
}

interface SchoolFundingDetails {
  district: string;
  county: string | null;
  budgetYear: string;
  totalBaseYear: number;
  totalSchoolYear: number;
  totalChange: number;
  percentChange: number;
  categories: SchoolFundingCategory[];
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
  relatedBills?: BillCitation[];
  perplexityCitations?: PerplexityCitation[];
  isPerplexityResponse?: boolean;
  thinkingPhrase?: string;
  schoolFundingData?: SchoolFundingDetails;
  isContractChat?: boolean;
  reasoning?: string;
  reasoningDuration?: number;
}

const NewChat = () => {
  const [query, setQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const promptScrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [mobileDrawerCategory, setMobileDrawerCategory] = useState<string | null>(null);
  const [isMobilePhone, setIsMobilePhone] = useState(false);

  // Detect phone viewport (< 640px)
  useEffect(() => {
    const check = () => setIsMobilePhone(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const { selectedModel } = useModel();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const { setOpen: setSidebarOpen } = useSidebarSafe();
  const { addWordsUsed, isLimitExceeded } = useAIUsage();
  const { toast } = useToast();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    currentSessionId,
    isSaving,
    createSession,
    updateMessages,
    loadSession,
    clearSession,
    setCurrentSessionId,
  } = useChatPersistence();

  // Only show ChatHeader on root page (public), not on /new-chat (authenticated)
  const isPublicPage = location.pathname === "/";

  // Check if we should persist (authenticated users on /new-chat only)
  const shouldPersist = !isPublicPage && !!user;

  // Selected items state
  const [selectedBills, setSelectedBills] = useState<BillCitation[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [selectedCommittees, setSelectedCommittees] = useState<any[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [contractsDialogOpen, setContractsDialogOpen] = useState(false);
  const [contractsSearch, setContractsSearch] = useState("");
  const [availableContracts, setAvailableContracts] = useState<Contract[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [selectedContracts, setSelectedContracts] = useState<Contract[]>([]);

  // Check if user is at the bottom of scroll container
  const checkIfAtBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return true;

    const threshold = 100; // pixels from bottom to consider "at bottom"
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    return isAtBottom;
  };

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom = checkIfAtBottom();
      setShowScrollButton(!isAtBottom);

      // Track if user manually scrolled up (not at bottom during streaming)
      if (!isAtBottom && isTyping) {
        userScrolledRef.current = true;
      }

      // Reset user scrolled flag when they reach bottom
      if (isAtBottom) {
        userScrolledRef.current = false;
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isTyping]);

  // Auto-scroll to bottom (only if user hasn't scrolled up)
  useEffect(() => {
    // Don't auto-scroll if user has manually scrolled up
    if (userScrolledRef.current) return;

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Enable sidebar transitions after mount to prevent flash
  useEffect(() => {
    const timer = setTimeout(() => setSidebarMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom function for the button
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    userScrolledRef.current = false;
    setShowScrollButton(false);
  };


  // Handle "Ask Goodable" popup click - inject selected text into query
  const handleAskGoodable = (selectedText: string) => {
    if (selectedText) {
      // Inject as a quoted reference
      const newQuery = query
        ? `${query}\n\n"${selectedText}"`
        : `"${selectedText}"`;
      setQuery(newQuery);

      // Focus the textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  // Track if we've already auto-submitted the prompt
  const hasAutoSubmittedRef = useRef(false);

  // Track if the current message is a "What is Goodable.dev?" prompt (for disclaimer)
  const isGoodablePromptRef = useRef(false);

  // Track previous session ID to detect navigation to /new-chat
  const prevSessionIdRef = useRef<string | undefined>(routeSessionId);

  // Reset state when navigating from a chat to /new-chat
  useEffect(() => {
    const prevSessionId = prevSessionIdRef.current;
    prevSessionIdRef.current = routeSessionId;

    // If we had a session ID before and now we don't (navigated to /new-chat)
    // AND we have chat content to clear, reset the state
    if (prevSessionId && !routeSessionId && chatStarted) {
      console.log('[NewChat] Detected navigation to /new-chat, resetting state');
      // Stop any ongoing streaming
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (readerRef.current) {
        readerRef.current.cancel();
        readerRef.current = null;
      }
      // Reset chat state
      setMessages([]);
      setQuery("");
      setChatStarted(false);
      setIsTyping(false);
      // Reset scroll state
      setShowScrollButton(false);
      userScrolledRef.current = false;
      // Reset selected items
      setSelectedBills([]);
      setSelectedMembers([]);
      setSelectedCommittees([]);
      setAttachedFiles([]);
      // Clear persisted session
      clearSession();
      // Reset auto-submit ref so new prompts can trigger
      hasAutoSubmittedRef.current = false;
    }
  }, [routeSessionId, chatStarted, clearSession]);

  // Load existing session from URL (e.g., /c/abc123 or /new-chat?session=abc123)
  useEffect(() => {
    // Prefer route param (/c/:sessionId), fallback to query param (?session=)
    const sessionId = routeSessionId || searchParams.get('session');
    console.log('[NewChat] Session load check - sessionId:', sessionId, 'shouldPersist:', shouldPersist, 'currentSessionId:', currentSessionId);
    if (sessionId && shouldPersist && sessionId !== currentSessionId) {
      // Reset state before loading new session
      setMessages([]);
      setChatStarted(false);
      setIsTyping(false);

      loadSession(sessionId).then((sessionData) => {
        if (sessionData && sessionData.messages.length > 0) {
          // Convert persisted messages to our Message format, including citations metadata
          const loadedMessages: Message[] = sessionData.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            // Restore citations metadata for assistant messages
            ...(msg.citations && { citations: msg.citations }),
            ...(msg.relatedBills && { relatedBills: msg.relatedBills }),
            ...(msg.schoolFundingData && { schoolFundingData: msg.schoolFundingData }),
          }));
          setMessages(loadedMessages);
          setChatStarted(true);
          console.log('[NewChat] Loaded session with', loadedMessages.length, 'messages');
        }
      });
    }
  }, [routeSessionId, searchParams, shouldPersist, currentSessionId, loadSession]);

  // Auto-submit prompt from URL parameter
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    const contextParam = searchParams.get('context'); // Hidden context for AI
    const sessionId = routeSessionId || searchParams.get('session');

    // Only auto-submit once, and only if we have a prompt and haven't started a chat yet
    if (promptParam && !hasAutoSubmittedRef.current && !chatStarted && !isTyping) {
      console.log('[NewChat] Auto-submitting prompt:', promptParam, 'with context:', contextParam ? 'yes' : 'no');
      hasAutoSubmittedRef.current = true;

      // Collapse the sidebar when auto-submitting from AI Chat button
      setSidebarOpen(false);

      // If we have a session ID, set it first
      if (sessionId) {
        setCurrentSessionId(sessionId);
      }

      // Small delay to ensure everything is ready
      setTimeout(() => {
        handleSubmit(null, promptParam, contextParam || undefined);
        // Clear the prompt from URL to prevent re-submission on refresh
        navigate(location.pathname, { replace: true });
      }, 200);
    }
  }, [searchParams, chatStarted, isTyping, routeSessionId, setSidebarOpen]);

  // Handle new chat - reset all state
  const handleNewChat = () => {
    // Stop any ongoing streaming
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    // Reset chat state
    setMessages([]);
    setQuery("");
    setChatStarted(false);
    setIsTyping(false);
    // Reset scroll state
    setShowScrollButton(false);
    userScrolledRef.current = false;
    // Reset selected items
    setSelectedBills([]);
    setSelectedMembers([]);
    setSelectedCommittees([]);
    setAttachedFiles([]);
    // Clear persisted session so new messages create a new session
    clearSession();
  };

  // Handle "What is Goodable.dev?" prompt from heart icon click
  const handleWhatIsGoodable = () => {
    // Reset state first (like starting a new chat)
    handleNewChat();
    // Mark this as a special Goodable prompt so we can append the disclaimer
    isGoodablePromptRef.current = true;
    // Small delay to ensure state is reset, then submit the prompt with Goodable context
    setTimeout(() => {
      handleSubmit(null, "What is NYSgpt?", GOODABLE_CONTEXT);
    }, 100);
  };

  // Stop streaming function
  const stopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    setIsTyping(false);
  };

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

  // Fetch contracts for dialog
  const fetchContractsForSelection = async () => {
    setContractsLoading(true);
    try {
      const { data, error } = await supabase
        .from("Contracts")
        .select("*")
        .order("current_contract_amount", { ascending: false, nullsFirst: false })
        .limit(100);

      if (error) {
        console.error("Error fetching contracts:", error);
        throw error;
      }
      console.log("Contracts fetched:", data?.length || 0);
      setAvailableContracts((data as Contract[]) || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setContractsLoading(false);
    }
  };

  // Load contracts when dialog opens
  useEffect(() => {
    if (contractsDialogOpen && availableContracts.length === 0) {
      fetchContractsForSelection();
    }
  }, [contractsDialogOpen]);

  // Lobbying data for mobile drawer
  const [mobileDrawerLobbyists, setMobileDrawerLobbyists] = useState<any[]>([]);
  const [mobileDrawerLoading, setMobileDrawerLoading] = useState(false);

  // Fetch data when mobile drawer category opens
  useEffect(() => {
    if (!mobileDrawerCategory) return;
    if (mobileDrawerCategory === 'bills' && availableBills.length === 0) fetchBillsForSelection();
    if (mobileDrawerCategory === 'members' && availableMembers.length === 0) fetchMembersForSelection();
    if (mobileDrawerCategory === 'committees' && availableCommittees.length === 0) fetchCommitteesForSelection();
    if (mobileDrawerCategory === 'contracts' && availableContracts.length === 0) fetchContractsForSelection();
    if (mobileDrawerCategory === 'lobbying' && mobileDrawerLobbyists.length === 0) {
      setMobileDrawerLoading(true);
      supabase
        .from('lobbyists')
        .select('id, name, type_of_lobbyist')
        .order('name', { ascending: true })
        .limit(50)
        .then(({ data }) => {
          setMobileDrawerLobbyists(data || []);
          setMobileDrawerLoading(false);
        });
    }
  }, [mobileDrawerCategory]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const readFileAsText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent | null, promptText?: string, systemContext?: string) => {
    if (e) e.preventDefault();

    // Check if daily word limit is exceeded
    if (isLimitExceeded) {
      toast({
        title: "Daily limit reached",
        description: "You've reached your daily AI word limit. Upgrade your plan for more words.",
        variant: "destructive"
      });
      return;
    }

    let userQuery = promptText || query.trim();

    // Process attached files
    let fileContext = '';
    if (attachedFiles.length > 0) {
      fileContext = '\n\n--- Attached Files ---\n';
      for (const file of attachedFiles) {
        try {
          // Only read text files, PDFs and images need special handling
          if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
            const content = await readFileAsText(file);
            fileContext += `\nFile: ${file.name}\nContent:\n${content}\n---\n`;
          } else {
            // For other file types, just mention them
            fileContext += `\nFile: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)\n`;
            fileContext += `Note: This file type requires processing. Please describe what you'd like to know about this file.\n---\n`;
          }
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error);
          fileContext += `\nFile: ${file.name} (Could not read file)\n---\n`;
        }
      }

      // Append file context to user query
      userQuery += fileContext;
    }

    // Auto-generate prompt if no text but items are selected
    if (!userQuery && (selectedMembers.length > 0 || selectedBills.length > 0 || selectedCommittees.length > 0 || selectedContracts.length > 0)) {
      const promptParts: string[] = [];

      if (selectedMembers.length > 0) {
        const memberNames = selectedMembers.map(m => m.name).join(", ");
        promptParts.push(`Tell me about ${selectedMembers.length === 1 ? 'legislator' : 'legislators'} ${memberNames}, including their legislative record, sponsored bills, and committee work`);
      }

      if (selectedBills.length > 0) {
        const billNumbers = selectedBills.map(b => b.bill_number).join(", ");
        promptParts.push(`Tell me about ${selectedBills.length === 1 ? 'bill' : 'bills'} ${billNumbers}, including ${selectedBills.length === 1 ? 'its' : 'their'} status, sponsors, and details`);
      }

      if (selectedCommittees.length > 0) {
        const committeeNames = selectedCommittees.map(c => c.committee_name).join(", ");
        promptParts.push(`Tell me about the ${committeeNames} ${selectedCommittees.length === 1 ? 'committee' : 'committees'}, including focus areas and current bills`);
      }

      if (selectedContracts.length > 0) {
        const vendorNames = selectedContracts.map(c => c.vendor_name || 'Unknown vendor').join(", ");
        promptParts.push(`Tell me about ${selectedContracts.length === 1 ? 'contract with' : 'contracts with'} ${vendorNames}, including contract details, amounts, and department information`);
      }

      userQuery = promptParts.join(". Also, ");
    }

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
    // Clear selected items after submission
    setSelectedMembers([]);
    setSelectedBills([]);
    setSelectedCommittees([]);
    setAttachedFiles([]);
    setIsTyping(true);

    // Persistence: Create session on first message (authenticated only)
    let sessionId = currentSessionId;
    console.log('[NewChat] Persistence check - shouldPersist:', shouldPersist, 'currentSessionId:', currentSessionId, 'user:', !!user);
    if (shouldPersist && !sessionId) {
      // Generate title from first user message (truncate to ~50 chars)
      const title = userQuery.length > 50
        ? userQuery.substring(0, 50) + '...'
        : userQuery;

      // Check for billId, committeeId, or memberId in URL params to link chat
      const billIdParam = searchParams.get('billId');
      const committeeIdParam = searchParams.get('committeeId');
      const memberIdParam = searchParams.get('memberId');
      const context = (billIdParam || committeeIdParam || memberIdParam) ? {
        bill_id: billIdParam ? parseInt(billIdParam, 10) : undefined,
        committee_id: committeeIdParam ? parseInt(committeeIdParam, 10) : undefined,
        member_id: memberIdParam ? parseInt(memberIdParam, 10) : undefined,
      } : undefined;

      sessionId = await createSession(title, [{
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        timestamp: new Date().toISOString(),
      }], context);
      console.log('[NewChat] Created new session:', sessionId, 'with bill_id:', billIdParam, 'committee_id:', committeeIdParam, 'member_id:', memberIdParam);

      // Update URL to include session ID (like ChatGPT's /c/id pattern)
      if (sessionId) {
        // Refresh sidebar to show the new chat (dispatch event for sibling component)
        window.dispatchEvent(new CustomEvent('refresh-sidebar-chats'));
        navigate(`/c/${sessionId}`, { replace: true });
      }
    } else if (shouldPersist && sessionId) {
      // Update existing session with new user message
      const allMessages = [...messages, userMessage];
      const persistedMessages = allMessages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString(),
        ...(m.schoolFundingData && { schoolFundingData: m.schoolFundingData }),
      }));
      await updateMessages(sessionId, persistedMessages);
    }

    // INSTANT FEEDBACK: Create and show assistant message immediately (0ms delay)
    const messageId = `assistant-${Date.now()}`;

    // Check for school funding data in sessionStorage
    let schoolFundingData: SchoolFundingDetails | undefined;
    try {
      const storedData = sessionStorage.getItem('schoolFundingDetails');
      if (storedData) {
        schoolFundingData = JSON.parse(storedData);
        // Clear it after reading so it's only used once
        sessionStorage.removeItem('schoolFundingDetails');
      }
    } catch (e) {
      console.error('Error reading school funding data:', e);
    }

    // Check if this is a contract-related chat (via URL prompt prefix or selected contracts)
    const isContractChat = selectedContracts.length > 0 || userQuery.startsWith('[Contract:');

    const streamingMessage: Message = {
      id: messageId,
      role: "assistant",
      content: "",
      isStreaming: true,
      streamedContent: "",
      searchQueries: isContractChat
        ? [
            `Analyzing "${userQuery.substring(0, 60)}${userQuery.length > 60 ? '...' : ''}"`,
            `Searching NYS Contracts`,
          ]
        : [
            `Analyzing "${userQuery.substring(0, 60)}${userQuery.length > 60 ? '...' : ''}" in NY State Legislature`,
            `Searching NY State Bills Database`,
          ],
      thinkingPhrase: getNextThinkingPhrase(),
      schoolFundingData,
      isContractChat,
    };
    setMessages(prev => [...prev, streamingMessage]);

    try {
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

      // Build contract context if this is a contract chat
      let contractContext = systemContext || undefined;
      if (isContractChat) {
        try {
          // Parse contract number from prompt prefix [Contract:xxx]
          const contractMatch = userQuery.match(/\[Contract:([^\]]+)\]/);
          const contractNumber = contractMatch?.[1];

          if (contractNumber) {
            // Fetch the specific contract
            const { data: contract } = await supabase
              .from('Contracts')
              .select('*')
              .eq('contract_number', contractNumber)
              .single();

            if (contract) {
              let contextParts: string[] = [];

              // Primary contract details
              contextParts.push(`PRIMARY CONTRACT DATA:\n- Contract Number: ${contract.contract_number}\n- Vendor: ${contract.vendor_name}\n- Department: ${contract.department_facility}\n- Type: ${contract.contract_type || 'N/A'}\n- Amount: $${Number(contract.current_contract_amount || 0).toLocaleString()}\n- Spending to Date: $${Number(contract.spending_to_date || 0).toLocaleString()}\n- Start Date: ${contract.contract_start_date || 'N/A'}\n- End Date: ${contract.contract_end_date || 'N/A'}\n- Description: ${contract.contract_description || 'N/A'}`);

              // Fetch other contracts from the same vendor (limit 10)
              const { data: vendorContracts } = await supabase
                .from('Contracts')
                .select('contract_number, department_facility, current_contract_amount, spending_to_date, contract_start_date, contract_end_date, contract_type, contract_description')
                .eq('vendor_name', contract.vendor_name)
                .neq('contract_number', contractNumber)
                .order('current_contract_amount', { ascending: false, nullsFirst: false })
                .limit(10);

              if (vendorContracts && vendorContracts.length > 0) {
                const vendorSummary = vendorContracts.map(c =>
                  `  - ${c.contract_number}: ${c.department_facility} | $${Number(c.current_contract_amount || 0).toLocaleString()} | ${c.contract_type || 'N/A'} | ${c.contract_start_date || '?'} to ${c.contract_end_date || '?'}`
                ).join('\n');
                contextParts.push(`\nOTHER CONTRACTS BY SAME VENDOR (${contract.vendor_name}) - ${vendorContracts.length} additional contracts found:\n${vendorSummary}`);
              }

              // Fetch other contracts from the same department (limit 10, top by amount)
              const { data: deptContracts } = await supabase
                .from('Contracts')
                .select('contract_number, vendor_name, current_contract_amount, spending_to_date, contract_type, contract_description')
                .eq('department_facility', contract.department_facility)
                .neq('contract_number', contractNumber)
                .order('current_contract_amount', { ascending: false, nullsFirst: false })
                .limit(10);

              if (deptContracts && deptContracts.length > 0) {
                const deptSummary = deptContracts.map(c =>
                  `  - ${c.contract_number}: ${c.vendor_name} | $${Number(c.current_contract_amount || 0).toLocaleString()} | ${c.contract_type || 'N/A'}`
                ).join('\n');
                contextParts.push(`\nTOP CONTRACTS IN SAME DEPARTMENT (${contract.department_facility}) - showing top ${deptContracts.length} by amount:\n${deptSummary}`);
              }

              contractContext = contextParts.join('\n') + '\n\nUse this NYS contract database information to provide detailed, data-driven analysis. Reference specific contract numbers, amounts, and comparisons where relevant.';
            }
          }
        } catch (err) {
          console.error('Error fetching contract context:', err);
          // Continue without contract context - don't block the chat
        }
      }

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Call edge function with streaming (edge function handles all data fetching)
      const response = await fetch(`${supabaseUrl}/functions/v1/${edgeFunction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
        },
        body: JSON.stringify({
          prompt: userQuery,
          type: 'chat',
          stream: true,
          model: selectedModel,
          context: {
            previousMessages: messages.slice(-10).map(m => ({
              role: m.role,
              content: m.content
            })),
            systemContext: contractContext
          }
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status}`);
      }

      // Read streaming response
      const reader = response.body?.getReader();
      readerRef.current = reader || null;
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
                  // Extract reasoning during streaming for Perplexity models
                  const streamedData = isPerplexityModel
                    ? extractReasoning(aiResponse)
                    : { reasoning: null, mainContent: aiResponse };
                  // Update UI with streamed content
                  setMessages(prev => prev.map(msg =>
                    msg.id === messageId
                      ? {
                          ...msg,
                          streamedContent: streamedData.mainContent,
                          reasoning: streamedData.reasoning || undefined
                        }
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

      // Append disclaimer for "What is Goodable.dev?" prompt
      if (isGoodablePromptRef.current && aiResponse) {
        aiResponse += '\n\nEvery bill analysis includes tools to email sponsors, generate letters, view official documents, and track your positions.\n\n*Answers will vary by user. 😉';
        isGoodablePromptRef.current = false; // Reset for next message
      }

      // Extract Perplexity citations if this is a Perplexity response
      // Note: Perplexity returns citations in non-streaming responses, but for streaming
      // we only have the citation numbers [1], [2], etc. in the text
      let perplexityCitations: PerplexityCitation[] = [];
      if (isPerplexityModel && aiResponse) {
        const citationNumbers = extractCitationNumbers(aiResponse);
        perplexityCitations = citationNumbers.map(num => ({
          number: num,
          url: '',
          title: `Source ${num}`,
          excerpt: ''
        }));
        console.log('Extracted Perplexity citation numbers:', perplexityCitations);
      }

      // Extract bill numbers from AI response to fetch citations (progressive loading)
      let responseCitations: BillCitation[] = [];
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
          }
        }
      }

      // Extract reasoning from Perplexity responses (if present in <think> tags)
      const { reasoning, mainContent } = isPerplexityModel
        ? extractReasoning(aiResponse)
        : { reasoning: null, mainContent: aiResponse };

      // Finalize the streaming message with all metadata
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              content: mainContent,
              isStreaming: false,
              streamedContent: mainContent,
              reviewedInfo: `Reviewed ${responseCitations.length} bills: ${
                responseCitations.length > 0
                  ? `Found relevant legislation including ${responseCitations[0]?.bill_number || 'pending bills'} related to your query.`
                  : 'No directly matching bills found, providing general legislative context.'
              }`,
              citations: responseCitations,
              perplexityCitations: isPerplexityModel ? perplexityCitations : undefined,
              isPerplexityResponse: isPerplexityModel,
              reasoning: reasoning || undefined
            }
          : msg
      ));

      // Track AI word usage
      if (aiResponse) {
        const wordCount = countWords(aiResponse);
        addWordsUsed(wordCount);
      }

      // Fetch related bills based on the first cited bill's committee (progressive loading)
      let relatedBillsResult: typeof responseCitations = [];
      if (responseCitations.length > 0) {
        const firstBill = responseCitations[0];
        if (firstBill.committee) {
          try {
            const { data: relatedBillsData, error: relatedError } = await supabase
              .from('Bills')
              .select('bill_number, title, status_desc, description, committee, session_id')
              .eq('committee', firstBill.committee)
              .neq('bill_number', firstBill.bill_number) // Exclude the cited bill itself
              .order('session_id', { ascending: false })
              .limit(5);

            if (!relatedError && relatedBillsData && relatedBillsData.length > 0) {
              console.log(`Found ${relatedBillsData.length} related bills from committee: ${firstBill.committee}`);
              relatedBillsResult = relatedBillsData;

              // Update message with related bills
              setMessages(prev => prev.map(msg =>
                msg.id === messageId
                  ? { ...msg, relatedBills: relatedBillsData }
                  : msg
              ));
            }
          } catch (err) {
            console.error('Error fetching related bills:', err);
          }
        }
      }

      setIsTyping(false);
      abortControllerRef.current = null;
      readerRef.current = null;

      // Persistence: Save assistant response with citations metadata (authenticated only)
      if (shouldPersist && sessionId && aiResponse) {
        // Get all messages including the new assistant response with metadata
        const allMessages = [...messages, userMessage, {
          id: messageId,
          role: "assistant" as const,
          content: aiResponse,
          citations: responseCitations,
          relatedBills: relatedBillsResult,
          schoolFundingData,
        }];
        const persistedMessages = allMessages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date().toISOString(),
          // Include citations metadata for assistant messages
          ...(m.role === 'assistant' && 'citations' in m && {
            citations: m.citations,
            relatedBills: m.relatedBills,
          }),
          ...('schoolFundingData' in m && m.schoolFundingData && { schoolFundingData: m.schoolFundingData }),
        }));
        await updateMessages(sessionId, persistedMessages);
        console.log('[NewChat] Saved assistant response to session:', sessionId);
      }

    } catch (error: any) {
      console.error('Error generating response:', error);

      // Don't show error message if it was an abort (user stopped the stream)
      if (error.name !== 'AbortError') {
        const errorMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "I apologize, but I encountered an error generating a response. Please try again.",
        };

        setMessages(prev => [...prev, errorMessage]);
      }

      setIsTyping(false);
      abortControllerRef.current = null;
      readerRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Left Sidebar - slides in from off-screen (authenticated pages + mobile public) */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm md:w-64 bg-background border-r z-[60]",
          isPublicPage && "sm:hidden",
          sidebarMounted && "transition-transform duration-300 ease-in-out",
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NoteViewSidebar onClose={() => setLeftSidebarOpen(false)} />
      </div>

      {/* Backdrop overlay when sidebar is open */}
      {leftSidebarOpen && (
        <div
          className={cn(
            "fixed inset-0 bg-black/20 z-[55] transition-opacity",
            isPublicPage && "sm:hidden"
          )}
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

      {/* Main Content Container - different structure for public vs authenticated */}
      <div className={cn("h-full", !isPublicPage && "p-2 bg-muted/30")}>
        {/* Inner container - rounded with border for authenticated pages */}
        <div className={cn(
          "h-full flex flex-col relative",
          !isPublicPage && "rounded-2xl border bg-background overflow-hidden"
        )}>
          {/* Header - ChatHeader for public, sidebar toggle + engine for authenticated */}
          {isPublicPage ? (
            <ChatHeader onNewChat={handleNewChat} onWhatIsGoodable={handleWhatIsGoodable} onOpenSidebar={() => setLeftSidebarOpen(true)} />
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 bg-background flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                className={cn("flex-shrink-0", leftSidebarOpen && "bg-muted")}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <EngineSelection />
            </div>
          )}

          {/* Scrollable Content Area */}
          <div
            ref={scrollContainerRef}
            className={cn(
              "overflow-y-auto",
              isPublicPage
                ? "flex-1 pb-32 pt-14"
                : "absolute top-[57px] bottom-0 left-0 right-0 pb-40"
            )}
          >

        {!chatStarted ? (
          /* Initial State - Prompt Cards */
          <div className="flex flex-col items-center justify-center min-h-full px-4">
            <h1 className="hidden sm:block text-4xl md:text-5xl font-semibold text-center mb-12 tracking-tight">
              What are you researching?
            </h1>

            {/* Prompt Carousel - hidden on phones */}
            <div className="hidden sm:block w-full max-w-3xl mb-8">
              {/* Header with navigation arrows */}
              <div className="flex items-center justify-end mb-3 gap-1">
                <button
                  onClick={() => {
                    if (promptScrollRef.current) {
                      promptScrollRef.current.scrollBy({ left: -340, behavior: 'smooth' });
                    }
                  }}
                  className="p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Previous prompts"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (promptScrollRef.current) {
                      promptScrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
                    }
                  }}
                  className="p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Next prompts"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable container with fade edges */}
              <div className="relative">
                {/* Left fade */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                {/* Right fade */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                {/* Scrollable prompt cards */}
                <div
                  ref={promptScrollRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 pl-8 pr-8 scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {samplePrompts.map((prompt, index) => (
                    <Card
                      key={index}
                      className={cn(
                        "p-5 cursor-pointer transition-all duration-200 border flex-shrink-0",
                        "hover:border-foreground hover:shadow-md",
                        "w-[320px] h-[140px]",
                        hoveredCard === index && "border-foreground shadow-md"
                      )}
                      onClick={() => handlePromptClick(prompt.title)}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <p className="text-xs text-muted-foreground mb-2 font-medium">
                        {prompt.category}
                      </p>
                      <p className="text-sm leading-relaxed text-foreground line-clamp-4">
                        {prompt.title}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat State - Messages */
          <div className="pt-8 pb-16 px-4">
            <div className="w-full max-w-[720px] mx-auto">
            {messages.map((message, index) => (
              <div key={message.id} className={`space-y-3 ${index > 0 && message.role === "user" ? "mt-[80px]" : index > 0 ? "mt-6" : ""}`}>
                {message.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="bg-muted/40 rounded-lg p-4 border-0 max-w-[70%]">
                      <p className="text-base leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* School Aid Details Accordion - shown at top for school funding queries */}
                    {message.schoolFundingData && (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem
                          value="school-aid-details"
                          className="border border-border rounded-lg"
                        >
                          <AccordionTrigger className="hover:no-underline px-4 py-3 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <span>School Aid Details</span>
                              <span className="text-xs text-muted-foreground font-normal">
                                {message.schoolFundingData.district} • {message.schoolFundingData.budgetYear?.replace(' Enacted Budget', '')}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="overflow-x-auto overflow-y-auto max-h-[320px]">
                              <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-background">
                                  <tr className="border-b border-border/50">
                                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Aid Category</th>
                                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Base Year</th>
                                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">School Year</th>
                                    <th className="text-right py-2 pl-4 font-medium text-muted-foreground">% Change</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {message.schoolFundingData.categories.map((cat, idx) => {
                                    const pctNum = parseFloat(cat.percentChange?.replace('%', '') || '0');
                                    const isPositive = pctNum > 0;
                                    const isNegative = pctNum < 0;
                                    return (
                                      <tr key={idx} className="border-b border-border/30 last:border-0">
                                        <td className="py-2 pr-4">{cat.name}</td>
                                        <td className="py-2 px-4 text-right text-muted-foreground">${cat.baseYear}</td>
                                        <td className="py-2 px-4 text-right text-muted-foreground">${cat.schoolYear}</td>
                                        <td className={`py-2 pl-4 text-right font-medium ${
                                          isPositive ? 'text-green-600 dark:text-green-400' :
                                          isNegative ? 'text-red-600 dark:text-red-400' :
                                          'text-muted-foreground'
                                        }`}>
                                          {cat.percentChange}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Enhanced Searched and Reviewed Section with Process Content - hide for school funding */}
                    {(message.searchQueries || message.reviewedInfo) && !message.schoolFundingData && (() => {
                      // Check if this is a lobbying chat (has clients) - check both content sources
                      const contentToCheck = message.content || message.streamedContent || '';
                      const { clients } = parseClientsSection(contentToCheck);
                      const isLobbyingChat = clients.length > 0;

                      // Contract chats get Chain of Thought UI
                      if (message.isContractChat) {
                        return (
                          <ChainOfThought defaultOpen={false} className="border-2 border-dashed border-border/50 rounded-lg">
                            <ChainOfThoughtHeader />
                            <ChainOfThoughtContent>
                              {/* Analyzing Contract Step */}
                              <ChainOfThoughtStep
                                icon={Wallet}
                                label="Analyzing contract details"
                                status={message.isStreaming ? "active" : "complete"}
                              />

                              {/* Searching Step */}
                              {message.searchQueries && (
                                <ChainOfThoughtStep
                                  icon={SearchIcon}
                                  label="Searching databases"
                                  status={message.isStreaming ? "active" : "complete"}
                                >
                                  <ChainOfThoughtSearchResults>
                                    {message.searchQueries.map((query, idx) => (
                                      <ChainOfThoughtSearchResult key={idx}>
                                        {query.length > 40 ? query.substring(0, 40) + '...' : query}
                                      </ChainOfThoughtSearchResult>
                                    ))}
                                  </ChainOfThoughtSearchResults>
                                </ChainOfThoughtStep>
                              )}

                              {/* Reviewing Sources Step */}
                              {message.reviewedInfo && !message.isStreaming && (
                                <ChainOfThoughtStep
                                  icon={FileText}
                                  label={`Reviewed ${message.citations?.length || 0} sources`}
                                  status="complete"
                                />
                              )}
                            </ChainOfThoughtContent>
                          </ChainOfThought>
                        );
                      }

                      // Perplexity/Sonar responses get Reasoning UI when they have thinking content
                      if (message.isPerplexityResponse && (message.isStreaming || message.reasoning)) {
                        return (
                          <Reasoning
                            isStreaming={message.isStreaming}
                            defaultOpen={true}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>
                              {message.reasoning ? (
                                <p className="text-sm leading-relaxed">{message.reasoning}</p>
                              ) : (
                                <p className="text-sm text-muted-foreground">Processing your query...</p>
                              )}
                            </ReasoningContent>
                          </Reasoning>
                        );
                      }

                      return (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem
                          value="sources"
                          className="border-0 relative before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-dashed before:border-border/50 data-[state=open]:before:border-border/70 before:transition-colors before:duration-300"
                        >
                          <div className="relative p-0.5">
                            <AccordionTrigger className="hover:no-underline px-4 py-2.5 rounded-t-lg text-xs font-medium">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                {isLobbyingChat ? (
                                  <>
                                    <HandCoins className="h-3.5 w-3.5" />
                                    <span>Clients · {clients.length}</span>
                                  </>
                                ) : (
                                  <Shimmer duration={2} spread={2}>
                                    {message.thinkingPhrase || "Thinking…"}
                                  </Shimmer>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3 space-y-2">
                                    {/* Searching Section - hide entirely for lobbying chats */}
                                    {message.searchQueries && !isLobbyingChat && (
                                      <div className="space-y-2">
                                          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                            <SearchIcon className="h-3.5 w-3.5" />
                                            Searching
                                          </h3>
                                        <div className="space-y-1.5">
                                          {message.searchQueries.map((query, idx) => (
                                              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-md bg-muted/30 border border-border/50 text-xs text-muted-foreground">
                                                  <SearchIcon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground/70" />
                                                <span className="leading-relaxed">{query}</span>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Reviewing Sources Section - hide for lobbying chats */}
                                    {message.reviewedInfo && !message.isStreaming && !isLobbyingChat && (
                                      <div className="space-y-2">
                                        <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                          <FileText className="h-3.5 w-3.5" />
                                          Reviewing sources · {message.citations?.length || 0}
                                        </h3>
                                        <div className="p-2.5 rounded-md bg-muted/30 border border-border/50">
                                          <p className="text-xs text-muted-foreground leading-relaxed">{message.reviewedInfo}</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Clients Section - for lobbying chats (just the list, header is in trigger) */}
                                    {isLobbyingChat && (
                                        <ScrollArea className="h-[200px]">
                                          <div className="space-y-1.5 pr-4">
                                            {clients.map((client, idx) => (
                                              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-md bg-muted/30 border border-border/50 text-xs text-muted-foreground">
                                                <HandCoins className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground/70" />
                                                <span className="leading-relaxed">{client}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </ScrollArea>
                                    )}

                              {/* Finished State */}
                              {!message.isStreaming && (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 pt-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                                  Finished
                                </div>
                              )}
                            </AccordionContent>
                          </div>
                        </AccordionItem>
                      </Accordion>
                      );
                    })()}

                    {/* For streaming messages, show content directly */}
                    {message.isStreaming && (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {message.isPerplexityResponse && message.perplexityCitations ? (
                        // Render Perplexity response with inline citation badges using new InlineCitation component
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => {
                              const textContent = String(children);
                              const citationSources = convertToCitationSources(message.perplexityCitations || []);
                              return (
                                <p className="mb-3 leading-relaxed text-foreground">
                                  {parseCitationMarkers(textContent, citationSources)}
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
                          {message.isStreaming ? stripClientsSection(message.streamedContent || '').cleanContent : message.content}
                        </ReactMarkdown>
                      ) : (
                        // Standard markdown rendering with progressive clients accordion
                        (() => {
                          const streamContent = message.isStreaming ? message.streamedContent || '' : message.content;
                          const { cleanContent, isLoadingClients, partialClients } = stripClientsSection(streamContent);
                          return (
                            <>
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
                                {cleanContent}
                              </ReactMarkdown>
                            </>
                          );
                        })()
                      )}
                        <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5">|</span>
                      </div>
                    )}

                    {/* Perplexity-style Tabbed Interface for all assistant messages */}
                    {message.role === 'assistant' && (
                      <ChatResponseFooter
                        isStreaming={message.isStreaming}
                        messageContent={
                          message.isPerplexityResponse && message.perplexityCitations ? (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => {
                                  const textContent = String(children);
                                  const citationSources = convertToCitationSources(message.perplexityCitations || []);
                                  return (
                                    <p className="mb-3 leading-relaxed text-foreground">
                                      {parseCitationMarkers(textContent, citationSources)}
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
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            (() => {
                              const { mainContent, clients } = parseClientsSection(message.content);
                              return (
                                <>
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
                                    {mainContent}
                                  </ReactMarkdown>
                                </>
                              );
                            })()
                          )
                        }
                        bills={message.citations || []}
                        relatedBills={message.relatedBills || []}
                        sources={[
                          ...(message.perplexityCitations || []),
                          // Always include default sources
                          {
                            number: (message.perplexityCitations?.length || 0) + 1,
                            url: 'https://www.nysgpt.com',
                            title: 'NYSgpt - Legislative Policy Platform',
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
                        onSendMessage={(message) => handleSubmit(null, message)}
                        // Excerpt creation props
                        userMessage={
                          // Find the preceding user message for this assistant message
                          messages.slice(0, index).reverse().find(m => m.role === 'user')?.content
                        }
                        assistantMessageText={message.content}
                        parentSessionId={currentSessionId || undefined}
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

      {/* Floating Scroll to Bottom Button - ChatGPT style */}
      {showScrollButton && chatStarted && (
        <button
          onClick={scrollToBottom}
          className={cn(
            "z-10 bg-background border border-border rounded-full p-2 shadow-lg hover:bg-muted transition-all duration-200 hover:shadow-xl",
            isPublicPage
              ? "fixed left-1/2 -translate-x-1/2 bottom-44"
              : "absolute left-1/2 -translate-x-1/2 bottom-28"
          )}
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      {/* Bottom Input Area - fixed for public, absolute for authenticated */}
      {/* On mobile phones: centered when !chatStarted, bottom when chatStarted */}
      <div className={cn(
        // Default desktop/tablet behavior
        isPublicPage && !isMobilePhone && "fixed bottom-0 left-0 right-0 z-[5] bg-background",
        !isPublicPage && !isMobilePhone && "absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none",
        // Mobile phone: centered when no chat, bottom when chatting
        isMobilePhone && !chatStarted && "fixed left-0 right-0 z-[5] top-[calc(50%+20px)] -translate-y-1/2",
        isMobilePhone && chatStarted && "fixed bottom-0 left-0 right-0 z-[5]"
      )}>
        <div className={cn(
          "w-full px-4 py-4",
          !isPublicPage && !isMobilePhone && "py-3 max-w-[780px] pointer-events-auto",
          isMobilePhone && "pointer-events-auto"
        )}>
          <div className={cn("max-w-[720px] mx-auto", !isPublicPage && !isMobilePhone && "bg-background rounded-t-xl pt-3 px-3")}>
            <form onSubmit={handleSubmit} className="relative">
              {/* Larger input box - Fintool/Claude style */}
              <div className="rounded-2xl bg-muted/50 border-0 p-3 shadow-lg">
                {/* Selected Items Chips */}
                {(selectedBills.length > 0 || selectedMembers.length > 0 || selectedCommittees.length > 0 || selectedContracts.length > 0) && (
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
                    {selectedContracts.map((contract) => (
                      <div
                        key={contract.contract_number}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-md text-xs font-medium"
                      >
                        <Wallet className="h-3 w-3" />
                        <span>{contract.vendor_name || 'Contract'}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedContracts(prev => prev.filter(c => c.contract_number !== contract.contract_number))}
                          className="hover:bg-purple-500/20 rounded-sm p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Attached Files Display */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm"
                      >
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground max-w-[200px] truncate">
                          {file.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="ml-1 hover:bg-muted-foreground/20 rounded p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Input */}
                <Textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    // Auto-resize on mobile: grow up to 4 lines (~96px), then scroll
                    if (isMobilePhone && textareaRef.current) {
                      textareaRef.current.style.height = 'auto';
                      const maxHeight = 144; // ~6 lines
                      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
                      textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > maxHeight ? 'auto' : 'hidden';
                    }
                  }}
                  placeholder="Ask anything..."
                  className={cn(
                    "flex-1 min-h-[40px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 placeholder:text-muted-foreground/60",
                    isMobilePhone && "text-base"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (isMobilePhone) {
                        // On mobile: Enter adds newline, send via button only
                        return;
                      }
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }
                    }
                  }}
                />

                {/* Bottom Row with Buttons */}
                <div className="flex items-center justify-between">
                  {/* Left Side - Filter Buttons (hidden on mobile phones) */}
                  {isMobilePhone ? (
                    <div className="flex-1" />
                  ) : (
                  <div className="flex gap-1">
                    <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent transition-colors"
                            >
                              <Users className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Select Members</p>
                        </TooltipContent>
                      </Tooltip>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col" onOpenAutoFocus={(e) => { if (window.innerWidth < 768) e.preventDefault(); }}>
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
                                          onClick={() => {
                                            if (isSelected) {
                                              setSelectedMembers(prev => prev.filter(m => m.people_id !== member.people_id));
                                            } else {
                                              setSelectedMembers(prev => [...prev, member]);
                                            }
                                          }}
                                          className={cn(
                                            "border-t hover:bg-muted/30 transition-colors cursor-pointer",
                                            isSelected && "bg-green-500/5"
                                          )}
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
                                              className="w-4 h-4 rounded pointer-events-none"
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent transition-colors"
                            >
                              <Building2 className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Select Committees</p>
                        </TooltipContent>
                      </Tooltip>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col" onOpenAutoFocus={(e) => { if (window.innerWidth < 768) e.preventDefault(); }}>
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
                                          onClick={() => {
                                            if (isSelected) {
                                              setSelectedCommittees(prev => prev.filter(c => c.committee_id !== committee.committee_id));
                                            } else {
                                              setSelectedCommittees(prev => [...prev, committee]);
                                            }
                                          }}
                                          className={cn(
                                            "border-t hover:bg-muted/30 transition-colors cursor-pointer",
                                            isSelected && "bg-orange-500/5"
                                          )}
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
                                              className="w-4 h-4 rounded pointer-events-none"
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Select Bills</p>
                        </TooltipContent>
                      </Tooltip>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col" onOpenAutoFocus={(e) => { if (window.innerWidth < 768) e.preventDefault(); }}>
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
                                          onClick={() => {
                                            if (isSelected) {
                                              setSelectedBills(prev => prev.filter(b => b.bill_number !== bill.bill_number));
                                            } else {
                                              setSelectedBills(prev => [...prev, bill]);
                                            }
                                          }}
                                          className={cn(
                                            "border-t hover:bg-muted/30 transition-colors cursor-pointer",
                                            isSelected && "bg-primary/5"
                                          )}
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
                                              className="w-4 h-4 rounded pointer-events-none"
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

                    <Dialog open={contractsDialogOpen} onOpenChange={setContractsDialogOpen}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent transition-colors"
                            >
                              <Wallet className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Select Contracts</p>
                        </TooltipContent>
                      </Tooltip>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col" onOpenAutoFocus={(e) => { if (window.innerWidth < 768) e.preventDefault(); }}>
                        <DialogHeader>
                          <DialogTitle>Select Contracts</DialogTitle>
                        </DialogHeader>

                        {/* Search Input */}
                        <div className="px-6 pb-4">
                          <Input
                            placeholder="Search contracts by vendor or description..."
                            value={contractsSearch}
                            onChange={(e) => setContractsSearch(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        {/* Contracts Table */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                          {contractsLoading ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                              Loading contracts...
                            </div>
                          ) : (
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                  <tr>
                                    <th className="text-left p-3 font-medium">Vendor</th>
                                    <th className="text-left p-3 font-medium">Department</th>
                                    <th className="text-left p-3 font-medium">Amount</th>
                                    <th className="text-center p-3 font-medium w-20">Select</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {availableContracts
                                    .filter(contract =>
                                      contractsSearch === "" ||
                                      (contract.vendor_name?.toLowerCase().includes(contractsSearch.toLowerCase())) ||
                                      (contract.contract_description?.toLowerCase().includes(contractsSearch.toLowerCase()))
                                    )
                                    .map((contract) => {
                                      const isSelected = selectedContracts.some(c => c.contract_number === contract.contract_number);
                                      return (
                                        <tr
                                          key={contract.contract_number}
                                          onClick={() => {
                                            if (isSelected) {
                                              setSelectedContracts(prev => prev.filter(c => c.contract_number !== contract.contract_number));
                                            } else {
                                              setSelectedContracts(prev => [...prev, contract]);
                                            }
                                          }}
                                          className={cn(
                                            "border-t hover:bg-muted/30 transition-colors cursor-pointer",
                                            isSelected && "bg-purple-500/5"
                                          )}
                                        >
                                          <td className="p-3 font-medium">{contract.vendor_name || 'N/A'}</td>
                                          <td className="p-3 text-muted-foreground max-w-xs truncate">{contract.department_facility || 'N/A'}</td>
                                          <td className="p-3 text-muted-foreground">
                                            {contract.current_contract_amount
                                              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(contract.current_contract_amount)
                                              : 'N/A'}
                                          </td>
                                          <td className="p-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                if (isSelected) {
                                                  setSelectedContracts(prev => prev.filter(c => c.contract_number !== contract.contract_number));
                                                } else {
                                                  setSelectedContracts(prev => [...prev, contract]);
                                                }
                                              }}
                                              className="w-4 h-4 rounded pointer-events-none"
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
                            {selectedContracts.length} contract{selectedContracts.length !== 1 ? 's' : ''} selected
                          </span>
                          <Button onClick={() => setContractsDialogOpen(false)} size="sm">
                            Done
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  )}

                  {/* Right Side - Model selector (mobile) + Submit/Stop Button */}
                  <div className="flex items-center gap-3">
                    {isMobilePhone && (
                      <div className="[&_button>span]:text-sm [&_button>span]:font-medium [&_button]:px-1 [&_button]:py-1">
                        <EngineSelection />
                      </div>
                    )}
                    <Button
                      type={isTyping ? "button" : "submit"}
                      size="icon"
                      className={cn(
                        "h-9 w-9 rounded-lg",
                        isTyping
                          ? "bg-destructive hover:bg-destructive/90"
                          : "bg-foreground hover:bg-foreground/90"
                      )}
                      onClick={isTyping ? stopStream : undefined}
                    >
                      {isTyping ? (
                        <Square className="h-4 w-4" fill="currentColor" />
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Mobile Category Pills - shown on phones when chat hasn't started and no text typed */}
            {isMobilePhone && !chatStarted && query.length === 0 && (
              <>
                {/* Pills row */}
                {!mobileDrawerCategory && (
                  <div className="flex flex-wrap gap-2 mt-3 justify-center px-2">
                    {[
                      { key: 'bills', label: 'Bills', icon: <FileText className="h-3.5 w-3.5" /> },
                      { key: 'members', label: 'Members', icon: <Users className="h-3.5 w-3.5" /> },
                      { key: 'committees', label: 'Committees', icon: <Building2 className="h-3.5 w-3.5" /> },
                      { key: 'contracts', label: 'Contracts', icon: <Wallet className="h-3.5 w-3.5" /> },
                      { key: 'lobbying', label: 'Lobbying', icon: <HandCoins className="h-3.5 w-3.5" /> },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setMobileDrawerCategory(cat.key)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border/60 bg-background text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {cat.icon}
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Drawer card - Claude style */}
                {mobileDrawerCategory && (
                  <div className="mt-3 mx-1 rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {mobileDrawerCategory === 'bills' && <FileText className="h-4 w-4" />}
                        {mobileDrawerCategory === 'members' && <Users className="h-4 w-4" />}
                        {mobileDrawerCategory === 'committees' && <Building2 className="h-4 w-4" />}
                        {mobileDrawerCategory === 'contracts' && <Wallet className="h-4 w-4" />}
                        {mobileDrawerCategory === 'lobbying' && <HandCoins className="h-4 w-4" />}
                        <span className="text-sm font-medium text-foreground capitalize">{mobileDrawerCategory}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMobileDrawerCategory(null)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Items list */}
                    <div className="max-h-[280px] overflow-y-auto">
                      {/* Bills */}
                      {mobileDrawerCategory === 'bills' && (
                        billsLoading ? (
                          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading bills...</div>
                        ) : (
                          availableBills.slice(0, 50).map((bill, idx) => (
                            <button
                              key={bill.bill_number}
                              type="button"
                              onClick={() => {
                                setQuery(`Tell me about bill ${bill.bill_number}`);
                                setMobileDrawerCategory(null);
                                textareaRef.current?.focus();
                              }}
                              className={cn(
                                "w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors",
                                idx > 0 && "border-t border-border/40"
                              )}
                            >
                              <span className="font-medium">{bill.bill_number}</span>
                              <span className="text-muted-foreground ml-2 line-clamp-1">{bill.title}</span>
                            </button>
                          ))
                        )
                      )}

                      {/* Members */}
                      {mobileDrawerCategory === 'members' && (
                        membersLoading ? (
                          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading members...</div>
                        ) : (
                          availableMembers.slice(0, 50).map((member, idx) => (
                            <button
                              key={member.people_id}
                              type="button"
                              onClick={() => {
                                setQuery(`Tell me about ${member.name}`);
                                setMobileDrawerCategory(null);
                                textareaRef.current?.focus();
                              }}
                              className={cn(
                                "w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors",
                                idx > 0 && "border-t border-border/40"
                              )}
                            >
                              <span className="font-medium">{member.name}</span>
                              <span className="text-muted-foreground ml-2">{member.party} - {member.chamber}</span>
                            </button>
                          ))
                        )
                      )}

                      {/* Committees */}
                      {mobileDrawerCategory === 'committees' && (
                        committeesLoading ? (
                          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading committees...</div>
                        ) : (
                          availableCommittees.slice(0, 50).map((committee, idx) => (
                            <button
                              key={committee.committee_id}
                              type="button"
                              onClick={() => {
                                setQuery(`Tell me about the ${committee.committee_name} committee`);
                                setMobileDrawerCategory(null);
                                textareaRef.current?.focus();
                              }}
                              className={cn(
                                "w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors",
                                idx > 0 && "border-t border-border/40"
                              )}
                            >
                              <span className="font-medium">{committee.committee_name}</span>
                              <span className="text-muted-foreground ml-2">{committee.chamber}</span>
                            </button>
                          ))
                        )
                      )}

                      {/* Contracts */}
                      {mobileDrawerCategory === 'contracts' && (
                        contractsLoading ? (
                          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading contracts...</div>
                        ) : (
                          availableContracts.slice(0, 50).map((contract, idx) => (
                            <button
                              key={contract.contract_number}
                              type="button"
                              onClick={() => {
                                setQuery(`Tell me about the contract with ${contract.vendor_name}`);
                                setMobileDrawerCategory(null);
                                textareaRef.current?.focus();
                              }}
                              className={cn(
                                "w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors",
                                idx > 0 && "border-t border-border/40"
                              )}
                            >
                              <span className="font-medium">{contract.vendor_name || 'N/A'}</span>
                              <span className="text-muted-foreground ml-2">
                                {contract.current_contract_amount
                                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(contract.current_contract_amount)
                                  : ''}
                              </span>
                            </button>
                          ))
                        )
                      )}

                      {/* Lobbying */}
                      {mobileDrawerCategory === 'lobbying' && (
                        mobileDrawerLoading ? (
                          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading lobbyists...</div>
                        ) : (
                          mobileDrawerLobbyists.slice(0, 50).map((lobbyist, idx) => (
                            <button
                              key={lobbyist.id}
                              type="button"
                              onClick={() => {
                                setQuery(`Tell me about lobbyist ${lobbyist.name}`);
                                setMobileDrawerCategory(null);
                                textareaRef.current?.focus();
                              }}
                              className={cn(
                                "w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors",
                                idx > 0 && "border-t border-border/40"
                              )}
                            >
                              <span className="font-medium">{lobbyist.name}</span>
                              {lobbyist.type_of_lobbyist && (
                                <span className="text-muted-foreground ml-2">{lobbyist.type_of_lobbyist}</span>
                              )}
                            </button>
                          ))
                        )
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
        </div>
        </div>
      </div>

      {/* "Ask Goodable" Text Selection Popup - rendered via portal */}
      <AskGoodableSelectionPopup onAsk={handleAskGoodable} />

    </div>
  );
};

export default NewChat;
