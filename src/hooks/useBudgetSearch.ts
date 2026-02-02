import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BudgetAppropriation, BudgetCapital, BudgetSpending } from '@/types/budget';

export type BudgetTab = 'appropriations' | 'capital' | 'spending';

export const TABLE_MAP: Record<BudgetTab, string> = {
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

// Fund Type column: appropriations and spending have 'Fund Type', capital has 'Fund Name'
const FUND_TYPE_COL: Record<BudgetTab, string> = {
  appropriations: 'Fund Type',
  capital: 'Fund Name',
  spending: 'Fund Type',
};

// Extra filter column per tab: Fund Name (appropriations), Program Name (capital), FP Category (spending)
const EXTRA_COL: Record<BudgetTab, string> = {
  appropriations: 'Fund Name',
  capital: 'Program Name',
  spending: 'FP Category',
};

// Supabase PostgREST requires double-quoting column names that contain spaces in .select()
function quoteCol(col: string): string {
  return col.includes(' ') ? `"${col}"` : col;
}

// Reformat agency names like "Arts, Council on the" → "Council on the Arts"
export function reformatAgencyName(name: string): string {
  if (!name) return name;
  const commaIndex = name.indexOf(',');
  if (commaIndex === -1) return name;
  const before = name.substring(0, commaIndex).trim();
  const after = name.substring(commaIndex + 1).trim();
  return `${after} ${before}`;
}

// Convert raw budget agency name to a URL slug matching departmentPrompts/agencyPrompts/authorityPrompts
export function agencyToSlug(name: string): string {
  return reformatAgencyName(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Convert a Prompts title (e.g. "Office of Mental Health") to possible budget table name formats.
// Budget tables store names comma-inverted: "Mental Health, Office of"
export function titleToBudgetNames(title: string): string[] {
  const candidates = [title];

  const prefixes = [
    'Offices of the ',
    'Office for the ',
    'Office for ',
    'Office of the ',
    'Office of ',
    'Department of ',
    'Division of the ',
    'Division of ',
    'Council on the ',
    'Council on ',
    'Commission on ',
    'Commission of ',
    'Board of ',
  ];

  for (const prefix of prefixes) {
    if (title.startsWith(prefix)) {
      const rest = title.substring(prefix.length);
      candidates.push(`${rest}, ${prefix.trimEnd()}`);
      break;
    }
  }

  return candidates;
}

const BUDGET_PAGE_SIZE = 100;

export function useBudgetSearch(activeTab: BudgetTab) {
  const [searchTerm, setSearchTerm] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [secondaryFilter, setSecondaryFilter] = useState('');
  const [fundTypeFilter, setFundTypeFilter] = useState('');
  const [extraFilter, setExtraFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [allData, setAllData] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reset filters when tab changes
  const resetFilters = () => {
    setSearchTerm('');
    setAgencyFilter('');
    setSecondaryFilter('');
    setFundTypeFilter('');
    setExtraFilter('');
    setYearFilter('');
  };

  // Build filtered query helper
  const applyBudgetFilters = (query: any) => {
    const agencyCol = AGENCY_COL[activeTab];
    const fundTypeCol = FUND_TYPE_COL[activeTab];

    if (agencyFilter) {
      query = query.eq(agencyCol, agencyFilter);
    }
    if (secondaryFilter) {
      if (activeTab === 'appropriations') {
        query = query.eq('Appropriation Category', secondaryFilter);
      } else if (activeTab === 'capital') {
        query = query.eq('Financing Source', secondaryFilter);
      } else {
        query = query.eq('Function', secondaryFilter);
      }
    }
    if (fundTypeFilter) {
      query = query.eq(fundTypeCol, fundTypeFilter);
    }
    if (extraFilter) {
      query = query.eq(EXTRA_COL[activeTab], extraFilter);
    }
    return query;
  };

  // Fetch initial page of data
  const { data: queryData, isLoading, error } = useQuery({
    queryKey: ['budget', activeTab, agencyFilter, secondaryFilter, fundTypeFilter, extraFilter],
    queryFn: async () => {
      const table = TABLE_MAP[activeTab];
      const agencyCol = AGENCY_COL[activeTab];

      let query = (supabase as any).from(table).select('*');
      query = applyBudgetFilters(query);

      query = query
        .order(agencyCol, { ascending: true })
        .limit(BUDGET_PAGE_SIZE);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Reset accumulated data when initial query changes
  useEffect(() => {
    if (queryData) {
      setAllData(queryData);
      setOffset(BUDGET_PAGE_SIZE);
      setHasMore(queryData.length === BUDGET_PAGE_SIZE);
    }
  }, [queryData]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const table = TABLE_MAP[activeTab];
      const agencyCol = AGENCY_COL[activeTab];

      let query = (supabase as any).from(table).select('*');
      query = applyBudgetFilters(query);
      query = query
        .order(agencyCol, { ascending: true })
        .range(offset, offset + BUDGET_PAGE_SIZE - 1);

      const { data: moreData, error: err } = await query;
      if (err) throw err;
      const rows = moreData || [];
      setAllData(prev => [...prev, ...rows]);
      setOffset(prev => prev + BUDGET_PAGE_SIZE);
      setHasMore(rows.length === BUDGET_PAGE_SIZE);
    } catch (err) {
      console.error("Load more budget data error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Client-side text search
  const filtered = useMemo(() => {
    const items = allData;
    if (!searchTerm || searchTerm.length < 2) return items;

    const term = searchTerm.toLowerCase();
    return items.filter((item) => {
      const values = Object.values(item);
      return values.some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(term)
      );
    });
  }, [allData, searchTerm]);

  // Fetch unique agencies for the filter dropdown
  const { data: agencyOptions } = useQuery({
    queryKey: ['budget-agencies', activeTab],
    queryFn: async () => {
      const table = TABLE_MAP[activeTab];
      const agencyCol = AGENCY_COL[activeTab];

      const { data } = await (supabase as any)
        .from(table)
        .select(quoteCol(agencyCol));

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

      const { data } = await (supabase as any).from(table).select(quoteCol(col));

      if (!data) return [];
      const unique = [
        ...new Set(data.map((d: any) => d[col]).filter(Boolean)),
      ] as string[];
      return unique.sort();
    },
    staleTime: 30 * 60 * 1000,
  });

  // Fetch unique values for the fund type filter dropdown
  const { data: fundTypeOptions } = useQuery({
    queryKey: ['budget-fund-type', activeTab],
    queryFn: async () => {
      const table = TABLE_MAP[activeTab];
      const col = FUND_TYPE_COL[activeTab];

      const { data } = await (supabase as any).from(table).select(quoteCol(col));

      if (!data) return [];
      const unique = [
        ...new Set(data.map((d: any) => d[col]).filter(Boolean)),
      ] as string[];
      return unique.sort();
    },
    staleTime: 30 * 60 * 1000,
  });

  // Fetch unique values for the extra filter dropdown (Fund Name / Program Name / FP Category)
  const { data: extraOptions } = useQuery({
    queryKey: ['budget-extra', activeTab],
    queryFn: async () => {
      const table = TABLE_MAP[activeTab];
      const col = EXTRA_COL[activeTab];

      const { data } = await (supabase as any).from(table).select(quoteCol(col));

      if (!data) return [];
      const unique = [
        ...new Set(data.map((d: any) => d[col]).filter(Boolean)),
      ] as string[];
      return unique.sort();
    },
    staleTime: 30 * 60 * 1000,
  });

  // Discover fiscal-year columns from the spending table (e.g. "2022-23 Actuals", "2026-27 Estimates")
  const { data: yearOptions } = useQuery({
    queryKey: ['budget-year-columns'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from(TABLE_MAP.spending)
        .select('*')
        .limit(1);

      if (!data || data.length === 0) return [];

      const cols = Object.keys(data[0]);
      // Match columns like "2022-23 Actuals" or "2026-27 Estimates"
      const yearCols = cols
        .filter((col) => /^\d{4}-\d{2}\s/.test(col))
        .sort()
        .reverse(); // Most recent first
      return yearCols;
    },
    enabled: activeTab === 'spending',
    staleTime: 30 * 60 * 1000,
  });

  return {
    data: filtered,
    isLoading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    agencies: agencyOptions || [],
    secondaryOptions: secondaryOptions || [],
    fundTypeOptions: fundTypeOptions || [],
    extraOptions: extraOptions || [],
    yearOptions: yearOptions || [],
    searchTerm,
    setSearchTerm,
    agencyFilter,
    setAgencyFilter,
    secondaryFilter,
    setSecondaryFilter,
    fundTypeFilter,
    setFundTypeFilter,
    extraFilter,
    setExtraFilter,
    yearFilter,
    setYearFilter,
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
