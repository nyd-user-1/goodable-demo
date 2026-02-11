import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MemberVoteRow {
  billNumber: string | null;
  billTitle: string | null;
  date: string;
  vote: string; // "Yes" | "No" | "Other"
}

export const useMemberVotes = (peopleId: number) => {
  const [votes, setVotes] = useState<MemberVoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try the full votes RPC first, fall back to drilldown
        let data: any[] | null = null;
        let rpcError: any = null;

        const result = await (supabase as any).rpc('get_member_votes_all', {
          p_people_id: peopleId,
        });
        data = result.data;
        rpcError = result.error;

        // Fallback to drilldown if the new RPC doesn't exist yet
        if (rpcError) {
          const fallback = await (supabase as any).rpc('get_votes_drilldown', {
            p_people_id: peopleId,
          });
          data = fallback.data;
          rpcError = fallback.error;
        }

        if (rpcError) throw rpcError;

        const rows: MemberVoteRow[] = (data || []).map((d: any) => ({
          billNumber: d.bill_number,
          billTitle: d.bill_title,
          date: d.date || '',
          vote: d.vote,
        }));

        setVotes(rows);
      } catch (err: any) {
        setError(err.message || "Failed to fetch vote records");
        setVotes([]);
      } finally {
        setLoading(false);
      }
    };

    if (peopleId) fetchVotes();
  }, [peopleId]);

  return { votes, loading, error };
};
