import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMemberFavorites = () => {
  const [favoriteMemberIds, setFavoriteMemberIds] = useState<Set<number>>(new Set());
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
        .from("user_member_favorites" as any)
        .select("member_id")
        .eq("user_id", user.id);

      if (error) throw error;

      const favoriteIds = new Set(data?.map((fav: any) => fav.member_id) || []);
      setFavoriteMemberIds(favoriteIds);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load favorite members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (memberId: number) => {
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

      const isFavorited = favoriteMemberIds.has(memberId);

      if (isFavorited) {
        const { error } = await supabase
          .from("user_member_favorites" as any)
          .delete()
          .eq("user_id", user.id)
          .eq("member_id", memberId);

        if (error) throw error;

        setFavoriteMemberIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(memberId);
          return newSet;
        });

        toast({
          title: "Removed from favorites",
          description: "Member removed from your favorites",
        });
      } else {
        const { error } = await supabase
          .from("user_member_favorites" as any)
          .insert({
            user_id: user.id,
            member_id: memberId,
          });

        if (error) throw error;

        setFavoriteMemberIds(prev => new Set([...prev, memberId]));

        toast({
          title: "Added to favorites",
          description: "Member added to your favorites",
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
    favoriteMemberIds,
    loading,
    toggleFavorite,
  };
};