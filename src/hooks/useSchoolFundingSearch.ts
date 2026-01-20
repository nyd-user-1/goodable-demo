import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SchoolFundingTotals } from '@/types/schoolFunding';

export function useSchoolFundingSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [countyFilter, setCountyFilter] = useState('');
  const [budgetYearFilter, setBudgetYearFilter] = useState('');

  // Fetch aggregated school funding data from school_funding_totals
  const { data, isLoading, error } = useQuery({
    queryKey: ['school-funding-totals', searchTerm, districtFilter, countyFilter, budgetYearFilter],
    queryFn: async () => {
      let query = supabase
        .from('school_funding_totals')
        .select('*', { count: 'exact' });

      // Server-side search across district, county
      if (searchTerm && searchTerm.length >= 2) {
        query = query.or(
          `district.ilike.%${searchTerm}%,county.ilike.%${searchTerm}%`
        );
      }

      // Server-side district filter
      if (districtFilter) {
        query = query.eq('district', districtFilter);
      }

      // Server-side county filter
      if (countyFilter) {
        query = query.eq('county', countyFilter);
      }

      // Server-side budget year filter
      if (budgetYearFilter) {
        query = query.eq('enacted_budget', budgetYearFilter);
      }

      // Order and limit results
      query = query
        .order('district', { ascending: true })
        .order('enacted_budget', { ascending: false })
        .limit(1000);

      const { data, error, count } = await query;

      if (error) throw error;

      return { records: data as SchoolFundingTotals[], totalCount: count || 0 };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const records = data?.records || [];
  const totalCount = data?.totalCount || 0;

  // Get filter options from a separate query
  const { data: filterOptions } = useQuery({
    queryKey: ['school-funding-totals-filter-options'],
    queryFn: async () => {
      // Get unique districts
      const { data: districtData } = await supabase
        .from('school_funding_totals')
        .select('district')
        .not('district', 'is', null);

      // Get unique counties
      const { data: countyData } = await supabase
        .from('school_funding_totals')
        .select('county')
        .not('county', 'is', null);

      // Get unique budget years
      const { data: yearData } = await supabase
        .from('school_funding_totals')
        .select('enacted_budget')
        .not('enacted_budget', 'is', null);

      const districts = [...new Set(districtData?.map(d => d.district))].filter(Boolean).sort() as string[];
      const counties = [...new Set(countyData?.map(d => d.county))].filter(Boolean).sort() as string[];
      const budgetYears = [...new Set(yearData?.map(d => d.enacted_budget))].filter(Boolean).sort().reverse() as string[];

      return { districts, counties, budgetYears };
    },
    staleTime: 30 * 60 * 1000,
  });

  return {
    records,
    totalCount,
    isLoading,
    error,
    districts: filterOptions?.districts || [],
    counties: filterOptions?.counties || [],
    budgetYears: filterOptions?.budgetYears || [],
    searchTerm,
    setSearchTerm,
    districtFilter,
    setDistrictFilter,
    countyFilter,
    setCountyFilter,
    budgetYearFilter,
    setBudgetYearFilter,
  };
}

// Helper to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to format percentage
export function formatPercent(pct: number): string {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
}

// Legacy helpers for backwards compatibility
export function formatChange(change: string | null): string {
  if (!change) return 'N/A';
  const num = parseFloat(change);
  if (isNaN(num)) return change;
  return formatCurrency(num);
}
