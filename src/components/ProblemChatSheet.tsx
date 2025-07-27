import React, { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { ChatInput } from "@/components/features/chat/ChatInput";
import { MorphingHeartLoader } from "@/components/ui/MorphingHeartLoader";
import { generateProblemFromScenario } from "@/utils/problemStatementHelpers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

interface ProblemChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProblem: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const ProblemChatSheet = ({ open, onOpenChange, userProblem }: ProblemChatSheetProps) => {
  const [aiProblemStatement, setAiProblemStatement] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [chatTitle, setChatTitle] = useState('Problem Statement');
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const streamingRef = useRef<string>('');

  // Generate sequential problem number
  const generateProblemNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('problem_chats')
        .select('problem_number')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].problem_number.replace('P', ''));
        return `P${(lastNumber + 1).toString().padStart(5, '0')}`;
      }
      return 'P00001';
    } catch (error) {
      return `P${Date.now().toString().slice(-5)}`;
    }
  };

  // Start streaming when sheet opens and cleanup when closed
  useEffect(() => {
    if (open && userProblem && !isStreaming && !aiProblemStatement) {
      startStreaming();
    } else if (!open) {
      // Reset state when sheet closes
      setAiProblemStatement('');
      setIsStreaming(false);
      setIsComplete(false);
      setSuggestedPrompts([]);
      setChatTitle('Problem Statement');
      setChatSessionId(null);
      setInputValue('');
      setMessages([]);
      setIsLoading(false);
      streamingRef.current = '';
    }
  }, [open, userProblem]);

  // Initialize messages when AI problem statement is generated
  useEffect(() => {
    if (isComplete && aiProblemStatement && messages.length === 0) {
      const initialMessages: Message[] = [
        {
          id: 'user-1',
          role: 'user',
          content: userProblem,
          timestamp: new Date()
        },
        {
          id: 'assistant-1',
          role: 'assistant',
          content: aiProblemStatement,
          timestamp: new Date()
        }
      ];
      setMessages(initialMessages);
    }
  }, [isComplete, aiProblemStatement, userProblem, messages.length]);

  // Enhanced database update function with retry logic
  const updateProblemChatWithRetry = async (sessionId: string, content: string, maxRetries = 3) => {
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        
        const { data, error } = await supabase
          .from('problem_chats')
          .update({
            current_state: content,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .select();

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error('No rows were updated - session may not exist');
        }

        return data[0];
      } catch (error) {
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  };

  const startStreaming = async () => {
    if (!userProblem || !user) return;

    
    setIsStreaming(true);
    setIsComplete(false);
    streamingRef.current = '';
    setAiProblemStatement('');

    let sessionData = null;

    try {
      // Generate initial problem number and create chat session
      const problemNumber = await generateProblemNumber();
      setChatTitle(problemNumber);

      // Create chat session
      const { data: newSessionData, error: sessionError } = await supabase
        .from('problem_chats')
        .insert({
          user_id: user.id,
          problem_number: problemNumber,
          title: problemNumber,
          problem_statement: userProblem,
          current_state: 'generating'
        })
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }
      
      sessionData = newSessionData;
      setChatSessionId(sessionData.id);

      // Generate AI content
      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: {
          prompt: userProblem,
          type: 'problem',
          context: 'landing_page',
          stream: false
        }
      });

      if (error) {
        throw new Error('Failed to generate problem statement');
      }


      // Set the complete response
      const generatedText = data.generatedText || 'Unable to generate problem statement. Please try again.';
      
      streamingRef.current = generatedText;
      setAiProblemStatement(generatedText);
      setIsComplete(true);
      setIsStreaming(false);

      // Update chat session with final content using retry logic
      await updateProblemChatWithRetry(sessionData.id, generatedText);

      // Generate suggested prompts and dynamic title
      generateSuggestedPrompts(generatedText);
      generateDynamicTitle(generatedText, sessionData.id);

    } catch (error) {
      console.error('Error in startStreaming:', error);
      setIsStreaming(false);
      
      // If we have a session but failed to update it, try to clean up
      if (sessionData?.id) {
        try {
          await updateProblemChatWithRetry(
            sessionData.id, 
            'Error generating problem statement. Please try again.'
          );
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
      
      // Only show error toast if we actually failed to generate content
      if (!aiProblemStatement && !streamingRef.current) {
        toast({
          title: "Error",
          description: "Failed to generate problem statement. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const generateSuggestedPrompts = (content: string) => {
    // Extract keywords and generate 3-4 dynamic prompts based on content
    const prompts = [];
    
    if (content.toLowerCase().includes('fiscal') || content.toLowerCase().includes('cost') || content.toLowerCase().includes('budget')) {
      prompts.push('What are the fiscal implications?');
    }
    if (content.toLowerCase().includes('social') || content.toLowerCase().includes('community')) {
      prompts.push('How does this affect different communities?');
    }
    if (content.toLowerCase().includes('cause') || content.toLowerCase().includes('reason')) {
      prompts.push('What are the root causes?');
    }
    if (content.toLowerCase().includes('effect') || content.toLowerCase().includes('consequence')) {
      prompts.push('What are the potential unintended consequences?');
    }

    // Add context-aware next steps prompts
    if (prompts.length < 3) {
      prompts.push('What would a policy solution look like?');
      prompts.push('Who are the key stakeholders?');
      prompts.push('What similar legislation exists?');
    }

    setSuggestedPrompts(prompts.slice(0, 4)); // Maximum 4 prompts
  };

  const generateDynamicTitle = async (content: string, sessionId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: {
          prompt: `Create a short, descriptive title (3-5 words) for this problem analysis: ${content.substring(0, 200)}...`,
          type: 'default',
          model: 'gpt-4o-mini'
        }
      });

      if (!error && data?.generatedText) {
        let rawTitle = data.generatedText.trim().replace(/['"]/g, '');
        
        // Clean markdown from title
        const cleanTitle = rawTitle.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^#+\s*/g, '').trim();
        
        // Only update if we got a meaningful title (more than just the fallback)
        if (cleanTitle && cleanTitle !== 'Problem Statement' && cleanTitle.length > 0) {
          setChatTitle(cleanTitle);

          // Update the database with the clean title
          if (sessionId) {
            try {
              await supabase
                .from('problem_chats')
                .update({ title: cleanTitle })
                .eq('id', sessionId);
            } catch (titleError) {
            }
          }
        }
      }
    } catch (error) {
      // Keep the fallback title
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiProblemStatement);
    toast({
      title: "Copied to clipboard",
      description: "Problem statement copied to clipboard.",
    });
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;


    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setInputValue(''); // Clear input immediately

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-persona', {
        body: { 
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          systemPrompt: getCivicDesignPartnerPrompt()
        }
      });

      if (error) {
        throw new Error('Failed to generate response');
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message || 'Unable to generate response. Please try again.',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Update chat session with new messages
      if (chatSessionId) {
        try {
          await updateProblemChatWithRetry(
            chatSessionId,
            JSON.stringify(finalMessages)
          );
        } catch (updateError) {
        }
      }

    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      // Remove the failed user message from the UI
      setMessages(messages);
      
      toast({
        title: "Error", 
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCivicDesignPartnerPrompt = () => {
    return `You are a Civic Design Partner - a warm, professional, and proactive assistant helping users navigate policy development. Your role is to guide users through the policy creation process with expertise and encouragement.

CORE PERSONA:
• Warm and approachable, yet professional and knowledgeable
• Proactive in suggesting next steps and connecting ideas
• Context-aware of where users are in their policy journey
• Focused on practical, actionable guidance

COMMUNICATION STYLE:
• Use "we" language to create partnership ("Let's explore...", "We could consider...")
• Be encouraging and optimistic about policy solutions
• Ask thoughtful follow-up questions to deepen understanding
• Provide specific, actionable next steps
• Reference real-world examples when helpful

KEY RESPONSIBILITIES:
1. ANALYZE the problem comprehensively (root causes, stakeholders, impacts)
2. GUIDE toward solution development (policy options, implementation strategies)
3. CONNECT to relevant resources (similar legislation, case studies, experts)
4. ANTICIPATE next steps (what research is needed, who to engage, how to build support)

CONTEXT AWARENESS:
• Track user's progress through the policy development process
• Suggest logical next steps based on current discussion
• Connect new questions to previously discussed elements
• Maintain continuity across the conversation

RESPONSE STRUCTURE:
• Start with acknowledgment of their question/concern
• Provide thoughtful analysis with specific insights
• Suggest 2-3 concrete next steps
• End with an engaging follow-up question

Remember: You're not just answering questions - you're actively partnering with users to develop effective policy solutions. Be proactive, strategic, and encouraging.`;
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{chatTitle}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 px-6">
          {/* Initial loading animation for first generation */}
          {isStreaming && messages.length === 0 && (
            <div className="space-y-2">
              <div className="flex justify-start">
                <div className="w-full rounded-lg p-3 bg-muted flex items-center gap-3" style={{ marginLeft: '1rem', marginRight: '1rem' }}>
                  <div className="flex items-center justify-center">
                    <MorphingHeartLoader size={20} className="text-red-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Searching my heart</span>
                </div>
              </div>
            </div>
          )}

          {/* Display all messages */}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-3 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted relative'
              }`}
              style={{ 
                width: 'calc(100% - 2rem)', 
                marginLeft: '1rem', 
                marginRight: '1rem',
                maxWidth: 'calc(100% - 2rem)' 
              }}>
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none break-words overflow-wrap-anywhere">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="break-words">{message.content}</p>
                )}
                
                {message.role === 'assistant' && message.id === 'assistant-1' && isComplete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator for follow-up messages */}
          {isLoading && !isStreaming && (
            <div className="space-y-2">
              <div className="flex justify-start">
                <div className="w-full rounded-lg p-3 bg-muted flex items-center gap-3" style={{ marginLeft: '1rem', marginRight: '1rem' }}>
                  <div className="flex items-center justify-center">
                    <MorphingHeartLoader size={20} className="text-red-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Searching my heart</span>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Prompts - Only show after initial completion and if no follow-up messages */}
          {isComplete && suggestedPrompts.length > 0 && messages.length <= 2 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Suggested next steps:</div>
              <div className="flex gap-2 flex-wrap">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptClick(prompt)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Input - Fixed at bottom */}
        <div className="flex-shrink-0 border-t pt-4">
          <ChatInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            isLoading={isLoading || isStreaming}
            placeholder="Ask a follow-up question or explore next steps..."
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
