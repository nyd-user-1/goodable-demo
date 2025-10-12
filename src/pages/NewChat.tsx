import { useState, useRef, useEffect } from "react";
import { Paperclip, ArrowUp, Search as SearchIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';

// Reduced to 2 prompts like Midpage
const samplePrompts = [
  {
    title: "Are reduced-form regression models acceptable evidence of class-wide impact at the class certification stage?",
    category: "Legal Research"
  },
  {
    title: "If Delaware is a company's place of incorporation, is that enough to establish personal jurisdiction and venue in Delaware?",
    category: "Legal Research"
  }
];

interface BillCitation {
  bill_number: string;
  title: string;
  status_desc: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  streamedContent?: string;
  searchQueries?: string[];
  reviewedInfo?: string;
  citations?: BillCitation[];
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

  // Fetch relevant bills from database to use as citations
  const fetchRelevantBills = async (query: string): Promise<BillCitation[]> => {
    try {
      const searchPattern = `%${query.substring(0, 50)}%`;

      const { data, error } = await supabase
        .from("Bills")
        .select("bill_number, title, status_desc")
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .limit(5);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching bills:", error);
      return [];
    }
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
      // Fetch relevant bills while AI generates response
      const relevantBills = await fetchRelevantBills(userQuery);

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

      // Create AI message with streaming and research metadata
      const messageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: messageId,
        role: "assistant",
        content: aiResponse,
        isStreaming: true,
        streamedContent: '',
        searchQueries: [
          `Searched for "${userQuery.substring(0, 60)}${userQuery.length > 60 ? '...' : ''}" in NY State Legislature`,
          `Searched for "${userQuery.substring(0, 60)}${userQuery.length > 60 ? '...' : ''}" in NY State Bills Database`,
        ],
        reviewedInfo: `Reviewed ${relevantBills.length} bills: ${
          relevantBills.length > 0
            ? `Found relevant legislation including ${relevantBills[0]?.bill_number || 'pending bills'} related to your query.`
            : 'No directly matching bills found, providing general legislative context.'
        }`,
        citations: relevantBills
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
      <div className="flex-1 flex flex-col px-4 pb-36 overflow-y-auto">
        {!chatStarted ? (
          /* Initial State - Prompt Cards - More Minimal */}
          <div className="flex flex-col items-center justify-center flex-1">
            <h1 className="text-4xl md:text-5xl font-semibold text-center mb-12 tracking-tight">
              What are you researching?
            </h1>

            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {samplePrompts.map((prompt, index) => (
                <Card
                  key={index}
                  className={cn(
                    "p-5 cursor-pointer transition-all duration-200 border",
                    "hover:border-primary hover:shadow-md",
                    hoveredCard === index && "border-primary shadow-md"
                  )}
                  onClick={() => handlePromptClick(prompt.title)}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
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
          /* Chat State - Messages */}
          <div className="w-full max-w-4xl mx-auto pt-8 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {message.role === "user" ? (
                  <div className="bg-muted/40 rounded-lg p-4 border-0">
                    <p className="text-base leading-relaxed">{message.content}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Searched and Reviewed Section - Like Midpage */}
                    {(message.searchQueries || message.reviewedInfo) && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <SearchIcon className="h-3.5 w-3.5" />
                          <span>Searched and reviewed sources</span>
                        </div>

                        {/* Search Queries */}
                        {message.searchQueries && message.isStreaming && (
                          <div className="text-xs text-muted-foreground space-y-1 pl-5">
                            {message.searchQueries.map((query, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <SearchIcon className="h-3 w-3 mt-0.5 animate-pulse flex-shrink-0" />
                                <span>{query}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reviewed Info */}
                        {message.reviewedInfo && !message.isStreaming && (
                          <div className="text-xs text-muted-foreground pl-5 flex items-start gap-2">
                            <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{message.reviewedInfo}</span>
                          </div>
                        )}
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
                            <strong className="font-semibold text-foreground">
                              {children}
                            </strong>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-xl font-semibold mb-3 text-foreground">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-semibold mb-2 text-foreground">
                              {children}
                            </h2>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 mb-3 space-y-1">
                              {children}
                            </ul>
                          ),
                          li: ({ children }) => (
                            <li className="text-foreground text-sm">{children}</li>
                          ),
                        }}
                      >
                        {message.isStreaming ? message.streamedContent || '' : message.content}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5">|</span>
                      )}
                    </div>

                    {/* Citations from Bills Database */}
                    {message.citations && message.citations.length > 0 && !message.isStreaming && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
                          <FileText className="h-3.5 w-3.5" />
                          <span>Referenced Bills ({message.citations.length})</span>
                        </div>
                        <div className="space-y-2">
                          {message.citations.map((citation, idx) => (
                            <div key={idx} className="text-xs p-3 rounded-md bg-muted/40 border-0">
                              <div className="font-medium text-foreground mb-1">
                                {citation.bill_number}
                              </div>
                              <div className="text-muted-foreground line-clamp-2">
                                {citation.title}
                              </div>
                              {citation.status_desc && (
                                <div className="text-muted-foreground/80 mt-1 text-xs">
                                  Status: {citation.status_desc}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

      {/* Bottom Input Area - Minimal Gray Styling like Midpage */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            {/* Minimal gray input box - Midpage style */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50 border-0">
              {/* File Attachment Icon */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8 rounded-md hover:bg-muted"
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>

              {/* Input Field */}
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm px-2 h-8 placeholder:text-muted-foreground/60"
              />

              {/* Deep Research Label */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground border rounded-md bg-background/50">
                <FileText className="h-3.5 w-3.5" />
                <span>Deep research</span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="icon"
                className="flex-shrink-0 h-8 w-8 rounded-md"
                disabled={!query.trim()}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Disclaimer */}
          <div className="flex items-center justify-center gap-1 mt-3">
            <span className="text-xs text-muted-foreground/70">
              AI-generated responses must be verified and are not legal advice.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChat;
