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

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  feature?: string;
  timestamp: Date;
  isTyping?: boolean;
}


const initialMessages: Message[] = [
  {
    id: "1",
    content:
      "Hello! I'm here to help you explore policy solutions. Try a sample problem statement or suggested prompt to get started.",
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
    setInputValue("");
    setIsAssistantTyping(true);

    // Simulate assistant typing delay with morphing heart loader
    setTimeout(() => {
      const assistantResponse: Message = {
        id: `assistant-${Date.now()}`,
        content: `I'm analyzing policy solutions for "${inputValue}". Here are some relevant insights and legislative approaches...`,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantResponse]);
      setIsAssistantTyping(false);
    }, 1500);
  };

  const handleSuggestedPrompt = (prompt: string) => {
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
                Try a sample problem statement or suggested prompt
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
                  <p>{message.content}</p>
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
                placeholder="Ask about our features..."
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
            <div className="overflow-x-auto">
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
          
          {/* Browse feature documentation - moved below prompts */}
          <div className="text-center mt-6">
            <Link
              to="#"
              className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
            >
              <Search className="h-4 w-4" />
              Browse feature documentation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
