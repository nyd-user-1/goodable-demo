import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

type FavoriteWithBill = {
  id: string;
  user_id: string;
  bill_id: number;
  created_at: string;
  updated_at: string;
  bill: Bill;
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteWithBill[]>([]);
  const [favoriteBillIds, setFavoriteBillIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: favoritesData, error } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (favoritesData && favoritesData.length > 0) {
        // Fetch bill details for each favorite
        const billIds = favoritesData.map(fav => fav.bill_id);
        const { data: billsData, error: billsError } = await supabase
          .from("Bills")
          .select("*")
          .in("bill_id", billIds);

        if (billsError) throw billsError;

        // Combine favorites with bill data
        const favoritesWithBills = favoritesData.map(favorite => ({
          ...favorite,
          bill: billsData?.find(bill => bill.bill_id === favorite.bill_id) || {} as Bill
        })).filter(fav => fav.bill.bill_id); // Only include if bill exists

        setFavorites(favoritesWithBills);
        setFavoriteBillIds(new Set(billIds));
      } else {
        setFavorites([]);
        setFavoriteBillIds(new Set());
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (billId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isFavorited = favoriteBillIds.has(billId);

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("bill_id", billId);

        if (error) throw error;

        setFavoriteBillIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(billId);
          return newSet;
        });

        setFavorites(prev => prev.filter(fav => fav.bill_id !== billId));

        toast({
          title: "Removed from favorites",
          description: "Bill has been removed from your favorites",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("user_favorites")
          .insert({
            user_id: user.id,
            bill_id: billId,
          });

        if (error) throw error;

        setFavoriteBillIds(prev => new Set([...prev, billId]));

        // Refresh favorites to get the new item with bill details
        await fetchFavorites();

        toast({
          title: "Added to favorites",
          description: "Bill has been added to your favorites",
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

  useEffect(() => {
    fetchFavorites();
  }, []);

  return {
    favorites,
    favoriteBillIds,
    loading,
    toggleFavorite,
    refetch: fetchFavorites,
  };
};