import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;
type Committee = Tables<"Committees">;

interface MemberCommittee {
  committee_id: number;
  committee_name: string;
  role: string;
  chamber: string;
  description?: string;
}

export const useMemberCommittees = (member: Member) => {
  const [committees, setCommittees] = useState<MemberCommittee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberCommittees = async () => {
      try {
        setLoading(true);
        setError(null);

        // Parse the committee_ids field (semicolon-separated IDs like "10; 16; 34")
        const committeeIdsString = member.committee_ids || '';
        const memberCommitteeIds = committeeIdsString
          .split(';')
          .map(id => id.trim())
          .filter(id => id !== '')
          .map(id => parseInt(id))
          .filter(id => !isNaN(id));

        if (memberCommitteeIds.length > 0) {
          // Fetch committee details from the Committees table
          const { data: committeesData, error: committeesError } = await supabase
            .from("Committees")
            .select("*")
            .in("committee_id", memberCommitteeIds);

          if (committeesError) throw committeesError;

          const transformedCommittees: MemberCommittee[] = committeesData?.map((committee) => ({
            committee_id: committee.committee_id,
            committee_name: committee.committee_name || "Unknown Committee",
            role: "Member", // Default role since we don't have specific role data
            chamber: committee.chamber || "Unknown",
            description: committee.description,
          })) || [];

          setCommittees(transformedCommittees);
        } else {
          setCommittees([]);
        }
      } catch (error: any) {
        setError(error.message || "Failed to fetch committee assignments");
        setCommittees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberCommittees();
  }, [member.committee_ids, member.people_id]);

  return {
    committees,
    loading,
    error,
  };
};