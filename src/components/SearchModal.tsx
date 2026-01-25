/**
 * SearchModal - A command palette style search modal
 * Triggered by the search icon in the sidebar
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

type TabType = "all" | "library" | "prompts";

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [recentExcerpts, setRecentExcerpts] = useState<Excerpt[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch recent items
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
  }, [user]);

  useEffect(() => {
    if (open) {
      fetchRecents();
      setSearchTerm("");
      setSelectedIndex(0);
      // Focus input after a short delay to ensure dialog is mounted
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, fetchRecents]);

  // Filter items based on search term
  const filteredChats = recentChats.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredExcerpts = recentExcerpts.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredNotes = recentNotes.filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredPrompts = allPrompts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get items for current tab
  const getDisplayItems = () => {
    if (activeTab === "library") {
      return {
        recents: [...filteredChats, ...filteredExcerpts, ...filteredNotes],
        prompts: [],
      };
    }
    if (activeTab === "prompts") {
      return {
        recents: [],
        prompts: filteredPrompts,
      };
    }
    // "all" tab
    return {
      recents: [...filteredChats.slice(0, 3), ...filteredExcerpts.slice(0, 2), ...filteredNotes.slice(0, 2)],
      prompts: filteredPrompts.slice(0, 5),
    };
  };

  const { recents, prompts } = getDisplayItems();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[724px] p-0 gap-0 overflow-hidden">
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
          <button
            onClick={() => setActiveTab("library")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              activeTab === "library"
                ? "bg-muted font-medium"
                : "hover:bg-muted/50 text-muted-foreground"
            )}
          >
            Library
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
        <div className="max-h-[304px] overflow-y-auto">
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

          {/* Prompts Section */}
          {prompts.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                {activeTab === "prompts" ? "Prompts" : "Suggestions"}
              </p>
              {prompts.map((item, idx) => (
                <button
                  key={`prompt-${idx}`}
                  onClick={() => handlePromptClick(item.prompt)}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  {getCategoryIcon(item.category)}
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {recents.length === 0 && prompts.length === 0 && (
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
      </DialogContent>
    </Dialog>
  );
}
