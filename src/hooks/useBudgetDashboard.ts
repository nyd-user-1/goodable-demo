import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DashboardTab = 'function' | 'fundType' | 'fpCategory';

const TAB_COLUMN: Record<DashboardTab, string> = {
  function: 'Function',
  fundType: 'Fund Type',
  fpCategory: 'FP Category',
};

export const TAB_LABELS: Record<DashboardTab, string> = {
  function: 'By Function',
  fundType: 'By Fund Type',
  fpCategory: 'By FP Category',
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
  // Fetch all spending rows (budget_2027_spending)
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['budget-dashboard-spending'],
    queryFn: async () => {
      // Fetch in batches since PostgREST limits to 1000 by default
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

  // Discover fiscal year columns from sample row
  const yearColumns = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    const cols = Object.keys(rawData[0]);
    return cols
      .filter((col) => /^\d{4}-\d{2}\s/.test(col))
      .sort()
      .reverse(); // Most recent first
  }, [rawData]);

  // The primary and prior fiscal year columns
  const primaryYear = yearColumns.find((c) => c.includes('2026-27')) || yearColumns[0] || '2026-27 Estimates';
  const priorYear = yearColumns.find((c) => c.includes('2025-26')) || yearColumns[1] || '2025-26 Estimates';

  // Aggregate rows by a given column (Function, Fund Type, FP Category)
  const aggregate = useMemo(() => {
    if (!rawData || rawData.length === 0) return { byFunction: [], byFundType: [], byFpCategory: [], grandTotal: 0, priorGrandTotal: 0 };

    const aggregateByCol = (colName: string): DashboardRow[] => {
      const map = new Map<string, { amount: number; priorAmount: number; count: number }>();

      for (const row of rawData) {
        const key = (row[colName] as string) || 'Unclassified';
        const amount = parseDollar(row[primaryYear]);
        const priorAmount = parseDollar(row[priorYear]);

        const existing = map.get(key);
        if (existing) {
          existing.amount += amount;
          existing.priorAmount += priorAmount;
          existing.count += 1;
        } else {
          map.set(key, { amount, priorAmount, count: 1 });
        }
      }

      // Calculate grand total for pctOfTotal
      let total = 0;
      for (const v of map.values()) {
        total += v.amount;
      }

      const rows: DashboardRow[] = [];
      for (const [name, v] of map.entries()) {
        const yoyChange = v.priorAmount !== 0
          ? ((v.amount - v.priorAmount) / Math.abs(v.priorAmount)) * 100
          : v.amount > 0 ? 100 : 0;

        rows.push({
          name,
          amount: v.amount,
          priorAmount: v.priorAmount,
          yoyChange,
          pctOfTotal: total > 0 ? (v.amount / total) * 100 : 0,
          rowCount: v.count,
        });
      }

      // Sort by amount descending
      rows.sort((a, b) => b.amount - a.amount);
      return rows;
    };

    const byFunction = aggregateByCol('Function');
    const byFundType = aggregateByCol('Fund Type');
    const byFpCategory = aggregateByCol('FP Category');

    // Grand totals
    let grandTotal = 0;
    let priorGrandTotal = 0;
    for (const row of rawData) {
      grandTotal += parseDollar(row[primaryYear]);
      priorGrandTotal += parseDollar(row[priorYear]);
    }

    return { byFunction, byFundType, byFpCategory, grandTotal, priorGrandTotal };
  }, [rawData, primaryYear, priorYear]);

  // Historical data for all year columns (for potential chart use)
  const historicalTotals = useMemo(() => {
    if (!rawData || rawData.length === 0 || yearColumns.length === 0) return [];

    return yearColumns.map((col) => {
      let total = 0;
      for (const row of rawData) {
        total += parseDollar(row[col]);
      }
      // Extract the year label like "2026-27"
      const yearLabel = col.replace(/\s+(Actuals|Estimates)$/i, '');
      const isEstimate = col.toLowerCase().includes('estimate');
      return { year: yearLabel, total, column: col, isEstimate };
    }).reverse(); // Chronological order (oldest first)
  }, [rawData, yearColumns]);

  // Drill-down: get agencies within a specific grouping value
  const getDrillDown = (tab: DashboardTab, groupValue: string): DrillDownRow[] => {
    if (!rawData) return [];

    const groupCol = TAB_COLUMN[tab];
    const filtered = rawData.filter((row: any) => (row[groupCol] || 'Unclassified') === groupValue);

    // Aggregate by Agency
    const map = new Map<string, { amount: number; priorAmount: number }>();
    for (const row of filtered) {
      const agency = (row['Agency'] as string) || 'Unknown Agency';
      const amount = parseDollar(row[primaryYear]);
      const priorAmount = parseDollar(row[priorYear]);

      const existing = map.get(agency);
      if (existing) {
        existing.amount += amount;
        existing.priorAmount += priorAmount;
      } else {
        map.set(agency, { amount, priorAmount });
      }
    }

    // Calculate parent total for pctOfParent
    let parentTotal = 0;
    for (const v of map.values()) {
      parentTotal += v.amount;
    }

    const rows: DrillDownRow[] = [];
    for (const [name, v] of map.entries()) {
      const yoyChange = v.priorAmount !== 0
        ? ((v.amount - v.priorAmount) / Math.abs(v.priorAmount)) * 100
        : v.amount > 0 ? 100 : 0;

      rows.push({
        name,
        amount: v.amount,
        priorAmount: v.priorAmount,
        yoyChange,
        pctOfParent: parentTotal > 0 ? (v.amount / parentTotal) * 100 : 0,
      });
    }

    rows.sort((a, b) => b.amount - a.amount);
    return rows;
  };

  return {
    isLoading,
    error,
    byFunction: aggregate.byFunction,
    byFundType: aggregate.byFundType,
    byFpCategory: aggregate.byFpCategory,
    grandTotal: aggregate.grandTotal,
    priorGrandTotal: aggregate.priorGrandTotal,
    historicalTotals,
    yearColumns,
    primaryYear,
    priorYear,
    getDrillDown,
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
