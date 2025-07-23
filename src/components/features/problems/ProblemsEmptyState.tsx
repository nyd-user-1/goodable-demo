import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ProblemsEmptyStateProps {
  hasFilters: boolean;
}

export const ProblemsEmptyState = ({ hasFilters }: ProblemsEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <Search className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">
        {hasFilters ? "No problems found" : "No problems available"}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {hasFilters 
          ? "Try adjusting your search criteria or clearing filters to see more results."
          : "There are currently no problems available to display."
        }
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={() => window.location.reload()}>
          Clear Filters
        </Button>
      )}
    </div>
  );
};