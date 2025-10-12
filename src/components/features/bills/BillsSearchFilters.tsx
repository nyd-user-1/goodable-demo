import { useState, useMemo } from "react";
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
import { Search, X, Filter, Calendar, Zap } from "lucide-react";

interface Filters {
  search: string;
  sponsor: string;
  committee: string;
  status?: string; // NEW
  dateRange?: string; // NEW
}

interface BillsSearchFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  committees: Array<{ name: string; chamber: string; chair_name?: string }>;
  sponsors: Array<{ name: string; chamber: string; party: string }>;
  isDeepSearch?: boolean; // NEW: Show deep search indicator
  totalBillsInDb?: number; // NEW: Total bills in database
  totalFiltered?: number; // NEW: Current filtered count
}

export const BillsSearchFilters = ({
  filters,
  onFiltersChange,
  committees,
  sponsors,
  isDeepSearch = false,
  totalBillsInDb = 0,
  totalFiltered = 0,
}: BillsSearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value,
    });
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

  // NEW: Status filter handler
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === "all" ? "" : value,
    });
  };

  // NEW: Date preset handlers
  const handleDatePreset = (days: string) => {
    onFiltersChange({
      ...filters,
      dateRange: filters.dateRange === days ? "" : days,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      sponsor: "",
      committee: "",
      status: "",
      dateRange: "",
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

  // NEW: Common bill statuses
  const billStatuses = [
    "Introduced",
    "Engrossed",
    "In Committee",
    "Passed Assembly",
    "Passed Senate",
    "Delivered to Governor",
    "Signed by Governor",
    "Vetoed",
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar with Indicator */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isDeepSearch ? "Searching all bills..." : "Search bills, sponsors, committees... (type 3+ chars for deep search)"}
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
          {/* NEW: Deep Search Indicator */}
          {isDeepSearch && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="default" className="text-xs flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Deep Search
              </Badge>
            </div>
          )}
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

      {/* NEW: Search Mode Indicator */}
      {!isDeepSearch && filters.search.length > 0 && filters.search.length < 3 && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Zap className="h-3 w-3" />
          Type {3 - filters.search.length} more character{(3 - filters.search.length) > 1 ? 's' : ''} to search all {totalBillsInDb.toLocaleString()} bills
        </div>
      )}

      {/* NEW: Date Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Quick filters:</span>
        <Button
          variant={filters.dateRange === "30" ? "default" : "outline"}
          size="sm"
          onClick={() => handleDatePreset("30")}
          className="h-7 text-xs"
        >
          Last 30 Days
        </Button>
        <Button
          variant={filters.dateRange === "90" ? "default" : "outline"}
          size="sm"
          onClick={() => handleDatePreset("90")}
          className="h-7 text-xs"
        >
          Last 90 Days
        </Button>
        <Button
          variant={filters.dateRange === "365" ? "default" : "outline"}
          size="sm"
          onClick={() => handleDatePreset("365")}
          className="h-7 text-xs"
        >
          This Year
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
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleStatusChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.dateRange && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Last {filters.dateRange} days
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleDatePreset(filters.dateRange!)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* NEW: Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status || "all"} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {billStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
