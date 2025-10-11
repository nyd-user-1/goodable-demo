import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";

interface Filters {
  search: string;
  sponsor: string;
  committee: string;
}

interface BillsSearchFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  committees: Array<{ name: string; chamber: string; chair_name?: string }>;
  sponsors: Array<{ name: string; chamber: string; party: string }>;
}

export const BillsSearchFilters = ({
  filters,
  onFiltersChange,
  committees,
  sponsors,
}: BillsSearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.search);

  // Debounce search updates - only update parent after 300ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== filters.search) {
        onFiltersChange({
          ...filters,
          search: localSearchTerm,
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  // Update local state if filters change externally (e.g., clear all)
  useEffect(() => {
    setLocalSearchTerm(filters.search);
  }, [filters.search]);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const handleSponsorChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sponsor: value === "all" ? "" : value,
    });
  };

  const handleCommitteeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      committee: value === "all" ? "" : value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      sponsor: "",
      committee: "",
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  // Get unique sponsors to avoid duplicate keys
  const uniqueSponsors = sponsors.reduce((acc, sponsor) => {
    const key = `${sponsor.name}-${sponsor.chamber}-${sponsor.party}`;
    if (!acc.some(s => `${s.name}-${s.chamber}-${s.party}` === key)) {
      acc.push(sponsor);
    }
    return acc;
  }, [] as typeof sponsors);

  // Get unique committees to avoid duplicate keys  
  const uniqueCommittees = committees.reduce((acc, committee) => {
    const key = `${committee.name}-${committee.chamber}`;
    if (!acc.some(c => `${c.name}-${c.chamber}` === key)) {
      acc.push(committee);
    }
    return acc;
  }, [] as typeof committees);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bills, sponsors, committees..."
            value={localSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 shrink-0"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-1 h-5 min-w-5 text-xs px-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.sponsor && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sponsor: {filters.sponsor}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleSponsorChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.committee && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Committee: {filters.committee}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleCommitteeChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sponsor</label>
              <Select value={filters.sponsor || "all"} onValueChange={handleSponsorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All sponsors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sponsors</SelectItem>
                  {uniqueSponsors.map((sponsor) => (
                    <SelectItem key={sponsor.name} value={sponsor.name}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{sponsor.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {sponsor.chamber} • {sponsor.party}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Committee</label>
              <Select value={filters.committee || "all"} onValueChange={handleCommitteeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All committees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All committees</SelectItem>
                  {uniqueCommittees.map((committee) => (
                    <SelectItem key={committee.name} value={committee.name}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{committee.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {committee.chamber}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};