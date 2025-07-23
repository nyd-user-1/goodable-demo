import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { useSearch, SearchResult } from "@/hooks/useSearch";
import { SearchResultItem } from "./SearchResultItem";

interface SidebarSearchProps {
  collapsed: boolean;
  onSearchResultClick: (result: SearchResult) => void;
}

export function SidebarSearch({ collapsed, onSearchResultClick }: SidebarSearchProps) {
  const { searchTerm, setSearchTerm, searchResults, clearSearch } = useSearch();

  if (collapsed) return null;

  return (
    <>
      {/* Search Input */}
      <SidebarGroup>
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-2 h-5 w-5 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </SidebarGroup>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Search Results</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {searchResults.map((result) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  onClick={onSearchResultClick}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}