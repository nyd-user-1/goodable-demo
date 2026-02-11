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

interface VotesChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName?: string | null;
  memberParty?: string | null;
  billTitle?: string | null;
  billNumber?: string | null;
  billResult?: string | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  streamedContent?: string;
}

const VOTES_SYSTEM_PROMPT = `You are an expert on New York State legislative voting records. You have access to official roll call vote data from the NY Senate and Assembly.

Key facts about NYS legislative votes:
- Roll call votes are recorded for both the NY Senate and Assembly
- Vote types include: Yes/Yea, No/Nay, Not Voting, and Absent
- Bills pass with a majority of Yes votes (varies by bill type)
- Data includes member name, party affiliation, vote cast, bill number, bill title, and vote date
- The legislature has two chambers: Senate (63 members) and Assembly (150 members)
- Party affiliations are primarily Democrat (D) and Republican (R)
- Some votes are unanimous while others are closely contested along party lines

When discussing voting data:
1. Be factual and cite specific vote counts when available
2. Explain voting patterns and trends in context
3. Note party-line voting when relevant
4. Discuss the significance of close or contested votes
5. Provide context about the legislative process when helpful

Format your responses clearly with:
- Bold text for names, bill numbers, and key figures
- Bullet points for lists
- Clear paragraph breaks`;

const SUGGESTED_QUESTIONS = [
  'How many total votes have been cast this session?',
  'Who are the most active voting members?',
  'Which bills were most contested?',
  'What are the party-line voting trends?',
  'How often do bills pass vs fail?',
  'What types of legislation get the most votes?',
];

const MEMBER_QUESTIONS = [
  'How often do they vote yes?',
  'Which bills did they oppose?',
  'Do they vote with their party?',
];

const BILL_QUESTIONS = [
  'Who voted yes and who voted no?',
  'Was this a party-line vote?',
  'What does this bill do?',
];

export function VotesChatDrawer({
  open,
  onOpenChange,
  memberName,
  memberParty,
  billTitle,
  billNumber,
  billResult,
}: VotesChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Build context-specific system prompt
  const systemPrompt = memberName
    ? `${VOTES_SYSTEM_PROMPT}\n\nThe user is asking about ${memberName} (${memberParty || 'unknown party'})'s voting record. Provide specific information about their voting patterns, party alignment, and notable votes.`
    : billTitle
      ? `${VOTES_SYSTEM_PROMPT}\n\nThe user is asking about ${billNumber}: ${billTitle}${billResult ? `, which ${billResult}` : ''}. Provide specific information about how members voted, whether it was party-line, and what the bill does.`
      : VOTES_SYSTEM_PROMPT;

  const suggestions = memberName
    ? MEMBER_QUESTIONS
    : billTitle
      ? BILL_QUESTIONS
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
      console.error('Votes chat error:', err);
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

  const title = memberName
    ? `Ask about ${memberName}`
    : billTitle
      ? `Ask about ${billNumber || billTitle}`
      : 'Ask about NYS Votes';

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
                  Ask anything about New York State legislative voting records.
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

          </div>
        </ScrollArea>

        {/* Input area */}
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
