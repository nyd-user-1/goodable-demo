import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface CommitteesSearchFiltersProps {
  filters: {
    search: string;
  };
  onFiltersChange: (filters: {
    search: string;
  }) => void;
}

export const CommitteesSearchFilters = ({
  filters,
  onFiltersChange,
}: CommitteesSearchFiltersProps) => {
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: ""
    };
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = filters.search !== "";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search committees..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-fit"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};