import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Filter, 
  X, 
  ArrowUpDown,
  Calendar,
  Type
} from 'lucide-react';

export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

interface ImageFiltersProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  availableTags: string[];
  totalAssets: number;
  filteredCount: number;
}

export const ImageFilters: React.FC<ImageFiltersProps> = ({
  selectedTags,
  onTagToggle,
  onClearFilters,
  sortBy,
  onSortChange,
  availableTags,
  totalAssets,
  filteredCount
}) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest to Oldest', icon: Calendar },
    { value: 'oldest', label: 'Oldest to Newest', icon: Calendar },
    { value: 'name-asc', label: 'A-Z by filename', icon: Type },
    { value: 'name-desc', label: 'Z-A by filename', icon: Type },
  ] as const;

  const currentSortOption = sortOptions.find(option => option.value === sortBy);

  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Showing {filteredCount} of {totalAssets} assets
          </span>
        </div>
        
        {/* Sort dropdown */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-48">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              <SelectValue placeholder="Sort by..." />
            </div>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by tag:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => onTagToggle(tag)}
              className="text-xs"
            >
              {tag}
              {selectedTags.includes(tag) && (
                <span className="ml-1 text-xs opacity-75">
                  ✓
                </span>
              )}
            </Button>
          ))}
        </div>
        
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground ml-auto"
          >
            <X className="w-3 h-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Active filters summary */}
      {selectedTags.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Active filters: {selectedTags.join(', ')}
        </div>
      )}
    </div>
  );
};