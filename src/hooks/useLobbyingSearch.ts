import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LobbyingSpend, LobbyistCompensation, LobbyistClient } from '@/types/lobbying';

export type LobbyingTab = 'spend' | 'compensation';

export function useLobbyingSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<LobbyingTab>('compensation');

  // Fetch Lobbying Spend data
  const { data: spendData, isLoading: spendLoading, error: spendError } = useQuery({
    queryKey: ['lobbying-spend', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('lobbying_spend')
        .select('*', { count: 'exact' });

      // Server-side search
      if (searchTerm && searchTerm.length >= 2) {
        query = query.ilike('contractual_client', `%${searchTerm}%`);
      }

      // Order by compensation (parse as number for sorting)
      query = query.limit(1000);

      const { data, error, count } = await query;

      if (error) throw error;

      // Sort by compensation_and_expenses descending (parse currency strings)
      const sorted = (data as LobbyingSpend[]).sort((a, b) => {
        const aVal = parseCurrencyToNumber(a.compensation_and_expenses);
        const bVal = parseCurrencyToNumber(b.compensation_and_expenses);
        return bVal - aVal;
      });

      return { records: sorted, totalCount: count || 0 };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch Lobbyist Compensation data
  const { data: compensationData, isLoading: compensationLoading, error: compensationError } = useQuery({
    queryKey: ['lobbyist-compensation', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('lobbyist_compensation')
        .select('*', { count: 'exact' });

      // Server-side search
      if (searchTerm && searchTerm.length >= 2) {
        query = query.ilike('principal_lobbyist', `%${searchTerm}%`);
      }

      query = query.limit(1000);

      const { data, error, count } = await query;

      if (error) throw error;

      // Sort by grand_total_compensation_expenses descending (parse currency strings)
      const sorted = (data as LobbyistCompensation[]).sort((a, b) => {
        const aVal = parseCurrencyToNumber(a.grand_total_compensation_expenses);
        const bVal = parseCurrencyToNumber(b.grand_total_compensation_expenses);
        return bVal - aVal;
      });

      return { records: sorted, totalCount: count || 0 };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch all lobbyist clients (for the Earnings cards)
  // Note: Supabase default limit is 1000, so we need to fetch in batches or set a higher limit
  const { data: clientsData } = useQuery({
    queryKey: ['lobbyists-clients-v2'], // Changed key to bust cache
    queryFn: async () => {
      // Fetch all clients by paginating through results
      let allClients: LobbyistClient[] = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('lobbyists_clients')
          .select('*')
          .range(offset, offset + batchSize - 1);

        if (error) {
          console.error('Error fetching lobbyists_clients:', error);
          throw error;
        }

        if (data && data.length > 0) {
          allClients = [...allClients, ...data];
          offset += batchSize;
          hasMore = data.length === batchSize; // If we got a full batch, there might be more
        } else {
          hasMore = false;
        }
      }

      return allClients as LobbyistClient[];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const spendRecords = spendData?.records || [];
  const compensationRecords = compensationData?.records || [];
  const allClients = clientsData || [];

  // Group clients by normalized lobbyist name for easy lookup
  const clientsByLobbyist = useMemo(() => {
    const map = new Map<string, LobbyistClient[]>();
    allClients.forEach(client => {
      const lobbyist = normalizeLobbyistName(client.principal_lobbyist);
      if (!map.has(lobbyist)) {
        map.set(lobbyist, []);
      }
      map.get(lobbyist)!.push(client);
    });
    return map;
  }, [allClients]);

  return {
    // Data
    spendRecords,
    compensationRecords,
    clientsByLobbyist,
    spendCount: spendData?.totalCount || 0,
    compensationCount: compensationData?.totalCount || 0,

    // Loading states
    isLoading: activeTab === 'spend' ? spendLoading : compensationLoading,
    error: activeTab === 'spend' ? spendError : compensationError,

    // Tab state
    activeTab,
    setActiveTab,

    // Search state
    searchTerm,
    setSearchTerm,
  };
}

// Helper to format currency strings (they come as formatted strings from the DB)
export function formatLobbyingCurrency(amount: string | null): string {
  if (!amount) return 'N/A';
  return amount;
}

// Helper to parse currency string to number for sorting
export function parseCurrencyToNumber(amount: string | null): number {
  if (!amount) return 0;
  // Remove $ and commas, then parse
  const cleaned = amount.replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper to normalize lobbyist names for matching
// Removes punctuation, collapses whitespace, and converts to uppercase
export function normalizeLobbyistName(name: string | null): string {
  if (!name) return '';
  return name
    .toUpperCase()
    .replace(/[.,\-&'"()]/g, '') // Remove common punctuation
    .replace(/\s+/g, ' ')         // Collapse multiple spaces to single space
    .trim();
}
