import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;
type Member = Tables<"People">;
type Committee = Tables<"Committees">;

export interface TopFavorite {
  id: string;
  type: "bill" | "member" | "committee";
  title: string;
  subtitle?: string;
  url: string;
  created_at: string;
}

export const useTopFavorites = (limit: number = 10) => {
  const [topFavorites, setTopFavorites] = useState<TopFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopFavorites();
  }, [limit]);

  const fetchTopFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch all favorites in parallel
      const [billFavs, memberFavs, committeeFavs] = await Promise.all([
        supabase
          .from("user_favorites")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_member_favorites")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_committee_favorites")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      // Get the bill, member, and committee data
      const billIds = billFavs.data?.map(fav => fav.bill_id) || [];
      const memberIds = memberFavs.data?.map(fav => fav.member_id) || [];
      const committeeIds = committeeFavs.data?.map(fav => fav.committee_id) || [];

      const [bills, members, committees] = await Promise.all([
        billIds.length > 0
          ? supabase.from("Bills").select("*").in("bill_id", billIds)
          : Promise.resolve({ data: [] as Bill[], error: null }),
        memberIds.length > 0
          ? supabase.from("People").select("*").in("people_id", memberIds)
          : Promise.resolve({ data: [] as Member[], error: null }),
        committeeIds.length > 0
          ? supabase.from("Committees").select("*").in("committee_id", committeeIds)
          : Promise.resolve({ data: [] as Committee[], error: null }),
      ]);

      // Combine all favorites with their data
      const allFavorites: TopFavorite[] = [];

      // Add bill favorites
      billFavs.data?.forEach(fav => {
        const bill = bills.data?.find(b => b.bill_id === fav.bill_id);
        if (bill) {
          allFavorites.push({
            id: fav.id,
            type: "bill",
            title: bill.bill_number || "Unknown Bill",
            subtitle: bill.title || undefined,
            url: "/bills",
            created_at: fav.created_at,
          });
        }
      });

      // Add member favorites
      memberFavs.data?.forEach(fav => {
        const member = members.data?.find(m => m.people_id === fav.member_id);
        if (member) {
          allFavorites.push({
            id: fav.id,
            type: "member",
            title: member.name || "Unknown Member",
            subtitle: `${member.chamber} - ${member.party}`,
            url: "/members",
            created_at: fav.created_at,
          });
        }
      });

      // Add committee favorites
      committeeFavs.data?.forEach(fav => {
        const committee = committees.data?.find(c => c.committee_id === fav.committee_id);
        if (committee) {
          allFavorites.push({
            id: fav.id,
            type: "committee",
            title: committee.committee_name || "Unknown Committee",
            subtitle: committee.chamber || undefined,
            url: "/committees",
            created_at: fav.created_at,
          });
        }
      });

      // Sort by created_at and take top N
      allFavorites.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTopFavorites(allFavorites.slice(0, limit));
    } catch (error) {
      console.error("Error fetching top favorites:", error);
      setTopFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    topFavorites,
    loading,
    refetch: fetchTopFavorites,
  };
};
