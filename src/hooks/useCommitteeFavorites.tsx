import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCommitteeFavorites = () => {
  const [favoriteCommitteeIds, setFavoriteCommitteeIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_committee_favorites" as any)
        .select("committee_id")
        .eq("user_id", user.id);

      if (error) throw error;

      const favoriteIds = new Set(data?.map((fav: any) => fav.committee_id) || []);
      setFavoriteCommitteeIds(favoriteIds);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load favorite committees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (committeeId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save favorites",
          variant: "destructive",
        });
        return;
      }

      const isFavorited = favoriteCommitteeIds.has(committeeId);

      if (isFavorited) {
        const { error } = await supabase
          .from("user_committee_favorites" as any)
          .delete()
          .eq("user_id", user.id)
          .eq("committee_id", committeeId);

        if (error) throw error;

        setFavoriteCommitteeIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(committeeId);
          return newSet;
        });

        toast({
          title: "Removed from favorites",
          description: "Committee removed from your favorites",
        });
      } else {
        const { error } = await supabase
          .from("user_committee_favorites" as any)
          .insert({
            user_id: user.id,
            committee_id: committeeId,
          });

        if (error) throw error;

        setFavoriteCommitteeIds(prev => new Set([...prev, committeeId]));

        toast({
          title: "Added to favorites",
          description: "Committee added to your favorites",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  return {
    favoriteCommitteeIds,
    loading,
    toggleFavorite,
  };
};