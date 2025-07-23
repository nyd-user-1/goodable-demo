interface BillsEmptyStateProps {
  hasFilters?: boolean;
}

export const BillsEmptyState = ({ hasFilters }: BillsEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        {hasFilters 
          ? "No bills found matching your search criteria. Try adjusting your filters."
          : "No bills available at the moment. Please check back later."
        }
      </p>
    </div>
  );
};