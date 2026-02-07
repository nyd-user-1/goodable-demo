/**
 * NoteViewSidebar - A standalone sidebar component for the NoteView page
 * Slides in from off-screen outside the main container
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  ScrollText,
  Users,
  Landmark,
  DollarSign,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PenSquare,
  TextQuote,
  Wallet,
  GraduationCap,
  NotebookPen,
  Search,
  Settings,
  Sun,
  Moon,
  LogIn,
  LogOut,
  HelpCircle,
  FileText,
  HandCoins,
  MoreHorizontal,
  Pin,
  Trash2,
  Pencil,
  BookCheck,
  BarChart3,
  CirclePlus,
  Home,
  Flag,
  Sparkles,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useAIUsage } from "@/hooks/useAIUsage";
import { useSubscription } from "@/hooks/useSubscription";
import { useRecentChats } from "@/hooks/useRecentChats";
import { trackEvent } from "@/utils/analytics";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent as RenameDialogContent,
  DialogHeader as RenameDialogHeader,
  DialogTitle as RenameDialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NoteViewSidebarProps {
  onClose?: () => void;
}

interface Excerpt {
  id: string;
  title: string;
}

interface Note {
  id: string;
  title: string;
  updated_at: string;
  isPinned?: boolean;
}

// Combined item type for unified list
interface SidebarItem {
  id: string;
  title: string;
  type: 'chat' | 'note' | 'excerpt';
  updated_at: string;
  isPinned: boolean;
  // Chat-specific
  isLobbyingChat?: boolean;
  isContractChat?: boolean;
  isSchoolFundingChat?: boolean;
}

const PINNED_NOTES_KEY = "goodable_pinned_notes";

// Helper to get pinned note IDs from localStorage
const getPinnedNoteIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem(PINNED_NOTES_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
};

const savePinnedNoteIds = (ids: Set<string>) => {
  localStorage.setItem(PINNED_NOTES_KEY, JSON.stringify([...ids]));
};

export function NoteViewSidebar({ onClose }: NoteViewSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const { wordsUsed, dailyLimit, usagePercentage } = useAIUsage();
  const { recentChats, deleteChat, togglePinChat, renameChat, refetch: refetchChats } = useRecentChats(10);
  const [recentExcerpts, setRecentExcerpts] = useState<Excerpt[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [pinnedNoteIds, setPinnedNoteIds] = useState<Set<string>>(getPinnedNoteIds());
  const [newChatHover, setNewChatHover] = useState(false);
  const [planUsageOpen, setPlanUsageOpen] = useState(!user);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{ id: string; title: string; type: 'chat' | 'note' } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState("");

  // Check current theme
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  // Fetch recent excerpts
  const fetchRecentExcerpts = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("chat_excerpts")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentExcerpts(data);
    }
  }, [user]);

  // Fetch recent notes
  const fetchRecentNotes = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("chat_notes")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentNotes(data);
    }
  }, [user]);

  useEffect(() => {
    fetchRecentExcerpts();
    fetchRecentNotes();
  }, [fetchRecentExcerpts, fetchRecentNotes]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      refetchChats();
      fetchRecentExcerpts();
      fetchRecentNotes();
    };
    window.addEventListener("refresh-sidebar-notes", handleRefresh);
    return () => window.removeEventListener("refresh-sidebar-notes", handleRefresh);
  }, [refetchChats, fetchRecentExcerpts, fetchRecentNotes]);

  const isActive = (url: string) => location.pathname === url;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };


  const handleRenameClick = (id: string, currentTitle: string, type: 'chat' | 'note') => {
    setItemToRename({ id, title: currentTitle, type });
    setRenameValue(currentTitle);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!itemToRename || !renameValue.trim()) return;

    if (itemToRename.type === 'chat') {
      await renameChat(itemToRename.id, renameValue.trim());
    } else if (itemToRename.type === 'note') {
      await renameNote(itemToRename.id, renameValue.trim());
    }

    setRenameDialogOpen(false);
    setItemToRename(null);
    setRenameValue("");
  };

  const handleInlineRenameSubmit = async (id: string, type: 'chat' | 'note') => {
    if (!inlineEditValue.trim()) {
      setInlineEditId(null);
      return;
    }
    if (type === 'chat') {
      await renameChat(id, inlineEditValue.trim());
    } else {
      await renameNote(id, inlineEditValue.trim());
    }
    setInlineEditId(null);
    setInlineEditValue("");
  };

  // Note operations
  const renameNote = async (noteId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from("chat_notes")
        .update({ title: newTitle })
        .eq("id", noteId);

      if (error) throw error;

      setRecentNotes(prev => prev.map(note =>
        note.id === noteId ? { ...note, title: newTitle } : note
      ));
    } catch (error) {
      console.error("Error renaming note:", error);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("chat_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      setRecentNotes(prev => prev.filter(note => note.id !== noteId));

      // Remove from pinned if it was pinned
      const newPinnedIds = new Set(pinnedNoteIds);
      newPinnedIds.delete(noteId);
      setPinnedNoteIds(newPinnedIds);
      savePinnedNoteIds(newPinnedIds);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const togglePinNote = (noteId: string) => {
    const newPinnedIds = new Set(pinnedNoteIds);
    if (newPinnedIds.has(noteId)) {
      newPinnedIds.delete(noteId);
    } else {
      newPinnedIds.add(noteId);
    }
    setPinnedNoteIds(newPinnedIds);
    savePinnedNoteIds(newPinnedIds);
  };

  // Combine chats and notes into a single sorted list
  const combinedItems: SidebarItem[] = useMemo(() => {
    const items: SidebarItem[] = [];

    // Add chats
    recentChats.forEach(chat => {
      const rawTitle = chat.title || "Untitled Chat";
      const isLobbyingChat = rawTitle.startsWith("Tell me about") &&
        (rawTitle.includes("LLC") || rawTitle.includes("LLP") ||
         rawTitle.includes("INC") || rawTitle.includes("ADVISORS") ||
         rawTitle.includes("ASSOCIATES") || rawTitle.includes("CONSULTING") ||
         rawTitle.includes("GROUP") || rawTitle.includes("STRATEGIES") ||
         rawTitle.includes("AFFAIRS") || rawTitle.includes("& "));

      // Check both title and first user message content for contract/school funding chats
      // (title prefix is stripped on rename, but first message content is preserved)
      const messagesArr = Array.isArray(chat.messages) ? chat.messages as Array<{ role?: string; content?: string }> : [];
      const firstUserContent = messagesArr.find(m => m.role === 'user')?.content || '';
      const isContractChat = /^\[Contract:[^\]]+\]/.test(rawTitle) || /\[Contract:[^\]]+\]/.test(firstUserContent);
      const isSchoolFundingChat = /^\[SchoolFunding:[^\]]+\]/.test(rawTitle) || /\[SchoolFunding:[^\]]+\]/.test(firstUserContent);

      // Strip [Contract:...] and [SchoolFunding:...] prefixes from displayed title
      const chatTitle = rawTitle.replace(/^\[Contract:[^\]]+\]\s*/, '').replace(/^\[SchoolFunding:[^\]]+\]\s*/, '');

      items.push({
        id: chat.id,
        title: chatTitle,
        type: 'chat',
        updated_at: chat.updated_at || new Date().toISOString(),
        isPinned: chat.isPinned,
        isLobbyingChat,
        isContractChat,
        isSchoolFundingChat,
      });
    });

    // Add notes
    recentNotes.forEach(note => {
      items.push({
        id: note.id,
        title: note.title || "Untitled Note",
        type: 'note',
        updated_at: note.updated_at || new Date().toISOString(),
        isPinned: pinnedNoteIds.has(note.id),
      });
    });

    // Sort: pinned first, then by updated_at descending
    items.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return items;
  }, [recentChats, recentNotes, pinnedNoteIds]);

  // Get user display name
  const displayName = user ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User') : 'NYSgpt';
  const truncatedName = displayName.length > 14 ? displayName.slice(0, 14) + '...' : displayName;

  return (
    <TooltipProvider delayDuration={300}>
    <div className="flex flex-col h-full">
      {/* Header with User Dropdown/Sign In, Search, and Add */}
      <div className="flex items-center justify-between px-3 py-3 border-b">
        {/* User Dropdown for authenticated, Sign In button for unauthenticated */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 gap-1 font-semibold max-w-[160px]">
                <span className="truncate">{truncatedName}</span>
                <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {/* User Info */}
              <div className="px-3 py-2 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded">Free</span>
                </div>
              </div>

              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {isDarkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => { document.documentElement.classList.remove('dark'); setIsDarkMode(false); }}>
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { document.documentElement.classList.add('dark'); setIsDarkMode(true); }}>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => { navigate('/features'); onClose?.(); }}>
                <Sparkles className="h-4 w-4 mr-2" />
                Features
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigate('/use-cases'); onClose?.(); }}>
                <Briefcase className="h-4 w-4 mr-2" />
                Use Cases
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            className="h-9 px-3 font-semibold text-base hover:bg-muted"
            onClick={() => navigate('/auth-4')}
          >
            Sign Up
          </Button>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }));
            }}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex h-9 w-9" onClick={() => navigate(user ? '/new-chat' : '/')}>
            <Home className="h-5 w-5" />
          </Button>

          {/* Log close icon - all screen sizes */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5h1"/><path d="M3 12h1"/><path d="M3 19h1"/>
              <path d="M8 5h1"/><path d="M8 12h1"/><path d="M8 19h1"/>
              <path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/>
            </svg>
          </Button>
        </div>
      </div>

      {/* Fixed Top Actions */}
      <div className="flex-shrink-0 px-2 py-2 space-y-1">
        {/* #1 Chats */}
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/new-chat"
              onClick={onClose}
              onMouseEnter={() => setNewChatHover(true)}
              onMouseLeave={() => setNewChatHover(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                isActive("/new-chat") ? "bg-muted" : "hover:bg-muted"
              )}
            >
              <div className="relative w-4 h-4 flex-shrink-0">
                <MessageSquare
                  className={cn(
                    "absolute inset-0 w-4 h-4 transition-opacity duration-200",
                    newChatHover ? "opacity-0" : "opacity-100"
                  )}
                />
                <PenSquare
                  className={cn(
                    "absolute inset-0 w-4 h-4 transition-opacity duration-200",
                    newChatHover ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>
              <span>Chats</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Start a new conversation</p>
          </TooltipContent>
        </Tooltip>

        {/* #2 Search */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }));
                onClose?.();
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors w-full text-left",
                "hover:bg-muted"
              )}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Search everything</p>
          </TooltipContent>
        </Tooltip>

        {/* #3 Prompts */}
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/prompts"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                isActive("/prompts") ? "bg-muted" : "hover:bg-muted"
              )}
            >
              <Flag className="h-4 w-4" />
              <span>Prompts</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Browse prompts & lists</p>
          </TooltipContent>
        </Tooltip>


      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Research Navigation - No collapsible */}
        <div className="px-2 space-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/bills"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                    isActive("/bills") ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <ScrollText className="h-4 w-4" />
                  <span>Bills</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Browse legislative bills</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/committees"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                    isActive("/committees") ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <Landmark className="h-4 w-4" />
                  <span>Committees</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Explore legislative committees</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/departments"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                    isActive("/departments") ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <BookCheck className="h-4 w-4" />
                  <span>Departments</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Explore NYS departments & agencies</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/members"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                    isActive("/members") ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <Users className="h-4 w-4" />
                  <span>Members</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>View elected officials</p>
              </TooltipContent>
            </Tooltip>

            {/* Notes - after Members */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/new-note"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                    isActive("/new-note") ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <NotebookPen className="h-4 w-4" />
                  <span>Notes</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Create a new note</p>
              </TooltipContent>
            </Tooltip>

            {/* Pro Plan Section */}
            <Collapsible className="group/pro">
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal text-foreground hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <CirclePlus className="h-4 w-4" />
                  <span>Pro Plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); navigate('/plans'); onClose?.(); }}
                    className="text-xs font-medium px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 transition-shadow hover:shadow-sm cursor-pointer"
                  >
                    Upgrade
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]/pro:rotate-90" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-1 mt-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to="/budget"
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                        isActive("/budget") ? "bg-muted" : "hover:bg-muted"
                      )}
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>Budget</span>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>NYS Budget data</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to="/contracts"
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                        isActive("/contracts") ? "bg-muted" : "hover:bg-muted"
                      )}
                    >
                      <Wallet className="h-4 w-4" />
                      <span>Contracts</span>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Search government contracts</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to="/budget-dashboard"
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                        isActive("/budget-dashboard") ? "bg-muted" : "hover:bg-muted"
                      )}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Explorer</span>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Explore NYS budget spending data</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to="/lobbying"
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                        isActive("/lobbying") ? "bg-muted" : "hover:bg-muted"
                      )}
                    >
                      <HandCoins className="h-4 w-4" />
                      <span>Lobbyists</span>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Explore lobbying data</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to="/school-funding"
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors",
                        isActive("/school-funding") ? "bg-muted" : "hover:bg-muted"
                      )}
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>Schools</span>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>School funding information</p>
                  </TooltipContent>
                </Tooltip>
              </CollapsibleContent>
            </Collapsible>

            {/* User Login - only for unauthenticated users */}
            {!user && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-base md:text-[15px] font-normal transition-colors hover:bg-muted w-full text-left"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>User Login</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Log in to your account</p>
                </TooltipContent>
              </Tooltip>
            )}

        </div>

        {/* Your Chats Section - Combined chats and notes, sorted chronologically */}
        {(combinedItems.length > 0 || recentExcerpts.length > 0) && (
          <Collapsible className="group/chats mt-4">
            <div className="px-2">
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                Chats
                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/chats:rotate-90" />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="px-2 space-y-1">
              {/* Combined chats and notes, sorted by date */}
              {combinedItems.map((item) => (
                <div key={`${item.type}-${item.id}`} className="group/item relative">
                  {inlineEditId === item.id ? (
                    <div className="flex items-center gap-3 px-3 py-2.5 md:py-2 pr-8 rounded-md text-[15px] md:text-sm bg-muted w-full">
                      {item.isPinned ? (
                        <Pin className="h-4 w-4 flex-shrink-0 text-primary" />
                      ) : item.type === 'note' ? (
                        <NotebookPen className="h-4 w-4 flex-shrink-0" />
                      ) : item.isLobbyingChat ? (
                        <HandCoins className="h-4 w-4 flex-shrink-0" />
                      ) : item.isContractChat ? (
                        <Wallet className="h-4 w-4 flex-shrink-0" />
                      ) : item.isSchoolFundingChat ? (
                        <GraduationCap className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      )}
                      <input
                        autoFocus
                        className="flex-1 bg-transparent outline-none text-[15px] md:text-sm min-w-0"
                        value={inlineEditValue}
                        onChange={(e) => setInlineEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInlineRenameSubmit(item.id, item.type);
                          } else if (e.key === 'Escape') {
                            setInlineEditId(null);
                          }
                        }}
                        onBlur={() => handleInlineRenameSubmit(item.id, item.type)}
                      />
                    </div>
                  ) : (
                  <NavLink
                    to={item.type === 'chat' ? `/c/${item.id}` : `/n/${item.id}`}
                    onClick={onClose}
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      setInlineEditId(item.id);
                      setInlineEditValue(item.title);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 md:py-2 pr-8 rounded-md text-[15px] md:text-sm transition-colors",
                      (item.type === 'chat' ? location.pathname === `/c/${item.id}` : location.pathname === `/n/${item.id}`)
                        ? "bg-muted"
                        : "hover:bg-muted"
                    )}
                  >
                    {item.isPinned ? (
                      <Pin className="h-4 w-4 flex-shrink-0 text-primary" />
                    ) : item.type === 'note' ? (
                      <NotebookPen className="h-4 w-4 flex-shrink-0" />
                    ) : item.isLobbyingChat ? (
                      <HandCoins className="h-4 w-4 flex-shrink-0" />
                    ) : item.isContractChat ? (
                      <Wallet className="h-4 w-4 flex-shrink-0" />
                    ) : item.isSchoolFundingChat ? (
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="right">
                      <DropdownMenuItem onClick={() => handleRenameClick(item.id, item.title, item.type)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => item.type === 'chat' ? togglePinChat(item.id) : togglePinNote(item.id)}>
                        <Pin className="h-4 w-4 mr-2" />
                        {item.isPinned ? (item.type === 'chat' ? "Unpin Chat" : "Unpin Note") : (item.type === 'chat' ? "Pin Chat" : "Pin Note")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => item.type === 'chat' ? deleteChat(item.id) : deleteNote(item.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              {/* Excerpts */}
              {recentExcerpts.map((excerpt) => (
                <NavLink
                  key={`excerpt-${excerpt.id}`}
                  to={`/e/${excerpt.id}`}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-[15px] md:text-sm transition-colors",
                    location.pathname === `/e/${excerpt.id}` ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <TextQuote className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{excerpt.title}</span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Bottom Section */}
      <div className="flex-shrink-0 p-3 pb-6 space-y-3 border-t">
        {/* Plan Usage Card - Collapsible (only for authenticated users) */}
        <Collapsible open={planUsageOpen} onOpenChange={setPlanUsageOpen}>
          <div className="border rounded-lg overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Plan usage</span>
                <span className="text-xs text-primary font-medium px-1.5 py-0.5 bg-primary/10 rounded capitalize">
                  {subscription?.subscription_tier || 'Free'}
                </span>
              </div>
              {planUsageOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-3">
                {/* AI Words Usage */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">AI words/day</span>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground">
                      {dailyLimit === Infinity ? (
                        `${wordsUsed.toLocaleString()} (unlimited)`
                      ) : (
                        `${wordsUsed.toLocaleString()}/${dailyLimit.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  {dailyLimit !== Infinity && (
                    <Progress value={usagePercentage} className="h-1.5" />
                  )}
                </div>

                {/* Upgrade Button - only show for free tier */}
                {(subscription?.subscription_tier === 'free' || !subscription?.subscription_tier) && (
                  <Button
                    className="w-full bg-foreground hover:bg-foreground/90 text-background"
                    onClick={() => { trackEvent('upgrade_prompt_clicked', { source: 'sidebar' }); navigate('/plans'); onClose?.(); }}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Features & Use Cases - hidden on mobile */}
        <div className="hidden sm:block space-y-1 pt-1">
          <button
            onClick={() => { navigate('/features'); onClose?.(); }}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-normal transition-colors hover:bg-muted w-full text-left text-muted-foreground"
          >
            <Sparkles className="h-4 w-4" />
            <span>Features</span>
          </button>
          <button
            onClick={() => { navigate('/use-cases'); onClose?.(); }}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-normal transition-colors hover:bg-muted w-full text-left text-muted-foreground"
          >
            <Briefcase className="h-4 w-4" />
            <span>Use Cases</span>
          </button>
        </div>

      </div>

      {/* Rename Chat Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={(open) => {
        setRenameDialogOpen(open);
        if (!open) document.body.style.pointerEvents = '';
      }}>
        <RenameDialogContent className="sm:max-w-[425px]" onCloseAutoFocus={(e) => e.preventDefault()}>
          <RenameDialogHeader>
            <RenameDialogTitle>Rename Chat</RenameDialogTitle>
          </RenameDialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new title"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>
              Save
            </Button>
          </DialogFooter>
        </RenameDialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
