import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  billId?: number | null;
}

export const useChatSession = (billId?: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>("");

  const saveMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const createNewSession = useCallback(async (title: string) => {
    setMessages([]);
    setSessionTitle(title);
    
    // Automatically create and save the session when it's created
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const sessionData = {
        user_id: user.id,
        bill_id: billId,
        title: title || "AI Chat Session",
        messages: JSON.stringify([])
      };

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert(sessionData)
        .select()
        .single();
      
      if (error) throw error;
      setSessionId(data.id);
      return data.id;
    } catch (error) {
      throw error;
    }
  }, [billId]);

  const updateSession = useCallback(async (newMessages: Message[]) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from("chat_sessions")
        .update({
          messages: JSON.stringify(newMessages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          })))
        })
        .eq("id", sessionId);
      
      if (error) throw error;
    } catch (error) {
      // Error updating session - handled silently
    }
  }, [sessionId]);

  const saveSession = useCallback(async () => {
    if (messages.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const sessionData = {
        user_id: user.id,
        bill_id: billId,
        title: sessionTitle || "AI Chat Session",
        messages: JSON.stringify(messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        })))
      };

      if (sessionId) {
        // Update existing session
        const { error } = await supabase
          .from("chat_sessions")
          .update(sessionData)
          .eq("id", sessionId);
        
        if (error) throw error;
      } else {
        // Create new session
        const { data, error } = await supabase
          .from("chat_sessions")
          .insert(sessionData)
          .select()
          .single();
        
        if (error) throw error;
        setSessionId(data.id);
      }
    } catch (error) {
      throw error;
    }
  }, [messages, sessionId, sessionTitle, billId]);

  const loadSession = useCallback(async (sessionIdToLoad: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", sessionIdToLoad)
        .single();

      if (error) throw error;

      if (data) {
        setSessionId(data.id);
        setSessionTitle(data.title);
        
        const parsedMessages = JSON.parse(String(data.messages) || "[]").map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(parsedMessages);
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteSession = useCallback(async (sessionIdToDelete: string) => {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", sessionIdToDelete);

      if (error) throw error;

      if (sessionIdToDelete === sessionId) {
        setMessages([]);
        setSessionId(null);
        setSessionTitle("");
      }
    } catch (error) {
      throw error;
    }
  }, [sessionId]);

  return {
    messages,
    sessionId,
    sessionTitle,
    saveMessage,
    saveSession,
    loadSession,
    createNewSession,
    deleteSession,
    updateSession,
  };
};