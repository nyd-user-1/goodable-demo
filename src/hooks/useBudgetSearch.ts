import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BudgetAppropriation, BudgetCapital, BudgetSpending } from '@/types/budget';

export type BudgetTab = 'appropriations' | 'capital' | 'spending';

const TABLE_MAP: Record<BudgetTab, string> = {
  appropriations: 'budget_2027-aprops',
  capital: 'budget_2027_capital_aprops',
  spending: 'budget_2027_spending',
};

// Agency column name differs between tables
const AGENCY_COL: Record<BudgetTab, string> = {
  appropriations: 'Agency Name',
  capital: 'Agency Name',
  spending: 'Agency',
};

export function useBudgetSearch(activeTab: BudgetTab) {
  const [searchTerm, setSearchTerm] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [secondaryFilter, setSecondaryFilter] = useState('');

  // Reset filters when tab changes
  const resetFilters = () => {
    setSearchTerm('');
    setAgencyFilter('');
    setSecondaryFilter('');
  };

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['budget', activeTab, agencyFilter, secondaryFilter],
    queryFn: async () => {
      const table = TABLE_MAP[activeTab];
      const agencyCol = AGENCY_COL[activeTab];

      // Use .from() with any to handle non-typed tables
      let query = (supabase as any).from(table).select('*');

      // Server-side agency filter
      if (agencyFilter) {
        query = query.eq(agencyCol, agencyFilter);
      }

      // Server-side secondary filter
      if (secondaryFilter) {
        if (activeTab === 'appropriations') {
          query = query.eq('Appropriation Category', secondaryFilter);
        } else if (activeTab === 'capital') {
          query = query.eq('Financing Source', secondaryFilter);
        } else {
          query = query.eq('Function', secondaryFilter);
        }
      }

      query = query.limit(1000);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Client-side text search
  const filtered = useMemo(() => {
    const items = (data as any[]) || [];
    if (!searchTerm || searchTerm.length < 2) return items;

    const term = searchTerm.toLowerCase();
    return items.filter((item) => {
      const values = Object.values(item);
      return values.some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm]);

  // Fetch unique agencies for the filter dropdown
  const { data: agencyOptions } = useQuery({
    queryKey: ['budget-agencies', activeTab],
    queryFn: async () => {
      const table = TABLE_MAP[activeTab];
      const agencyCol = AGENCY_COL[activeTab];

      const { data } = await (supabase as any)
        .from(table)
        .select(agencyCol);

      if (!data) return [];
      const unique = [
        ...new Set(data.map((d: any) => d[agencyCol]).filter(Boolean)),
      ] as string[];
      return unique.sort();
    },
    staleTime: 30 * 60 * 1000,
  });

  // Fetch unique values for the secondary filter dropdown
  const { data: secondaryOptions } = useQuery({
    queryKey: ['budget-secondary', activeTab],
    queryFn: async () => {
      const table = TABLE_MAP[activeTab];
      const col =
        activeTab === 'appropriations'
          ? 'Appropriation Category'
          : activeTab === 'capital'
          ? 'Financing Source'
          : 'Function';

      const { data } = await (supabase as any).from(table).select(col);

      if (!data) return [];
      const unique = [
        ...new Set(data.map((d: any) => d[col]).filter(Boolean)),
      ] as string[];
      return unique.sort();
    },
    staleTime: 30 * 60 * 1000,
  });

  return {
    data: filtered,
    isLoading,
    error,
    agencies: agencyOptions || [],
    secondaryOptions: secondaryOptions || [],
    searchTerm,
    setSearchTerm,
    agencyFilter,
    setAgencyFilter,
    secondaryFilter,
    setSecondaryFilter,
    resetFilters,
  };
}

// Parse budget amount text into a formatted currency string
export function formatBudgetAmount(value: string | null): string {
  if (!value || value.trim() === '' || value === '0') return '—';
  // Remove dollar signs, commas, spaces
  const cleaned = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
