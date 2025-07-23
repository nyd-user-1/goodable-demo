import { Search, Lightbulb, FileText, BarChart3, Users, User, Building } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { SearchResult } from "@/hooks/useSearch";

interface SearchResultItemProps {
  result: SearchResult;
  onClick: (result: SearchResult) => void;
}

export function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'problem': return Search;
      case 'idea': return Lightbulb;
      case 'draft': return FileText;
      case 'media': return BarChart3;
      case 'bill': return FileText;
      case 'member': return User;
      case 'committee': return Users;
      default: return FileText;
    }
  };

  const TypeIcon = getTypeIcon(result.type);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => onClick(result)}
        className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
      >
        <TypeIcon className="mr-2 h-4 w-4" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{result.title}</span>
          <p className="text-xs text-muted-foreground truncate">
            {result.content.substring(0, 50)}...
          </p>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}