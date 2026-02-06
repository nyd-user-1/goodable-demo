import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LobbyingSpend, LobbyistCompensation, LobbyistClient } from '@/types/lobbying';

export type LobbyingTab = 'spend' | 'compensation';

const LOBBYING_PAGE_SIZE = 100;

export function useLobbyingSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<LobbyingTab>('compensation');
  const [allSpendRecords, setAllSpendRecords] = useState<LobbyingSpend[]>([]);
  const [spendOffset, setSpendOffset] = useState(0);
  const [spendHasMore, setSpendHasMore] = useState(true);
  const [allCompRecords, setAllCompRecords] = useState<LobbyistCompensation[]>([]);
  const [compOffset, setCompOffset] = useState(0);
  const [compHasMore, setCompHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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

      query = query.limit(LOBBYING_PAGE_SIZE);

      const { data, error, count } = await query;

      if (error) throw error;

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

  // Sync spend data to accumulated state
  useEffect(() => {
    if (spendData) {
      setAllSpendRecords(spendData.records);
      setSpendOffset(LOBBYING_PAGE_SIZE);
      setSpendHasMore(spendData.records.length === LOBBYING_PAGE_SIZE);
    }
  }, [spendData]);

  // Fetch Lobbyist Compensation data
  const { data: compensationData, isLoading: compensationLoading, error: compensationError } = useQuery({
    queryKey: ['lobbyist-compensation', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('lobbyist_compensation')
        .select('*', { count: 'exact' });

      if (searchTerm && searchTerm.length >= 2) {
        query = query.ilike('principal_lobbyist', `%${searchTerm}%`);
      }

      query = query.limit(LOBBYING_PAGE_SIZE);

      const { data, error, count } = await query;

      if (error) throw error;

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

  // Sync compensation data to accumulated state
  useEffect(() => {
    if (compensationData) {
      setAllCompRecords(compensationData.records);
      setCompOffset(LOBBYING_PAGE_SIZE);
      setCompHasMore(compensationData.records.length === LOBBYING_PAGE_SIZE);
    }
  }, [compensationData]);

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

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      if (activeTab === 'spend' && spendHasMore) {
        let query = supabase.from('lobbying_spend').select('*');
        if (searchTerm && searchTerm.length >= 2) {
          query = query.ilike('contractual_client', `%${searchTerm}%`);
        }
        query = query.range(spendOffset, spendOffset + LOBBYING_PAGE_SIZE - 1);
        const { data, error } = await query;
        if (error) throw error;
        const rows = (data as LobbyingSpend[]) || [];
        const sorted = rows.sort((a, b) => parseCurrencyToNumber(b.compensation_and_expenses) - parseCurrencyToNumber(a.compensation_and_expenses));
        setAllSpendRecords(prev => [...prev, ...sorted]);
        setSpendOffset(prev => prev + LOBBYING_PAGE_SIZE);
        setSpendHasMore(rows.length === LOBBYING_PAGE_SIZE);
      } else if (activeTab === 'compensation' && compHasMore) {
        let query = supabase.from('lobbyist_compensation').select('*');
        if (searchTerm && searchTerm.length >= 2) {
          query = query.ilike('principal_lobbyist', `%${searchTerm}%`);
        }
        query = query.range(compOffset, compOffset + LOBBYING_PAGE_SIZE - 1);
        const { data, error } = await query;
        if (error) throw error;
        const rows = (data as LobbyistCompensation[]) || [];
        const sorted = rows.sort((a, b) => parseCurrencyToNumber(b.grand_total_compensation_expenses) - parseCurrencyToNumber(a.grand_total_compensation_expenses));
        setAllCompRecords(prev => [...prev, ...sorted]);
        setCompOffset(prev => prev + LOBBYING_PAGE_SIZE);
        setCompHasMore(rows.length === LOBBYING_PAGE_SIZE);
      }
    } catch (err) {
      console.error("Load more lobbying data error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const spendRecords = allSpendRecords;
  const compensationRecords = allCompRecords;
  const allClients = clientsData || [];

  // Group clients by lobbyist_id for easy lookup (uses FK relationship)
  // Falls back to normalized name for unmatched records
  const clientsByLobbyist = useMemo(() => {
    const mapById = new Map<number, LobbyistClient[]>();
    const mapByName = new Map<string, LobbyistClient[]>();

    allClients.forEach(client => {
      // Primary: group by lobbyist_id (FK relationship)
      if (client.lobbyist_id) {
        if (!mapById.has(client.lobbyist_id)) {
          mapById.set(client.lobbyist_id, []);
        }
        mapById.get(client.lobbyist_id)!.push(client);
      }

      // Also maintain name-based map for lookups
      const normalizedName = client.normalized_lobbyist || normalizeLobbyistName(client.principal_lobbyist);
      if (normalizedName) {
        if (!mapByName.has(normalizedName)) {
          mapByName.set(normalizedName, []);
        }
        mapByName.get(normalizedName)!.push(client);
      }
    });

    return { byId: mapById, byName: mapByName };
  }, [allClients]);

  // Helper to get clients for a compensation record
  const getClientsForCompensation = (record: LobbyistCompensation): LobbyistClient[] => {
    // Try FK first
    if (record.lobbyist_id && clientsByLobbyist.byId.has(record.lobbyist_id)) {
      return clientsByLobbyist.byId.get(record.lobbyist_id)!;
    }
    // Fall back to normalized name
    const normalizedName = record.normalized_lobbyist || normalizeLobbyistName(record.principal_lobbyist);
    return clientsByLobbyist.byName.get(normalizedName) || [];
  };

  return {
    // Data
    spendRecords,
    compensationRecords,
    clientsByLobbyist: clientsByLobbyist.byName, // Keep backwards compatibility
    getClientsForCompensation, // New FK-based lookup
    spendCount: spendData?.totalCount || 0,
    compensationCount: compensationData?.totalCount || 0,

    // Loading states
    isLoading: activeTab === 'spend' ? spendLoading : compensationLoading,
    loadingMore,
    hasMore: activeTab === 'spend' ? spendHasMore : compHasMore,
    loadMore,
    error: activeTab === 'spend' ? spendError : compensationError,

    // Tab state
    activeTab,
    setActiveTab,

    // Search state
    searchTerm,
    setSearchTerm,
  };
}

// Helper to format currency - handles both numeric values and legacy strings
export function formatLobbyingCurrency(amount: string | number | null): string {
  if (amount === null || amount === undefined || amount === '') return 'N/A';

  // If it's a number, format it as currency
  if (typeof amount === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // If it's already a formatted string (legacy), return as-is
  return amount;
}

// Helper to parse currency to number for sorting - handles both numeric and string values
export function parseCurrencyToNumber(amount: string | number | null): number {
  if (amount === null || amount === undefined || amount === '') return 0;

  // If it's already a number, return it directly
  if (typeof amount === 'number') {
    return isNaN(amount) ? 0 : amount;
  }

  // If it's a string, remove $ and commas, then parse
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
