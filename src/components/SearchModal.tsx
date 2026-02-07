/**
 * SearchModal - A command palette style search modal
 * Triggered by the search icon in the sidebar
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContentNoOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  MessagesSquare,
  TextQuote,
  NotebookPen,
  MessageSquare,
  ScrollText,
  Users,
  Landmark,
  Lightbulb,
  CornerDownLeft,
  Building2,
  Globe,
  Shield,
  FileText,
  DollarSign,
  GraduationCap,
  Briefcase,
  HandCoins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { departmentPrompts, agencyPrompts, authorityPrompts } from "@/pages/Prompts";
import { generateMemberSlug } from "@/utils/memberSlug";
import { generateCommitteeSlug } from "@/utils/committeeSlug";
import { normalizeBillNumber } from "@/utils/billNumberUtils";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatSession {
  id: string;
  title: string;
}

interface Excerpt {
  id: string;
  title: string;
}

interface Note {
  id: string;
  title: string;
}

interface Prompt {
  title: string;
  prompt: string;
  category: "bills" | "members" | "committees" | "policy";
}

interface BillItem {
  bill_number: string;
  title: string;
}

interface MemberItem {
  people_id: number;
  name: string;
  first_name: string;
  last_name: string;
  party: string;
  chamber: string;
}

interface CommitteeItem {
  committee_id: number;
  committee_name: string;
  chamber: string;
  slug: string;
}

interface PageItem {
  title: string;
  slug: string;
  category: "department" | "agency" | "authority";
}

interface LobbyistItem {
  contractual_client: string;
  compensation_and_expenses: number | null;
}

interface ContractItem {
  contract_number: string;
  vendor_name: string;
  contract_description: string | null;
  department_facility: string | null;
}

interface BudgetItem {
  "Agency Name": string;
  "Program Name": string | null;
  "Appropriations Recommended 2026-27": number | null;
}

interface SchoolFundingItem {
  id: number;
  district: string;
  county: string;
  enacted_budget: string | null;
  total_change: string | null;
}

// All prompts from Use Cases pages
const allPrompts: Prompt[] = [
  // Bills prompts
  { title: "AI Consumer Protection", prompt: "What can you tell me about efforts to protect consumers from algorithmic discrimination in New York?", category: "bills" },
  { title: "Childcare Affordability", prompt: "What legislative approaches have been proposed to make childcare more affordable for working families in New York?", category: "bills" },
  { title: "Paid Family Leave", prompt: "What can you tell me about efforts to expand paid family leave in New York?", category: "bills" },
  { title: "Affordable Housing", prompt: "What are legislators doing to address the affordable housing crisis in New York?", category: "bills" },
  { title: "Volunteer Firefighter Recruitment", prompt: "What incentives are being considered to help recruit and retain volunteer firefighters and emergency responders?", category: "bills" },
  { title: "Medicaid Access", prompt: "What efforts are underway to reduce barriers to Medicaid services for patients?", category: "bills" },
  { title: "Minimum Wage", prompt: "What's the current state of minimum wage legislation in New York and what changes are being proposed?", category: "bills" },
  { title: "School Safety", prompt: "What measures are being proposed to improve safety around school zones in New York?", category: "bills" },
  { title: "Rental Assistance", prompt: "What programs exist or are being proposed to help New Yorkers facing housing instability?", category: "bills" },
  { title: "Disability Benefits", prompt: "What efforts are underway to strengthen disability benefits for New York workers?", category: "bills" },
  { title: "Veteran Services", prompt: "What initiatives are being considered to improve services and support for veterans in New York?", category: "bills" },
  { title: "Clean Energy Incentives", prompt: "What tax incentives or programs are being proposed to accelerate clean energy adoption in New York?", category: "bills" },
  // Members prompts
  { title: "Find My Representative", prompt: "How can I find out who my state legislators are and how to contact them?", category: "members" },
  { title: "Assembly Leadership", prompt: "Who are the current leaders of the New York State Assembly?", category: "members" },
  { title: "Senate Leadership", prompt: "Who are the current leaders of the New York State Senate?", category: "members" },
  { title: "Committee Chairs", prompt: "Who chairs the major committees in the New York legislature?", category: "members" },
  { title: "Labor Advocates", prompt: "Which legislators are known for championing workers' rights and labor issues?", category: "members" },
  { title: "Education Champions", prompt: "Which legislators are most active on education policy and school funding?", category: "members" },
  { title: "Healthcare Policy Leaders", prompt: "Which legislators are leading on healthcare access and reform?", category: "members" },
  { title: "Housing Advocates", prompt: "Which legislators are focused on affordable housing and tenant protections?", category: "members" },
  { title: "Environmental Leaders", prompt: "Which legislators are championing climate and environmental legislation?", category: "members" },
  { title: "Small Business Supporters", prompt: "Which legislators are focused on supporting small businesses and entrepreneurs?", category: "members" },
  // Committees prompts
  { title: "Labor Committee Overview", prompt: "What issues does the Labor Committee handle and what major legislation is it currently considering?", category: "committees" },
  { title: "Education Committee Priorities", prompt: "What are the current priorities of the Education Committee in New York?", category: "committees" },
  { title: "Health Committee Focus Areas", prompt: "What healthcare issues is the Health Committee currently focused on?", category: "committees" },
  { title: "Housing Committee Activity", prompt: "What housing-related bills is the Housing Committee reviewing this session?", category: "committees" },
  { title: "Environmental Conservation", prompt: "What role does the Environmental Conservation Committee play in climate policy?", category: "committees" },
  { title: "Ways and Means", prompt: "How does the Ways and Means Committee influence the state budget process?", category: "committees" },
  { title: "Judiciary Committee", prompt: "What types of legislation does the Judiciary Committee typically handle?", category: "committees" },
  { title: "Children and Families", prompt: "What childcare and family support issues is the Children and Families Committee working on?", category: "committees" },
  { title: "Transportation Committee", prompt: "What infrastructure and transit issues is the Transportation Committee addressing?", category: "committees" },
  { title: "Economic Development", prompt: "How is the Economic Development Committee supporting job creation and workforce development?", category: "committees" },
  // Policy prompts
  { title: "Policy Analysis Framework", prompt: "What framework should I use to analyze the potential impact of a proposed policy change?", category: "policy" },
  { title: "Stakeholder Mapping", prompt: "How do I identify and map stakeholders who would be affected by a new housing policy?", category: "policy" },
  { title: "Evidence-Based Policy", prompt: "What does evidence-based policymaking look like and how can I apply it to education reform?", category: "policy" },
  { title: "Policy Implementation", prompt: "What are the key factors that determine whether a policy will be successfully implemented?", category: "policy" },
  { title: "Regulatory Impact Assessment", prompt: "How do I conduct a regulatory impact assessment for a proposed environmental regulation?", category: "policy" },
  { title: "Cost-Benefit Analysis", prompt: "How do I perform a cost-benefit analysis for a proposed public health initiative?", category: "policy" },
  { title: "Policy Evaluation Methods", prompt: "What methods can I use to evaluate whether a policy is achieving its intended outcomes?", category: "policy" },
  { title: "Unintended Consequences", prompt: "How can I anticipate and mitigate unintended consequences when designing new policies?", category: "policy" },
  { title: "Policy Memo Writing", prompt: "What's the best structure for writing a policy memo that will be read by busy decision-makers?", category: "policy" },
  { title: "Building Coalition Support", prompt: "How do I build a coalition of support for a policy initiative across different interest groups?", category: "policy" },
];

// Static department/agency/authority pages (computed once at module level)
const allPages: PageItem[] = [
  ...departmentPrompts.map((p) => ({ title: p.title, slug: p.slug, category: "department" as const })),
  ...agencyPrompts.map((p) => ({ title: p.title, slug: p.slug, category: "agency" as const })),
  ...authorityPrompts.map((p) => ({ title: p.title, slug: p.slug, category: "authority" as const })),
];

// Browse links for unauthenticated users
const browseLinks = [
  { title: "Bills", path: "/bills", icon: FileText },
  { title: "Members", path: "/members", icon: Users },
  { title: "Committees", path: "/committees", icon: Landmark },
  { title: "Departments", path: "/prompts", icon: Building2 },
  { title: "Lobbying", path: "/lobbying", icon: Briefcase },
  { title: "Contracts", path: "/contracts", icon: HandCoins },
  { title: "Budget", path: "/budget", icon: DollarSign },
  { title: "School Funding", path: "/school-funding", icon: GraduationCap },
];

type TabType = "all" | "history" | "library" | "prompts";

// Empty arrays (stable references to avoid re-renders)
const emptyBills: BillItem[] = [];
const emptyMembers: MemberItem[] = [];
const emptyCommittees: CommitteeItem[] = [];
const emptyPages: PageItem[] = [];
const emptyLobbyists: LobbyistItem[] = [];
const emptyContracts: ContractItem[] = [];
const emptyBudget: BudgetItem[] = [];
const emptySchoolFunding: SchoolFundingItem[] = [];

export function SearchModal({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: Partial<SearchModalProps>) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  // Self-managed state (used when no props are passed, e.g. App-level mount)
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [recentExcerpts, setRecentExcerpts] = useState<Excerpt[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [allChats, setAllChats] = useState<ChatSession[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Public data state (fetched once, cached in state)
  const [publicBills, setPublicBills] = useState<BillItem[]>([]);
  const [publicMembers, setPublicMembers] = useState<MemberItem[]>([]);
  const [publicCommittees, setPublicCommittees] = useState<CommitteeItem[]>([]);
  const [publicLobbyists, setPublicLobbyists] = useState<LobbyistItem[]>([]);
  const [publicContracts, setPublicContracts] = useState<ContractItem[]>([]);
  const [publicBudget, setPublicBudget] = useState<BudgetItem[]>([]);
  const [publicSchoolFunding, setPublicSchoolFunding] = useState<SchoolFundingItem[]>([]);
  const [publicDataLoaded, setPublicDataLoaded] = useState(false);

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Fetch recent items (authenticated users only)
  const fetchRecents = useCallback(async () => {
    if (!user) return;

    const [chatsResult, excerptsResult, notesResult] = await Promise.all([
      supabase
        .from("chat_sessions")
        .select("id, title")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5),
      supabase
        .from("chat_excerpts")
        .select("id, title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("chat_notes")
        .select("id, title")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

    if (chatsResult.data) setRecentChats(chatsResult.data);
    if (excerptsResult.data) setRecentExcerpts(excerptsResult.data);
    if (notesResult.data) setRecentNotes(notesResult.data);

    // Fetch all chats for the History tab (no limit)
    const allChatsResult = await supabase
      .from("chat_sessions")
      .select("id, title")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (allChatsResult.data) setAllChats(allChatsResult.data);
  }, [user]);

  // Fetch public data - runs once for all users
  const fetchPublicData = useCallback(async () => {
    if (publicDataLoaded) return;

    try {
      const [billsResult, membersResult, committeesResult, lobbyistsResult, contractsResult, budgetResult, schoolFundingResult] = await Promise.all([
        supabase
          .from("Bills")
          .select("bill_number, title"),
        supabase
          .from("People")
          .select("people_id, name, first_name, last_name, party, chamber")
          .not("chamber", "is", null)
          .not("name", "is", null)
          .order("first_name", { ascending: true }),
        supabase
          .from("Committees")
          .select("committee_id, committee_name, chamber, slug")
          .order("committee_name", { ascending: true }),
        supabase
          .from("lobbying_spend")
          .select("contractual_client, compensation_and_expenses")
          .not("contractual_client", "is", null)
          .order("compensation_and_expenses", { ascending: false, nullsFirst: false })
          .limit(500),
        supabase
          .from("Contracts")
          .select("contract_number, vendor_name, contract_description, department_facility")
          .not("vendor_name", "is", null)
          .order("current_contract_amount", { ascending: false, nullsFirst: false })
          .limit(500),
        supabase
          .from("budget_2027-aprops")
          .select('"Agency Name", "Program Name", "Appropriations Recommended 2026-27"')
          .not("Agency Name", "is", null)
          .limit(500),
        supabase
          .from("school_funding_totals")
          .select("id, district, county, enacted_budget, total_change")
          .not("district", "is", null)
          .order("district", { ascending: true })
          .limit(500),
      ]);

      if (billsResult.data) {
        const seen = new Set<string>();
        const deduped = billsResult.data.filter(b => {
          const key = normalizeBillNumber(b.bill_number);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setPublicBills(deduped);
      }
      if (membersResult.data) setPublicMembers(membersResult.data);
      if (committeesResult.data) setPublicCommittees(committeesResult.data);
      if (lobbyistsResult.data) setPublicLobbyists(lobbyistsResult.data as any);
      if (contractsResult.data) setPublicContracts(contractsResult.data as any);
      if (budgetResult.data) setPublicBudget(budgetResult.data as any);
      if (schoolFundingResult.data) setPublicSchoolFunding(schoolFundingResult.data as any);
      setPublicDataLoaded(true);
    } catch (error) {
      console.error("Error fetching public search data:", error);
    }
  }, [publicDataLoaded]);

  useEffect(() => {
    if (open) {
      fetchRecents();
      fetchPublicData();
      setSearchTerm("");
      setSelectedIndex(0);
      // Focus input after a short delay to ensure dialog is mounted
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, fetchRecents, fetchPublicData]);

  // Filter items based on search term
  const term = searchTerm.toLowerCase();

  const filteredChats = recentChats.filter((c) =>
    c.title.toLowerCase().includes(term)
  );
  const filteredExcerpts = recentExcerpts.filter((e) =>
    e.title.toLowerCase().includes(term)
  );
  const filteredNotes = recentNotes.filter((n) =>
    n.title.toLowerCase().includes(term)
  );
  const filteredAllChats = allChats.filter((c) =>
    c.title.toLowerCase().includes(term)
  );
  const filteredPrompts = allPrompts.filter(
    (p) =>
      p.title.toLowerCase().includes(term) ||
      p.prompt.toLowerCase().includes(term)
  );

  // Filter public data
  const filteredPages = allPages.filter((p) =>
    p.title.toLowerCase().includes(term)
  );
  const filteredBills = publicBills.filter(
    (b) =>
      normalizeBillNumber(b.bill_number).toLowerCase().includes(term) ||
      b.bill_number?.toLowerCase().includes(term) ||
      b.title?.toLowerCase().includes(term)
  );
  const filteredMembers = publicMembers.filter((m) =>
    m.name?.toLowerCase().includes(term)
  );
  const filteredCommittees = publicCommittees.filter((c) =>
    c.committee_name?.toLowerCase().includes(term)
  );
  const filteredLobbyists = publicLobbyists.filter((l) =>
    l.contractual_client?.toLowerCase().includes(term)
  );
  const filteredContracts = publicContracts.filter(
    (c) =>
      c.vendor_name?.toLowerCase().includes(term) ||
      c.contract_number?.toLowerCase().includes(term) ||
      c.contract_description?.toLowerCase().includes(term)
  );
  const filteredBudget = publicBudget.filter(
    (b) =>
      b["Agency Name"]?.toLowerCase().includes(term) ||
      b["Program Name"]?.toLowerCase().includes(term)
  );
  const filteredSchoolFunding = publicSchoolFunding.filter(
    (s) =>
      s.district?.toLowerCase().includes(term) ||
      s.county?.toLowerCase().includes(term)
  );

  // Get items for current tab
  const emptyHistoryChats: ChatSession[] = [];
  const getDisplayItems = () => {
    if (activeTab === "history") {
      return {
        recents: [], prompts: [], historyChats: filteredAllChats,
        bills: emptyBills, members: emptyMembers, committees: emptyCommittees,
        pages: emptyPages, lobbyists: emptyLobbyists, contracts: emptyContracts,
        budget: emptyBudget, schoolFunding: emptySchoolFunding, showBrowseLinks: false,
      };
    }
    if (activeTab === "library") {
      if (user) {
        return {
          recents: [...filteredChats, ...filteredExcerpts, ...filteredNotes],
          prompts: [], historyChats: emptyHistoryChats,
          bills: emptyBills, members: emptyMembers, committees: emptyCommittees,
          pages: emptyPages, lobbyists: emptyLobbyists, contracts: emptyContracts,
          budget: emptyBudget, schoolFunding: emptySchoolFunding, showBrowseLinks: false,
        };
      }
      if (!searchTerm) {
        return {
          recents: [], prompts: [], historyChats: emptyHistoryChats,
          bills: emptyBills, members: emptyMembers, committees: emptyCommittees,
          pages: emptyPages, lobbyists: emptyLobbyists, contracts: emptyContracts,
          budget: emptyBudget, schoolFunding: emptySchoolFunding, showBrowseLinks: true,
        };
      }
      return {
        recents: [], prompts: [], historyChats: emptyHistoryChats,
        bills: filteredBills, members: filteredMembers, committees: filteredCommittees,
        pages: filteredPages, lobbyists: filteredLobbyists, contracts: filteredContracts,
        budget: filteredBudget, schoolFunding: filteredSchoolFunding, showBrowseLinks: false,
      };
    }
    if (activeTab === "prompts") {
      return {
        recents: [], prompts: filteredPrompts, historyChats: emptyHistoryChats,
        bills: emptyBills, members: emptyMembers, committees: emptyCommittees,
        pages: emptyPages, lobbyists: emptyLobbyists, contracts: emptyContracts,
        budget: emptyBudget, schoolFunding: emptySchoolFunding, showBrowseLinks: false,
      };
    }
    // "all" tab
    return {
      recents: [...filteredChats.slice(0, 3), ...filteredExcerpts.slice(0, 2), ...filteredNotes.slice(0, 2)],
      prompts: filteredPrompts.slice(0, 5),
      historyChats: emptyHistoryChats,
      bills: filteredBills.slice(0, 3),
      members: filteredMembers.slice(0, 3),
      committees: filteredCommittees.slice(0, 3),
      pages: filteredPages.slice(0, 3),
      lobbyists: filteredLobbyists.slice(0, 3),
      contracts: filteredContracts.slice(0, 3),
      budget: filteredBudget.slice(0, 3),
      schoolFunding: filteredSchoolFunding.slice(0, 3),
      showBrowseLinks: false,
    };
  };

  const { recents, prompts, historyChats, bills, members, committees, pages, lobbyists, contracts, budget, schoolFunding, showBrowseLinks } = getDisplayItems();

  const handleItemClick = (type: string, id: string) => {
    onOpenChange(false);
    if (type === "chat") navigate(`/c/${id}`);
    else if (type === "excerpt") navigate(`/e/${id}`);
    else if (type === "note") navigate(`/n/${id}`);
  };

  const handlePromptClick = (prompt: string) => {
    onOpenChange(false);
    navigate(`/new-chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "bills":
        return <ScrollText className="h-4 w-4" />;
      case "members":
        return <Users className="h-4 w-4" />;
      case "committees":
        return <Landmark className="h-4 w-4" />;
      case "policy":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPageIcon = (category: string) => {
    switch (category) {
      case "department":
        return <Building2 className="h-4 w-4" />;
      case "agency":
        return <Globe className="h-4 w-4" />;
      case "authority":
        return <Shield className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const formatCurrency = (val: number | null) => {
    if (val == null) return "";
    return val.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  };

  const hasResults = recents.length > 0 || historyChats.length > 0 || prompts.length > 0 || bills.length > 0 || members.length > 0 || committees.length > 0 || pages.length > 0 || lobbyists.length > 0 || contracts.length > 0 || budget.length > 0 || schoolFunding.length > 0 || showBrowseLinks;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentNoOverlay className="sm:max-w-[724px] p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <Input
            ref={inputRef}
            placeholder="Search NYSgpt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">tab</kbd>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              activeTab === "all"
                ? "bg-muted font-medium"
                : "hover:bg-muted/50 text-muted-foreground"
            )}
          >
            All
          </button>
          {user && (
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                activeTab === "history"
                  ? "bg-muted font-medium"
                  : "hover:bg-muted/50 text-muted-foreground"
              )}
            >
              History
            </button>
          )}
          <button
            onClick={() => setActiveTab("library")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              activeTab === "library"
                ? "bg-muted font-medium"
                : "hover:bg-muted/50 text-muted-foreground"
            )}
          >
            {user ? "Library" : "Browse"}
          </button>
          <button
            onClick={() => setActiveTab("prompts")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              activeTab === "prompts"
                ? "bg-muted font-medium"
                : "hover:bg-muted/50 text-muted-foreground"
            )}
          >
            Prompts
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {/* Browse Links Section (unauthenticated, no search) */}
          {showBrowseLinks && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Browse
              </p>
              {browseLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => {
                      onOpenChange(false);
                      navigate(link.path);
                    }}
                    className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{link.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Recents Section */}
          {recents.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                {activeTab === "library" ? "Library" : "Recents"}
              </p>
              {recents.map((item, idx) => {
                const isChat = "id" in item && recentChats.some((c) => c.id === (item as ChatSession).id);
                const isExcerpt = "id" in item && recentExcerpts.some((e) => e.id === (item as Excerpt).id);
                const isNote = "id" in item && recentNotes.some((n) => n.id === (item as Note).id);
                const type = isChat ? "chat" : isExcerpt ? "excerpt" : "note";
                const Icon = isChat ? MessagesSquare : isExcerpt ? TextQuote : NotebookPen;

                return (
                  <button
                    key={`${type}-${(item as any).id}`}
                    onClick={() => handleItemClick(type, (item as any).id)}
                    className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{(item as any).title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* History Section */}
          {historyChats.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Chat History ({historyChats.length})
              </p>
              {historyChats.map((chat) => (
                <button
                  key={`history-${chat.id}`}
                  onClick={() => handleItemClick("chat", chat.id)}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  <MessagesSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Prompts Section */}
          {prompts.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Prompts
              </p>
              {prompts.map((item, idx) => (
                <button
                  key={`prompt-${idx}`}
                  onClick={() => handlePromptClick(item.prompt)}
                  className="flex items-start gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  <span className="mt-0.5 flex-shrink-0">{getCategoryIcon(item.category)}</span>
                  <span className="min-w-0">
                    <span className="font-medium block truncate">{item.title}</span>
                    <span className="text-muted-foreground text-xs line-clamp-1">{item.prompt}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Bills Section */}
          {bills.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Bills
              </p>
              {bills.map((bill) => (
                <button
                  key={`bill-${bill.bill_number}`}
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/bills/${normalizeBillNumber(bill.bill_number)}`);
                  }}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  <ScrollText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">
                    <span className="font-medium">{normalizeBillNumber(bill.bill_number)}</span>
                    {bill.title && <span className="text-muted-foreground"> — {bill.title}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Members Section */}
          {members.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Members
              </p>
              {members.map((member) => (
                <button
                  key={`member-${member.people_id}`}
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/members/${generateMemberSlug(member as any)}`);
                  }}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{member.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                    {member.party} · {member.chamber}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Committees Section */}
          {committees.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Committees
              </p>
              {committees.map((committee) => (
                <button
                  key={`committee-${committee.committee_id}`}
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/committees/${generateCommitteeSlug(committee as any)}`);
                  }}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  <Landmark className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{committee.chamber} {committee.committee_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Lobbyists Section */}
          {lobbyists.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Lobbying
              </p>
              {lobbyists.map((item, idx) => (
                <button
                  key={`lobby-${idx}`}
                  onClick={() => {
                    onOpenChange(false);
                    navigate("/lobbying");
                  }}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">
                    <span className="font-medium">{item.contractual_client}</span>
                    {item.compensation_and_expenses != null && (
                      <span className="text-muted-foreground"> — {formatCurrency(item.compensation_and_expenses)}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Contracts Section */}
          {contracts.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Contracts
              </p>
              {contracts.map((item) => (
                <button
                  key={`contract-${item.contract_number}`}
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/contracts/${item.contract_number}`);
                  }}
                  className="flex items-start gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  <HandCoins className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="min-w-0">
                    <span className="font-medium block truncate">{item.vendor_name}</span>
                    {item.contract_description && (
                      <span className="text-muted-foreground text-xs line-clamp-1">{item.contract_description}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Budget Section */}
          {budget.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Budget
              </p>
              {budget.map((item, idx) => (
                <button
                  key={`budget-${idx}`}
                  onClick={() => {
                    onOpenChange(false);
                    navigate("/budget");
                  }}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">
                    <span className="font-medium">{item["Agency Name"]}</span>
                    {item["Program Name"] && <span className="text-muted-foreground"> — {item["Program Name"]}</span>}
                    {item["Appropriations Recommended 2026-27"] != null && (
                      <span className="text-muted-foreground"> ({formatCurrency(item["Appropriations Recommended 2026-27"])})</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* School Funding Section */}
          {schoolFunding.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                School Funding
              </p>
              {schoolFunding.map((item) => (
                <button
                  key={`school-${item.id}`}
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/school-funding/${item.id}`);
                  }}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">
                    <span className="font-medium">{item.district}</span>
                    <span className="text-muted-foreground"> — {item.county}</span>
                    {item.total_change && <span className="text-muted-foreground"> ({item.total_change})</span>}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Pages Section (Departments/Agencies/Authorities) */}
          {pages.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Departments & Agencies
              </p>
              {pages.map((page) => (
                <button
                  key={`page-${page.slug}`}
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/departments/${page.slug}`);
                  }}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  {getPageIcon(page.category)}
                  <span className="truncate">{page.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!hasResults && (
            <div className="p-8 text-center text-muted-foreground">
              <p>No results found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">esc</kbd>
              Close
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑</kbd>
              <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↓</kbd>
              Navigate
            </span>
          </div>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" />
            Open
          </span>
        </div>
      </DialogContentNoOverlay>
    </Dialog>
  );
}
