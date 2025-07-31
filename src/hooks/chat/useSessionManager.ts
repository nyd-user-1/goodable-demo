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

      const sessionData: any = {
        user_id: user.id,
        title: title,
        messages: messages,
        chat_type: entityType || 'general'
      };

      // Set the appropriate related ID based on entity type
      if (entityType === 'bill' && entity) {
        sessionData.bill_id = entity.bill_id;
      } else if (entityType === 'member' && entity) {
        sessionData.member_id = entity.people_id;
      } else if (entityType === 'committee' && entity) {
        sessionData.committee_id = entity.committee_id;
      }

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