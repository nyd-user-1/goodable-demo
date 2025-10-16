import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message, EntityType, Citation } from './types';
import { generateId } from './utils';

// Extract citations from response content and entity information
const extractCitationsFromResponse = (content: string, entity: any, entityType: EntityType): Citation[] => {
  const citations: Citation[] = [];
  
  // Generate citations based on entity type and content
  if (entityType === 'bill' && entity) {
    citations.push({
      id: generateId(),
      title: `NY State Bill ${entity.bill_number || 'N/A'}`,
      url: entity.state_link || entity.url || '',
      excerpt: `${entity.title || 'Bill information'} - Status: ${entity.status_desc || 'Unknown'}`
    });
    
    // Add Legiscan citation if available
    if (entity.url) {
      citations.push({
        id: generateId(),
        title: 'Legiscan Database',
        url: entity.url,
        excerpt: 'Legislative tracking and bill information from Legiscan'
      });
    }
  }
  
  if (entityType === 'member' && entity) {
    citations.push({
      id: generateId(),
      title: `NY State ${entity.chamber || 'Legislature'} - ${entity.name || 'Member'}`,
      url: entity.nys_bio_url || '',
      excerpt: `${entity.party || ''} representative for District ${entity.district || 'N/A'}`
    });
    
    // Add additional member sources
    if (entity.ballotpedia) {
      citations.push({
        id: generateId(),
        title: 'Ballotpedia Profile',
        url: entity.ballotpedia,
        excerpt: 'Comprehensive political information and voting record'
      });
    }
  }
  
  if (entityType === 'committee' && entity) {
    citations.push({
      id: generateId(),
      title: `${entity.committee_name || entity.name || 'Committee'} - NY State ${entity.chamber || 'Legislature'}`,
      url: entity.committee_url || '',
      excerpt: `Committee information including membership, jurisdiction, and current agenda`
    });
  }
  
  // Add NYS Open Legislation API as a general source
  citations.push({
    id: generateId(),
    title: 'NY State Open Legislation API',
    url: 'https://legislation.nysenate.gov/api/3/',
    excerpt: 'Official New York State legislative data and documentation'
  });
  
  return citations.filter(citation => citation.url); // Only return citations with valid URLs
};

export const useMessageHandler = (entity: any, entityType: EntityType) => {
  const { toast } = useToast();

  const sendMessage = useCallback(async (
    message: string,
    messages: Message[],
    setMessages: (messages: Message[]) => void,
    setIsLoading: (loading: boolean) => void,
    saveChatSession: (messages: Message[]) => void,
    setCitations?: (citations: any[]) => void
  ) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // For bills, members, committees - use the original message for comprehensive analysis
      const contextualPrompt = message;

      // Get Supabase session for auth
      const { data: { session } } = await supabase.auth.getSession();
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;

      // Create streaming assistant message
      const assistantId = generateId();
      const streamingMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date()
      };

      let currentMessages = [...updatedMessages, streamingMessage];
      setMessages(currentMessages);

      // Call edge function with streaming
      const response = await fetch(`${projectUrl}/functions/v1/generate-with-openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({
          prompt: contextualPrompt,
          type: entityType,
          stream: true,
          fastMode: true,
          context: {
            chatType: entityType,
            relatedId: entityType === 'bill' ? entity?.bill_id :
                      entityType === 'member' ? entity?.people_id :
                      entityType === 'committee' ? entity?.committee_id : null,
            title: entityType === 'bill' ? entity?.title || entity?.bill_number :
                   entityType === 'member' ? entity?.name :
                   entityType === 'committee' ? entity?.committee_name : '',
            previousMessages: messages.slice(-5) // Last 5 messages for context
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';

                if (content) {
                  fullResponse += content;
                  // Update streaming message
                  currentMessages = currentMessages.map(msg =>
                    msg.id === assistantId
                      ? { ...msg, content: fullResponse }
                      : msg
                  );
                  setMessages(currentMessages);
                }
              } catch (e) {
                console.debug('Skipping chunk:', line);
              }
            }
          }
        }
      }

      if (!fullResponse) {
        fullResponse = 'Unable to generate response. Please try again.';
        currentMessages = currentMessages.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: fullResponse }
            : msg
        );
        setMessages(currentMessages);
      }

      // Extract and store citations from the response
      if (setCitations) {
        const extractedCitations = extractCitationsFromResponse(fullResponse, entity, entityType);
        setCitations(extractedCitations);
      }

      // Save updated messages to database
      await saveChatSession(currentMessages);

    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [entity, entityType, toast]);

  return { sendMessage };
};