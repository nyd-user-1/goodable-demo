import { useSidebar } from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";

export function SidebarHeader() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <div className="flex items-center justify-center space-x-2">
      {!collapsed && (
        <div className="text-center">
          <NavLink to="/home" className="hover:text-muted-foreground transition-colors">
            <h1 className="text-lg font-bold text-foreground">Goodable</h1>
          </NavLink>
        </div>
      )}
    </div>
  );
}