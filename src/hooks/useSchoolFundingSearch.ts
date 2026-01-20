import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SchoolFunding } from '@/types/schoolFunding';

export function useSchoolFundingSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [countyFilter, setCountyFilter] = useState('');
  const [aidCategoryFilter, setAidCategoryFilter] = useState('');
  const [schoolYearFilter, setSchoolYearFilter] = useState('');

  // Fetch school funding data
  const { data, isLoading, error } = useQuery({
    queryKey: ['school-funding', searchTerm, countyFilter, aidCategoryFilter, schoolYearFilter],
    queryFn: async () => {
      let query = supabase
        .from('school_funding')
        .select('*', { count: 'exact' });

      // Server-side search across district, county, BEDS code
      if (searchTerm && searchTerm.length >= 2) {
        query = query.or(
          `District.ilike.%${searchTerm}%,County.ilike.%${searchTerm}%,"BEDS Code".ilike.%${searchTerm}%`
        );
      }

      // Server-side county filter
      if (countyFilter) {
        query = query.eq('County', countyFilter);
      }

      // Server-side aid category filter
      if (aidCategoryFilter) {
        query = query.eq('Aid Category', aidCategoryFilter);
      }

      // Server-side school year filter
      if (schoolYearFilter) {
        query = query.eq('School Year', schoolYearFilter);
      }

      // Order and limit results
      query = query
        .order('County', { ascending: true })
        .order('District', { ascending: true })
        .limit(1000);

      const { data, error, count } = await query;

      if (error) throw error;

      return { records: data as SchoolFunding[], totalCount: count || 0 };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const records = data?.records || [];
  const totalCount = data?.totalCount || 0;

  // Get filter options from a separate query
  const { data: filterOptions } = useQuery({
    queryKey: ['school-funding-filter-options'],
    queryFn: async () => {
      // Get unique counties
      const { data: countyData } = await supabase
        .from('school_funding')
        .select('County')
        .not('County', 'is', null);

      // Get unique aid categories
      const { data: aidData } = await supabase
        .from('school_funding')
        .select('"Aid Category"')
        .not('Aid Category', 'is', null);

      // Get unique school years
      const { data: yearData } = await supabase
        .from('school_funding')
        .select('"School Year"')
        .not('School Year', 'is', null);

      const counties = [...new Set(countyData?.map(d => d.County))].filter(Boolean).sort() as string[];
      const aidCategories = [...new Set(aidData?.map(d => d['Aid Category']))].filter(Boolean).sort() as string[];
      const schoolYears = [...new Set(yearData?.map(d => d['School Year']))].filter(Boolean).sort() as string[];

      return { counties, aidCategories, schoolYears };
    },
    staleTime: 30 * 60 * 1000,
  });

  return {
    records,
    totalCount,
    isLoading,
    error,
    counties: filterOptions?.counties || [],
    aidCategories: filterOptions?.aidCategories || [],
    schoolYears: filterOptions?.schoolYears || [],
    searchTerm,
    setSearchTerm,
    countyFilter,
    setCountyFilter,
    aidCategoryFilter,
    setAidCategoryFilter,
    schoolYearFilter,
    setSchoolYearFilter,
  };
}

// Helper to format currency change
export function formatChange(change: string | null): string {
  if (!change) return 'N/A';
  const num = parseFloat(change);
  if (isNaN(num)) return change;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Helper to format percentage
export function formatPercent(pct: string | null): string {
  if (!pct) return 'N/A';
  const num = parseFloat(pct);
  if (isNaN(num)) return pct;
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
}
