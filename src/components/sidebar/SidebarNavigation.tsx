import { useState } from "react";
import { Search, Settings, User, FileText, Lightbulb, BarChart3, Users, Building2, TrendingUp, MessageSquare, Heart, CreditCard, History, Gamepad2, Factory, Target, Star, ScrollText, Palette, Shield, Lock, Rss, Home, Image, BookOpen, ChevronDown, ChevronRight, FlaskConical, Scale } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { NavigationItem } from "./NavigationItem";
import { useNavigation } from "@/hooks/useNavigation";
import { useAuth } from "@/contexts/AuthContext";

const navigateNavItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Intelligence", url: "/dashboard", icon: TrendingUp },
  { title: "Feed", url: "/feed", icon: Rss, adminOnly: true },
  { title: "Blog", url: "/blog", icon: BookOpen },
  { title: "Members", url: "/members", icon: Users },
  { title: "Bills", url: "/bills", icon: FileText, requiresAuth: true },
  { title: "Committees", url: "/committees", icon: Building2, requiresAuth: true },
  { title: "Laws", url: "/laws", icon: Scale, requiresAuth: true },
];

const workflowNavItems = [
  { title: "Problems", url: "/problems", icon: Target },
  { title: "Solutions", url: "/public-policy", icon: ScrollText },
  { title: "Chats", url: "/chats", icon: MessageSquare },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Playground", url: "/playground", icon: Gamepad2, adminOnly: true },
  { title: "Bills and Resolutions", url: "/policy-portal", icon: Factory, adminOnly: true },
  { title: "Policy Lab", url: "/policy-lab", icon: FlaskConical, adminOnly: true },
];

const bottomNavItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Plans", url: "/plans", icon: CreditCard },
  { title: "Change Log", url: "/changelog", icon: History },
];

const adminNavItems = [
  { title: "Control Panel", url: "/admin", icon: Shield },
  { title: "Design System", url: "/style-guide", icon: Palette },
  { title: "Image System", url: "/image-system", icon: Image },
];

interface SidebarNavigationProps {
  collapsed: boolean;
  hasSearchResults: boolean;
}

export function SidebarNavigation({ collapsed, hasSearchResults }: SidebarNavigationProps) {
  const { getNavClassName } = useNavigation();
  const { isAdmin } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(true);

  return (
    <>
      {/* Navigate Navigation - Hidden when searching */}
      {!hasSearchResults && (
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigateNavItems
                .filter(item => !item.adminOnly || isAdmin)
                .map((item) => (
                  <NavigationItem
                    key={item.title}
                    title={item.title}
                    url={item.url}
                    icon={item.icon}
                    collapsed={collapsed}
                    getNavClassName={getNavClassName}
                    requiresAuth={item.requiresAuth}
                  />
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Workflow Navigation - Hidden when searching */}
      {!hasSearchResults && (
        <SidebarGroup>
          <SidebarGroupLabel>Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowNavItems
                .filter(item => !item.adminOnly || isAdmin)
                .map((item) => (
                  <NavigationItem
                    key={item.title}
                    title={item.title}
                    url={item.url}
                    icon={item.icon}
                    collapsed={collapsed}
                    getNavClassName={getNavClassName}
                  />
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Account Navigation - Collapsible */}
      <SidebarGroup>
        <Collapsible open={isAccountOpen} onOpenChange={setIsAccountOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-2 py-1 h-8 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <span>Account</span>
              {isAccountOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomNavItems
                  .filter(item => !item.adminOnly || isAdmin)
                  .map((item) => (
                    <NavigationItem
                      key={item.title}
                      title={item.title}
                      url={item.url}
                      icon={item.icon}
                      collapsed={collapsed}
                      getNavClassName={getNavClassName}
                    />
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>

      {/* Admin Navigation - Only visible to admins, Collapsible */}
      {isAdmin && (
        <SidebarGroup>
          <Collapsible open={isAdminOpen} onOpenChange={setIsAdminOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between px-2 py-1 h-8 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <span>Admin</span>
                {isAdminOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((item) => (
                    <NavigationItem
                      key={item.title}
                      title={item.title}
                      url={item.url}
                      icon={item.icon}
                      collapsed={collapsed}
                      getNavClassName={getNavClassName}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      )}
    </>
  );
}