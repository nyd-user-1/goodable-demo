import { useState, useRef } from 'react';
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

export function useVotesDashboard() {
  // ── RPC: votes aggregated by member ─────────────────────────
  const { data: byMemberRaw, isLoading: memberLoading, error: memberError } = useQuery({
    queryKey: ['votes-rpc-by-member'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_votes_by_member');
      if (error) throw error;
      return (data as any[]).map((r: any): VotesDashboardRow => ({
        name: r.name,
        people_id: r.people_id,
        totalVotes: Number(r.total_votes),
        yesCount: Number(r.yes_count),
        noCount: Number(r.no_count),
        pctYes: Number(r.total_votes) > 0
          ? (Number(r.yes_count) / Number(r.total_votes)) * 100
          : 0,
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: chart data (yes/no per day) ────────────────────────
  const { data: chartDataRaw, isLoading: chartLoading, error: chartError } = useQuery({
    queryKey: ['votes-rpc-chart-data'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_votes_chart_data');
      if (error) throw error;
      return (data as any[]).map((r: any): VotesChartPoint => ({
        date: r.date,
        yes: Number(r.yes),
        no: Number(r.no),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: grand totals ──────────────────────────────────────
  const { data: totalsRaw, isLoading: totalsLoading, error: totalsError } = useQuery({
    queryKey: ['votes-rpc-totals'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_votes_totals');
      if (error) throw error;
      const row = (data as any[])[0];
      return {
        totalVotes: Number(row.total_votes),
        totalMembers: Number(row.total_members),
      };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const isLoading = memberLoading || chartLoading || totalsLoading;
  const error = memberError || chartError || totalsError;

  // ── Drill-down: lazy RPC with cache ────────────────────────
  const [drillCache, setDrillCache] = useState<Record<string, VotesDrillDownRow[]>>({});
  const fetchingRef = useRef<Set<string>>(new Set());

  const getDrillDown = (peopleId: number): VotesDrillDownRow[] => {
    const key = String(peopleId);
    if (drillCache[key]) return drillCache[key];

    if (!fetchingRef.current.has(key)) {
      fetchingRef.current.add(key);
      (supabase as any)
        .rpc('get_votes_drilldown', { p_people_id: peopleId })
        .then(({ data }: any) => {
          if (data) {
            setDrillCache((prev) => ({
              ...prev,
              [key]: (data as any[]).map((d: any) => ({
                billNumber: d.bill_number,
                billTitle: d.bill_title,
                date: d.date || '',
                vote: d.vote,
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
    byMember: byMemberRaw ?? [],
    chartData: chartDataRaw ?? [],
    getDrillDown,
    totalVotes: totalsRaw?.totalVotes ?? 0,
    totalMembers: totalsRaw?.totalMembers ?? 0,
  };
}
