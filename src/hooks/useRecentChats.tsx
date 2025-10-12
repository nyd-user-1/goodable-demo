import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type ChatSession = Tables<"chat_sessions">;

export const useRecentChats = (limit: number = 5) => {
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentChats();
  }, [limit]);

  const fetchRecentChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setRecentChats(data || []);
    } catch (error) {
      console.error("Error fetching recent chats:", error);
      setRecentChats([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    recentChats,
    loading,
    refetch: fetchRecentChats,
  };
};
