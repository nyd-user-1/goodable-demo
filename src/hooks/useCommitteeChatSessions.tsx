import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Committee = {
  committee_id: number;
  committee_name: string;
  description?: string;
};

export const useCommitteeChatSessions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createOrGetChatSession = useCallback(async (committee: Committee) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Only proceed if we have a valid committee_id
      if (!committee.committee_id || committee.committee_id <= 0) {
        throw new Error("Invalid committee ID");
      }

      // Check if a chat session already exists for this committee
      const { data: existingSession, error: fetchError } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("committee_id", committee.committee_id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingSession) {
        return existingSession;
      }

      // Create a new chat session
      const { data: newSession, error: createError } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          committee_id: committee.committee_id,
          title: `Committee: ${committee.committee_name}`,
          messages: JSON.stringify([])
        })
        .select()
        .single();

      if (createError) throw createError;

      return newSession;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chat session",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    createOrGetChatSession,
    loading,
  };
};