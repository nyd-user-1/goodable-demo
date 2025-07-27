import { Search, Settings, User, FileText, Lightbulb, BarChart3, Users, Building2, TrendingUp, MessageSquare, Heart, CreditCard, History, Gamepad2, Factory, Target, Star, ScrollText, Palette, Shield, Lock, Rss, Home } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { NavigationItem } from "./NavigationItem";
import { useNavigation } from "@/hooks/useNavigation";
import { useAuth } from "@/contexts/AuthContext";

const navigateNavItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Intelligence", url: "/dashboard", icon: TrendingUp },
  { title: "Feed", url: "/feed", icon: Rss, adminOnly: true },
  { title: "Members", url: "/members", icon: Users },
  { title: "Bills", url: "/bills", icon: FileText, requiresAuth: true },
  { title: "Committees", url: "/committees", icon: Building2, requiresAuth: true },
];

const workflowNavItems = [
  { title: "Challenges", url: "/problems", icon: Target },
  { title: "Solutions", url: "/public-policy", icon: ScrollText },
  { title: "Chats", url: "/chats", icon: MessageSquare },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Playground", url: "/playground", icon: Gamepad2, adminOnly: true },
  { title: "Bills and Resolutions", url: "/policy-portal", icon: Factory, adminOnly: true },
];

const bottomNavItems = [
  { title: "Plans", url: "/plans", icon: CreditCard },
  { title: "Style Guide", url: "/style-guide", icon: Palette, adminOnly: true },
  { title: "Admin", url: "/admin", icon: Shield, adminOnly: true },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Change Log", url: "/changelog", icon: History },
];

interface SidebarNavigationProps {
  collapsed: boolean;
  hasSearchResults: boolean;
}

export function SidebarNavigation({ collapsed, hasSearchResults }: SidebarNavigationProps) {
  const { getNavClassName } = useNavigation();
  const { isAdmin } = useAuth();

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

      {/* Account Navigation */}
      <SidebarGroup>
        <SidebarGroupLabel>Account</SidebarGroupLabel>
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
      </SidebarGroup>
    </>
  );
}