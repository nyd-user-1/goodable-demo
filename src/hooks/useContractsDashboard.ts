import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contract } from '@/types/contracts';

export type ContractsDashboardTab = 'department' | 'type';

export const TAB_LABELS: Record<ContractsDashboardTab, string> = {
  department: 'Department',
  type: 'Type',
};

export interface ContractsDashboardRow {
  name: string;
  amount: number;
  contractCount: number;
  pctOfTotal: number;
}

export interface ContractsDrillDownRow {
  name: string;
  amount: number;
  contractNumber: string | null;
  pctOfParent: number;
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

export function useContractsDashboard() {
  // Batch-fetch all rows from Contracts table
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['contracts-dashboard-all'],
    queryFn: async () => {
      let allRows: Contract[] = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('Contracts')
          .select('vendor_name, department_facility, contract_number, current_contract_amount, contract_type')
          .range(offset, offset + batchSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allRows = allRows.concat(data as Contract[]);
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

  // Aggregate by department_facility
  const byDepartment = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    const groups = new Map<string, { amount: number; count: number }>();
    let grandTotal = 0;

    rawData.forEach((row) => {
      const key = row.department_facility || 'Unknown';
      const amount = row.current_contract_amount ?? 0;
      grandTotal += amount;
      const existing = groups.get(key);
      if (existing) {
        existing.amount += amount;
        existing.count += 1;
      } else {
        groups.set(key, { amount, count: 1 });
      }
    });

    const rows: ContractsDashboardRow[] = [];
    groups.forEach((value, key) => {
      rows.push({
        name: key,
        amount: value.amount,
        contractCount: value.count,
        pctOfTotal: grandTotal > 0 ? (value.amount / grandTotal) * 100 : 0,
      });
    });

    rows.sort((a, b) => b.amount - a.amount);
    return rows;
  }, [rawData]);

  // Aggregate by contract_type
  const byType = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    const groups = new Map<string, { amount: number; count: number }>();
    let grandTotal = 0;

    rawData.forEach((row) => {
      const key = row.contract_type || 'Unknown';
      const amount = row.current_contract_amount ?? 0;
      grandTotal += amount;
      const existing = groups.get(key);
      if (existing) {
        existing.amount += amount;
        existing.count += 1;
      } else {
        groups.set(key, { amount, count: 1 });
      }
    });

    const rows: ContractsDashboardRow[] = [];
    groups.forEach((value, key) => {
      rows.push({
        name: key,
        amount: value.amount,
        contractCount: value.count,
        pctOfTotal: grandTotal > 0 ? (value.amount / grandTotal) * 100 : 0,
      });
    });

    rows.sort((a, b) => b.amount - a.amount);
    return rows;
  }, [rawData]);

  // Grand total
  const grandTotal = useMemo(() => {
    if (!rawData || rawData.length === 0) return 0;
    return rawData.reduce((sum, row) => sum + (row.current_contract_amount ?? 0), 0);
  }, [rawData]);

  // Total contract count
  const totalContracts = rawData?.length ?? 0;

  // Drill-down: get individual contracts for a given group value
  const getDrillDown = (tab: ContractsDashboardTab, groupValue: string): ContractsDrillDownRow[] => {
    if (!rawData) return [];

    const column = tab === 'department' ? 'department_facility' : 'contract_type';
    const filtered = rawData.filter((row) => (row[column] || 'Unknown') === groupValue);

    let parentTotal = 0;
    const rows: ContractsDrillDownRow[] = filtered.map((row) => {
      const amount = row.current_contract_amount ?? 0;
      parentTotal += amount;
      return {
        name: row.vendor_name || 'Unknown Vendor',
        amount,
        contractNumber: row.contract_number,
        pctOfParent: 0,
      };
    });

    rows.forEach((row) => {
      row.pctOfParent = parentTotal > 0 ? (row.amount / parentTotal) * 100 : 0;
    });
    rows.sort((a, b) => b.amount - a.amount);

    return rows;
  };

  return {
    isLoading,
    error,
    byDepartment,
    byType,
    grandTotal,
    totalContracts,
    getDrillDown,
  };
}
