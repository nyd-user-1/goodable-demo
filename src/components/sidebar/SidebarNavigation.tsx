import { Search, Settings, User, FileText, Lightbulb, BarChart3, Users, Building2, TrendingUp, MessageSquare, Heart, CreditCard, History, Gamepad2, Factory, Target, Star, ScrollText, Palette, Shield } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { NavigationItem } from "./NavigationItem";
import { useNavigation } from "@/hooks/useNavigation";

const researchNavItems = [
  { title: "Intelligence", url: "/dashboard", icon: TrendingUp },
  { title: "Bills", url: "/bills", icon: FileText },
  { title: "Members", url: "/members", icon: Users },
  { title: "Committees", url: "/committees", icon: Building2 },
];

const workflowNavItems = [
  { title: "Problems", url: "/problems", icon: Target },
  { title: "Chats", url: "/chats", icon: MessageSquare },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Playground", url: "/playground", icon: Gamepad2 },
  { title: "Bills and Resolutions", url: "/policy-portal", icon: Factory },
  { title: "Public Policy", url: "/public-policy", icon: ScrollText },
];

const bottomNavItems = [
  { title: "Features", url: "/features", icon: Star },
  { title: "Plans", url: "/plans", icon: CreditCard },
  { title: "Style Guide", url: "/style-guide", icon: Palette },
  { title: "Admin", url: "/admin", icon: Shield },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Change Log", url: "/changelog", icon: History },
];

interface SidebarNavigationProps {
  collapsed: boolean;
  hasSearchResults: boolean;
}

export function SidebarNavigation({ collapsed, hasSearchResults }: SidebarNavigationProps) {
  const { getNavClassName } = useNavigation();

  return (
    <>
      {/* Research Navigation - Hidden when searching */}
      {!hasSearchResults && (
        <SidebarGroup>
          <SidebarGroupLabel>Research</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {researchNavItems.map((item) => (
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

      {/* Workflow Navigation - Hidden when searching */}
      {!hasSearchResults && (
        <SidebarGroup>
          <SidebarGroupLabel>Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowNavItems.map((item) => (
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
            {bottomNavItems.map((item) => (
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