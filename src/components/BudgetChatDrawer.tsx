import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp, Square, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import {
  BUDGET_CHAT_SYSTEM_PROMPT,
  getBudgetContextForFunction,
} from '@/lib/budget/budgetContext';

interface BudgetChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Build the system prompt
  const systemPrompt = functionName
    ? `${BUDGET_CHAT_SYSTEM_PROMPT}\n\nThe user is currently viewing the "${functionName}" budget category. Here is additional context:\n${getBudgetContextForFunction(functionName)}`
    : BUDGET_CHAT_SYSTEM_PROMPT;

  const suggestions = functionName && FUNCTION_QUESTIONS[functionName]
    ? FUNCTION_QUESTIONS[functionName]
    : SUGGESTED_QUESTIONS;

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setMessages([]);
        setInputValue('');
        setIsLoading(false);
        stopStream();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const stopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
    setIsLoading(false);
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

    // Add placeholder assistant message for streaming
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant' as const,
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        streamedContent: '',
      },
    ]);

    try {
      const previousMessages = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Use direct fetch for real SSE streaming (same pattern as NewChat)
      const supabaseUrl = (supabase as any).supabaseUrl;
      const supabaseKey = (supabase as any).supabaseKey;
      const { data: { session } } = await supabase.auth.getSession();

      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-with-openai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token || supabaseKey}`,
            apikey: supabaseKey,
          },
          body: JSON.stringify({
            prompt: text,
            type: 'chat',
            stream: true,
            model: 'gpt-4o-mini',
            context: {
              systemContext: systemPrompt,
              previousMessages,
            },
            enhanceWithNYSData: false,
            fastMode: true,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      // Stream SSE chunks
      const reader = response.body?.getReader();
      readerRef.current = reader || null;
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
                let content = '';
                if (parsed.choices?.[0]?.delta?.content) {
                  content = parsed.choices[0].delta.content;
                } else if (parsed.delta?.text) {
                  content = parsed.delta.text;
                }

                if (content) {
                  aiResponse += content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, streamedContent: aiResponse, content: aiResponse }
                        : m
                    )
                  );
                }
              } catch {
                // Skip invalid JSON chunks
              }
            }
          }
        }
      }

      // Finalize message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, isStreaming: false, content: aiResponse, streamedContent: aiResponse }
            : m
        )
      );
      setIsLoading(false);
      readerRef.current = null;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setIsLoading(false);
        return;
      }
      console.error('Budget chat error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                isStreaming: false,
                content: 'Sorry, something went wrong. Please try again.',
                streamedContent: 'Sorry, something went wrong. Please try again.',
              }
            : m
        )
      );
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
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full overflow-hidden p-0">
        <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-lg">{title}</SheetTitle>
        </SheetHeader>

        {/* Messages area */}
        <ScrollArea ref={scrollRef} className="flex-1 px-6 py-4">
          <div className="space-y-2">
            {/* Empty state with suggested questions */}
            {messages.length === 0 && !isLoading && (
              <div className="space-y-4 pt-8">
                <p className="text-sm text-muted-foreground">
                  Ask anything about the New York State FY 2027 Executive Budget.
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                      className="text-left text-sm px-3 py-2 rounded-lg border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, index) => {
              const displayContent =
                msg.isStreaming && msg.streamedContent !== undefined
                  ? msg.streamedContent
                  : msg.content;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'space-y-3',
                    index > 0 && msg.role === 'user' ? 'mt-[80px]' : index > 0 ? 'mt-6' : ''
                  )}
                >
                  {msg.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="bg-muted/40 rounded-lg p-4 border-0 max-w-[70%]">
                        <p className="text-base leading-relaxed">{displayContent}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-3 leading-relaxed text-foreground">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-foreground">{children}</strong>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold mt-6 mb-3 text-foreground">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-semibold mt-5 mb-2 text-foreground">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h3>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-6 space-y-1 my-2">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-6 space-y-1 my-2">{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li className="leading-relaxed text-foreground">{children}</li>
                            ),
                          }}
                        >
                          {displayContent}
                        </ReactMarkdown>
                        {msg.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1">|</span>
                        )}
                      </div>

                      {/* Copy button below assistant message */}
                      {!msg.isStreaming && displayContent && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="h-7 px-2 text-muted-foreground hover:text-foreground"
                          >
                            {copiedId === msg.id ? (
                              <><Check className="h-3.5 w-3.5 mr-1" /> Copied</>
                            ) : (
                              <><Copy className="h-3.5 w-3.5 mr-1" /> Copy</>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading indicator (only shown before first streaming content) */}
            {isLoading && messages[messages.length - 1]?.streamedContent === '' && (
              <div className="mt-6 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-muted-foreground">
                  Analyzing budget data...
                </span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area - matches NewChat standard */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-background">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                  const maxHeight = 144;
                  textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
                  textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > maxHeight ? 'auto' : 'hidden';
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="What are you researching?"
              disabled={isLoading}
              rows={1}
              className="flex-1 min-h-[40px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none p-0 placeholder:text-muted-foreground/60 text-base disabled:opacity-50"
            />
            <Button
              onClick={isLoading ? stopStream : handleSend}
              disabled={!isLoading && !inputValue.trim()}
              size="icon"
              className={cn(
                'h-9 w-9 rounded-lg flex-shrink-0',
                isLoading
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-foreground hover:bg-foreground/90'
              )}
            >
              {isLoading ? (
                <Square className="h-4 w-4" fill="currentColor" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
