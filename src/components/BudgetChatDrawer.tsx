import { useState, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Square, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import {
  BUDGET_CHAT_SYSTEM_PROMPT,
  getBudgetContextForFunction,
} from '@/lib/budget/budgetContext';

interface BudgetChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, scopes the chat to a specific budget function/category */
  functionName?: string | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  streamedContent?: string;
}

const SUGGESTED_QUESTIONS = [
  'What is the total FY 2027 budget?',
  'How much is Medicaid spending?',
  'What childcare investments are planned?',
  'What are the biggest budget risks?',
  'How does school aid change this year?',
  'What infrastructure projects are funded?',
];

const FUNCTION_QUESTIONS: Record<string, string[]> = {
  Health: [
    'What drives Medicaid cost growth?',
    'How does H.R. 1 affect the Essential Plan?',
    'What hospital support is included?',
  ],
  Education: [
    'How much is Foundation Aid increasing?',
    'What is the Universal Pre-K expansion plan?',
    'How does per-pupil spending compare nationally?',
  ],
  'Higher Education': [
    'What capital investments go to SUNY/CUNY?',
    'How many students attend tuition-free?',
    'What is the Opportunity Promise Scholarship?',
  ],
  Transportation: [
    'What is the MTA Capital Plan total?',
    'What are the major highway projects?',
    'What is the Gateway Hudson Tunnel status?',
  ],
  'Social Welfare': [
    'How is childcare funding expanding?',
    'What is the Empire State Child Credit?',
    'What housing investments are planned?',
  ],
  'Mental Hygiene': [
    'What mental health programs target teens?',
    'How much has the Opioid Settlement distributed?',
    'What OPWDD services are expanding?',
  ],
  'Public Protection/Criminal Justice': [
    'How has gun violence changed?',
    'What is the SCOUT program?',
    'What corrections investments are planned?',
  ],
};

export function BudgetChatDrawer({
  open,
  onOpenChange,
  functionName,
}: BudgetChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build the system prompt — append function-specific context if available
  const systemPrompt = functionName
    ? `${BUDGET_CHAT_SYSTEM_PROMPT}\n\nThe user is currently viewing the "${functionName}" budget category. Here is additional context:\n${getBudgetContextForFunction(functionName)}`
    : BUDGET_CHAT_SYSTEM_PROMPT;

  // Get suggested questions based on function context
  const suggestions = functionName && FUNCTION_QUESTIONS[functionName]
    ? FUNCTION_QUESTIONS[functionName]
    : SUGGESTED_QUESTIONS;

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      // Give the close animation time before clearing
      const timer = setTimeout(() => {
        setMessages([]);
        setInputValue('');
        setIsLoading(false);
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Stream text word-by-word
  const streamText = (text: string, messageId: string) => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }

    const words = text.split(' ');
    let idx = 0;

    streamIntervalRef.current = setInterval(() => {
      if (idx < words.length) {
        const streamed = words.slice(0, idx + 1).join(' ');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, streamedContent: streamed, isStreaming: true }
              : m
          )
        );
        idx++;
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, isStreaming: false, streamedContent: text }
              : m
          )
        );
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
      }
    }, 30);
  };

  const stopStream = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
      setMessages((prev) =>
        prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
      );
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const assistantId = `assistant-${Date.now()}`;

    try {
      const previousMessages = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke(
        'generate-with-openai',
        {
          body: {
            prompt: text,
            type: 'chat',
            model: 'gpt-4o-mini',
            context: {
              systemContext: systemPrompt,
              previousMessages,
            },
            enhanceWithNYSData: false,
            fastMode: true,
          },
        }
      );

      if (error) throw error;

      const responseText =
        data?.generatedText || "I'm sorry, I couldn't generate a response.";

      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        isStreaming: true,
        streamedContent: '',
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
      streamText(responseText, assistantId);
    } catch (err) {
      console.error('Budget chat error:', err);
      const errorMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content:
          'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const title = functionName
    ? `Ask about ${functionName}`
    : 'Ask about the FY 2027 Budget';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full overflow-hidden p-0">
        <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-lg">{title}</SheetTitle>
          <p className="text-xs text-muted-foreground">
            Powered by the FY 2027 Executive Budget Briefing Book
          </p>
        </SheetHeader>

        {/* Messages area */}
        <ScrollArea ref={scrollRef} className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {/* Empty state with suggested questions */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ask anything about the New York State FY 2027 Executive Budget.
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                      className="text-left text-sm px-3 py-2 rounded-full border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg) => {
              const displayContent =
                msg.isStreaming && msg.streamedContent !== undefined
                  ? msg.streamedContent
                  : msg.content;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-foreground text-background'
                        : 'bg-muted'
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {displayContent}
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5 align-text-bottom" />
                      )}
                    </div>
                    {/* Copy button for assistant messages */}
                    {msg.role === 'assistant' && !msg.isStreaming && (
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Analyzing budget data...
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the budget..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={isLoading ? stopStream : handleSend}
              disabled={!isLoading && !inputValue.trim()}
              size="icon"
              variant={isLoading ? 'destructive' : 'default'}
            >
              {isLoading ? (
                <Square className="w-4 h-4" fill="currentColor" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
