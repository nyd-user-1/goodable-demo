/**
 * NoteViewSidebar - A standalone sidebar component for the NoteView page
 * Slides in from off-screen outside the main container
 */

import { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  MessagesSquare,
  ScrollText,
  Users,
  Landmark,
  TrendingUp,
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
  Plus,
  Settings,
  UserPlus,
  Briefcase,
  Sun,
  Moon,
  Chrome,
  LogOut,
  ThumbsUp,
  HelpCircle,
  FileText,
  Mail,
  Zap,
  ArrowUpRight,
  FileUp,
  FolderUp,
  Download,
  MessageSquarePlus,
  FilePlus,
  FolderPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface NoteViewSidebarProps {
  onClose?: () => void;
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

export function NoteViewSidebar({ onClose }: NoteViewSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [recentExcerpts, setRecentExcerpts] = useState<Excerpt[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [newChatHover, setNewChatHover] = useState(false);
  const [planUsageOpen, setPlanUsageOpen] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check current theme
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // Fetch recent chats
  const fetchRecentChats = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentChats(data);
    }
  }, [user]);

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
    fetchRecentChats();
    fetchRecentExcerpts();
    fetchRecentNotes();
  }, [fetchRecentChats, fetchRecentExcerpts, fetchRecentNotes]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchRecentChats();
      fetchRecentExcerpts();
      fetchRecentNotes();
    };
    window.addEventListener("refresh-sidebar-notes", handleRefresh);
    return () => window.removeEventListener("refresh-sidebar-notes", handleRefresh);
  }, [fetchRecentChats, fetchRecentExcerpts, fetchRecentNotes]);

  const isActive = (url: string) => location.pathname === url;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;

    try {
      const { error } = await supabase
        .from("feedback")
        .insert({
          user_id: user?.id || null,
          content: feedbackText,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error("Error submitting feedback:", error);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }

    setFeedbackText("");
    setFeedbackOpen(false);
  };

  // Get user display name
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const truncatedName = displayName.length > 14 ? displayName.slice(0, 14) + '...' : displayName;

  return (
    <div className="flex flex-col h-full">
      {/* Header with User Dropdown, Search, and Add */}
      <div className="flex items-center justify-between px-3 py-3 border-b">
        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 gap-1 font-medium max-w-[160px]">
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
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded">Free</span>
              </div>
            </div>

            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite members
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Briefcase className="h-4 w-4 mr-2" />
                Switch workspace
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Personal</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Create workspace</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

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

            <DropdownMenuItem>
              <Chrome className="h-4 w-4 mr-2" />
              Chrome extension
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search and Add buttons */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search className="h-4 w-4" />
          </Button>

          {/* Add/Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <FileUp className="h-4 w-4 mr-2" />
                File upload
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FolderUp className="h-4 w-4 mr-2" />
                Folder upload
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Download className="h-4 w-4 mr-2" />
                  Import
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>From URL</DropdownMenuItem>
                  <DropdownMenuItem>From file</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => { navigate('/new-chat'); onClose?.(); }}>
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Chat
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FilePlus className="h-4 w-4 mr-2" />
                Note
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FolderPlus className="h-4 w-4 mr-2" />
                Folder
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-muted-foreground">
                <HelpCircle className="h-4 w-4 mr-2" />
                Learn about file types
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* New Chat and Chat History */}
        <div className="px-2 space-y-1">
          <NavLink
            to="/new-chat"
            onClick={onClose}
            onMouseEnter={() => setNewChatHover(true)}
            onMouseLeave={() => setNewChatHover(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
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
            <span>New chat</span>
          </NavLink>

          <NavLink
            to="/chats"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              isActive("/chats") ? "bg-muted" : "hover:bg-muted"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>Chat History</span>
          </NavLink>
        </div>

        {/* Your Research Section */}
        <Collapsible defaultOpen className="group/research mt-4">
          <div className="px-2">
            <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
              Your research
              <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/research:rotate-90" />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="px-2 space-y-1">
            <NavLink
              to="/bills"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive("/bills") ? "bg-muted" : "hover:bg-muted"
              )}
            >
              <ScrollText className="h-4 w-4" />
              <span>Bills</span>
            </NavLink>
            <NavLink
              to="/committees"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive("/committees") ? "bg-muted" : "hover:bg-muted"
              )}
            >
              <Landmark className="h-4 w-4" />
              <span>Committees</span>
            </NavLink>
            <NavLink
              to="/members"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive("/members") ? "bg-muted" : "hover:bg-muted"
              )}
            >
              <Users className="h-4 w-4" />
              <span>Members</span>
            </NavLink>

            {/* Separator */}
            <div className="my-2 mx-3 border-t border-border/50" />

            <NavLink
              to="/contracts"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive("/contracts") ? "bg-muted" : "hover:bg-muted"
              )}
            >
              <Wallet className="h-4 w-4" />
              <span>Contracts</span>
            </NavLink>
            <NavLink
              to="/school-funding"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive("/school-funding") ? "bg-muted" : "hover:bg-muted"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span>School Funding</span>
            </NavLink>
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive("/dashboard") ? "bg-muted" : "hover:bg-muted"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>
          </CollapsibleContent>
        </Collapsible>

        {/* Your Chats Section - Combined chats, excerpts, and notes */}
        {(recentChats.length > 0 || recentExcerpts.length > 0 || recentNotes.length > 0) && (
          <Collapsible className="group/chats mt-4">
            <div className="px-2">
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                Your chats
                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/chats:rotate-90" />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="px-2 space-y-1">
              {/* Notes */}
              {recentNotes.map((note) => (
                <NavLink
                  key={`note-${note.id}`}
                  to={`/n/${note.id}`}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    location.pathname === `/n/${note.id}` ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <NotebookPen className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{note.title}</span>
                </NavLink>
              ))}
              {/* Chats */}
              {recentChats.map((chat) => (
                <NavLink
                  key={`chat-${chat.id}`}
                  to={`/c/${chat.id}`}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    location.pathname === `/c/${chat.id}` ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <MessagesSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </NavLink>
              ))}
              {/* Excerpts */}
              {recentExcerpts.map((excerpt) => (
                <NavLink
                  key={`excerpt-${excerpt.id}`}
                  to={`/e/${excerpt.id}`}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
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
      <div className="flex-shrink-0 p-3 space-y-3 border-t">
        {/* Plan Usage Card - Collapsible */}
        <Collapsible open={planUsageOpen} onOpenChange={setPlanUsageOpen}>
          <div className="border rounded-lg overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Plan usage</span>
                <span className="text-xs text-primary font-medium px-1.5 py-0.5 bg-primary/10 rounded">Free</span>
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
                    <span className="text-muted-foreground">836/1000</span>
                  </div>
                  <Progress value={83.6} className="h-1.5" />
                </div>

                {/* Imports Usage */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Imports/day</span>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground">0/5</span>
                  </div>
                  <Progress value={0} className="h-1.5 bg-green-100 [&>div]:bg-green-500" />
                </div>

                {/* Upgrade Button */}
                <Button
                  className="w-full bg-foreground hover:bg-foreground/90 text-background"
                  onClick={() => { navigate('/plans'); onClose?.(); }}
                >
                  Upgrade
                </Button>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Feedback - Expandable */}
        <Collapsible open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 px-1 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
            <ThumbsUp className="h-4 w-4" />
            <span>Feedback</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 p-3 border rounded-lg space-y-3">
              <Textarea
                placeholder="How can we improve Goodable?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setFeedbackOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-foreground hover:bg-foreground/90 text-background" onClick={handleFeedbackSubmit}>
                  Submit
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Support Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-1 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
            <HelpCircle className="h-4 w-4" />
            <span>Support</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              User guide
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="h-4 w-4 mr-2" />
              Talk to a person
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              Email support
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">What's new</DropdownMenuLabel>
            <DropdownMenuItem>
              <Zap className="h-4 w-4 mr-2" />
              <span className="truncate">Home update, deep search, fi...</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Zap className="h-4 w-4 mr-2" />
              <span className="truncate">Academic citations, add files ...</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { navigate('/changelog'); onClose?.(); }}>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Full changelog
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
