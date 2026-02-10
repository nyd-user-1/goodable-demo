import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VotesDashboardRow {
  name: string;
  people_id: number;
  totalVotes: number;
  yesCount: number;
  noCount: number;
  pctYes: number;
}

export interface VotesDrillDownRow {
  billNumber: string | null;
  billTitle: string | null;
  date: string;
  vote: string; // "Yes", "No", "Other"
}

export interface VotesChartPoint {
  date: string;
  yes: number;
  no: number;
}

interface VoteRow {
  people_id: number;
  roll_call_id: number;
  vote_desc: string | null;
}

interface RollCallRow {
  roll_call_id: number;
  bill_id: number | null;
  date: string | null;
  chamber: string | null;
}

interface PeopleRow {
  people_id: number;
  name: string | null;
  party: string | null;
  chamber: string | null;
}

interface BillRow {
  bill_id: number;
  bill_number: string | null;
  title: string | null;
}

function normalizeVote(vote_desc: string | null): string {
  if (!vote_desc) return 'Other';
  const v = vote_desc.trim();
  if (v.startsWith('Y')) return 'Yes';
  if (v.startsWith('N') && !v.startsWith('NV')) return 'No';
  return 'Other';
}

async function batchFetch<T>(table: string, select: string, maxRows?: number): Promise<T[]> {
  let allRows: T[] = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(offset, offset + batchSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allRows = allRows.concat(data as T[]);
      if (data.length < batchSize) {
        hasMore = false;
      } else if (maxRows && allRows.length >= maxRows) {
        allRows = allRows.slice(0, maxRows);
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }
  }

  return allRows;
}

export function useVotesDashboard() {
  const { data: votesData, isLoading: votesLoading, error: votesError } = useQuery({
    queryKey: ['votes-dashboard-votes'],
    queryFn: () => batchFetch<VoteRow>('Votes', 'people_id, roll_call_id, vote_desc', 10000),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: rollCallData, isLoading: rollCallLoading, error: rollCallError } = useQuery({
    queryKey: ['votes-dashboard-rollcall'],
    queryFn: () => batchFetch<RollCallRow>('Roll Call', 'roll_call_id, bill_id, date, chamber'),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: peopleData, isLoading: peopleLoading, error: peopleError } = useQuery({
    queryKey: ['votes-dashboard-people'],
    queryFn: () => batchFetch<PeopleRow>('People', 'people_id, name, party, chamber'),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: billsData, isLoading: billsLoading, error: billsError } = useQuery({
    queryKey: ['votes-dashboard-bills'],
    queryFn: () => batchFetch<BillRow>('Bills', 'bill_id, bill_number, title'),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const isLoading = votesLoading || rollCallLoading || peopleLoading || billsLoading;
  const error = votesError || rollCallError || peopleError || billsError;

  // Build lookup maps
  const peopleMap = useMemo(() => {
    if (!peopleData) return new Map<number, PeopleRow>();
    const map = new Map<number, PeopleRow>();
    peopleData.forEach((p) => map.set(p.people_id, p));
    return map;
  }, [peopleData]);

  const rollCallMap = useMemo(() => {
    if (!rollCallData) return new Map<number, RollCallRow>();
    const map = new Map<number, RollCallRow>();
    rollCallData.forEach((rc) => map.set(rc.roll_call_id, rc));
    return map;
  }, [rollCallData]);

  const billsMap = useMemo(() => {
    if (!billsData) return new Map<number, BillRow>();
    const map = new Map<number, BillRow>();
    billsData.forEach((b) => map.set(b.bill_id, b));
    return map;
  }, [billsData]);

  // Aggregate by member
  const byMember = useMemo((): VotesDashboardRow[] => {
    if (!votesData || votesData.length === 0) return [];

    const groups = new Map<number, { yesCount: number; noCount: number; total: number }>();

    votesData.forEach((v) => {
      const normalized = normalizeVote(v.vote_desc);
      const existing = groups.get(v.people_id);
      if (existing) {
        existing.total += 1;
        if (normalized === 'Yes') existing.yesCount += 1;
        if (normalized === 'No') existing.noCount += 1;
      } else {
        groups.set(v.people_id, {
          total: 1,
          yesCount: normalized === 'Yes' ? 1 : 0,
          noCount: normalized === 'No' ? 1 : 0,
        });
      }
    });

    const rows: VotesDashboardRow[] = [];
    groups.forEach((value, peopleId) => {
      const person = peopleMap.get(peopleId);
      rows.push({
        name: person?.name || 'Unknown',
        people_id: peopleId,
        totalVotes: value.total,
        yesCount: value.yesCount,
        noCount: value.noCount,
        pctYes: value.total > 0 ? (value.yesCount / value.total) * 100 : 0,
      });
    });

    rows.sort((a, b) => b.totalVotes - a.totalVotes);
    return rows;
  }, [votesData, peopleMap]);

  // Chart data: yes/no counts per day
  const chartData = useMemo((): VotesChartPoint[] => {
    if (!votesData || votesData.length === 0) return [];

    const byDate = new Map<string, { yes: number; no: number }>();

    votesData.forEach((v) => {
      const rc = rollCallMap.get(v.roll_call_id);
      if (!rc || !rc.date) return;
      const date = rc.date;
      const normalized = normalizeVote(v.vote_desc);
      const existing = byDate.get(date);
      if (existing) {
        if (normalized === 'Yes') existing.yes += 1;
        if (normalized === 'No') existing.no += 1;
      } else {
        byDate.set(date, {
          yes: normalized === 'Yes' ? 1 : 0,
          no: normalized === 'No' ? 1 : 0,
        });
      }
    });

    const points: VotesChartPoint[] = [];
    byDate.forEach((value, date) => {
      points.push({ date, yes: value.yes, no: value.no });
    });

    points.sort((a, b) => a.date.localeCompare(b.date));
    return points;
  }, [votesData, rollCallMap]);

  // Drill-down for a specific member
  const getDrillDown = (peopleId: number): VotesDrillDownRow[] => {
    if (!votesData) return [];

    const memberVotes = votesData.filter((v) => v.people_id === peopleId);
    const rows: VotesDrillDownRow[] = memberVotes.map((v) => {
      const rc = rollCallMap.get(v.roll_call_id);
      const bill = rc?.bill_id ? billsMap.get(rc.bill_id) : null;
      return {
        billNumber: bill?.bill_number || null,
        billTitle: bill?.title || null,
        date: rc?.date || '',
        vote: normalizeVote(v.vote_desc),
      };
    });

    rows.sort((a, b) => b.date.localeCompare(a.date));
    return rows.slice(0, 10);
  };

  // Grand totals
  const totalVotes = votesData?.length ?? 0;
  const totalMembers = byMember.length;

  return {
    isLoading,
    error,
    byMember,
    chartData,
    getDrillDown,
    totalVotes,
    totalMembers,
  };
}
