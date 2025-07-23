import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSearch, SearchResult } from "@/hooks/useSearch";
import { SidebarHeader as CustomSidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarSearch } from "./sidebar/SidebarSearch";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarFooter as CustomSidebarFooter } from "./sidebar/SidebarFooter";

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { searchTerm, searchResults, clearSearch } = useSearch();

  const collapsed = state === "collapsed";

  const handleSearchResultClick = (result: SearchResult) => {
    navigate(result.url);
    clearSearch();
  };

  const hasSearchResults = searchTerm && searchResults.length > 0;

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <CustomSidebarHeader />
      </SidebarHeader>

      <SidebarContent>
        <SidebarSearch 
          collapsed={collapsed}
          onSearchResultClick={handleSearchResultClick}
        />
        
        <SidebarNavigation 
          collapsed={collapsed}
          hasSearchResults={hasSearchResults}
        />
      </SidebarContent>

      <SidebarFooter className="p-4">
        <CustomSidebarFooter collapsed={collapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}