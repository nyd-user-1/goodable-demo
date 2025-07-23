import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Bill = Tables<"Bills">;

export const useBillChatSessions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createOrGetChatSession = useCallback(async (bill: Bill) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if a chat session already exists for this bill
      const { data: existingSession, error: fetchError } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("bill_id", bill.bill_id)
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
          bill_id: bill.bill_id,
          title: `Bill: ${bill.bill_number}`,
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