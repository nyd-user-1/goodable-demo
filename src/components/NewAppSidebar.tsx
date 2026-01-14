import { useState, useEffect } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { MessageSquare, FileText, Users, Building2, TrendingUp, Heart, Target, Gamepad2, Factory, Home, User, CreditCard, Clock, Shield, Palette, Image as ImageIcon, ChevronRight } from "lucide-react";
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
}

export function NewAppSidebar() {
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { isAdmin, user } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);

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
        setRecentChats(data);
      }
    };

    fetchRecentChats();
  }, [user]);

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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={toggleSidebar}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground cursor-pointer">
                <span className="text-lg font-bold">G</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Goodable</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent onClick={handleWhitespaceClick}>
        {/* New Chat & Chat History */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild isActive={isActive("/new-chat")}>
                    <NavLink to="/new-chat">
                      <MessageSquare />
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

        {/* Your Chats */}
        {recentChats.length > 0 && (
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
                      <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isChatActive(chat.id)}
                          className="truncate"
                        >
                          <NavLink to={`/c/${chat.id}`}>
                            <span className="truncate">{chat.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
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
                <SidebarMenuButton>
                  <User className="h-4 w-4" />
                  <span>Account</span>
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
