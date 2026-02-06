import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LobbyistCompensation, LobbyingSpend, LobbyistClient } from '@/types/lobbying';

export type LobbyingDashboardTab = 'lobbyist' | 'client';

export const TAB_LABELS: Record<LobbyingDashboardTab, string> = {
  lobbyist: 'By Lobbyist',
  client: 'By Client',
};

// A single aggregated row in the dashboard table
export interface LobbyingDashboardRow {
  name: string;
  amount: number;
  clientCount?: number;
  pctOfTotal: number;
  rowCount: number;
}

// Drill-down row (clients for a lobbyist, or lobbyists for a client)
export interface LobbyingDrillDownRow {
  name: string;
  amount: number;
  pctOfParent: number;
}

// Parse currency values (handles both numeric and string formats)
function parseCurrency(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const cleaned = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function useLobbyingDashboard() {
  // Fetch all compensation records (lobbyists)
  const { data: compensationData, isLoading: compLoading, error: compError } = useQuery({
    queryKey: ['lobbying-dashboard-compensation'],
    queryFn: async () => {
      let allRows: LobbyistCompensation[] = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('lobbyist_compensation')
          .select('*')
          .range(offset, offset + batchSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allRows = allRows.concat(data as LobbyistCompensation[]);
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

  // Fetch all spend records (clients)
  const { data: spendData, isLoading: spendLoading, error: spendError } = useQuery({
    queryKey: ['lobbying-dashboard-spend'],
    queryFn: async () => {
      let allRows: LobbyingSpend[] = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('lobbying_spend')
          .select('*')
          .range(offset, offset + batchSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allRows = allRows.concat(data as LobbyingSpend[]);
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

  // Fetch all client relationships
  const { data: clientsData } = useQuery({
    queryKey: ['lobbying-dashboard-clients'],
    queryFn: async () => {
      let allClients: LobbyistClient[] = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('lobbyists_clients')
          .select('*')
          .range(offset, offset + batchSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allClients = allClients.concat(data as LobbyistClient[]);
          if (data.length < batchSize) {
            hasMore = false;
          } else {
            offset += batchSize;
          }
        }
      }

      return allClients;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Aggregate lobbyist data
  const byLobbyist = useMemo(() => {
    if (!compensationData || compensationData.length === 0) return [];

    // Group clients by lobbyist
    const clientCounts = new Map<string, number>();
    if (clientsData) {
      clientsData.forEach(client => {
        const lobbyist = client.principal_lobbyist || 'Unknown';
        clientCounts.set(lobbyist, (clientCounts.get(lobbyist) || 0) + 1);
      });
    }

    let grandTotal = 0;
    const rows: LobbyingDashboardRow[] = compensationData.map(record => {
      const amount = parseCurrency(record.grand_total_compensation_expenses);
      grandTotal += amount;
      return {
        name: record.principal_lobbyist || 'Unknown Lobbyist',
        amount,
        clientCount: clientCounts.get(record.principal_lobbyist || 'Unknown') || 0,
        pctOfTotal: 0,
        rowCount: 1,
      };
    });

    // Calculate percentages and sort
    rows.forEach(row => {
      row.pctOfTotal = grandTotal > 0 ? (row.amount / grandTotal) * 100 : 0;
    });
    rows.sort((a, b) => b.amount - a.amount);

    return rows;
  }, [compensationData, clientsData]);

  // Aggregate client data
  const byClient = useMemo(() => {
    if (!spendData || spendData.length === 0) return [];

    let grandTotal = 0;
    const rows: LobbyingDashboardRow[] = spendData.map(record => {
      const amount = parseCurrency(record.compensation_and_expenses);
      grandTotal += amount;
      return {
        name: record.contractual_client || 'Unknown Client',
        amount,
        pctOfTotal: 0,
        rowCount: 1,
      };
    });

    // Calculate percentages and sort
    rows.forEach(row => {
      row.pctOfTotal = grandTotal > 0 ? (row.amount / grandTotal) * 100 : 0;
    });
    rows.sort((a, b) => b.amount - a.amount);

    return rows;
  }, [spendData]);

  // Grand totals
  const lobbyistGrandTotal = useMemo(() => {
    return byLobbyist.reduce((sum, row) => sum + row.amount, 0);
  }, [byLobbyist]);

  const clientGrandTotal = useMemo(() => {
    return byClient.reduce((sum, row) => sum + row.amount, 0);
  }, [byClient]);

  // Get drill-down: clients for a lobbyist
  const getClientsForLobbyist = (lobbyistName: string): LobbyingDrillDownRow[] => {
    if (!clientsData) return [];

    const clients = clientsData.filter(c => c.principal_lobbyist === lobbyistName);

    // For each client, try to find their spending amount
    const clientAmounts = new Map<string, number>();
    if (spendData) {
      spendData.forEach(spend => {
        const name = spend.contractual_client || 'Unknown';
        clientAmounts.set(name, parseCurrency(spend.compensation_and_expenses));
      });
    }

    let parentTotal = 0;
    const rows: LobbyingDrillDownRow[] = clients.map(client => {
      const name = client.contractual_client || 'Unknown Client';
      const amount = clientAmounts.get(name) || 0;
      parentTotal += amount;
      return { name, amount, pctOfParent: 0 };
    });

    // Calculate percentages
    rows.forEach(row => {
      row.pctOfParent = parentTotal > 0 ? (row.amount / parentTotal) * 100 : 0;
    });
    rows.sort((a, b) => b.amount - a.amount);

    return rows;
  };

  return {
    isLoading: compLoading || spendLoading,
    error: compError || spendError,
    byLobbyist,
    byClient,
    lobbyistGrandTotal,
    clientGrandTotal,
    totalLobbyists: byLobbyist.length,
    totalClients: byClient.length,
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
