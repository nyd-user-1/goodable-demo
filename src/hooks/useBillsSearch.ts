import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bill } from '@/types/bill';

export function useBillsSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');

  // Fetch bills - server-side search when there's a search term
  const { data, isLoading, error } = useQuery({
    queryKey: ['bills-search', searchTerm, statusFilter, committeeFilter, sessionFilter],
    queryFn: async () => {
      let query = supabase
        .from('Bills')
        .select('*', { count: 'exact' });

      // Server-side search across bill number, title, description
      if (searchTerm && searchTerm.length >= 2) {
        query = query.or(
          `bill_number.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      // Server-side status filter
      if (statusFilter) {
        query = query.eq('status_desc', statusFilter);
      }

      // Server-side committee filter
      if (committeeFilter) {
        query = query.eq('committee', committeeFilter);
      }

      // Server-side session filter
      if (sessionFilter) {
        query = query.eq('session_id', parseInt(sessionFilter));
      }

      // Order by last action date (most recent first) and limit results
      query = query
        .order('last_action_date', { ascending: false, nullsFirst: false })
        .limit(500);

      const { data: billsData, error, count } = await query;

      if (error) throw error;

      // Fetch primary sponsors for all bills (position = 1 is typically primary sponsor)
      const billIds = (billsData || []).map(b => b.bill_id);

      // Get sponsors with people info
      const { data: sponsorsData } = await supabase
        .from('Sponsors')
        .select('bill_id, people_id, position')
        .in('bill_id', billIds)
        .eq('position', 1);

      // Get people names for sponsors
      const peopleIds = [...new Set((sponsorsData || []).map(s => s.people_id).filter(Boolean))];
      const { data: peopleData } = await supabase
        .from('People')
        .select('people_id, name, first_name, last_name')
        .in('people_id', peopleIds);

      // Create lookup maps
      const peopleMap = new Map((peopleData || []).map(p => [p.people_id, p]));
      const sponsorMap = new Map((sponsorsData || []).map(s => {
        const person = peopleMap.get(s.people_id);
        const name = person?.name || (person ? `${person.first_name || ''} ${person.last_name || ''}`.trim() : null);
        return [s.bill_id, name];
      }));

      // Merge sponsor names into bills
      const bills = (billsData || []).map(bill => ({
        ...bill,
        sponsor_name: sponsorMap.get(bill.bill_id) || null,
      })) as Bill[];

      return { bills, totalCount: count || 0 };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  const bills = data?.bills || [];
  const totalCount = data?.totalCount || 0;

  // Get filter options (statuses, committees, sessions) from a separate query
  const { data: filterOptions } = useQuery({
    queryKey: ['bills-filter-options'],
    queryFn: async () => {
      // Get unique statuses
      const { data: statusData } = await supabase
        .from('Bills')
        .select('status_desc')
        .not('status_desc', 'is', null);

      // Get unique committees
      const { data: committeeData } = await supabase
        .from('Bills')
        .select('committee')
        .not('committee', 'is', null);

      // Get unique session years - order descending so newest sessions appear first
      const { data: sessionData } = await supabase
        .from('Bills')
        .select('session_id')
        .not('session_id', 'is', null)
        .order('session_id', { ascending: false });

      const statuses = [...new Set(statusData?.map(s => s.status_desc))].filter(Boolean).sort() as string[];
      const committees = [...new Set(committeeData?.map(c => c.committee))].filter(Boolean).sort() as string[];
      const sessions = [...new Set(sessionData?.map(s => s.session_id))].filter(Boolean).sort((a, b) => b - a) as number[];

      return { statuses, committees, sessions };
    },
    staleTime: 30 * 60 * 1000, // Cache filter options for 30 minutes
  });

  return {
    bills,
    totalCount,
    isLoading,
    error,
    statuses: filterOptions?.statuses || [],
    committees: filterOptions?.committees || [],
    sessions: filterOptions?.sessions || [],
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    committeeFilter,
    setCommitteeFilter,
    sessionFilter,
    setSessionFilter,
  };
}

// Helper to format date strings
export function formatBillDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
