import { useState, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DashboardTab = 'function' | 'fundType' | 'fpCategory';

const TAB_COLUMN: Record<DashboardTab, string> = {
  function: 'Function',
  fundType: 'Fund Type',
  fpCategory: 'FP Category',
};

export const TAB_LABELS: Record<DashboardTab, string> = {
  function: 'Function',
  fundType: 'Type',
  fpCategory: 'Category',
};

// A single aggregated row in the dashboard table
export interface DashboardRow {
  name: string;
  amount: number;        // FY 2026-27 Estimates total
  priorAmount: number;   // FY 2025-26 Estimates total
  yoyChange: number;     // percentage change
  pctOfTotal: number;    // percentage of the grand total
  rowCount: number;      // number of raw rows aggregated
}

// Drill-down row (Agency level within a Function/FundType/FPCategory)
export interface DrillDownRow {
  name: string;
  amount: number;
  priorAmount: number;
  yoyChange: number;
  pctOfParent: number;
}

// Parse a dollar string like "$1,234,567" or "1234567" into a number.
// The spending table stores values in thousands, so multiply by 1,000.
function parseDollar(value: string | null | undefined): number {
  if (!value || value.trim() === '') return 0;
  const cleaned = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num * 1000;
}

export function useBudgetDashboard() {
  const primaryYear = '2026-27 Estimates';
  const priorYear = '2025-26 Estimates';

  // ── RPC: by Function ────────────────────────────────────────
  const { data: byFunctionRaw, isLoading: funcLoading, error: funcError } = useQuery({
    queryKey: ['budget-rpc-by-function'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_budget_by_group', {
        p_group_by: 'Function',
      });
      if (error) throw error;
      return (data as any[]).map((r: any): DashboardRow => ({
        name: r.name,
        amount: Number(r.amount),
        priorAmount: Number(r.prior_amount),
        yoyChange: Number(r.yoy_change),
        pctOfTotal: Number(r.pct_of_total),
        rowCount: Number(r.row_count),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: by Fund Type ───────────────────────────────────────
  const { data: byFundTypeRaw, isLoading: fundLoading, error: fundError } = useQuery({
    queryKey: ['budget-rpc-by-fund-type'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_budget_by_group', {
        p_group_by: 'Fund Type',
      });
      if (error) throw error;
      return (data as any[]).map((r: any): DashboardRow => ({
        name: r.name,
        amount: Number(r.amount),
        priorAmount: Number(r.prior_amount),
        yoyChange: Number(r.yoy_change),
        pctOfTotal: Number(r.pct_of_total),
        rowCount: Number(r.row_count),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: by FP Category ─────────────────────────────────────
  const { data: byFpCategoryRaw, isLoading: fpLoading, error: fpError } = useQuery({
    queryKey: ['budget-rpc-by-fp-category'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_budget_by_group', {
        p_group_by: 'FP Category',
      });
      if (error) throw error;
      return (data as any[]).map((r: any): DashboardRow => ({
        name: r.name,
        amount: Number(r.amount),
        priorAmount: Number(r.prior_amount),
        yoyChange: Number(r.yoy_change),
        pctOfTotal: Number(r.pct_of_total),
        rowCount: Number(r.row_count),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: grand totals ──────────────────────────────────────
  const { data: totalsRaw, isLoading: totalsLoading, error: totalsError } = useQuery({
    queryKey: ['budget-rpc-totals'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_budget_totals');
      if (error) throw error;
      const row = (data as any[])[0];
      return {
        grandTotal: Number(row.grand_total),
        priorGrandTotal: Number(row.prior_grand_total),
      };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const isLoading = funcLoading || fundLoading || fpLoading || totalsLoading;
  const error = funcError || fundError || fpError || totalsError;

  // ── Drill-down: lazy RPC with cache ────────────────────────
  const [drillCache, setDrillCache] = useState<Record<string, DrillDownRow[]>>({});
  const fetchingDrillRef = useRef<Set<string>>(new Set());

  const getDrillDown = (tab: DashboardTab, groupValue: string): DrillDownRow[] => {
    const colName = TAB_COLUMN[tab];
    const key = `${tab}:${groupValue}`;
    if (drillCache[key]) return drillCache[key];

    if (!fetchingDrillRef.current.has(key)) {
      fetchingDrillRef.current.add(key);
      (supabase as any)
        .rpc('get_budget_drilldown', { p_group_by: colName, p_group_value: groupValue })
        .then(({ data }: any) => {
          if (data) {
            setDrillCache((prev) => ({
              ...prev,
              [key]: (data as any[]).map((d: any) => ({
                name: d.name,
                amount: Number(d.amount),
                priorAmount: Number(d.prior_amount),
                yoyChange: Number(d.yoy_change),
                pctOfParent: Number(d.pct_of_parent),
              })),
            }));
          }
          fetchingDrillRef.current.delete(key);
        });
    }

    return [];
  };

  // ── Historical chart data (lightweight batch fetch) ────────
  // Budget table is small, so this runs in parallel with RPC
  // and doesn't block the main table loading.
  const { data: rawData } = useQuery({
    queryKey: ['budget-raw-for-chart'],
    queryFn: async () => {
      let allRows: any[] = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await (supabase as any)
          .from('budget_2027_spending')
          .select('*')
          .range(offset, offset + batchSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allRows = allRows.concat(data);
          if (data.length < batchSize) {
            hasMore = false;
          } else {
            offset += batchSize;
          }
        }
      }

      return allRows;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Discover fiscal year columns from data
  const yearColumns = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    const cols = Object.keys(rawData[0]);
    return cols
      .filter((col) => /^\d{4}-\d{2}\s/.test(col))
      .sort()
      .reverse();
  }, [rawData]);

  // Historical totals per fiscal year (for chart)
  const historicalTotals = useMemo(() => {
    if (!rawData || rawData.length === 0 || yearColumns.length === 0) return [];

    return yearColumns.map((col) => {
      let total = 0;
      for (const row of rawData) {
        total += parseDollar(row[col]);
      }
      const yearLabel = col.replace(/\s+(Actuals|Estimates)$/i, '');
      const isEstimate = col.toLowerCase().includes('estimate');
      return { year: yearLabel, total, column: col, isEstimate };
    }).reverse();
  }, [rawData, yearColumns]);

  // Historical data filtered by a specific group value (for interactive chart)
  const getHistoricalForGroup = (
    tab: DashboardTab,
    groupValue: string
  ): { year: string; total: number; column: string; isEstimate: boolean }[] => {
    if (!rawData || rawData.length === 0 || yearColumns.length === 0) return [];

    const groupCol = TAB_COLUMN[tab];
    const filtered = rawData.filter((row: any) => (row[groupCol] || 'Unclassified') === groupValue);

    return yearColumns.map((col) => {
      let total = 0;
      for (const row of filtered) {
        total += parseDollar(row[col]);
      }
      const yearLabel = col.replace(/\s+(Actuals|Estimates)$/i, '');
      const isEstimate = col.toLowerCase().includes('estimate');
      return { year: yearLabel, total, column: col, isEstimate };
    }).reverse();
  };

  return {
    isLoading,
    error,
    byFunction: byFunctionRaw ?? [],
    byFundType: byFundTypeRaw ?? [],
    byFpCategory: byFpCategoryRaw ?? [],
    grandTotal: totalsRaw?.grandTotal ?? 0,
    priorGrandTotal: totalsRaw?.priorGrandTotal ?? 0,
    historicalTotals,
    yearColumns,
    primaryYear,
    priorYear,
    getDrillDown,
    getHistoricalForGroup,
  };
}

// Format large currency values compactly: $1.2B, $456M, $12K
export function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  }
  return `${sign}$${abs.toFixed(0)}`;
}

// Format full currency
export function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
