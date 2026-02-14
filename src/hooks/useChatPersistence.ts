import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BillCitation {
  bill_number: string;
  title: string;
  status_desc: string;
  description?: string;
  committee?: string;
  session_id?: number;
}

interface PersistedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  // Metadata for assistant messages
  citations?: BillCitation[];
  relatedBills?: BillCitation[];
  schoolFundingData?: Record<string, any>;
  feedback?: 'good' | 'bad' | null;
  /** Full system prompt the model received — used for fine-tuning data export */
  promptLog?: string;
}

interface ChatSessionData {
  id: string;
  title: string;
  messages: PersistedMessage[];
  bill_id?: number | null;
  member_id?: number | null;
  committee_id?: number | null;
}

export const useChatPersistence = () => {
  const { user } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Create a new chat session
  const createSession = useCallback(async (
    title: string,
    initialMessages: PersistedMessage[] = [],
    context?: { bill_id?: number; member_id?: number; committee_id?: number }
  ): Promise<string | null> => {
    if (!user) {
      console.log('[useChatPersistence] No user, skipping session creation');
      return null;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title: title.substring(0, 100), // Truncate title to 100 chars
          messages: initialMessages,
          bill_id: context?.bill_id || null,
          member_id: context?.member_id || null,
          committee_id: context?.committee_id || null,
        })
        .select("id")
        .single();

      if (error) {
        console.error('[useChatPersistence] Error creating session:', error);
        return null;
      }

      console.log('[useChatPersistence] Session created:', data.id);
      setCurrentSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error('[useChatPersistence] Exception creating session:', error);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  // Update messages in existing session
  const updateMessages = useCallback(async (
    sessionId: string,
    messages: PersistedMessage[]
  ): Promise<boolean> => {
    if (!user || !sessionId) {
      console.log('[useChatPersistence] No user or sessionId, skipping update');
      return false;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .update({
          messages: messages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .eq("user_id", user.id); // Security: ensure user owns this session

      if (error) {
        console.error('[useChatPersistence] Error updating messages:', error);
        return false;
      }

      console.log('[useChatPersistence] Messages updated for session:', sessionId);
      return true;
    } catch (error) {
      console.error('[useChatPersistence] Exception updating messages:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  // Load an existing session
  const loadSession = useCallback(async (sessionId: string): Promise<ChatSessionData | null> => {
    if (!user) {
      console.log('[useChatPersistence] No user, skipping session load');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error('[useChatPersistence] Error loading session:', error);
        return null;
      }

      console.log('[useChatPersistence] Session loaded:', sessionId);
      setCurrentSessionId(sessionId);

      return {
        id: data.id,
        title: data.title,
        messages: (data.messages as PersistedMessage[]) || [],
        bill_id: data.bill_id,
        member_id: data.member_id,
        committee_id: data.committee_id,
      };
    } catch (error) {
      console.error('[useChatPersistence] Exception loading session:', error);
      return null;
    }
  }, [user]);

  // Update session title
  const updateTitle = useCallback(async (sessionId: string, title: string): Promise<boolean> => {
    if (!user || !sessionId) return false;

    try {
      const { error } = await supabase
        .from("chat_sessions")
        .update({ title: title.substring(0, 100) })
        .eq("id", sessionId)
        .eq("user_id", user.id);

      if (error) {
        console.error('[useChatPersistence] Error updating title:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[useChatPersistence] Exception updating title:', error);
      return false;
    }
  }, [user]);

  // Clear current session (for new chat)
  const clearSession = useCallback(() => {
    setCurrentSessionId(null);
  }, []);

  return {
    currentSessionId,
    isSaving,
    createSession,
    updateMessages,
    loadSession,
    updateTitle,
    clearSession,
    setCurrentSessionId,
  };
};
