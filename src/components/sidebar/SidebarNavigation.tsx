import { useState } from "react";
import { MessageSquare, FileText, Users, Building2, TrendingUp, Heart, Target, ScrollText, Gamepad2, Factory, Home, ChevronDown } from "lucide-react";
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
import { useModel } from "@/contexts/ModelContext";
import { NavLink } from "react-router-dom";

// Custom icon components for each provider
const OpenAIIcon = ({ className }: { className?: string }) => (
  <img
    src="/OAI LOGO.png"
    alt="OpenAI"
    className={`object-contain ${className}`}
    style={{ maxWidth: '16px', maxHeight: '16px', width: 'auto', height: 'auto' }}
  />
);

const ClaudeIcon = ({ className }: { className?: string }) => (
  <img
    src="/claude-ai-icon-65aa.png"
    alt="Claude"
    className={`object-contain ${className}`}
    style={{ maxWidth: '16px', maxHeight: '16px', width: 'auto', height: 'auto' }}
  />
);

const PerplexityIcon = ({ className }: { className?: string }) => (
  <img
    src="/PPLX LOGO.png"
    alt="Perplexity"
    className={`object-contain ${className}`}
    style={{ maxWidth: '16px', maxHeight: '16px', width: 'auto', height: 'auto' }}
  />
);

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

type ModelProvider = "openai" | "anthropic" | "perplexity";
type ModelType = "gpt-4o-mini" | "gpt-4o" | "claude-3-5-sonnet-20241022" | "claude-3-5-haiku-20241022" | "llama-3.1-sonar-small-128k-online" | "llama-3.1-sonar-large-128k-online";

const models: Record<ModelProvider, { name: string; icon: React.ComponentType<{ className?: string }>; models: { id: ModelType; name: string }[] }> = {
  openai: {
    name: "OpenAI",
    icon: OpenAIIcon,
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    ]
  },
  anthropic: {
    name: "Anthropic",
    icon: ClaudeIcon,
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
    ]
  },
  perplexity: {
    name: "Perplexity",
    icon: PerplexityIcon,
    models: [
      { id: "llama-3.1-sonar-large-128k-online", name: "Sonar Large" },
      { id: "llama-3.1-sonar-small-128k-online", name: "Sonar Small" },
    ]
  }
};

interface SidebarNavigationProps {
  collapsed: boolean;
  hasSearchResults: boolean;
}

export function SidebarNavigation({ collapsed, hasSearchResults }: SidebarNavigationProps) {
  const { getNavClassName } = useNavigation();
  const { isAdmin } = useAuth();
  const { recentChats, loading: chatsLoading } = useRecentChats(10);
  const { selectedModel, setSelectedModel } = useModel();

  const [isLegislationOpen, setIsLegislationOpen] = useState(true);
  const [isDevelopmentOpen, setIsDevelopmentOpen] = useState(true);
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(true);

  return (
    <>
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
                    {Object.entries(models).map(([providerId, provider]) => (
                      <div key={providerId}>
                        {provider.models.map((model) => {
                          const Icon = provider.icon;
                          return (
                            <SidebarMenuItem key={model.id}>
                              <SidebarMenuButton
                                isActive={selectedModel === model.id}
                                onClick={() => setSelectedModel(model.id as any)}
                              >
                                <div className="w-4 h-4 flex items-center justify-center">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span>{model.name}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </div>
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
    </>
  );
}