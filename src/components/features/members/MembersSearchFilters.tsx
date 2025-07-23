import { useState } from "react";
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
  party: string;
  district: string;
  chamber: string;
}

interface MembersSearchFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  chambers: string[];
  parties: string[];
  districts: string[];
}

export const MembersSearchFilters = ({
  filters,
  onFiltersChange,
  chambers,
  parties,
  districts,
}: MembersSearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value,
    });
  };

  const handlePartyChange = (value: string) => {
    onFiltersChange({
      ...filters,
      party: value === "all" ? "" : value,
    });
  };

  const handleDistrictChange = (value: string) => {
    onFiltersChange({
      ...filters,
      district: value === "all" ? "" : value,
    });
  };

  const handleChamberChange = (value: string) => {
    onFiltersChange({
      ...filters,
      chamber: value === "all" ? "" : value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      party: "",
      district: "",
      chamber: "",
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={filters.search}
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
          {filters.party && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Party: {filters.party}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handlePartyChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.district && (
            <Badge variant="secondary" className="flex items-center gap-1">
              District: {filters.district}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleDistrictChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.chamber && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Chamber: {filters.chamber}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleChamberChange("all")}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Party</label>
              <Select value={filters.party || "all"} onValueChange={handlePartyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All parties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All parties</SelectItem>
                  {parties.map((party) => (
                    <SelectItem key={party} value={party}>
                      {party}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">District</label>
              <Select value={filters.district || "all"} onValueChange={handleDistrictChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All districts</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      District {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chamber</label>
              <Select value={filters.chamber || "all"} onValueChange={handleChamberChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All chambers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All chambers</SelectItem>
                  {chambers.map((chamber) => (
                    <SelectItem key={chamber} value={chamber}>
                      {chamber}
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