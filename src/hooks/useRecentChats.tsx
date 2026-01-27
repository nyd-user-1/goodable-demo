import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type ChatSession = Tables<"chat_sessions">;

// Extended chat with pinned status
export interface ChatWithPinned extends ChatSession {
  isPinned: boolean;
}

const PINNED_CHATS_KEY = "goodable_pinned_chats";

const getPinnedChatIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem(PINNED_CHATS_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
};

const savePinnedChatIds = (ids: Set<string>) => {
  localStorage.setItem(PINNED_CHATS_KEY, JSON.stringify([...ids]));
};

export const useRecentChats = (limit: number = 10) => {
  const [recentChats, setRecentChats] = useState<ChatWithPinned[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(getPinnedChatIds());
  const { toast } = useToast();

  const fetchRecentChats = useCallback(async () => {
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

      // Add pinned status and sort with pinned first
      const currentPinnedIds = getPinnedChatIds();
      const chatsWithPinned: ChatWithPinned[] = (data || []).map(chat => ({
        ...chat,
        isPinned: currentPinnedIds.has(chat.id),
      }));

      // Sort: pinned first, then by updated_at
      chatsWithPinned.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0; // Keep original order for same pin status
      });

      setRecentChats(chatsWithPinned);
    } catch (error) {
      console.error("Error fetching recent chats:", error);
      setRecentChats([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecentChats();
  }, [fetchRecentChats]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", chatId);

      if (error) throw error;

      // Remove from local state
      setRecentChats(prev => prev.filter(chat => chat.id !== chatId));

      // Remove from pinned if it was pinned
      const newPinnedIds = new Set(pinnedIds);
      newPinnedIds.delete(chatId);
      setPinnedIds(newPinnedIds);
      savePinnedChatIds(newPinnedIds);

      toast({
        title: "Chat deleted",
        description: "The chat has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat.",
        variant: "destructive",
      });
    }
  }, [pinnedIds, toast]);

  const togglePinChat = useCallback((chatId: string) => {
    const newPinnedIds = new Set(pinnedIds);
    const wasPinned = newPinnedIds.has(chatId);

    if (wasPinned) {
      newPinnedIds.delete(chatId);
    } else {
      newPinnedIds.add(chatId);
    }

    setPinnedIds(newPinnedIds);
    savePinnedChatIds(newPinnedIds);

    // Update local state and re-sort
    setRecentChats(prev => {
      const updated = prev.map(chat => ({
        ...chat,
        isPinned: newPinnedIds.has(chat.id),
      }));

      // Sort: pinned first
      updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });

      return updated;
    });

    toast({
      title: wasPinned ? "Chat unpinned" : "Chat pinned",
      description: wasPinned ? "Chat removed from pins." : "Chat pinned to top.",
    });
  }, [pinnedIds, toast]);

  const renameChat = useCallback(async (chatId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .update({ title: newTitle })
        .eq("id", chatId);

      if (error) throw error;

      // Update local state
      setRecentChats(prev => prev.map(chat =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      ));

      toast({
        title: "Chat renamed",
        description: "The chat has been renamed.",
      });
    } catch (error) {
      console.error("Error renaming chat:", error);
      toast({
        title: "Error",
        description: "Failed to rename chat.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    recentChats,
    loading,
    refetch: fetchRecentChats,
    deleteChat,
    togglePinChat,
    renameChat,
  };
};
