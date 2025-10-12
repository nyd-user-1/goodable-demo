import { useState } from "react";
import { MessageSquare, FileText, Users, Building2, TrendingUp, Heart, Target, ScrollText, Gamepad2, Factory, Home, ChevronDown, Star, Bot } from "lucide-react";
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
import { useNavigation } from "@/hooks/useNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRecentChats } from "@/hooks/useRecentChats";
import { useTopFavorites } from "@/hooks/useTopFavorites";
import { useModel } from "@/contexts/ModelContext";
import { NavLink } from "react-router-dom";

const legislationItems = [
  { title: "Dashboard", url: "/dashboard", icon: TrendingUp },
  { title: "Members", url: "/members", icon: Users },
  { title: "Bills", url: "/bills", icon: FileText, requiresAuth: true },
  { title: "Committees", url: "/committees", icon: Building2, requiresAuth: true },
];

const developmentItems = [
  { title: "Explore", url: "/home", icon: Home },
  { title: "Problems", url: "/problems", icon: Target },
  { title: "Solutions", url: "/public-policy", icon: ScrollText },
  { title: "Chats", url: "/chats", icon: MessageSquare },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Playground", url: "/playground", icon: Gamepad2, adminOnly: true },
  { title: "Policy Lab", url: "/policy-portal", icon: Factory, adminOnly: true },
];

const availableModels = [
  { id: "gpt-4o", name: "GPT-4o", description: "Most capable, multimodal flagship model" },
  { id: "gpt-4o-mini", name: "GPT-4o mini", description: "Affordable and intelligent small model" },
  { id: "o1-preview", name: "o1-preview", description: "Reasoning model for hard problems" },
  { id: "o1-mini", name: "o1-mini", description: "Faster and cheaper reasoning model" },
];

interface SidebarNavigationProps {
  collapsed: boolean;
  hasSearchResults: boolean;
}

export function SidebarNavigation({ collapsed, hasSearchResults }: SidebarNavigationProps) {
  const { getNavClassName } = useNavigation();
  const { isAdmin } = useAuth();
  const { recentChats, loading: chatsLoading } = useRecentChats(10);
  const { topFavorites, loading: favoritesLoading } = useTopFavorites(5);
  const { selectedModel, setSelectedModel } = useModel();

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
  const [isLegislationOpen, setIsLegislationOpen] = useState(true);
  const [isDevelopmentOpen, setIsDevelopmentOpen] = useState(true);
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(true);

  return (
    <>
      {/* Favorites Section - Hidden when searching */}
      {!hasSearchResults && (
        <>
          <SidebarGroup>
            <Collapsible open={isFavoritesOpen} onOpenChange={setIsFavoritesOpen} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between">
                  Favorites
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {favoritesLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuSkeleton showIcon />
                        </SidebarMenuItem>
                      ))
                    ) : topFavorites.length > 0 ? (
                      topFavorites.map((favorite) => (
                        <SidebarMenuItem key={favorite.id}>
                          <SidebarMenuButton asChild>
                            <NavLink to={favorite.url} className={getNavClassName}>
                              <Star className="h-4 w-4" />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="truncate text-sm">{favorite.title}</span>
                                {favorite.subtitle && (
                                  <span className="truncate text-xs text-muted-foreground">{favorite.subtitle}</span>
                                )}
                              </div>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    ) : (
                      <SidebarMenuItem>
                        <SidebarMenuButton disabled>
                          <Star className="h-4 w-4" />
                          <span className="text-muted-foreground text-xs">No favorites yet</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
          <SidebarSeparator />
        </>
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

      {/* Models Section - Hidden when searching */}
      {!hasSearchResults && (
        <>
          <SidebarGroup>
            <Collapsible open={isModelsOpen} onOpenChange={setIsModelsOpen} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between">
                  Models
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {availableModels.map((model) => (
                      <SidebarMenuItem key={model.id}>
                        <SidebarMenuButton
                          isActive={selectedModel === model.id}
                          onClick={() => setSelectedModel(model.id)}
                        >
                          <Bot className="h-4 w-4" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="truncate text-sm">{model.name}</span>
                            <span className="truncate text-xs text-muted-foreground">{model.description}</span>
                          </div>
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

      {/* Recent Chats Section - Hidden when searching */}
      {!hasSearchResults && (
        <SidebarGroup>
          <Collapsible open={isChatsOpen} onOpenChange={setIsChatsOpen} className="group/collapsible">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                Recent Chats
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="max-h-[300px] overflow-y-auto">
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
    </>
  );
}