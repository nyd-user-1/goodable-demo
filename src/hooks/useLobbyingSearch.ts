import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LobbyingSpend, LobbyistCompensation } from '@/types/lobbying';

export type LobbyingTab = 'spend' | 'compensation';

export function useLobbyingSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<LobbyingTab>('spend');

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

      if (error) {
        console.error('lobbying_spend query error:', error);
        throw error;
      }

      console.log('lobbying_spend data:', data?.length, 'records', data);
      return { records: data as LobbyingSpend[], totalCount: count || 0 };
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

      if (error) {
        console.error('lobbyist_compensation query error:', error);
        throw error;
      }

      console.log('lobbyist_compensation data:', data?.length, 'records', data);
      return { records: data as LobbyistCompensation[], totalCount: count || 0 };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const spendRecords = spendData?.records || [];
  const compensationRecords = compensationData?.records || [];

  return {
    // Data
    spendRecords,
    compensationRecords,
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
