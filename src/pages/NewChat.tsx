import { useState, useRef, useEffect } from "react";
import { FileText, Paperclip, ArrowUp, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';

const samplePrompts = [
  {
    title: "Are reduced-form regression models acceptable evidence of class-wide impact at the class certification stage?",
    category: "Legal Research"
  },
  {
    title: "What legislative frameworks support equitable funding for school districts in underserved communities?",
    category: "Education Policy"
  },
  {
    title: "How do recent NYSLRS amendments affect pension obligations for municipal employees?",
    category: "Public Finance"
  },
  {
    title: "What are the constitutional requirements for due process in administrative hearings for benefit determinations?",
    category: "Administrative Law"
  },
  {
    title: "Which states have successfully implemented universal Pre-K programs and what were the key legislative provisions?",
    category: "Education Policy"
  },
  {
    title: "What is the legislative history behind New York's tenant protection laws and recent amendments?",
    category: "Housing Policy"
  }
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  streamedContent?: string;
  searchQueries?: string[];
}

const NewChat = () => {
  const [query, setQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Stream text effect - 30ms per word for enterprise speed
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
    }, 30); // Enterprise-level speed: 30ms per word
  };

  const handlePromptClick = (prompt: string) => {
    setQuery(prompt);
    handleSubmit(null, prompt);
  };

  const handleSubmit = async (e: React.FormEvent | null, promptText?: string) => {
    if (e) e.preventDefault();

    const userQuery = promptText || query.trim();
    if (!userQuery) return;

    // Start chat interface
    setChatStarted(true);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userQuery,
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsTyping(true);

    try {
      // Call your existing OpenAI edge function
      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: {
          prompt: userQuery,
          type: 'default',
          context: 'research_chat',
          stream: false
        }
      });

      if (error) {
        console.error('API Error:', error);
        throw error;
      }

      const aiResponse = data?.generatedText || 'I apologize, but I encountered an error. Please try again.';

      // Create AI message with streaming
      const messageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: messageId,
        role: "assistant",
        content: aiResponse,
        isStreaming: true,
        streamedContent: '',
        searchQueries: [
          `Searching: "${userQuery.substring(0, 80)}..." in state_and_federal`,
        ]
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Start streaming the response
      streamText(aiResponse, messageId);

    } catch (error) {
      console.error('Error generating response:', error);

      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an error generating a response. Please try again.",
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-4 pb-32 overflow-y-auto">
        {!chatStarted ? (
          /* Initial State - Prompt Cards */
          <div className="flex flex-col items-center justify-center flex-1">
            <h1 className="text-5xl md:text-6xl font-bold text-center mb-16 tracking-tight">
              What are you researching?
            </h1>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {samplePrompts.map((prompt, index) => (
                <Card
                  key={index}
                  className={cn(
                    "p-6 cursor-pointer transition-all duration-200 border-2",
                    "hover:border-primary hover:shadow-lg",
                    hoveredCard === index && "border-primary shadow-lg"
                  )}
                  onClick={() => handlePromptClick(prompt.title)}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <p className="text-sm text-muted-foreground mb-3 font-medium">
                    {prompt.category}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {prompt.title}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Chat State - Messages */
          <div className="w-full max-w-4xl mx-auto pt-8 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {message.role === "user" ? (
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="text-base leading-relaxed">{message.content}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Show search queries if they exist */}
                    {message.searchQueries && message.isStreaming && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {message.searchQueries.map((query, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <SearchIcon className="h-3 w-3 animate-pulse" />
                            <span>{query}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Response */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-3 leading-relaxed text-foreground">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-foreground">
                              {children}
                            </strong>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-bold mb-4 text-foreground">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-bold mb-3 text-foreground">
                              {children}
                            </h2>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-6 mb-3 space-y-1">
                              {children}
                            </ul>
                          ),
                          li: ({ children }) => (
                            <li className="text-foreground">{children}</li>
                          ),
                        }}
                      >
                        {message.isStreaming ? message.streamedContent || '' : message.content}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1">|</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full"></div>
                  <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full delay-75"></div>
                  <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full delay-150"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Area - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-input bg-background focus-within:border-primary transition-colors">
              {/* File Attachment Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-10 w-10 rounded-full"
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              {/* Input Field */}
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base px-0"
              />

              {/* Deep Research Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-shrink-0 rounded-full px-4 py-2 h-10 border-2"
              >
                <FileText className="h-4 w-4 mr-2" />
                Deep research
              </Button>

              {/* Submit Button */}
              <Button
                type="submit"
                size="icon"
                className="flex-shrink-0 h-10 w-10 rounded-full"
                disabled={!query.trim()}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </div>
          </form>

          {/* Disclaimer */}
          <p className="text-xs text-center text-muted-foreground mt-4">
            AI-generated responses must be verified and are not legal advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewChat;
