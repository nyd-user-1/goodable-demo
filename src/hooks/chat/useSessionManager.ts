import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, EntityType } from './types';

const getTitle = (entity: any, entityType: EntityType): string => {
  if (entityType === 'bill' && entity) {
    return `Bill: ${entity.bill_number}`;
  }
  if (entityType === 'member' && entity) {
    return `Member: ${entity.name}`;
  }
  if (entityType === 'committee' && entity) {
    return `Committee: ${entity.name}`;
  }
  return 'AI Chat';
};

export const useSessionManager = (entity: any, entityType: EntityType) => {
  const saveChatSession = useCallback(async (messages: Message[], sessionId: string | null, setSessionId: (id: string) => void) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const title = getTitle(entity, entityType);

      const sessionData = {
        user_id: user.id,
        bill_id: entityType === 'bill' ? entity?.bill_id : null,
        member_id: entityType === 'member' ? entity?.people_id : null,
        committee_id: entityType === 'committee' ? entity?.committee_id : null,
        title: title,
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
      // Error saving chat session - handled silently
    }
  }, [entity, entityType]);

  return { saveChatSession };
};