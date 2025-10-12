import { ChevronsUpDown, Home, TrendingUp, Users, FileText, Building2, Star } from "lucide-react";
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
import { useTopFavorites } from "@/hooks/useTopFavorites";

export function SidebarHeader() {
  const navigate = useNavigate();
  const { topFavorites, loading: favoritesLoading } = useTopFavorites(5);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="w-8 h-8 bg-card border rounded-lg flex items-center justify-center">
                <span className="text-lg">❤️</span>
              </div>
              <span className="text-sm font-semibold truncate">Goodable</span>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuLabel>Favorites</DropdownMenuLabel>
            {favoritesLoading ? (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground text-xs">Loading...</span>
              </DropdownMenuItem>
            ) : topFavorites.length > 0 ? (
              topFavorites.map((favorite) => (
                <DropdownMenuItem key={favorite.id} onClick={() => navigate(favorite.url)}>
                  <Star className="mr-2 h-4 w-4" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate text-sm">{favorite.title}</span>
                    {favorite.subtitle && (
                      <span className="truncate text-xs text-muted-foreground">{favorite.subtitle}</span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                <Star className="mr-2 h-4 w-4" />
                <span className="text-muted-foreground text-xs">No favorites yet</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
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