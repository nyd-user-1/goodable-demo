import { Building2, Search } from "lucide-react";

interface CommitteesEmptyStateProps {
  hasFilters: boolean;
}

export const CommitteesEmptyState = ({ hasFilters }: CommitteesEmptyStateProps) => {
  return (
    <section className="section-container bg-card rounded-xl shadow-sm border p-6">
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          {hasFilters ? (
            <Search className="h-6 w-6 text-muted-foreground" />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {hasFilters ? "No committees found" : "No committees available"}
        </h3>
        
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {hasFilters
            ? "Try adjusting your search criteria to find the committees you're looking for."
            : "There are currently no committees in the system. Check back later for updates."
          }
        </p>
      </div>
    </section>
  );
};