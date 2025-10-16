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

    // Create streaming message placeholder
    const messageId = generateId();
    const streamingMessage: Message = {
      id: messageId,
      role: "assistant",
      content: "",
      timestamp: new Date()
    };

    setMessages([...updatedMessages, streamingMessage]);

    try {
      // For bills, members, committees - use the original message for comprehensive analysis
      const contextualPrompt = message;

      // Build entity context
      const entityContext = {
        chatType: entityType,
        relatedId: entityType === 'bill' ? entity?.bill_id :
                  entityType === 'member' ? entity?.people_id :
                  entityType === 'committee' ? entity?.committee_id : null,
        title: entityType === 'bill' ? entity?.title || entity?.bill_number :
               entityType === 'member' ? entity?.name :
               entityType === 'committee' ? entity?.committee_name : '',
        previousMessages: messages.slice(-5) // Last 5 messages for context
      };

      // Get Supabase URL from the client (avoids env var issues)
      const supabaseUrl = supabase.supabaseUrl;
      const { data: { session } } = await supabase.auth.getSession();

      // Call edge function with streaming via direct fetch
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-with-openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
        },
        body: JSON.stringify({
          prompt: contextualPrompt,
          type: entityType,
          stream: true,
          fastMode: true,
          context: entityContext
        }),
      });

      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status}`);
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

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

                // Handle different streaming formats
                let content = '';
                if (parsed.choices?.[0]?.delta?.content) {
                  // OpenAI format
                  content = parsed.choices[0].delta.content;
                } else if (parsed.delta?.text) {
                  // Claude format
                  content = parsed.delta.text;
                }

                if (content) {
                  aiResponse += content;
                  // Update UI with streamed content
                  setMessages(prev => prev.map(msg =>
                    msg.id === messageId
                      ? { ...msg, content: aiResponse }
                      : msg
                  ));
                }
              } catch (e) {
                // Skip invalid JSON chunks
                console.debug('Skipping chunk:', line);
              }
            }
          }
        }
      }

      if (!aiResponse) {
        aiResponse = 'Unable to generate response. Please try again.';
      }

      // Finalize the message
      const finalMessage: Message = {
        id: messageId,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, finalMessage];
      setMessages(finalMessages);

      // Extract and store citations from the response
      if (setCitations) {
        // Generate citations based on the entity and response content
        const extractedCitations = extractCitationsFromResponse(aiResponse, entity, entityType);
        setCitations(extractedCitations);
      }

      // Save updated messages to database
      await saveChatSession(finalMessages);

    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });

      // Remove streaming message and show error
      setMessages(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  }, [entity, entityType, toast]);

  return { sendMessage };
};