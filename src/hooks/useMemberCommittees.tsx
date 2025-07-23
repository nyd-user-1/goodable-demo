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

        // First, try to get committees from the member's committee_id field
        const memberCommitteeIds = member.committee_id ? [member.committee_id] : [];
        
        if (memberCommitteeIds.length > 0) {
          // Fetch committee details from the Committees table
          const { data: committeesData, error: committeesError } = await supabase
            .from("Committees")
            .select("*")
            .in("committee_id", memberCommitteeIds.map(id => parseInt(id)));

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
          // If no committee_id, try to find committees by chamber or other criteria
          // For now, we'll show an empty list but this could be enhanced
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
  }, [member.committee_id, member.people_id]);

  return {
    committees,
    loading,
    error,
  };
};