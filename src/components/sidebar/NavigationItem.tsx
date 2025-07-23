import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface NavigationItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
  collapsed: boolean;
  getNavClassName: (path: string) => string;
}

export function NavigationItem({ title, url, icon: Icon, collapsed, getNavClassName }: NavigationItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={url} 
          className={getNavClassName(url)}
        >
          <Icon className="mr-2 h-4 w-4" />
          {!collapsed && <span>{title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}