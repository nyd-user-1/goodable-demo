import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VotesDashboardRow {
  name: string;
  people_id: number;
  party: string;
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

export interface RollCallsChartPoint {
  date: string;
  rollCalls: number;
}

export interface PassFailChartPoint {
  date: string;
  passed: number;
  failed: number;
}

export interface BillPassFailRow {
  rollCallId: number;
  billNumber: string | null;
  billTitle: string | null;
  date: string;
  yesCount: number;
  noCount: number;
  result: string; // "Passed" | "Failed"
}

export interface BillMemberVoteRow {
  name: string;
  vote: string; // "Yes" | "No" | "Other"
}

export interface PartyChartPoint {
  date: string;
  demYes: number;
  repYes: number;
}

export interface MarginChartPoint {
  date: string;
  avgMargin: number;
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
        party: r.party || 'Unknown',
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

  // ── RPC: roll calls per day ─────────────────────────────────
  const { data: rollCallsRaw } = useQuery({
    queryKey: ['votes-rpc-rollcalls-per-day'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_votes_rollcalls_per_day');
      if (error) throw error;
      return (data as any[]).map((r: any): RollCallsChartPoint => ({
        date: r.date,
        rollCalls: Number(r.roll_calls),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: passed vs failed per day ─────────────────────────
  const { data: passFailRaw } = useQuery({
    queryKey: ['votes-rpc-pass-fail-per-day'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_votes_pass_fail_per_day');
      if (error) throw error;
      return (data as any[]).map((r: any): PassFailChartPoint => ({
        date: r.date,
        passed: Number(r.passed),
        failed: Number(r.failed),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: party breakdown per day ──────────────────────────
  const { data: partyChartRaw } = useQuery({
    queryKey: ['votes-rpc-party-per-day'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_votes_by_party_per_day');
      if (error) throw error;
      return (data as any[]).map((r: any): PartyChartPoint => ({
        date: r.date,
        demYes: Number(r.dem_yes),
        repYes: Number(r.rep_yes),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: average margin per day ─────────────────────────
  const { data: marginChartRaw } = useQuery({
    queryKey: ['votes-rpc-avg-margin-per-day'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_votes_avg_margin_per_day');
      if (error) throw error;
      return (data as any[]).map((r: any): MarginChartPoint => ({
        date: r.date,
        avgMargin: Number(r.avg_margin),
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // ── RPC: bills with pass/fail results ─────────────────────
  const { data: billsPassFailRaw, error: billsError } = useQuery({
    queryKey: ['votes-rpc-bills-pass-fail'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_votes_bills_pass_fail');
      if (error) throw error;
      return (data as any[]).map((r: any): BillPassFailRow => ({
        rollCallId: Number(r.roll_call_id),
        billNumber: r.bill_number,
        billTitle: r.bill_title,
        date: r.date || '',
        yesCount: Number(r.yes_count),
        noCount: Number(r.no_count),
        result: r.result,
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const isLoading = memberLoading || chartLoading || totalsLoading;
  const error = memberError || chartError || totalsError || billsError;

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

  // ── Bill member votes drill-down: lazy RPC with cache ────
  const [billDrillCache, setBillDrillCache] = useState<Record<string, BillMemberVoteRow[]>>({});
  const billFetchingRef = useRef<Set<string>>(new Set());

  const getBillMemberVotes = (rollCallId: number): BillMemberVoteRow[] => {
    const key = String(rollCallId);
    if (billDrillCache[key]) return billDrillCache[key];

    if (!billFetchingRef.current.has(key)) {
      billFetchingRef.current.add(key);
      (supabase as any)
        .rpc('get_votes_bill_member_votes', { p_roll_call_id: rollCallId })
        .then(({ data }: any) => {
          if (data) {
            setBillDrillCache((prev) => ({
              ...prev,
              [key]: (data as any[]).map((d: any) => ({
                name: d.name,
                vote: d.vote,
              })),
            }));
          }
          billFetchingRef.current.delete(key);
        });
    }

    return [];
  };

  return {
    isLoading,
    error,
    byMember: byMemberRaw ?? [],
    chartData: chartDataRaw ?? [],
    rollCallsPerDay: rollCallsRaw ?? [],
    passFailPerDay: passFailRaw ?? [],
    partyPerDay: partyChartRaw ?? [],
    marginPerDay: marginChartRaw ?? [],
    billsPassFail: billsPassFailRaw ?? [],
    getDrillDown,
    getBillMemberVotes,
    totalVotes: totalsRaw?.totalVotes ?? 0,
    totalMembers: totalsRaw?.totalMembers ?? 0,
  };
}
