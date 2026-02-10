import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bill } from '@/types/bill';
import { normalizeBillNumber } from '@/utils/billNumberUtils';

const PAGE_SIZE = 200;

export function useBillsSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [sponsorFilter, setSponsorFilter] = useState('');
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Helper to apply search/filter criteria to a query
  const buildFilteredQuery = async (query: any) => {
    // Normalize search term if it looks like a bill number
    const normalizedSearchTerm = /^[ASKask]\d+$/i.test(searchTerm)
      ? normalizeBillNumber(searchTerm)
      : searchTerm;

    // If searching, also search by sponsor name
    let sponsorSearchBillIds: number[] = [];
    if (normalizedSearchTerm && normalizedSearchTerm.length >= 2) {
      const { data: matchingPeople } = await supabase
        .from('People')
        .select('people_id')
        .or(`name.ilike.%${normalizedSearchTerm}%,first_name.ilike.%${normalizedSearchTerm}%,last_name.ilike.%${normalizedSearchTerm}%`);

      if (matchingPeople && matchingPeople.length > 0) {
        const peopleIds = matchingPeople.map(p => p.people_id);
        const { data: sponsorBills } = await supabase
          .from('Sponsors')
          .select('bill_id')
          .in('people_id', peopleIds)
          .eq('position', 1);
        sponsorSearchBillIds = (sponsorBills || []).map(s => s.bill_id).filter(Boolean) as number[];
      }
    }

    // Server-side search across bill number, title, description, OR bills by matching sponsors
    if (normalizedSearchTerm && normalizedSearchTerm.length >= 2) {
      if (sponsorSearchBillIds.length > 0) {
        query = query.or(
          `bill_number.ilike.%${normalizedSearchTerm}%,title.ilike.%${normalizedSearchTerm}%,description.ilike.%${normalizedSearchTerm}%,bill_id.in.(${sponsorSearchBillIds.join(',')})`
        );
      } else {
        query = query.or(
          `bill_number.ilike.%${normalizedSearchTerm}%,title.ilike.%${normalizedSearchTerm}%,description.ilike.%${normalizedSearchTerm}%`
        );
      }
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

    // If filtering by sponsor, get bill IDs for that sponsor first
    if (sponsorFilter) {
      const { data: sponsorBills } = await supabase
        .from('Sponsors')
        .select('bill_id')
        .eq('people_id', parseInt(sponsorFilter))
        .eq('position', 1);
      const sponsorBillIds = (sponsorBills || []).map(s => s.bill_id).filter(Boolean) as number[];

      if (sponsorBillIds.length === 0) {
        return null; // Signal empty result
      }

      query = query.in('bill_id', sponsorBillIds);
    }

    return query;
  };

  // Helper to fetch sponsor names for a set of bills
  const fetchSponsors = async (billsData: any[]): Promise<Bill[]> => {
    const billIds = billsData.map(b => b.bill_id);
    if (billIds.length === 0) return [];

    const { data: sponsorsData } = await supabase
      .from('Sponsors')
      .select('bill_id, people_id, position')
      .in('bill_id', billIds)
      .eq('position', 1);

    const peopleIds = [...new Set((sponsorsData || []).map(s => s.people_id).filter(Boolean))];
    const { data: peopleData } = await supabase
      .from('People')
      .select('people_id, name, first_name, last_name')
      .in('people_id', peopleIds);

    const peopleMap = new Map((peopleData || []).map(p => [p.people_id, p]));
    const sponsorMap = new Map((sponsorsData || []).map(s => {
      const person = peopleMap.get(s.people_id);
      const name = person?.name || (person ? `${person.first_name || ''} ${person.last_name || ''}`.trim() : null);
      return [s.bill_id, name];
    }));

    return billsData.map(bill => ({
      ...bill,
      sponsor_name: sponsorMap.get(bill.bill_id) || null,
    })) as Bill[];
  };

  // Fetch initial page of bills
  const { data, isLoading, error } = useQuery({
    queryKey: ['bills-search', searchTerm, statusFilter, committeeFilter, sessionFilter, sponsorFilter],
    queryFn: async () => {
      let query = supabase
        .from('Bills')
        .select('*', { count: 'exact' });

      query = await buildFilteredQuery(query);

      // buildFilteredQuery returns null when sponsor filter yields no bills
      if (query === null) {
        return { bills: [], totalCount: 0 };
      }

      query = query
        .order('last_action_date', { ascending: false, nullsFirst: false })
        .limit(PAGE_SIZE);

      const { data: billsData, error, count } = await query;

      if (error) throw error;

      const bills = await fetchSponsors(billsData || []);

      return { bills, totalCount: count || 0 };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Reset accumulated data when initial query changes (filters changed)
  useEffect(() => {
    if (data) {
      setAllBills(data.bills);
      setOffset(PAGE_SIZE);
      setHasMore(data.bills.length === PAGE_SIZE);
    }
  }, [data]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      let query = supabase.from('Bills').select('*');

      query = await buildFilteredQuery(query);

      if (query === null) {
        setHasMore(false);
        return;
      }

      query = query
        .order('last_action_date', { ascending: false, nullsFirst: false })
        .range(offset, offset + PAGE_SIZE - 1);

      const { data: moreData, error: err } = await query;
      if (err) throw err;

      const bills = await fetchSponsors(moreData || []);
      setAllBills(prev => [...prev, ...bills]);
      setOffset(prev => prev + PAGE_SIZE);
      setHasMore(bills.length === PAGE_SIZE);
    } catch (err) {
      console.error("Load more bills error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const bills = allBills;
  const totalCount = data?.totalCount || 0;

  // Get filter options (statuses, committees, sessions, sponsors) from a separate query
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

      // Get unique sponsors (primary sponsors only, position = 1)
      const { data: sponsorData } = await supabase
        .from('Sponsors')
        .select('people_id')
        .eq('position', 1)
        .not('people_id', 'is', null);

      const uniquePeopleIds = [...new Set((sponsorData || []).map(s => s.people_id))].filter(Boolean) as number[];

      // Get people names for sponsors
      const { data: peopleData } = await supabase
        .from('People')
        .select('people_id, name, first_name, last_name')
        .in('people_id', uniquePeopleIds);

      const sponsors = (peopleData || [])
        .map(p => ({
          id: p.people_id,
          name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        }))
        .filter(s => s.name)
        .sort((a, b) => a.name.localeCompare(b.name));

      const statuses = [...new Set(statusData?.map(s => s.status_desc))].filter(Boolean).sort() as string[];
      const committees = [...new Set(committeeData?.map(c => c.committee))].filter(Boolean).sort() as string[];
      const sessions = [...new Set(sessionData?.map(s => s.session_id))].filter(Boolean).sort((a, b) => b - a) as number[];

      return { statuses, committees, sessions, sponsors };
    },
    staleTime: 30 * 60 * 1000, // Cache filter options for 30 minutes
  });

  return {
    bills,
    totalCount,
    isLoading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    statuses: filterOptions?.statuses || [],
    committees: filterOptions?.committees || [],
    sessions: filterOptions?.sessions || [],
    sponsors: filterOptions?.sponsors || [],
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    committeeFilter,
    setCommitteeFilter,
    sessionFilter,
    setSessionFilter,
    sponsorFilter,
    setSponsorFilter,
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
