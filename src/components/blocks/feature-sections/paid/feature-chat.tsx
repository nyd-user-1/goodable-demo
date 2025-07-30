"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Code2,
  Command,
  LucideIcon,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  Shield,
  Sparkles,
  ThumbsUp,
  Zap,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { problems } from "@/data/problems";
import { supabase } from "@/integrations/supabase/client";
import { Confetti, type ConfettiRef } from '@/components/magicui/confetti';
import ReactMarkdown from 'react-markdown';
import { useModel } from '@/contexts/ModelContext';

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  feature?: string;
  timestamp: Date;
  isTyping?: boolean;
  isStreaming?: boolean;
  streamedContent?: string;
}

type ConversationStage = 'initial' | 'problem_received' | 'statement_sent' | 'five_whys' | 'complete';


const initialMessages: Message[] = [
  {
    id: "1",
    content:
      "Hey! What's your problem? 🤔 Tell me what's bothering you, what challenge you're facing, or what issue needs solving. I'm here to help you think through it!",
    sender: "assistant",
    timestamp: new Date(),
  },
];

export default function FeatureChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSampleProblemActive, setIsSampleProblemActive] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [problemStatements, setProblemStatements] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<ConfettiRef>(null);
  const { selectedModel } = useModel();

  // Auto-scroll to bottom only within the chat container, and only for new messages
  const [messageCount, setMessageCount] = useState(messages.length);
  
  useEffect(() => {
    // Only scroll when a new message is added (not during streaming)
    if (messages.length > messageCount) {
      setMessageCount(messages.length);
      
      if (messagesEndRef.current) {
        const chatContainer = messagesEndRef.current.closest('.overflow-y-auto');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }
    }
  }, [messages, messageCount]);
  
  // Problem-solving wizard state
  const [conversationStage, setConversationStage] = useState<ConversationStage>('initial');
  const [userProblem, setUserProblem] = useState('');

  // Stream text effect - blazing fast
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
    }, 30); // Very fast - 30ms per word
  };

  // Generate AI response using the exact working pattern from ProblemChatSheet
  const generateAIResponse = async (prompt: string, stage: ConversationStage): Promise<string> => {
    try {
      if (stage === 'problem_received') {
        // Use the exact working API call from ProblemChatSheet
        const { data, error } = await supabase.functions.invoke('generate-with-openai', {
          body: {
            prompt: userProblem,
            type: 'problem',
            context: 'landing_page',
            stream: false
          }
        });

        if (error) {
          console.error('API Error:', error);
          return 'I apologize, but I encountered an error generating a response. Please try again.';
        }

        // Add the validation response before the problem statement
        const problemStatement = data?.generatedText || '';
        return `I hear you, and what you're experiencing sounds genuinely challenging. 

You know what? A well-crafted problem statement could be incredibly valuable here. It's like having a GPS for solutions - it helps you:

• **Clarify exactly what needs fixing** (no more spinning wheels)
• **Identify who's affected** (so you know your stakeholders)  
• **Understand the real impact** (why this matters)
• **Focus your energy** (instead of shooting in the dark)

Think of it as turning frustration into a roadmap.

**Shall I draw up that problem statement for you right now?** 📝`;
      } else if (stage === 'statement_sent') {
        // Generate the actual problem statement
        const { data, error } = await supabase.functions.invoke('generate-with-openai', {
          body: {
            prompt: userProblem,
            type: 'problem',
            context: 'landing_page',
            stream: false
          }
        });

        if (error) {
          console.error('API Error:', error);
          return 'I apologize, but I encountered an error generating the problem statement. Please try again.';
        }

        const problemStatement = data?.generatedText || '';
        return `Here's your problem statement:

${problemStatement}

**Why this matters:** This statement gives you clarity, helps communicate the issue to others, and becomes your north star for finding solutions. It transforms a messy situation into something you can actually tackle.

Now, want to go deeper? I can walk you through a "5 Whys" analysis - it's like detective work that uncovers the root cause hiding beneath the surface symptoms.

**Ready to dig into the real source of this problem?** 🔍`;
      } else if (stage === 'five_whys') {
        // Generate 5 Whys analysis using the same API
        const { data, error } = await supabase.functions.invoke('generate-with-openai', {
          body: {
            prompt: `Perform a comprehensive "5 Whys" root cause analysis for this problem: ${userProblem}`,
            type: 'default',
            model: 'gpt-4o-mini'
          }
        });

        if (error) {
          console.error('API Error:', error);
          return 'I apologize, but I encountered an error generating the 5 Whys analysis. Please try again.';
        }

        const fiveWhysAnalysis = data?.generatedText || '';
        return `Perfect! The "5 Whys" technique peels back the layers to find what's really causing your problem. Think of it like:

• **Why #1:** Gets past the obvious
• **Why #2:** Reveals the deeper issue  
• **Why #3:** Uncovers systemic problems
• **Why #4:** Finds the real culprit
• **Why #5:** Hits the root cause

${fiveWhysAnalysis}

🎯 **What's Next?** Now that you've identified the root cause, you can focus your energy on solutions that actually address the core issue rather than just symptoms. Want to explore some policy approaches or next steps?`;
      }

      // Default response
      return 'I\'m here to help you work through problems step by step. If you\'d like to start over with a new problem, just tell me what\'s bothering you, or if you want to continue with your current issue, let me know how I can help!';
    } catch (error) {
      console.error('Error calling AI API:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }
  };

  // Fetch from Sample Problems table in Supabase
  useEffect(() => {
    const fetchSampleProblems = async () => {
      try {
        // Query the Sample Problems table with the exact column name
        const { data, error } = await supabase
          .from('Sample Problems')
          .select('"Sample Problems"')
          .order('id', { ascending: true })
          .limit(10);
        
        if (error) {
          console.error('Error fetching sample problems:', error);
          return;
        }
        
        if (data && data.length > 0) {
          setProblemStatements(data.map(item => item['Sample Problems']));
        }
      } catch (err) {
        console.error('Failed to fetch sample problems:', err);
        // Just leave problemStatements empty if it fails
      }
    };

    fetchSampleProblems();
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsAssistantTyping(true);

    // Handle conversation flow based on current stage
    const handleResponse = async () => {
      const messageId = `assistant-${Date.now()}`;
      let responseContent: string;

      if (conversationStage === 'initial') {
        // User described their problem
        setUserProblem(currentInput);
        setConversationStage('problem_received');
        responseContent = await generateAIResponse(currentInput, 'problem_received');
      } else if (conversationStage === 'problem_received' && currentInput.toLowerCase().includes('yes')) {
        // User agreed to problem statement
        setConversationStage('statement_sent');
        responseContent = await generateAIResponse(userProblem, 'statement_sent');
      } else if (conversationStage === 'statement_sent' && currentInput.toLowerCase().includes('yes')) {
        // User agreed to 5 whys
        setConversationStage('five_whys');
        responseContent = await generateAIResponse(userProblem, 'five_whys');
      } else {
        // Default response for other cases
        responseContent = `I'm here to help you work through problems step by step. If you'd like to start over with a new problem, just tell me what's bothering you, or if you want to continue with your current issue, let me know how I can help!`;
      }

      // Create message with streaming support
      const assistantResponse: Message = {
        id: messageId,
        content: responseContent,
        sender: "assistant",
        timestamp: new Date(),
        isStreaming: true,
        streamedContent: '',
      };

      setMessages((prev) => [...prev, assistantResponse]);
      setIsAssistantTyping(false);
      
      // Start streaming the response
      streamText(responseContent, messageId);
    };

    handleResponse();
  };

  const handleSuggestedPrompt = (prompt: string) => {
    // Reset conversation state when using suggested prompt
    setConversationStage('initial');
    setUserProblem('');
    setInputValue(`It's a problem that ${prompt.toLowerCase()}`);
    setIsSampleProblemActive(true);
  };

  return (
    <section id="playground" className="container mx-auto space-y-12 px-4 py-24 md:px-6 2xl:max-w-[1400px]">
      <div className="space-y-6 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Playground
        </h2>
        
        {/* Sample problems - moved above chat */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sample problems</h3>
            <div className="relative">
              {/* Left fade mask */}
              <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
              
              {/* Right fade mask */}
              <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
              
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 pb-2 pl-2" style={{ minWidth: 'max-content' }}>
                  {problemStatements.length > 0 ? (
                    (() => {
                      // Move "Families never get time together anymore" to the front
                      const familiesStatement = "Families never get time together anymore";
                      const reorderedStatements = [
                        familiesStatement,
                        ...problemStatements.filter(statement => statement !== familiesStatement)
                      ];
                      
                      return reorderedStatements.map((statement, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="hover:bg-primary/10 cursor-pointer py-1.5 whitespace-nowrap transition-colors"
                          onClick={() => handleSuggestedPrompt(statement)}
                        >
                          <MessageSquare className="mr-1 h-3.5 w-3.5" />
                          {statement}
                        </Badge>
                      ));
                    })()
                  ) : (
                    <div className="text-muted-foreground text-sm pl-2">Loading suggested prompts...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* Centered Chat Section */}
        <div className="flex h-[600px] w-full max-w-4xl flex-col rounded-xl border shadow-sm">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b p-4 relative">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src="/goodable%20pwa.jpg"
                alt="Goodable Assistant"
              />
              <AvatarFallback className="bg-red-50 text-red-500">
                ❤️
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">Goodable.dev</h3>
              <p className="text-muted-foreground text-xs">
                A policy playground for problems and proposals.
              </p>
            </div>
            <Badge variant="outline" className="ml-auto">
              <span className="mr-2 h-2 w-2 rounded-full bg-green-500 shadow-green-500/50 shadow-md animate-pulse"></span>
              Live
            </Badge>
          </div>

          {/* Chat messages */}
          <div className="flex-grow space-y-4 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "rounded-bl-none",
                  )}
                >
                  {message.sender === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>
                        {message.isStreaming ? message.streamedContent || '' : message.content}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1">|</span>
                      )}
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <div
                    className={cn(
                      "mt-1 flex items-center gap-2 text-xs",
                      message.sender === "user"
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {message.sender === "user" && (
                      <ThumbsUp className="h-3 w-3" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isAssistantTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg rounded-bl-none p-3">
                  <div className="flex items-center space-x-2">
                    <span className="animate-pulse">❤️</span>
                    <div className="flex space-x-1">
                      <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full"></div>
                      <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full delay-75"></div>
                      <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-full"
              >
                <Paperclip className="text-muted-foreground h-5 w-5" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Reset sample problem state if user manually edits
                  if (isSampleProblemActive && e.target.value !== inputValue) {
                    setIsSampleProblemActive(false);
                  }
                }}
                placeholder="Choose a sample problem."
                className={`flex-grow ${isSampleProblemActive ? 'border-blue-500 bg-blue-50' : ''}`}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim()}
                className="rounded-full"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>

      </div>
      
      {/* Confetti component */}
      <Confetti ref={confettiRef} />
    </section>
  );
}
