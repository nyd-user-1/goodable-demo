/**
 * SearchModal - Server-side search with cursor-based pagination
 *
 * Architecture:
 * - Server-side full-text search via Postgres tsvector
 * - Cursor-based pagination for efficient loading
 * - Debounced input (150ms) with request cancellation
 * - Tab caching with 60s staleness
 * - Lazy-loaded tab content
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContentNoOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  NotebookPen,
  CornerDownLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Search result from server
interface SearchResult {
  id: string;
  type: "chat" | "note";
  title: string;
  preview_text: string | null;
  created_at: string;
  last_activity_at: string;
  relevance: number;
}

// Prompt with category
interface Prompt {
  title: string;
  prompt: string;
  category: string;
}

// Tab types
type TabType = "all" | "chats" | "notes" | "prompts";

// Cache entry with timestamp
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  cursor: string | null;
}

// Routes shown in All tab
const APP_ROUTES = [
  { path: "/lobbying-dashboard", label: "Lobbying Dashboard" },
  { path: "/prompts", label: "Prompts" },
  { path: "/lists", label: "Lists" },
  { path: "/features", label: "Features" },
  { path: "/use-cases", label: "Use Cases" },
  { path: "/use-cases/bills", label: "Bills Use Cases" },
  { path: "/use-cases/committees", label: "Committees Use Cases" },
  { path: "/use-cases/members", label: "Members Use Cases" },
  { path: "/use-cases/policy", label: "Policy Use Cases" },
  { path: "/use-cases/departments", label: "Departments Use Cases" },
  { path: "/nonprofits/directory", label: "Nonprofit Directory" },
  { path: "/nonprofits/economic-advocacy", label: "Economic Advocacy" },
  { path: "/nonprofits/environmental-advocacy", label: "Environmental Advocacy" },
  { path: "/nonprofits/legal-advocacy", label: "Legal Advocacy" },
  { path: "/nonprofits/social-advocacy", label: "Social Advocacy" },
  { path: "/budget", label: "Budget" },
  { path: "/school-funding", label: "School Funding" },
  { path: "/lobbying", label: "Lobbying" },
  { path: "/budget-dashboard", label: "Budget Dashboard" },
];

// Prompts with category mapping
const ALL_PROMPTS: Prompt[] = [
  // Bills
  { title: "AI Consumer Protection", prompt: "What can you tell me about efforts to protect consumers from algorithmic discrimination in New York?", category: "Bills" },
  { title: "Childcare Affordability", prompt: "What legislative approaches have been proposed to make childcare more affordable for working families in New York?", category: "Bills" },
  { title: "Paid Family Leave", prompt: "What can you tell me about efforts to expand paid family leave in New York?", category: "Bills" },
  { title: "Affordable Housing", prompt: "What are legislators doing to address the affordable housing crisis in New York?", category: "Bills" },
  { title: "Volunteer Firefighter Recruitment", prompt: "What incentives are being considered to help recruit and retain volunteer firefighters and emergency responders?", category: "Bills" },
  { title: "Medicaid Access", prompt: "What efforts are underway to reduce barriers to Medicaid services for patients?", category: "Bills" },
  { title: "Minimum Wage", prompt: "What's the current state of minimum wage legislation in New York and what changes are being proposed?", category: "Bills" },
  { title: "School Safety", prompt: "What measures are being proposed to improve safety around school zones in New York?", category: "Bills" },
  { title: "Rental Assistance", prompt: "What programs exist or are being proposed to help New Yorkers facing housing instability?", category: "Bills" },
  { title: "Disability Benefits", prompt: "What efforts are underway to strengthen disability benefits for New York workers?", category: "Bills" },
  { title: "Veteran Services", prompt: "What initiatives are being considered to improve services and support for veterans in New York?", category: "Bills" },
  { title: "Clean Energy Incentives", prompt: "What tax incentives or programs are being proposed to accelerate clean energy adoption in New York?", category: "Bills" },
  // Members
  { title: "Find My Representative", prompt: "How can I find out who my state legislators are and how to contact them?", category: "Members" },
  { title: "Assembly Leadership", prompt: "Who are the current leaders of the New York State Assembly?", category: "Members" },
  { title: "Senate Leadership", prompt: "Who are the current leaders of the New York State Senate?", category: "Members" },
  { title: "Committee Chairs", prompt: "Who chairs the major committees in the New York legislature?", category: "Members" },
  { title: "Labor Advocates", prompt: "Which legislators are known for championing workers' rights and labor issues?", category: "Members" },
  { title: "Education Champions", prompt: "Which legislators are most active on education policy and school funding?", category: "Members" },
  { title: "Healthcare Policy Leaders", prompt: "Which legislators are leading on healthcare access and reform?", category: "Members" },
  { title: "Housing Advocates", prompt: "Which legislators are focused on affordable housing and tenant protections?", category: "Members" },
  { title: "Environmental Leaders", prompt: "Which legislators are championing climate and environmental legislation?", category: "Members" },
  { title: "Small Business Supporters", prompt: "Which legislators are focused on supporting small businesses and entrepreneurs?", category: "Members" },
  // Committees
  { title: "Labor Committee Overview", prompt: "What issues does the Labor Committee handle and what major legislation is it currently considering?", category: "Committees" },
  { title: "Education Committee Priorities", prompt: "What are the current priorities of the Education Committee in New York?", category: "Committees" },
  { title: "Health Committee Focus Areas", prompt: "What healthcare issues is the Health Committee currently focused on?", category: "Committees" },
  { title: "Housing Committee Activity", prompt: "What housing-related bills is the Housing Committee reviewing this session?", category: "Committees" },
  { title: "Environmental Conservation", prompt: "What role does the Environmental Conservation Committee play in climate policy?", category: "Committees" },
  { title: "Ways and Means", prompt: "How does the Ways and Means Committee influence the state budget process?", category: "Committees" },
  { title: "Judiciary Committee", prompt: "What types of legislation does the Judiciary Committee typically handle?", category: "Committees" },
  { title: "Children and Families", prompt: "What childcare and family support issues is the Children and Families Committee working on?", category: "Committees" },
  { title: "Transportation Committee", prompt: "What infrastructure and transit issues is the Transportation Committee addressing?", category: "Committees" },
  { title: "Economic Development", prompt: "How is the Economic Development Committee supporting job creation and workforce development?", category: "Committees" },
  // Policy
  { title: "Policy Analysis Framework", prompt: "What framework should I use to analyze the potential impact of a proposed policy change?", category: "Policy" },
  { title: "Stakeholder Mapping", prompt: "How do I identify and map stakeholders who would be affected by a new housing policy?", category: "Policy" },
  { title: "Evidence-Based Policy", prompt: "What does evidence-based policymaking look like and how can I apply it to education reform?", category: "Policy" },
  { title: "Policy Implementation", prompt: "What are the key factors that determine whether a policy will be successfully implemented?", category: "Policy" },
  { title: "Regulatory Impact Assessment", prompt: "How do I conduct a regulatory impact assessment for a proposed environmental regulation?", category: "Policy" },
  { title: "Cost-Benefit Analysis", prompt: "How do I perform a cost-benefit analysis for a proposed public health initiative?", category: "Policy" },
  { title: "Policy Evaluation Methods", prompt: "What methods can I use to evaluate whether a policy is achieving its intended outcomes?", category: "Policy" },
  { title: "Unintended Consequences", prompt: "How can I anticipate and mitigate unintended consequences when designing new policies?", category: "Policy" },
  { title: "Policy Memo Writing", prompt: "What's the best structure for writing a policy memo that will be read by busy decision-makers?", category: "Policy" },
  { title: "Building Coalition Support", prompt: "How do I build a coalition of support for a policy initiative across different interest groups?", category: "Policy" },
  // Departments
  { title: "Department Overview", prompt: "What are the major departments and agencies in New York State government?", category: "Departments" },
  { title: "Agency Functions", prompt: "How do I find out what services a specific state agency provides?", category: "Departments" },
  // Nonprofit categories
  { title: "Economic Justice Initiatives", prompt: "What economic justice initiatives are nonprofits advocating for in New York?", category: "Economic" },
  { title: "Environmental Protection", prompt: "What environmental protection efforts are being led by advocacy groups?", category: "Environmental" },
  { title: "Legal Aid Resources", prompt: "What legal aid resources are available for New Yorkers?", category: "Legal" },
  { title: "Social Services Advocacy", prompt: "What social services advocacy efforts are underway in New York?", category: "Social" },
];

// Cache staleness threshold (60 seconds)
const CACHE_STALENESS_MS = 60 * 1000;

// Helper to group items by date
function groupByDate(items: SearchResult[]): { today: SearchResult[]; yesterday: SearchResult[]; previous7Days: SearchResult[]; older: SearchResult[] } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups = { today: [] as SearchResult[], yesterday: [] as SearchResult[], previous7Days: [] as SearchResult[], older: [] as SearchResult[] };

  items.forEach(item => {
    const itemDate = new Date(item.last_activity_at);
    if (itemDate >= today) {
      groups.today.push(item);
    } else if (itemDate >= yesterday) {
      groups.yesterday.push(item);
    } else if (itemDate >= weekAgo) {
      groups.previous7Days.push(item);
    } else {
      groups.older.push(item);
    }
  });

  return groups;
}

// Display labels for prompt categories
const CATEGORY_LABELS: Record<string, string> = {
  Bills: "Bill Prompts",
  Members: "Member Prompts",
  Committees: "Committee Prompts",
  Policy: "Policy Prompts",
  Departments: "Department Prompts",
  Economic: "Economic Prompts",
  Environmental: "Environmental Prompts",
  Legal: "Legal Prompts",
  Social: "Social Prompts",
};

// Helper to group prompts by category
function groupPromptsByCategory(prompts: Prompt[]): Record<string, Prompt[]> {
  const groups: Record<string, Prompt[]> = {};
  prompts.forEach(p => {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  });
  return groups;
}

// Format date for display (e.g., "Feb 5", "Jan 24")
function formatSearchDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  if (date >= today) return "Today";
  if (date >= yesterday) return "Yesterday";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Extract snippet around search term with context
function extractSnippet(text: string | null, searchTerm: string, maxLength: number = 100): { before: string; match: string; after: string } | null {
  if (!text || !searchTerm) return null;

  const lowerText = text.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerTerm);

  if (index === -1) return null;

  // Get context around the match
  const contextStart = Math.max(0, index - 30);
  const contextEnd = Math.min(text.length, index + searchTerm.length + 70);

  const before = (contextStart > 0 ? "..." : "") + text.slice(contextStart, index);
  const match = text.slice(index, index + searchTerm.length);
  const after = text.slice(index + searchTerm.length, contextEnd) + (contextEnd < text.length ? "..." : "");

  return { before, match, after };
}

export function SearchModal({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: Partial<SearchModalProps>) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Self-managed state for App-level mount
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isSearching, setIsSearching] = useState(false);

  // Results state
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [chatResults, setChatResults] = useState<SearchResult[]>([]);
  const [noteResults, setNoteResults] = useState<SearchResult[]>([]);

  // Cache state (tab -> cache entry)
  const cacheRef = useRef<Record<string, CacheEntry<SearchResult[]>>>({});
  const [tabsLoaded, setTabsLoaded] = useState<Record<TabType, boolean>>({ all: false, chats: false, notes: false, prompts: true });

  // Cmd+K keyboard shortcut
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

  // Debounce search input (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Check if cache is stale
  const isCacheStale = useCallback((key: string) => {
    const entry = cacheRef.current[key];
    if (!entry) return true;
    return Date.now() - entry.timestamp > CACHE_STALENESS_MS;
  }, []);

  // Fetch data for a tab (with caching)
  const fetchTabData = useCallback(async (tab: TabType, query: string) => {
    if (!user) return;

    const cacheKey = `${tab}-${query}`;

    // Return cached data if fresh
    if (!isCacheStale(cacheKey)) {
      const cached = cacheRef.current[cacheKey];
      if (tab === "all") setAllResults(cached.data);
      else if (tab === "chats") setChatResults(cached.data);
      else if (tab === "notes") setNoteResults(cached.data);
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearching(true);

    try {
      let results: SearchResult[] = [];

      if (tab === "all") {
        // Call search_all RPC
        const { data, error } = await supabase.rpc("search_all", {
          p_user_id: user.id,
          p_query: query || null,
          p_cursor: null,
          p_limit: 30,
        });
        if (error) throw error;
        results = data || [];
        setAllResults(results);
      } else if (tab === "chats") {
        // Call search_chats RPC
        const { data, error } = await supabase.rpc("search_chats", {
          p_user_id: user.id,
          p_query: query || null,
          p_cursor: null,
          p_limit: 50,
        });
        if (error) throw error;
        results = data || [];
        setChatResults(results);
      } else if (tab === "notes") {
        // Call search_notes RPC
        const { data, error } = await supabase.rpc("search_notes", {
          p_user_id: user.id,
          p_query: query || null,
          p_cursor: null,
          p_limit: 50,
        });
        if (error) throw error;
        results = data || [];
        setNoteResults(results);
      }

      // Cache results
      cacheRef.current[cacheKey] = {
        data: results,
        timestamp: Date.now(),
        cursor: results.length > 0 ? results[results.length - 1].last_activity_at : null,
      };

      setTabsLoaded(prev => ({ ...prev, [tab]: true }));
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Search error:", error);
      }
    } finally {
      setIsSearching(false);
    }
  }, [user, isCacheStale]);

  // Fetch data when tab changes or search term changes
  useEffect(() => {
    if (!open || !user) return;
    if (activeTab === "prompts") return; // Prompts are client-side

    fetchTabData(activeTab, debouncedTerm);
  }, [open, activeTab, debouncedTerm, user, fetchTabData]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setDebouncedTerm("");
      setActiveTab("all");
      setTabsLoaded({ all: false, chats: false, notes: false, prompts: true });
      // Clear cache on open to ensure fresh data
      cacheRef.current = {};
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter prompts client-side
  const filteredPrompts = useMemo(() => {
    if (!debouncedTerm) return ALL_PROMPTS;
    const term = debouncedTerm.toLowerCase();
    return ALL_PROMPTS.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.prompt.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }, [debouncedTerm]);

  // Filter routes for All tab
  const filteredRoutes = useMemo(() => {
    if (!debouncedTerm) return APP_ROUTES;
    const term = debouncedTerm.toLowerCase();
    return APP_ROUTES.filter(r => r.label.toLowerCase().includes(term));
  }, [debouncedTerm]);

  // Group results by date
  const groupedAllResults = useMemo(() => groupByDate(allResults), [allResults]);
  const groupedChatResults = useMemo(() => groupByDate(chatResults), [chatResults]);
  const groupedNoteResults = useMemo(() => groupByDate(noteResults), [noteResults]);
  const groupedPrompts = useMemo(() => groupPromptsByCategory(filteredPrompts), [filteredPrompts]);

  // Navigation handlers
  const handleItemClick = (type: string, id: string) => {
    onOpenChange(false);
    if (type === "chat") navigate(`/c/${id}`);
    else if (type === "note") navigate(`/n/${id}`);
  };

  const handlePromptClick = (prompt: string) => {
    onOpenChange(false);
    navigate(`/new-chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleRouteClick = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  // Check if we have any results
  const hasResults = useMemo(() => {
    if (activeTab === "all") {
      return filteredRoutes.length > 0 || allResults.length > 0;
    }
    if (activeTab === "chats") return chatResults.length > 0;
    if (activeTab === "notes") return noteResults.length > 0;
    if (activeTab === "prompts") return filteredPrompts.length > 0;
    return false;
  }, [activeTab, filteredRoutes, allResults, chatResults, noteResults, filteredPrompts]);

  // Render date group
  const renderDateGroup = (label: string, items: SearchResult[]) => {
    if (items.length === 0) return null;
    return (
      <div key={label}>
        <p className="px-4 py-2 text-xs font-medium text-muted-foreground">{label}</p>
        {items.map(item => {
          const snippet = debouncedTerm ? extractSnippet(item.preview_text, debouncedTerm) : null;

          return (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => handleItemClick(item.type, item.id)}
              className="flex items-start gap-3 w-full px-4 py-3 text-sm hover:bg-muted transition-colors text-left"
            >
              {item.type === "note" && (
                <NotebookPen className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate">{item.title || "Untitled"}</div>
                {snippet && (
                  <div className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                    {snippet.before}
                    <span className="font-semibold text-foreground">{snippet.match}</span>
                    {snippet.after}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                {formatSearchDate(item.last_activity_at)}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentNoOverlay className="sm:max-w-[680px] p-0 gap-0 overflow-hidden">
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
            {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">tab</kbd>
            <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-muted rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b">
          {(["all", "chats", "notes", "prompts"] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors capitalize",
                activeTab === tab ? "bg-muted font-medium" : "hover:bg-muted/50 text-muted-foreground"
              )}
            >
              {tab === "all" ? "All" : tab === "chats" ? "Chats" : tab === "notes" ? "Notes" : "Prompts"}
            </button>
          ))}
        </div>

        {/* Results - fixed height container */}
        <div className="h-[400px] overflow-y-auto">
          {/* All Tab */}
          {activeTab === "all" && (
            <>
              {/* Routes Section */}
              {filteredRoutes.length > 0 && !debouncedTerm && (
                <div>
                  <p className="px-4 py-2 text-xs font-medium text-muted-foreground">Pages</p>
                  {filteredRoutes.slice(0, 5).map(route => (
                    <button
                      key={route.path}
                      onClick={() => handleRouteClick(route.path)}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <span className="truncate">{route.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Activity grouped by date */}
              {user && (
                <>
                  {renderDateGroup("Today", groupedAllResults.today)}
                  {renderDateGroup("Yesterday", groupedAllResults.yesterday)}
                  {renderDateGroup("Previous 7 Days", groupedAllResults.previous7Days)}
                </>
              )}

              {/* Unauthenticated state */}
              {!user && (
                <div className="p-4 text-center text-muted-foreground">
                  <p>Sign in to search your chats and notes</p>
                </div>
              )}
            </>
          )}

          {/* Chats Tab */}
          {activeTab === "chats" && user && (
            <>
              {renderDateGroup("Today", groupedChatResults.today)}
              {renderDateGroup("Yesterday", groupedChatResults.yesterday)}
              {renderDateGroup("Previous 7 Days", groupedChatResults.previous7Days)}
              {renderDateGroup("Older", groupedChatResults.older)}
            </>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && user && (
            <>
              {renderDateGroup("Today", groupedNoteResults.today)}
              {renderDateGroup("Yesterday", groupedNoteResults.yesterday)}
              {renderDateGroup("Previous 7 Days", groupedNoteResults.previous7Days)}
              {renderDateGroup("Older", groupedNoteResults.older)}
            </>
          )}

          {/* Prompts Tab */}
          {activeTab === "prompts" && (
            <>
              {Object.entries(groupedPrompts).map(([category, prompts]) => (
                <div key={category}>
                  <p className="px-4 py-2 text-xs font-medium text-muted-foreground">{CATEGORY_LABELS[category] || category}</p>
                  {prompts.map((p, idx) => (
                    <button
                      key={`${category}-${idx}`}
                      onClick={() => handlePromptClick(p.prompt)}
                      className="flex flex-col items-start w-full px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <span className="font-medium">{p.title}</span>
                      <span className="text-muted-foreground text-xs line-clamp-1">{p.prompt}</span>
                    </button>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* Empty / No Results State */}
          {!hasResults && !isSearching && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {debouncedTerm ? (
                <p>No results found for "{debouncedTerm}"</p>
              ) : (
                <p>No items yet</p>
              )}
            </div>
          )}

          {/* Skeleton Loading State */}
          {isSearching && (
            <div className="py-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/5 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-4/5 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
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
