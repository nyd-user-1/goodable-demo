import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, GraduationCap, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSchoolFundingSearch, formatChange, formatPercent } from '@/hooks/useSchoolFundingSearch';
import { SchoolFunding } from '@/types/schoolFunding';

const SchoolFundingPage = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    records,
    totalCount,
    isLoading,
    error,
    counties,
    aidCategories,
    schoolYears,
    searchTerm,
    setSearchTerm,
    countyFilter,
    setCountyFilter,
    aidCategoryFilter,
    setAidCategoryFilter,
    schoolYearFilter,
    setSchoolYearFilter,
  } = useSchoolFundingSearch();

  // Focus search on mount and keyboard shortcut
  useEffect(() => {
    searchInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate a prompt for a school funding record
  const generatePrompt = (record: SchoolFunding): string => {
    const district = record['District'] || 'this district';
    const county = record['County'] ? ` in ${record['County']} County` : '';
    const category = record['Aid Category'] ? ` for ${record['Aid Category']}` : '';
    const year = record['School Year'] ? ` in ${record['School Year']}` : '';
    const change = record['Change'] ? ` The funding change was ${formatChange(record['Change'])}` : '';
    const pctChange = record['% Change'] ? ` (${formatPercent(record['% Change'])})` : '';

    return `Tell me about school funding for ${district}${county}${category}${year}.${change}${pctChange}. What factors affect school aid in this district?`;
  };

  const handleRecordClick = (record: SchoolFunding) => {
    const prompt = generatePrompt(record);
    navigate(`/new-chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCountyFilter('');
    setAidCategoryFilter('');
    setSchoolYearFilter('');
  };

  const hasActiveFilters = searchTerm || countyFilter || aidCategoryFilter || schoolYearFilter;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Title and stats */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">School Funding</h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading
                    ? 'Loading...'
                    : `Showing ${records.length.toLocaleString()} of ${totalCount.toLocaleString()} records`
                  }
                </p>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search districts, counties, BEDS codes... (press / to focus)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-12 text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-2">
              <Select value={countyFilter || "all"} onValueChange={(v) => setCountyFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Counties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  {counties.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={aidCategoryFilter || "all"} onValueChange={(v) => setAidCategoryFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Aid Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Aid Categories</SelectItem>
                  {aidCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={schoolYearFilter || "all"} onValueChange={(v) => setSchoolYearFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {schoolYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results - Masonry Grid */}
      <div className="container mx-auto px-4 py-6">
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading school funding data: {String(error)}</p>
          </div>
        ) : isLoading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="break-inside-avoid h-32 bg-muted/30 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No school funding records found matching your criteria.</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {records.map((record) => (
              <SchoolFundingCard
                key={record.id}
                record={record}
                onClick={() => handleRecordClick(record)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// School funding card component
interface SchoolFundingCardProps {
  record: SchoolFunding;
  onClick: () => void;
}

function SchoolFundingCard({ record, onClick }: SchoolFundingCardProps) {
  const district = record['District'] || 'Unknown District';
  const county = record['County'];
  const aidCategory = record['Aid Category'];
  const change = record['Change'];
  const pctChange = record['% Change'];

  // Determine if change is positive/negative for styling
  const changeNum = change ? parseFloat(change) : 0;
  const isPositive = changeNum > 0;
  const isNegative = changeNum < 0;

  return (
    <div
      onClick={onClick}
      className="group break-inside-avoid bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200"
    >
      <h3 className="font-semibold text-base mb-2">
        {district}
      </h3>
      <p className="text-sm text-muted-foreground mb-1">
        {county && `${county} County`}
        {county && aidCategory && ' • '}
        {aidCategory}
      </p>
      {change && (
        <p className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
          {formatChange(change)} {pctChange && `(${formatPercent(pctChange)})`}
        </p>
      )}

      {/* Details and arrow - render on hover */}
      <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
        {/* Record details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
          {record['BEDS Code'] && (
            <div>
              <span className="text-muted-foreground">BEDS Code</span>
              <p className="font-medium">{record['BEDS Code']}</p>
            </div>
          )}
          {record['School Year'] && (
            <div>
              <span className="text-muted-foreground">School Year</span>
              <p className="font-medium">{record['School Year']}</p>
            </div>
          )}
          {record['Base Year'] && (
            <div>
              <span className="text-muted-foreground">Base Year</span>
              <p className="font-medium">{record['Base Year']}</p>
            </div>
          )}
          {record['Event'] && (
            <div>
              <span className="text-muted-foreground">Event</span>
              <p className="font-medium">{record['Event']}</p>
            </div>
          )}
        </div>

        {/* Arrow button */}
        <div className="flex justify-end">
          <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center">
            <ArrowUp className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchoolFundingPage;
