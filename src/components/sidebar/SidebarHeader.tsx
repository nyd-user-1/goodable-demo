import { useSidebar } from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";

export function SidebarHeader() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <div className="flex items-center">
      <NavLink to="/home" className="hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-card border rounded-lg flex items-center justify-center hover:shadow-md transition-shadow duration-200">
          <span className="text-lg">❤️</span>
        </div>
      </NavLink>
      {!collapsed && (
        <NavLink to="/home" className="ml-3 hover:text-muted-foreground transition-colors">
          <h1 className="text-lg font-bold text-foreground">Goodable</h1>
        </NavLink>
      )}
    </div>
  );
}