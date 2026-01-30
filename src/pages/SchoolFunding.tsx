import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, GraduationCap, ArrowUp, PanelLeft, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileMenuIcon, MobileNYSgpt } from '@/components/MobileMenuButton';
import { NoteViewSidebar } from '@/components/NoteViewSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSchoolFundingSearch, formatCurrency, formatPercent } from '@/hooks/useSchoolFundingSearch';
import { SchoolFundingTotals } from '@/types/schoolFunding';
import { supabase } from '@/integrations/supabase/client';

const SchoolFundingPage = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);

  // Enable sidebar transitions after mount to prevent flash
  useEffect(() => {
    const timer = setTimeout(() => setSidebarMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const {
    records,
    totalCount,
    isLoading,
    error,
    districts,
    counties,
    budgetYears,
    searchTerm,
    setSearchTerm,
    districtFilter,
    setDistrictFilter,
    countyFilter,
    setCountyFilter,
    budgetYearFilter,
    setBudgetYearFilter,
  } = useSchoolFundingSearch();

  // Focus search on mount (desktop only) and keyboard shortcut
  useEffect(() => {
    if (window.innerWidth >= 768) {
      searchInputRef.current?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRecordClick = (record: SchoolFundingTotals) => {
    navigate(`/school-funding/${record.id}`);
  };

  const handleChatClick = async (record: SchoolFundingTotals) => {
    const district = record.district || 'Unknown District';
    const county = record.county || 'New York';
    const budgetYear = record.enacted_budget || '';

    // Fetch detailed categories for this district/year
    const { data: categories } = await supabase
      .from('school_funding')
      .select('*')
      .eq('District', record.district)
      .eq('enacted_budget', record.enacted_budget);

    // Store school funding details in sessionStorage for the chat to display
    const schoolFundingDetails = {
      district,
      county,
      budgetYear,
      totalBaseYear: record.total_base_year,
      totalSchoolYear: record.total_school_year,
      totalChange: record.total_change,
      percentChange: record.percent_change,
      categories: (categories || []).map(cat => {
        // Parse dollar amounts from base_year and school_year columns
        const baseYearStr = cat.base_year || '0';
        const schoolYearStr = cat.school_year || '0';
        const baseYear = parseFloat(baseYearStr.replace(/[$,]/g, '')) || 0;
        const schoolYear = parseFloat(schoolYearStr.replace(/[$,]/g, '')) || 0;
        const rawPctChange = parseFloat(cat.percent_change || '0');
        const pctChange = isNaN(rawPctChange) ? 0 : rawPctChange;
        return {
          name: cat.aid_category || 'Unknown',
          baseYear: Math.round(baseYear).toLocaleString(),
          schoolYear: Math.round(schoolYear).toLocaleString(),
          change: formatCurrency(schoolYear - baseYear),
          percentChange: `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%`,
        };
      }),
    };
    sessionStorage.setItem('schoolFundingDetails', JSON.stringify(schoolFundingDetails));

    // Include fundingId in prompt for precise chat association
    const initialPrompt = `[SchoolFunding:${record.id}] Analyze school funding for ${district} in ${county} County for the ${budgetYear} budget year. Total change: ${formatCurrency(record.total_change)} (${formatPercent(record.percent_change)}). What should I know about this district's funding?`;

    navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDistrictFilter('');
    setCountyFilter('');
    setBudgetYearFilter('');
  };

  const hasActiveFilters = searchTerm || districtFilter || countyFilter || budgetYearFilter;

  const openCommandPalette = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Left Sidebar - slides in from off-screen */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm md:w-64 bg-background border-r z-50",
          sidebarMounted && "transition-transform duration-300 ease-in-out",
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NoteViewSidebar onClose={() => setLeftSidebarOpen(false)} />
      </div>

      {/* Backdrop overlay when sidebar is open */}
      {leftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

      {/* Main Container with padding */}
      <div className="h-full md:p-2 bg-muted/30">
        {/* Inner container with rounded corners and border */}
        <div className="w-full h-full md:rounded-2xl md:border bg-background overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-background">
            <div className="px-4 py-4">
              <div className="flex flex-col gap-4">
                {/* Title row with sidebar toggle and command button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MobileMenuIcon onOpenSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                      className={cn("hidden md:inline-flex flex-shrink-0", leftSidebarOpen && "bg-muted")}
                    >
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl font-semibold">School Funding</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear filters
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={openCommandPalette}
                      className="flex-shrink-0"
                    >
                      <Command className="h-4 w-4" />
                    </Button>
                    <MobileNYSgpt />
                  </div>
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
                  <Select value={districtFilter || "all"} onValueChange={(v) => setDistrictFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted rounded-lg px-3 py-2 h-auto text-muted-foreground data-[state=open]:bg-muted [&>svg]:hidden focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="focus:bg-muted focus:text-foreground">All Districts</SelectItem>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district} className="focus:bg-muted focus:text-foreground">
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={countyFilter || "all"} onValueChange={(v) => setCountyFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted rounded-lg px-3 py-2 h-auto text-muted-foreground data-[state=open]:bg-muted [&>svg]:hidden focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="All Counties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="focus:bg-muted focus:text-foreground">All Counties</SelectItem>
                      {counties.map((county) => (
                        <SelectItem key={county} value={county} className="focus:bg-muted focus:text-foreground">
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={budgetYearFilter || "all"} onValueChange={(v) => setBudgetYearFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted rounded-lg px-3 py-2 h-auto text-muted-foreground data-[state=open]:bg-muted [&>svg]:hidden focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="All Budget Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="focus:bg-muted focus:text-foreground">All Budget Years</SelectItem>
                      {budgetYears.map((year) => (
                        <SelectItem key={year} value={year} className="focus:bg-muted focus:text-foreground">
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Results - Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {error ? (
              <div className="text-center py-12">
                <p className="text-destructive">Error loading school funding data: {String(error)}</p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-32 bg-muted/30 rounded-2xl animate-pulse" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {records.map((record) => (
                  <SchoolFundingCard
                    key={record.id}
                    record={record}
                    onClick={() => handleRecordClick(record)}
                    onChatClick={() => handleChatClick(record)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// School funding card component
interface SchoolFundingCardProps {
  record: SchoolFundingTotals;
  onClick: () => void;
  onChatClick: () => void;
}

function SchoolFundingCard({ record, onClick, onChatClick }: SchoolFundingCardProps) {
  const district = record.district || 'Unknown District';
  const county = record.county;
  // Strip "Enacted Budget" suffix to show just the year (e.g., "2025-26")
  const budgetYear = (record.enacted_budget || '').replace(' Enacted Budget', '');
  const totalChange = record.total_change;
  const pctChange = record.percent_change;

  // Determine if change is positive/negative for styling
  const isPositive = totalChange > 0;
  const isNegative = totalChange < 0;

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onChatClick();
  };

  return (
    <div
      onClick={onClick}
      className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-base">
          {district}
        </h3>
        {budgetYear && (
          <span className="text-sm text-muted-foreground ml-2 shrink-0">
            {budgetYear}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">
        {county && `${county} County`}
      </p>
      {totalChange !== 0 && (
        <p className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
          {formatCurrency(totalChange)}
        </p>
      )}

      {/* Details and arrow - render on hover */}
      <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
        {/* Record details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
          <div>
            <span className="text-muted-foreground">Base Year Total</span>
            <p className="font-medium">{formatCurrency(record.total_base_year)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">School Year Total</span>
            <p className="font-medium">{formatCurrency(record.total_school_year)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">% Change</span>
            <p className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : isNegative ? 'text-red-600 dark:text-red-400' : ''}`}>
              {formatPercent(pctChange)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Aid Categories</span>
            <p className="font-medium">{record.category_count}</p>
          </div>
        </div>

        {/* Arrow button - initiates chat */}
        <div className="flex justify-end">
          <button
            onClick={handleChatClick}
            className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-foreground/80 transition-colors"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SchoolFundingPage;
