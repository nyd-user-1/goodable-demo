import React, { useState, useEffect, useRef } from "react";
import { Tables } from "@/integrations/supabase/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { CitationsDrawer } from "./CitationsDrawer";
import { SuggestedPrompts } from "./features/chat/SuggestedPrompts";
import { ChatMessages } from "./features/chat/ChatMessages";
import { ChatInput } from "./features/chat/ChatInput";
import { ChatContainer } from "./features/chat/ChatContainer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Bill = Tables<"Bills">;
type Member = {
  people_id: number;
  name: string;
  party?: string;
  district?: string;
  chamber?: string;
};
type Committee = {
  committee_id: number;
  name: string;
  chamber: string;
  description?: string;
};

interface AIChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill | null;
  member?: Member | null;
  committee?: Committee | null;
}

export const AIChatSheet = ({ open, onOpenChange, bill, member, committee }: AIChatSheetProps) => {
  const [citationsOpen, setCitationsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use ref to track if we've already initialized this session
  const hasInitialized = useRef(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Replace hook-based system with direct state management for fast streaming
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    isStreaming?: boolean;
    streamedContent?: string;
    hasYesNoButtons?: boolean;
  }>>([]);
  
  // Determine the entity and type for the chat session
  const entity = bill || member || committee || null;
  const entityType = bill ? 'bill' : member ? 'member' : committee ? 'committee' : null;
  
  // Stream text effect - blazing fast like FeatureChat
  const streamText = (text: string, messageId: string) => {
    const words = text.split(' ');
    let currentIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (currentIndex < words.length) {
        const streamedText = words.slice(0, currentIndex + 1).join(' ');
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, streamedContent: streamedText, isStreaming: true }
            : msg
        ));
        
        currentIndex++;
      } else {
        // Streaming complete
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isStreaming: false, streamedContent: text }
            : msg
        ));
        clearInterval(streamInterval);
      }
    }, 30); // Very fast - 30ms per word like FeatureChat
  };

  // Save chat session to database
  const saveChatSession = async (updatedMessages: Array<{
    id: string;
    role: string;
    content: string;
    timestamp: string;
  }>) => {
    if (!user || !entity) return;

    try {
      const title = entityType === 'bill' ? `Bill ${entity.bill_number}` :
                   entityType === 'member' ? `Chat with ${entity.name}` :
                   entityType === 'committee' ? `Committee: ${entity.committee_name}` : 
                   'Chat Session';

      const sessionData = {
        user_id: user.id,
        title: title,
        messages: updatedMessages,
        chat_type: entityType || 'general'
      };

      // Add entity-specific fields
      if (entityType === 'bill') {
        sessionData.bill_id = entity.bill_id;
      } else if (entityType === 'member') {
        sessionData.member_id = entity.people_id;
      } else if (entityType === 'committee') {
        sessionData.committee_id = entity.committee_id;
      }

      if (sessionId) {
        // Update existing session
        const { error } = await supabase
          .from('chat_sessions')
          .update(sessionData)
          .eq('id', sessionId);

        if (error) throw error;
      } else {
        // Create new session
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert(sessionData)
          .select()
          .single();

        if (error) throw error;
        if (data) setSessionId(data.id);
      }
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  };

  // Initialize session when sheet opens (only once per entity)
  useEffect(() => {
    if (open && entity && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeSession();
    }
    
    // Reset when sheet closes
    if (!open) {
      hasInitialized.current = false;
      setMessages([]);
      setSessionId(null);
    }
  }, [open, entity]); // initializeSession is defined inside the component and doesn't need to be in deps
  
  // Initialize session with AI response
  const initializeSession = async () => {
    if (!entity) return;
    
    setIsLoading(true);
    
    const messageId = `assistant-${Date.now()}`;
    
    try {
      const billNumber = entity.bill_number || 'Unknown';
      const billTitle = entity.title || 'No title available';
      const initialPrompt = `Please provide a comprehensive analysis of New York State Bill ${billNumber}. The bill title is: "${billTitle}". 

I need you to analyze this specific legislation and provide detailed information about:
1. Bill provisions and what it does
2. Legislative status and process
3. Sponsorship and committee assignments  
4. Potential impact and implications
5. Key stakeholders affected

Please focus specifically on Bill ${billNumber} and provide factual legislative analysis based on the actual bill content.

After your analysis, would you like me to dive deeper into any specific aspect of this legislation?`;

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

      if (error) throw error;

      const assistantMessage = {
        id: messageId,
        content: data.generatedText || 'Hello! How can I help you analyze this legislation?',
        role: "assistant" as const,
        timestamp: new Date(),
        isStreaming: true,
        streamedContent: '',
        hasYesNoButtons: true
      };

      setMessages([assistantMessage]);
      setIsLoading(false);
      
      // Start streaming the response
      streamText(assistantMessage.content, messageId);
      
      // Save to database after message is created
      setTimeout(() => {
        saveChatSession([{
          id: assistantMessage.id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          timestamp: assistantMessage.timestamp.toISOString()
        }]);
      }, 100);
    } catch (error) {
      console.error('Error initializing session:', error);
      setIsLoading(false);
    }
  };

  // Send message function with fast streaming
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      content: message,
      role: "user" as const,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const messageId = `assistant-${Date.now()}`;

    try {
      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { 
          prompt: message,
          type: entityType,
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
        }
      });

      if (error) throw error;

      const assistantMessage = {
        id: messageId,
        content: data.generatedText || 'I apologize, but I encountered an error. Please try again.',
        role: "assistant" as const,
        timestamp: new Date(),
        isStreaming: true,
        streamedContent: '',
        hasYesNoButtons: false // Only first message has yes/no buttons
      };

      setMessages(prev => {
        const updatedMessages = [...prev, assistantMessage];
        
        // Save to database after message is added
        setTimeout(() => {
          const messagesToSave = updatedMessages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          }));
          saveChatSession(messagesToSave);
        }, 100);
        
        return updatedMessages;
      });
      setIsLoading(false);
      
      // Start streaming the response
      streamText(assistantMessage.content, messageId);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied to clipboard.",
    });
  };

  const handleFeedback = (type: "thumbs-up" | "thumbs-down" | "citations") => {
    if (type === "citations") {
      setCitationsOpen(true);
    } else {
      toast({
        title: "Feedback received",
        description: `Thank you for your ${type} feedback!`,
      });
    }
  };

  const getTitle = () => {
    if (entityType === 'bill') {
      return `Chat about Bill ${entity?.bill_number || 'Unknown'}`;
    } else if (entityType === 'member') {
      return `Chat with ${entity?.name || 'Member'}`;
    } else if (entityType === 'committee') {
      return `Chat about ${entity?.committee_name || 'Committee'}`;
    }
    return 'Chat';
  };

  const handleShareChat = () => {
    toast({
      title: "Chat shared",
      description: "Chat has been shared successfully!",
    });
  };

  const citations = []; // Add citations data if needed

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="chat-sheet-content w-full sm:max-w-2xl flex flex-col h-full overflow-hidden">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{getTitle()}</SheetTitle>
        </SheetHeader>

        <ChatContainer>
          {/* Chat Messages */}
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            onCopy={handleCopy}
            onShare={handleShareChat}
            onSendPrompt={sendMessage}
            entity={entity}
            entityType={entityType}
            onFeedback={handleFeedback}
          />

          {/* Input Area */}
          <ChatInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </ChatContainer>
      </SheetContent>
      
      <CitationsDrawer 
        open={citationsOpen}
        onOpenChange={setCitationsOpen}
        citations={citations}
      />
    </Sheet>
  );
};