import { useState, useEffect } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { MessageSquare, FileText, Users, Building2, TrendingUp, Heart, Target, Gamepad2, Factory, Home, User, CreditCard, Clock, Shield, Palette, Image as ImageIcon, ChevronRight, PanelLeftClose, PanelLeft, MoreHorizontal, Pin, Trash2, PenSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const developmentItems = [
  { title: "Explore", url: "/home", icon: Home },
  { title: "The 100", url: "/problems", icon: Target },
  { title: "Playground", url: "/playground", icon: Gamepad2, adminOnly: true },
  { title: "Lab", url: "/policy-portal", icon: Factory, adminOnly: true },
];

const accountItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Plans", url: "/plans", icon: CreditCard },
  { title: "Change Log", url: "/changelog", icon: Clock },
];

const adminItems = [
  { title: "Control Panel", url: "/admin", icon: Shield },
  { title: "Design System", url: "/style-guide", icon: Palette },
  { title: "Image System", url: "/image-system", icon: ImageIcon },
];

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
  isPinned?: boolean;
}

const PINNED_CHATS_KEY = "goodable_pinned_chats";

const getPinnedChatIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem(PINNED_CHATS_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
};

const savePinnedChatIds = (ids: Set<string>) => {
  localStorage.setItem(PINNED_CHATS_KEY, JSON.stringify([...ids]));
};

export function NewAppSidebar() {
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { isAdmin, user } = useAuth();
  const { toggleSidebar, state } = useSidebar();
  const { toast } = useToast();
  const isCollapsed = state === "collapsed";
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(getPinnedChatIds());
  const [newChatHover, setNewChatHover] = useState(false);

  // Fetch recent chats for the sidebar
  useEffect(() => {
    const fetchRecentChats = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_sessions")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        const currentPinnedIds = getPinnedChatIds();
        const chatsWithPinned = data.map(chat => ({
          ...chat,
          isPinned: currentPinnedIds.has(chat.id),
        }));
        // Sort: pinned first, then by updated_at
        chatsWithPinned.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });
        setRecentChats(chatsWithPinned);
      }
    };

    fetchRecentChats();
  }, [user]);

  const deleteChat = async (chatId: string) => {
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", chatId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat.",
        variant: "destructive",
      });
      return;
    }

    setRecentChats(prev => prev.filter(chat => chat.id !== chatId));
    const newPinnedIds = new Set(pinnedIds);
    newPinnedIds.delete(chatId);
    setPinnedIds(newPinnedIds);
    savePinnedChatIds(newPinnedIds);
    toast({
      title: "Chat deleted",
      description: "The chat has been deleted.",
    });
  };

  const togglePinChat = (chatId: string) => {
    const newPinnedIds = new Set(pinnedIds);
    const wasPinned = newPinnedIds.has(chatId);

    if (wasPinned) {
      newPinnedIds.delete(chatId);
    } else {
      newPinnedIds.add(chatId);
    }

    setPinnedIds(newPinnedIds);
    savePinnedChatIds(newPinnedIds);

    setRecentChats(prev => {
      const updated = prev.map(chat => ({
        ...chat,
        isPinned: newPinnedIds.has(chat.id),
      }));
      updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
      return updated;
    });

    toast({
      title: wasPinned ? "Chat unpinned" : "Chat pinned",
      description: wasPinned ? "Chat removed from pins." : "Chat pinned to top.",
    });
  };

  const isActive = (url: string) => location.pathname === url;
  const isChatActive = (chatId: string) => location.pathname === `/c/${chatId}` || sessionId === chatId;

  const handleWhitespaceClick = (e: React.MouseEvent) => {
    // Only toggle if clicking on the whitespace itself, not on buttons or links
    if (e.target === e.currentTarget) {
      toggleSidebar();
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader onClick={handleWhitespaceClick}>
        <div className="flex items-center justify-between w-full px-2 py-1">
          <button
            onClick={isCollapsed ? toggleSidebar : undefined}
            className={`flex items-center justify-center ${
              isCollapsed
                ? 'cursor-pointer hover:opacity-70'
                : 'aspect-square size-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'
            }`}
          >
            <span className={`font-bold ${isCollapsed ? 'text-xl text-foreground' : 'text-lg'}`}>G</span>
          </button>
          {!isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebar}
                  className="flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors"
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose className="size-5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Close sidebar</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent onClick={handleWhitespaceClick}>
        {/* New Chat & Chat History */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem
              onMouseEnter={() => setNewChatHover(true)}
              onMouseLeave={() => setNewChatHover(false)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild isActive={isActive("/new-chat")}>
                    <NavLink to="/new-chat">
                      <div className="relative w-4 h-4">
                        <MessageSquare className={`absolute inset-0 transition-opacity duration-200 ${newChatHover ? 'opacity-0' : 'opacity-100'}`} />
                        <PenSquare className={`absolute inset-0 transition-opacity duration-200 ${newChatHover ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                      <span>New chat</span>
                    </NavLink>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>New chat</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild isActive={isActive("/chats")}>
                    <NavLink to="/chats">
                      <Clock />
                      <span>Chat History</span>
                    </NavLink>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Chat History</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild isActive={isActive("/favorites")}>
                    <NavLink to="/favorites">
                      <Heart />
                      <span>Favorites</span>
                    </NavLink>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Favorites</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild isActive={isActive("/bills")}>
                    <NavLink to="/bills">
                      <FileText />
                      <span>Bills</span>
                    </NavLink>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Bills</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild isActive={isActive("/committees")}>
                    <NavLink to="/committees">
                      <Building2 />
                      <span>Committees</span>
                    </NavLink>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Committees</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild isActive={isActive("/members")}>
                    <NavLink to="/members">
                      <Users />
                      <span>Members</span>
                    </NavLink>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Members</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                    <NavLink to="/dashboard">
                      <TrendingUp />
                      <span>Dashboard</span>
                    </NavLink>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Dashboard</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Your Chats - only show when sidebar is expanded */}
        {!isCollapsed && recentChats.length > 0 && (
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  Your chats
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {recentChats.map((chat) => (
                      <SidebarMenuItem key={chat.id} className="group/chat relative">
                        <SidebarMenuButton
                          asChild
                          isActive={isChatActive(chat.id)}
                          className="truncate pr-8"
                        >
                          <NavLink to={`/c/${chat.id}`}>
                            {chat.isPinned && <Pin className="h-3 w-3 mr-1 flex-shrink-0 text-primary" />}
                            <span className="truncate">{chat.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover/chat:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="right">
                            <DropdownMenuItem onClick={() => togglePinChat(chat.id)}>
                              <Pin className="h-4 w-4 mr-2" />
                              {chat.isPinned ? "Unpin Chat" : "Pin Chat"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteChat(chat.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

      </SidebarContent>

      <SidebarFooter onClick={handleWhitespaceClick}>
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton asChild isActive={isActive("/profile")}>
                  <NavLink to="/profile">
                    <User className="h-4 w-4" />
                    <span>Account</span>
                  </NavLink>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Account</p>
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
