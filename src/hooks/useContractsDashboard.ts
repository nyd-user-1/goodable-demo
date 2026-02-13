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

export interface ContractsYearRow {
  year: string;
  count: number;
  amount: number;
}

export interface ContractsMonthDrillRow {
  month: string;
  monthName: string;
  count: number;
  amount: number;
}

export interface ContractsVendorDrillRow {
  contractNumber: string;
  name: string;
  amount: number;
  startDate: string | null;
  endDate: string | null;
}

export interface ContractsDurationDrillRow {
  contractNumber: string;
  vendorName: string;
  amount: number;
  durationDays: number;
}

export interface ContractsExpirationBucket {
  bucket: string;
  count: number;
  amount: number;
}

export interface ContractsExpirationDrillRow {
  contractNumber: string;
  vendorName: string;
  department: string;
  amount: number;
  endDate: string | null;
  daysUntilExpiry: number;
}

export interface ContractsSpendBucket {
  bucket: string;
  count: number;
  amount: number;
}

export interface ContractsSpendDrillRow {
  contractNumber: string;
  vendorName: string;
  amount: number;
  spending: number;
  spendPct: number;
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

  // ── RPC: expiration buckets ────────────────────────────────
  const { data: expirationRaw, isLoading: expirationLoading, error: expirationError } = useQuery({
    queryKey: ['contracts-rpc-expiration-buckets'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_contracts_expiration_buckets');
      if (error) throw error;
      return (data as any[]).map((r: any): ContractsExpirationBucket => ({
        bucket: r.bucket,
        count: Number(r.count),
        amount: Number(r.total_amount),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: spend buckets ───────────────────────────────────
  const { data: spendRaw, isLoading: spendLoading, error: spendError } = useQuery({
    queryKey: ['contracts-rpc-spend-buckets'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_contracts_spend_buckets');
      if (error) throw error;
      return (data as any[]).map((r: any): ContractsSpendBucket => ({
        bucket: r.bucket,
        count: Number(r.count),
        amount: Number(r.total_amount),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: contracts by year (for mode 1 table) ────────────
  const { data: byYearRaw } = useQuery({
    queryKey: ['contracts-rpc-by-year'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_contracts_by_year');
      if (error) throw error;
      return (data as any[]).map((r: any): ContractsYearRow => ({
        year: r.year,
        count: Number(r.count),
        amount: Number(r.total_amount),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const isLoading = deptLoading || typeLoading || histLoading || totalsLoading || monthlyLoading || vendorsLoading || durationLoading || expirationLoading || spendLoading;
  const error = deptError || typeError || histError || totalsError || monthlyError || vendorsError || durationError || expirationError || spendError;

  // ── Mode 1 drill-down: months within a year ────────────────
  const [monthDrillCache, setMonthDrillCache] = useState<Record<string, ContractsMonthDrillRow[]>>({});
  const fetchingMonthDrillRef = useRef<Set<string>>(new Set());

  const getMonthsForYear = (year: string): ContractsMonthDrillRow[] => {
    if (monthDrillCache[year]) return monthDrillCache[year];

    if (!fetchingMonthDrillRef.current.has(year)) {
      fetchingMonthDrillRef.current.add(year);
      (supabase as any)
        .rpc('get_contracts_months_for_year', { p_year: parseInt(year) })
        .then(({ data }: any) => {
          if (data) {
            setMonthDrillCache((prev) => ({
              ...prev,
              [year]: (data as any[]).map((d: any) => ({
                month: d.month,
                monthName: (d.month_name as string).trim(),
                count: Number(d.count),
                amount: Number(d.total_amount),
              })),
            }));
          }
          fetchingMonthDrillRef.current.delete(year);
        });
    }

    return [];
  };

  // ── Mode 2 drill-down: contracts for a vendor ──────────────
  const [vendorDrillCache, setVendorDrillCache] = useState<Record<string, ContractsVendorDrillRow[]>>({});
  const fetchingVendorDrillRef = useRef<Set<string>>(new Set());

  const getContractsForVendor = (vendorName: string): ContractsVendorDrillRow[] => {
    if (vendorDrillCache[vendorName]) return vendorDrillCache[vendorName];

    if (!fetchingVendorDrillRef.current.has(vendorName)) {
      fetchingVendorDrillRef.current.add(vendorName);
      (supabase as any)
        .rpc('get_contracts_for_vendor', { p_vendor_name: vendorName })
        .then(({ data }: any) => {
          if (data) {
            setVendorDrillCache((prev) => ({
              ...prev,
              [vendorName]: (data as any[]).map((d: any) => ({
                contractNumber: d.contract_number,
                name: d.name,
                amount: Number(d.amount),
                startDate: d.start_date,
                endDate: d.end_date,
              })),
            }));
          }
          fetchingVendorDrillRef.current.delete(vendorName);
        });
    }

    return [];
  };

  // ── Mode 3 drill-down: contracts for a duration bucket ─────
  const DURATION_BUCKET_RANGES: Record<string, [number, number]> = {
    '<1 yr': [0, 365],
    '1-2 yr': [365, 730],
    '2-3 yr': [730, 1095],
    '3-5 yr': [1095, 1795],
    '5 yr': [1795, 1861],
    '>5 yr': [1861, 999999],
  };

  const EXPIRATION_BUCKET_RANGES: Record<string, [number, number]> = {
    'Expired': [-999999, 0],
    '<30 days': [0, 30],
    '30-90 days': [30, 90],
    '3-6 mo': [90, 180],
    '6-12 mo': [180, 365],
    '1-2 yr': [365, 730],
    '2+ yr': [730, 999999],
  };

  const SPEND_BUCKET_RANGES: Record<string, [number, number]> = {
    '0%': [0, 0.001],
    '<25%': [0.001, 25],
    '25-50%': [25, 50],
    '50-75%': [50, 75],
    '75-100%': [75, 100.001],
    '>100%': [100.001, 999999],
  };

  const [durationDrillCache, setDurationDrillCache] = useState<Record<string, ContractsDurationDrillRow[]>>({});
  const fetchingDurationDrillRef = useRef<Set<string>>(new Set());

  const getContractsForDurationBucket = (bucket: string): ContractsDurationDrillRow[] => {
    if (durationDrillCache[bucket]) return durationDrillCache[bucket];

    if (!fetchingDurationDrillRef.current.has(bucket)) {
      fetchingDurationDrillRef.current.add(bucket);
      const [minDays, maxDays] = DURATION_BUCKET_RANGES[bucket] || [0, 999999];
      (supabase as any)
        .rpc('get_contracts_for_duration_bucket', { p_min_days: minDays, p_max_days: maxDays })
        .then(({ data }: any) => {
          if (data) {
            setDurationDrillCache((prev) => ({
              ...prev,
              [bucket]: (data as any[]).map((d: any) => ({
                contractNumber: d.contract_number,
                vendorName: d.vendor_name,
                amount: Number(d.amount),
                durationDays: Number(d.duration_days),
              })),
            }));
          }
          fetchingDurationDrillRef.current.delete(bucket);
        });
    }

    return [];
  };

  // ── Mode 4 drill-down: contracts for an expiration bucket ──
  const [expirationDrillCache, setExpirationDrillCache] = useState<Record<string, ContractsExpirationDrillRow[]>>({});
  const fetchingExpirationDrillRef = useRef<Set<string>>(new Set());

  const getContractsForExpirationBucket = (bucket: string): ContractsExpirationDrillRow[] => {
    if (expirationDrillCache[bucket]) return expirationDrillCache[bucket];

    if (!fetchingExpirationDrillRef.current.has(bucket)) {
      fetchingExpirationDrillRef.current.add(bucket);
      const [minDays, maxDays] = EXPIRATION_BUCKET_RANGES[bucket] || [-999999, 999999];
      (supabase as any)
        .rpc('get_contracts_for_expiration_bucket', { p_min_days: minDays, p_max_days: maxDays })
        .then(({ data }: any) => {
          if (data) {
            setExpirationDrillCache((prev) => ({
              ...prev,
              [bucket]: (data as any[]).map((d: any) => ({
                contractNumber: d.contract_number,
                vendorName: d.vendor_name,
                department: d.department,
                amount: Number(d.amount),
                endDate: d.end_date,
                daysUntilExpiry: Number(d.days_until_expiry),
              })),
            }));
          }
          fetchingExpirationDrillRef.current.delete(bucket);
        });
    }

    return [];
  };

  // ── Mode 5 drill-down: contracts for a spend bucket ───────
  const [spendDrillCache, setSpendDrillCache] = useState<Record<string, ContractsSpendDrillRow[]>>({});
  const fetchingSpendDrillRef = useRef<Set<string>>(new Set());

  const getContractsForSpendBucket = (bucket: string): ContractsSpendDrillRow[] => {
    if (spendDrillCache[bucket]) return spendDrillCache[bucket];

    if (!fetchingSpendDrillRef.current.has(bucket)) {
      fetchingSpendDrillRef.current.add(bucket);
      const [minPct, maxPct] = SPEND_BUCKET_RANGES[bucket] || [0, 999999];
      (supabase as any)
        .rpc('get_contracts_for_spend_bucket', { p_min_pct: minPct, p_max_pct: maxPct })
        .then(({ data }: any) => {
          if (data) {
            setSpendDrillCache((prev) => ({
              ...prev,
              [bucket]: (data as any[]).map((d: any) => ({
                contractNumber: d.contract_number,
                vendorName: d.vendor_name,
                amount: Number(d.amount),
                spending: Number(d.spending),
                spendPct: Number(d.spend_pct),
              })),
            }));
          }
          fetchingSpendDrillRef.current.delete(bucket);
        });
    }

    return [];
  };

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
    expirationBuckets: expirationRaw ?? [],
    spendBuckets: spendRaw ?? [],
    byYear: byYearRaw ?? [],
    getMonthsForYear,
    getContractsForVendor,
    getContractsForDurationBucket,
    getContractsForExpirationBucket,
    getContractsForSpendBucket,
  };
}
