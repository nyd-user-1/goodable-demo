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
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [problemStatements, setProblemStatements] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<ConfettiRef>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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

  // Generate problem statement based on user input
  const generateProblemStatement = (problem: string): string => {
    const keywords = problem.toLowerCase();
    let category = "General";
    let stakeholders = "community members";
    let impact = "quality of life";

    // Simple categorization based on keywords
    if (keywords.includes('housing') || keywords.includes('rent') || keywords.includes('home')) {
      category = "Housing";
      stakeholders = "residents and families";
      impact = "housing stability and affordability";
    } else if (keywords.includes('food') || keywords.includes('nutrition') || keywords.includes('hunger')) {
      category = "Food Security";
      stakeholders = "families and individuals";
      impact = "health and nutrition access";
    } else if (keywords.includes('education') || keywords.includes('school') || keywords.includes('student')) {
      category = "Education";
      stakeholders = "students, families, and educators";
      impact = "educational outcomes and opportunities";
    } else if (keywords.includes('health') || keywords.includes('medical') || keywords.includes('care')) {
      category = "Healthcare";
      stakeholders = "patients and healthcare providers";
      impact = "health outcomes and access to care";
    }

    return `**Problem Statement: ${category} Challenge**

**The Issue:** ${problem}

**Who's Affected:** This challenge primarily impacts ${stakeholders} in our community.

**The Impact:** Without addressing this issue, we risk continued deterioration of ${impact}, potentially affecting broader community wellbeing and economic stability.

**Why It Matters:** Solving this problem would create measurable improvements in people's daily lives and strengthen our community's foundation for future growth.`;
  };

  // Generate 5 Whys analysis
  const generateFiveWhys = (problem: string): string => {
    // This is a simplified version - in production you'd want more sophisticated analysis
    const baseWhy = problem.toLowerCase();
    
    let whys = [];
    if (baseWhy.includes('housing') || baseWhy.includes('rent')) {
      whys = [
        "Housing costs are rising faster than wages",
        "Limited housing supply meets growing demand", 
        "Zoning laws restrict dense, affordable development",
        "Local policies prioritize property values over affordability",
        "Economic incentives favor luxury over affordable housing"
      ];
    } else if (baseWhy.includes('food')) {
      whys = [
        "Families lack access to affordable, healthy food",
        "Food deserts exist in low-income neighborhoods",
        "Transportation barriers limit shopping options",
        "Economic policies don't support local food systems",
        "Agricultural subsidies favor processed over fresh foods"
      ];
    } else {
      whys = [
        "The immediate symptoms are visible but underlying causes remain",
        "Systemic barriers prevent effective solutions from taking hold",
        "Resource allocation doesn't match the scale of the problem", 
        "Policy frameworks weren't designed for current challenges",
        "Root cause lies in misaligned economic or social incentives"
      ];
    }

    return `**Your 5 Whys Analysis:**

🔍 **Why #1:** ${whys[0]}
🔍 **Why #2:** ${whys[1]}  
🔍 **Why #3:** ${whys[2]}
🔍 **Why #4:** ${whys[3]}
🔍 **Why #5:** ${whys[4]}

**💎 The Root Cause:** ${whys[4]}

This is pure gold - now you know what to actually fix instead of just treating symptoms!`;
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
    setTimeout(() => {
      let responseContent: string;
      const messageId = `assistant-${Date.now()}`;

      if (conversationStage === 'initial') {
        // User described their problem
        setUserProblem(currentInput);
        setConversationStage('problem_received');
        
        responseContent = `I hear you, and what you're experiencing sounds genuinely challenging. 

You know what? A well-crafted problem statement could be incredibly valuable here. It's like having a GPS for solutions - it helps you:

• **Clarify exactly what needs fixing** (no more spinning wheels)
• **Identify who's affected** (so you know your stakeholders)  
• **Understand the real impact** (why this matters)
• **Focus your energy** (instead of shooting in the dark)

Think of it as turning frustration into a roadmap.

**Shall I draw up that problem statement for you right now?** 📝`;
      } else if (conversationStage === 'problem_received' && currentInput.toLowerCase().includes('yes')) {
        // User agreed to problem statement
        setConversationStage('statement_sent');
        const problemStatement = generateProblemStatement(userProblem);
        
        responseContent = `Here's your problem statement:

${problemStatement}

**Why this matters:** This statement gives you clarity, helps communicate the issue to others, and becomes your north star for finding solutions. It transforms a messy situation into something you can actually tackle.

Now, want to go deeper? I can walk you through a "5 Whys" analysis - it's like detective work that uncovers the root cause hiding beneath the surface symptoms.

**Ready to dig into the real source of this problem?** 🔍`;
      } else if (conversationStage === 'statement_sent' && currentInput.toLowerCase().includes('yes')) {
        // User agreed to 5 whys
        setConversationStage('five_whys');
        const fiveWhysAnalysis = generateFiveWhys(userProblem);
        
        responseContent = `Perfect! The "5 Whys" technique peels back the layers to find what's really causing your problem. Think of it like:

• **Why #1:** Gets past the obvious
• **Why #2:** Reveals the deeper issue  
• **Why #3:** Uncovers systemic problems
• **Why #4:** Finds the real culprit
• **Why #5:** Hits the root cause

${fiveWhysAnalysis}

🎯 **What's Next?** Now that you've identified the root cause, you can focus your energy on solutions that actually address the core issue rather than just symptoms. Want to explore some policy approaches or next steps?`;
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
    }, 1500);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    // Reset conversation state when using suggested prompt
    setConversationStage('initial');
    setUserProblem('');
    setInputValue(`It's a problem that ${prompt.toLowerCase()}`);
  };

  return (
    <section className="container mx-auto space-y-12 px-4 py-24 md:px-6 2xl:max-w-[1400px]">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Policy Playground
        </h2>
        <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Explore ideas and solutions based on real data sets and up to the minute intel
        </p>
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* Centered Chat Section */}
        <div className="flex h-[600px] w-full max-w-4xl flex-col rounded-xl border shadow-sm">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b p-4 relative">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src="/goodable-heart.avif"
                alt="Goodable Assistant"
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                <Heart className="w-5 h-5 text-red-500" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">Goodable.dev</h3>
              <p className="text-muted-foreground text-xs">
                Problem-solving wizard ready to help
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
                      : "bg-muted rounded-bl-none",
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
                    <Heart className="h-4 w-4 text-red-500 animate-pulse" />
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
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tell me what's bothering you..."
                className="flex-grow"
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

        {/* Suggested Questions with horizontal scrolling - moved below chat */}
        <div className="w-full max-w-4xl">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Suggested prompts</h3>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
                {problemStatements.length > 0 ? (
                  problemStatements.map((statement, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="hover:bg-primary/10 cursor-pointer py-1.5 whitespace-nowrap transition-colors"
                      onClick={() => handleSuggestedPrompt(statement)}
                    >
                      <MessageSquare className="mr-1 h-3.5 w-3.5" />
                      {statement}
                    </Badge>
                  ))
                ) : (
                  <div className="text-muted-foreground text-sm">Loading suggested prompts...</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Command K button - moved below prompts */}
          <div className="text-center mt-6">
            <Button
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-2"
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true,
                  ctrlKey: true,
                  bubbles: true
                });
                document.dispatchEvent(event);
              }}
            >
              <Command className="h-3 w-3" />
              <span>Command K</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Confetti component */}
      <Confetti ref={confettiRef} />
    </section>
  );
}
