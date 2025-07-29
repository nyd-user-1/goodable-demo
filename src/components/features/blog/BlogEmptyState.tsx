import { Button } from "@/components/ui/button";
import { BookOpen, Search } from "lucide-react";

interface BlogEmptyStateProps {
  searchTerm?: string;
  onClearFilters?: () => void;
}

export const BlogEmptyState = ({ searchTerm, onClearFilters }: BlogEmptyStateProps) => {
  const isFiltered = !!searchTerm;

  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        {isFiltered ? (
          <Search className="w-8 h-8 text-muted-foreground" />
        ) : (
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {isFiltered ? "No articles found" : "No posts published yet"}
      </h3>
      
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        {isFiltered 
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Check back soon for policy insights and analysis."
        }
      </p>
      
      {isFiltered && onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
};