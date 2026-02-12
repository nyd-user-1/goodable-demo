import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export interface ContractsMonthlyPoint {
  month: string;
  count: number;
  amount: number;
}

export interface ContractsVendorRow {
  name: string;
  amount: number;
  contractCount: number;
}

export interface ContractsDurationBucket {
  bucket: string;
  count: number;
  amount: number;
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
  // ── RPC: contracts by department ────────────────────────────
  const { data: byDepartmentRaw, isLoading: deptLoading, error: deptError } = useQuery({
    queryKey: ['contracts-rpc-by-department'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_contracts_by_group', {
        p_group_by: 'department',
      });
      if (error) throw error;
      return (data as any[]).map((r: any): ContractsDashboardRow => ({
        name: r.name,
        amount: Number(r.amount),
        contractCount: Number(r.contract_count),
        pctOfTotal: Number(r.pct_of_total),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: contracts by type ──────────────────────────────────
  const { data: byTypeRaw, isLoading: typeLoading, error: typeError } = useQuery({
    queryKey: ['contracts-rpc-by-type'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_contracts_by_group', {
        p_group_by: 'type',
      });
      if (error) throw error;
      return (data as any[]).map((r: any): ContractsDashboardRow => ({
        name: r.name,
        amount: Number(r.amount),
        contractCount: Number(r.contract_count),
        pctOfTotal: Number(r.pct_of_total),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: historical totals ──────────────────────────────────
  const { data: historicalRaw, isLoading: histLoading, error: histError } = useQuery({
    queryKey: ['contracts-rpc-historical'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_contracts_historical');
      if (error) throw error;
      return (data as any[]).map((r: any) => ({
        year: r.year as string,
        total: Number(r.total),
        annual: Number(r.annual),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: grand totals ──────────────────────────────────────
  const { data: totalsRaw, isLoading: totalsLoading, error: totalsError } = useQuery({
    queryKey: ['contracts-rpc-totals'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_contracts_totals');
      if (error) throw error;
      const row = (data as any[])[0];
      return {
        grandTotal: Number(row.grand_total),
        totalContracts: Number(row.total_contracts),
      };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: contracts by month ──────────────────────────────
  const { data: monthlyRaw, isLoading: monthlyLoading, error: monthlyError } = useQuery({
    queryKey: ['contracts-rpc-by-month'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_contracts_by_month');
      if (error) throw error;
      return (data as any[]).map((r: any): ContractsMonthlyPoint => ({
        month: r.month,
        count: Number(r.count),
        amount: Number(r.total_amount),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: top vendors ────────────────────────────────────
  const { data: vendorsRaw, isLoading: vendorsLoading, error: vendorsError } = useQuery({
    queryKey: ['contracts-rpc-top-vendors'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_contracts_top_vendors', { p_limit: 40 });
      if (error) throw error;
      return (data as any[]).map((r: any): ContractsVendorRow => ({
        name: r.vendor_name,
        amount: Number(r.total_amount),
        contractCount: Number(r.contract_count),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: duration buckets ───────────────────────────────
  const { data: durationRaw, isLoading: durationLoading, error: durationError } = useQuery({
    queryKey: ['contracts-rpc-duration-buckets'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_contracts_duration_buckets');
      if (error) throw error;
      return (data as any[]).map((r: any): ContractsDurationBucket => ({
        bucket: r.bucket,
        count: Number(r.count),
        amount: Number(r.total_amount),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const isLoading = deptLoading || typeLoading || histLoading || totalsLoading;
  const error = deptError || typeError || histError || totalsError;

  // ── Drill-down: lazy RPC with cache ────────────────────────
  const [drillCache, setDrillCache] = useState<Record<string, ContractsDrillDownRow[]>>({});
  const fetchingDrillRef = useRef<Set<string>>(new Set());

  const getDrillDown = (tab: ContractsDashboardTab, groupValue: string): ContractsDrillDownRow[] => {
    const key = `${tab}:${groupValue}`;
    if (drillCache[key]) return drillCache[key];

    if (!fetchingDrillRef.current.has(key)) {
      fetchingDrillRef.current.add(key);
      (supabase as any)
        .rpc('get_contracts_drilldown', { p_group_by: tab, p_group_value: groupValue })
        .then(({ data }: any) => {
          if (data) {
            setDrillCache((prev) => ({
              ...prev,
              [key]: (data as any[]).map((d: any) => ({
                name: d.name,
                amount: Number(d.amount),
                contractNumber: d.contract_number,
                pctOfParent: Number(d.pct_of_parent),
              })),
            }));
          }
          fetchingDrillRef.current.delete(key);
        });
    }

    return [];
  };

  // ── Historical for group: lazy RPC with cache ──────────────
  const [histGroupCache, setHistGroupCache] = useState<
    Record<string, { year: string; total: number; annual: number }[]>
  >({});
  const fetchingHistRef = useRef<Set<string>>(new Set());

  const getHistoricalForGroup = (tab: ContractsDashboardTab, groupValue: string) => {
    const key = `${tab}:${groupValue}`;
    if (histGroupCache[key]) return histGroupCache[key];

    if (!fetchingHistRef.current.has(key)) {
      fetchingHistRef.current.add(key);
      (supabase as any)
        .rpc('get_contracts_historical_for_group', {
          p_group_by: tab,
          p_group_value: groupValue,
        })
        .then(({ data }: any) => {
          if (data) {
            setHistGroupCache((prev) => ({
              ...prev,
              [key]: (data as any[]).map((d: any) => ({
                year: d.year as string,
                total: Number(d.total),
                annual: Number(d.annual),
              })),
            }));
          }
          fetchingHistRef.current.delete(key);
        });
    }

    return [];
  };

  return {
    isLoading,
    error,
    byDepartment: byDepartmentRaw ?? [],
    byType: byTypeRaw ?? [],
    grandTotal: totalsRaw?.grandTotal ?? 0,
    totalContracts: totalsRaw?.totalContracts ?? 0,
    getDrillDown,
    historicalTotals: historicalRaw ?? [],
    getHistoricalForGroup,
    monthlyData: monthlyRaw ?? [],
    topVendors: vendorsRaw ?? [],
    durationBuckets: durationRaw ?? [],
  };
}
