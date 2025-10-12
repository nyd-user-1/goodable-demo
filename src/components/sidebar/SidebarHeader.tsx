import { ChevronsUpDown, Home, TrendingUp, Users, FileText, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export function SidebarHeader() {
  const navigate = useNavigate();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="w-8 h-8 bg-card border rounded-lg flex items-center justify-center">
                <span className="text-lg">❤️</span>
              </div>
              <div className="flex flex-col flex-1 min-w-0 text-left">
                <span className="text-sm font-semibold truncate">Goodable</span>
                <span className="text-xs text-muted-foreground truncate">Civic Engagement</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuLabel>Quick Navigation</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate('/home')}>
              <Home className="mr-2 h-4 w-4" />
              <span>Explore</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Legislation</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate('/members')}>
              <Users className="mr-2 h-4 w-4" />
              <span>Members</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/bills')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Bills</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/committees')}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Committees</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}