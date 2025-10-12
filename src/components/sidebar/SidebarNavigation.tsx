import { useState } from "react";
import { MessageSquare, FileText, Users, Building2, TrendingUp, Heart, Target, Gamepad2, Factory, Home, ChevronDown, Search } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/useNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRecentChats } from "@/hooks/useRecentChats";
import { NavLink } from "react-router-dom";
import { SearchChatsModal } from "@/components/SearchChatsModal";

const legislationItems = [
  { title: "Bills", url: "/bills", icon: FileText, requiresAuth: true },
  { title: "Committees", url: "/committees", icon: Building2, requiresAuth: true },
  { title: "Members", url: "/members", icon: Users },
  { title: "Dashboard", url: "/dashboard", icon: TrendingUp },
];

const developmentItems = [
  { title: "Explore", url: "/home", icon: Home },
  { title: "The 100", url: "/problems", icon: Target },
  { title: "Chats", url: "/chats", icon: MessageSquare },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Playground", url: "/playground", icon: Gamepad2, adminOnly: true },
  { title: "Lab", url: "/policy-portal", icon: Factory, adminOnly: true },
];

interface SidebarNavigationProps {
  collapsed: boolean;
  hasSearchResults: boolean;
}

export function SidebarNavigation({ collapsed, hasSearchResults }: SidebarNavigationProps) {
  const { getNavClassName } = useNavigation();
  const { isAdmin } = useAuth();
  const { recentChats, loading: chatsLoading } = useRecentChats(10);

  const [isLegislationOpen, setIsLegislationOpen] = useState(true);
  const [isDevelopmentOpen, setIsDevelopmentOpen] = useState(true);
  const [isChatsOpen, setIsChatsOpen] = useState(true);
  const [searchChatsOpen, setSearchChatsOpen] = useState(false);

  return (
    <>
      {/* Quick Actions - Always visible */}
      {!collapsed && (
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/new-chat" className={getNavClassName}>
                    <MessageSquare className="h-4 w-4" />
                    <span>New chat</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  onClick={() => setSearchChatsOpen(true)}
                  className="w-full justify-start gap-3 px-2 py-2 h-auto hover:bg-accent"
                >
                  <Search className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">Search chats</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Legislation Navigation - Hidden when searching */}
      {!hasSearchResults && (
        <>
          <SidebarGroup>
            <Collapsible open={isLegislationOpen} onOpenChange={setIsLegislationOpen} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between">
                  Legislation
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {legislationItems
                      .filter(item => !item.requiresAuth || isAdmin)
                      .map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <NavLink to={item.url} className={getNavClassName}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
          <SidebarSeparator />
        </>
      )}

      {/* Development Navigation - Hidden when searching */}
      {!hasSearchResults && (
        <>
          <SidebarGroup>
            <Collapsible open={isDevelopmentOpen} onOpenChange={setIsDevelopmentOpen} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between">
                  Development
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {developmentItems
                      .filter(item => !item.adminOnly || isAdmin)
                      .map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <NavLink to={item.url} className={getNavClassName}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
          <SidebarSeparator />
        </>
      )}

      {/* Chats Section - Hidden when searching */}
      {!hasSearchResults && (
        <SidebarGroup>
          <Collapsible open={isChatsOpen} onOpenChange={setIsChatsOpen} className="group/collapsible">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                Chats
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatsLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <SidebarMenuItem key={index}>
                        <SidebarMenuSkeleton showIcon />
                      </SidebarMenuItem>
                    ))
                  ) : recentChats.length > 0 ? (
                    recentChats.map((chat) => (
                      <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton asChild>
                          <NavLink to="/chats" className={getNavClassName}>
                            <MessageSquare className="h-4 w-4" />
                            <span className="truncate">{chat.title || "Untitled Chat"}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-muted-foreground text-xs">No recent chats</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      )}

      {/* Search Chats Modal */}
      <SearchChatsModal open={searchChatsOpen} onOpenChange={setSearchChatsOpen} />
    </>
  );
}