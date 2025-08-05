import { Button } from "@/components/ui/button";
import { Search, BookOpen } from "lucide-react";

interface LawsEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const LawsEmptyState = ({ hasFilters, onClearFilters }: LawsEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        {hasFilters ? (
          <Search className="h-10 w-10 text-muted-foreground" />
        ) : (
          <BookOpen className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {hasFilters ? "No laws found" : "No laws available"}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {hasFilters
          ? "Try adjusting your search criteria to find the laws you're looking for."
          : "Laws will appear here when they are available."}
      </p>
      {hasFilters && (
        <Button onClick={onClearFilters} variant="outline">
          Clear filters
        </Button>
      )}
    </div>
  );
};