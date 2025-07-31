import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, EntityType } from './types';
import { generateId } from './utils';

export const useSessionInitializer = (entity: any, entityType: EntityType) => {
  const initializeSession = useCallback(async (
    withInitialMessage: boolean,
    setMessages: (messages: Message[]) => void,
    setIsLoading: (loading: boolean) => void,
    saveChatSession: (messages: Message[]) => void
  ) => {
    if (!withInitialMessage || !entity) return;

    setIsLoading(true);

    try {
      let initialPrompt = '';

      if (entityType === 'member') {
        const memberName = entity.name || 'this member';
        initialPrompt = `I'm here to help you analyze ${memberName}'s legislative activities and provide insights about their work in the New York State Legislature. What would you like to know about ${memberName}?`;
      } else if (entityType === 'bill') {
        const billTitle = entity.title || entity.bill_number || 'this bill';
        initialPrompt = `I'm ready to analyze ${billTitle} and provide detailed insights about this legislation. What specific aspects would you like to explore?`;
      } else if (entityType === 'committee') {
        const committeeName = entity.committee_name || 'this committee';
        initialPrompt = `I can help you understand ${committeeName}'s activities, jurisdiction, and current legislative work. What would you like to know?`;
      }

      if (initialPrompt) {
        const { data, error } = await supabase.functions.invoke('generate-with-openai', {
          body: { 
            prompt: initialPrompt,
            type: entityType,
            context: {
              chatType: entityType,
              relatedId: entityType === 'bill' ? entity.bill_id : 
                        entityType === 'member' ? entity.people_id : 
                        entityType === 'committee' ? entity.committee_id : null,
              title: entityType === 'bill' ? entity.title || entity.bill_number :
                     entityType === 'member' ? entity.name :
                     entityType === 'committee' ? entity.committee_name : '',
              entity: entity
            }
          }
        });

        if (error) {
          throw new Error('Failed to initialize session');
        }

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: data.generatedText || 'Hello! How can I help you today?',
          timestamp: new Date()
        };

        const initialMessages = [assistantMessage];
        setMessages(initialMessages);
        await saveChatSession(initialMessages);
      }
    } catch (error) {
      // Set a fallback message if initialization fails
      const fallbackMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Hello! I'm ready to help you with your legislative analysis. How can I assist you today?",
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [entity, entityType]);

  return { initializeSession };
};