import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type LobbyingDashboardTab = 'lobbyist' | 'lobbyist3' | 'client';

export const TAB_LABELS: Record<LobbyingDashboardTab, string> = {
  lobbyist: 'Line Chart',
  lobbyist3: 'Bar Chart',
  client: 'By Client',
};

// A single aggregated row in the dashboard table
export interface LobbyingDashboardRow {
  name: string;
  amount: number;
  clientCount?: number;
  pctOfTotal: number;
  rowCount: number;
  pctChange?: number | null;
}

// Drill-down row (clients for a lobbyist, or lobbyists for a client)
export interface LobbyingDrillDownRow {
  name: string;
  amount: number;
  pctOfParent: number;
}

export function useLobbyingDashboard() {
  // ── RPC: lobbyists aggregated ───────────────────────────────
  const { data: byLobbyistRaw, isLoading: lobbyistLoading, error: lobbyistError } = useQuery({
    queryKey: ['lobbying-rpc-by-lobbyist'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_lobbying_by_lobbyist');
      if (error) throw error;
      return (data as any[]).map((r: any): LobbyingDashboardRow => ({
        name: r.name,
        amount: Number(r.amount),
        clientCount: Number(r.client_count),
        pctOfTotal: Number(r.pct_of_total),
        rowCount: 1,
        pctChange: r.pct_change != null ? Number(r.pct_change) : null,
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: clients aggregated ─────────────────────────────────
  const { data: byClientRaw, isLoading: clientLoading, error: clientError } = useQuery({
    queryKey: ['lobbying-rpc-by-client'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_lobbying_by_client');
      if (error) throw error;
      return (data as any[]).map((r: any): LobbyingDashboardRow => ({
        name: r.name,
        amount: Number(r.amount),
        pctOfTotal: Number(r.pct_of_total),
        rowCount: 1,
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: grand totals ──────────────────────────────────────
  const { data: totalsRaw, isLoading: totalsLoading, error: totalsError } = useQuery({
    queryKey: ['lobbying-rpc-totals'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_lobbying_totals');
      if (error) throw error;
      const row = (data as any[])[0];
      return {
        lobbyistGrandTotal: Number(row.lobbyist_grand_total),
        clientGrandTotal: Number(row.client_grand_total),
        totalLobbyists: Number(row.total_lobbyists),
        totalClients: Number(row.total_clients),
      };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const isLoading = lobbyistLoading || clientLoading || totalsLoading;
  const error = lobbyistError || clientError || totalsError;

  // ── Drill-down: lazy RPC with cache ────────────────────────
  const [drillCache, setDrillCache] = useState<Record<string, LobbyingDrillDownRow[]>>({});
  const fetchingRef = useRef<Set<string>>(new Set());

  const getClientsForLobbyist = (lobbyistName: string): LobbyingDrillDownRow[] => {
    const key = lobbyistName;
    if (drillCache[key]) return drillCache[key];

    if (!fetchingRef.current.has(key)) {
      fetchingRef.current.add(key);
      (supabase as any)
        .rpc('get_lobbying_clients_for_lobbyist', { p_lobbyist: lobbyistName })
        .then(({ data }: any) => {
          if (data) {
            setDrillCache((prev) => ({
              ...prev,
              [key]: (data as any[]).map((d: any) => ({
                name: d.name,
                amount: Number(d.amount),
                pctOfParent: Number(d.pct_of_parent),
              })),
            }));
          }
          fetchingRef.current.delete(key);
        });
    }

    return [];
  };

  return {
    isLoading,
    error,
    byLobbyist: byLobbyistRaw ?? [],
    byClient: byClientRaw ?? [],
    lobbyistGrandTotal: totalsRaw?.lobbyistGrandTotal ?? 0,
    clientGrandTotal: totalsRaw?.clientGrandTotal ?? 0,
    totalLobbyists: totalsRaw?.totalLobbyists ?? 0,
    totalClients: totalsRaw?.totalClients ?? 0,
    getClientsForLobbyist,
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
