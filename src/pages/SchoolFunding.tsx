import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, GraduationCap, ArrowUp, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { SchoolFunding } from '@/types/schoolFunding';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSchoolFundingSearch, formatCurrency, formatPercent } from '@/hooks/useSchoolFundingSearch';
import { SchoolFundingTotals } from '@/types/schoolFunding';

const SchoolFundingPage = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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

  // Generate a prompt for a school funding record with detailed aid category breakdown
  const generatePrompt = (record: SchoolFundingTotals, aidCategories: SchoolFunding[]): string => {
    const district = record.district || 'this district';
    const county = record.county ? ` in ${record.county} County` : '';
    const year = record.enacted_budget ? ` for ${record.enacted_budget}` : '';

    // Build summary section
    let prompt = `Analyze school funding for ${district}${county}${year}.\n\n`;
    prompt += `SUMMARY:\n`;
    prompt += `- Total Base Year Funding: ${formatCurrency(record.total_base_year)}\n`;
    prompt += `- Total School Year Funding: ${formatCurrency(record.total_school_year)}\n`;
    prompt += `- Total Change: ${formatCurrency(record.total_change)} (${formatPercent(record.percent_change)})\n`;
    prompt += `- Number of Aid Categories: ${record.category_count}\n\n`;

    // Build detailed breakdown if we have aid category data
    if (aidCategories.length > 0) {
      prompt += `DETAILED AID CATEGORY BREAKDOWN:\n`;

      // Sort by absolute change amount to highlight biggest movers
      const sortedCategories = [...aidCategories].sort((a, b) => {
        const aChange = Math.abs(parseFloat(a['Change']?.replace(/,/g, '') || '0'));
        const bChange = Math.abs(parseFloat(b['Change']?.replace(/,/g, '') || '0'));
        return bChange - aChange;
      });

      for (const cat of sortedCategories) {
        const catName = cat['Aid Category'] || 'Unknown';
        const baseYear = cat['Base Year'] || '0';
        const schoolYear = cat['School Year'] || '0';
        const change = cat['Change'] || '0';
        const pctChange = cat['% Change'] || 'N/A';

        prompt += `- ${catName}: Base Year $${baseYear} → School Year $${schoolYear} (Change: $${change}, ${pctChange})\n`;
      }
      prompt += '\n';
    }

    prompt += `Based on this detailed funding data, please:\n`;
    prompt += `1. Identify the most significant funding changes (increases and decreases)\n`;
    prompt += `2. Explain what each major aid category funds and why it might have changed\n`;
    prompt += `3. Discuss how these changes might impact the district's operations\n`;
    prompt += `4. Note any concerning trends or positive developments`;

    return prompt;
  };

  const handleRecordClick = async (record: SchoolFundingTotals) => {
    setIsLoadingDetails(true);

    try {
      // Fetch detailed aid category breakdown from raw school_funding table
      // Note: Trying multiple possible column names since table schema varies
      let aidCategories: SchoolFunding[] | null = null;
      let error: Error | null = null;

      // First try with 'Event' column (original schema)
      const result1 = await supabase
        .from('school_funding')
        .select('*')
        .eq('District', record.district)
        .eq('Event', record.enacted_budget)
        .order('Change', { ascending: false });

      if (result1.data && result1.data.length > 0) {
        aidCategories = result1.data as SchoolFunding[];
      } else {
        // Try with 'enacted_budget' column (alternate schema)
        const result2 = await supabase
          .from('school_funding')
          .select('*')
          .eq('District', record.district)
          .eq('enacted_budget', record.enacted_budget);

        if (result2.data && result2.data.length > 0) {
          aidCategories = result2.data as SchoolFunding[];
        } else if (result2.error) {
          error = result2.error;
        }
      }

      if (error) {
        console.error('Error fetching aid category details:', error);
      }

      console.log('School funding query result:', {
        district: record.district,
        budgetYear: record.enacted_budget,
        categoriesFound: aidCategories?.length || 0
      });

      const prompt = generatePrompt(record, (aidCategories as SchoolFunding[]) || []);

      // Store detailed aid category data in sessionStorage for chat to display
      if (aidCategories && aidCategories.length > 0) {
        sessionStorage.setItem('schoolFundingDetails', JSON.stringify({
          district: record.district,
          county: record.county,
          budgetYear: record.enacted_budget,
          totalBaseYear: record.total_base_year,
          totalSchoolYear: record.total_school_year,
          totalChange: record.total_change,
          percentChange: record.percent_change,
          categories: (aidCategories as SchoolFunding[]).map(cat => ({
            name: cat['Aid Category'] || 'Unknown',
            baseYear: cat['Base Year'] || '0',
            schoolYear: cat['School Year'] || '0',
            change: cat['Change'] || '0',
            percentChange: cat['% Change'] || 'N/A'
          }))
        }));
      }

      navigate(`/new-chat?prompt=${encodeURIComponent(prompt)}`);
    } catch (err) {
      console.error('Error in handleRecordClick:', err);
      // Fallback to basic prompt without detailed breakdown
      const prompt = generatePrompt(record, []);
      navigate(`/new-chat?prompt=${encodeURIComponent(prompt)}`);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDistrictFilter('');
    setCountyFilter('');
    setBudgetYearFilter('');
  };

  const hasActiveFilters = searchTerm || districtFilter || countyFilter || budgetYearFilter;

  return (
    <div className="min-h-screen bg-background">
      {/* Loading overlay when fetching aid category details */}
      {isLoadingDetails && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading funding details...</p>
          </div>
        </div>
      )}

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
                    : `Showing ${records.length.toLocaleString()} of ${totalCount.toLocaleString()} districts`
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
              <Select value={districtFilter || "all"} onValueChange={(v) => setDistrictFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

              <Select value={budgetYearFilter || "all"} onValueChange={(v) => setBudgetYearFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Budget Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budget Years</SelectItem>
                  {budgetYears.map((year) => (
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
  record: SchoolFundingTotals;
  onClick: () => void;
}

function SchoolFundingCard({ record, onClick }: SchoolFundingCardProps) {
  const district = record.district || 'Unknown District';
  const county = record.county;
  // Strip "Enacted Budget" suffix to show just the year (e.g., "2025-26")
  const budgetYear = (record.enacted_budget || '').replace(' Enacted Budget', '');
  const totalChange = record.total_change;
  const pctChange = record.percent_change;

  // Determine if change is positive/negative for styling
  const isPositive = totalChange > 0;
  const isNegative = totalChange < 0;

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
