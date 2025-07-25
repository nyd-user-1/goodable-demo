import { NavLink } from "react-router-dom";
import { LucideIcon, Lock } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface NavigationItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
  collapsed: boolean;
  getNavClassName: (path: string) => string;
  requiresAuth?: boolean;
}

export function NavigationItem({ title, url, icon: Icon, collapsed, getNavClassName, requiresAuth }: NavigationItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={url} 
          className={getNavClassName(url)}
        >
          <Icon className="mr-2 h-4 w-4" />
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span>{title}</span>
              {requiresAuth && (
                <Lock className="h-3 w-3 text-muted-foreground opacity-70 ml-auto" />
              )}
            </div>
          )}
          {collapsed && requiresAuth && (
            <Lock className="h-3 w-3 text-muted-foreground opacity-70 absolute top-1 right-1" />
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}