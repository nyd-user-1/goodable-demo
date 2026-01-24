/**
 * NoteViewSidebar - A standalone sidebar component for the NoteView page
 * This mirrors the navigation from NewAppSidebar but works independently
 * without requiring the SidebarProvider context.
 */

import { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  MessageSquare,
  MessagesSquare,
  ScrollText,
  Users,
  Landmark,
  TrendingUp,
  Clock,
  ChevronRight,
  PenSquare,
  TextQuote,
  Wallet,
  GraduationCap,
  User,
  NotebookPen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string;
  isPinned?: boolean;
}

interface Excerpt {
  id: string;
  title: string;
}

interface Note {
  id: string;
  title: string;
}

export function NoteViewSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [recentExcerpts, setRecentExcerpts] = useState<Excerpt[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [newChatHover, setNewChatHover] = useState(false);

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

  const isActive = (url: string) => location.pathname === url;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-2">
        {/* New Chat and Chat History */}
        <div className="px-2 space-y-1">
          <NavLink
            to="/new-chat"
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

        {/* Your Chats Section */}
        {recentChats.length > 0 && (
          <Collapsible className="group/chats mt-4">
            <div className="px-2">
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                Your chats
                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/chats:rotate-90" />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="px-2 space-y-1">
              {recentChats.map((chat) => (
                <NavLink
                  key={chat.id}
                  to={`/c/${chat.id}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    location.pathname === `/c/${chat.id}` ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <MessagesSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Your Excerpts Section */}
        {recentExcerpts.length > 0 && (
          <Collapsible className="group/excerpts mt-4">
            <div className="px-2">
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                Your excerpts
                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/excerpts:rotate-90" />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="px-2 space-y-1">
              {recentExcerpts.map((excerpt) => (
                <NavLink
                  key={excerpt.id}
                  to={`/e/${excerpt.id}`}
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

        {/* Your Notes Section */}
        {recentNotes.length > 0 && (
          <Collapsible className="group/notes mt-4">
            <div className="px-2">
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                Your notes
                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/notes:rotate-90" />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="px-2 space-y-1">
              {recentNotes.map((note) => (
                <NavLink
                  key={note.id}
                  to={`/n/${note.id}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    location.pathname === `/n/${note.id}` ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <NotebookPen className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{note.title}</span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Account Link - Fixed at bottom */}
      <div className="border-t p-2 flex-shrink-0">
        <NavLink
          to="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            isActive("/profile") ? "bg-muted" : "hover:bg-muted"
          )}
        >
          <User className="h-4 w-4 flex-shrink-0" />
          <span>Account</span>
        </NavLink>
      </div>
    </div>
  );
}
