import { Users } from "lucide-react";

interface MembersEmptyStateProps {
  hasFilters: boolean;
}

export const MembersEmptyState = ({ hasFilters }: MembersEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Members Found</h3>
      <p className="text-muted-foreground">
        {hasFilters 
          ? "Try adjusting your search or filters" 
          : "No members available"}
      </p>
    </div>
  );
};