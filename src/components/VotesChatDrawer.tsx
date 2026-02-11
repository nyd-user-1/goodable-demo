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
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Square, ChevronDown, FileText } from 'lucide-react';
import { Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { ChatResponseFooter } from '@/components/ChatResponseFooter';
import { useModel } from '@/contexts/ModelContext';

// Model provider icons
const OpenAIIcon = ({ className }: { className?: string }) => (
  <img
    src="/OAI LOGO.png"
    alt="OpenAI"
    className={`object-contain ${className}`}
    style={{ maxWidth: '14px', maxHeight: '14px', width: 'auto', height: 'auto' }}
  />
);

const ClaudeIcon = ({ className }: { className?: string }) => (
  <img
    src="/claude-ai-icon-65aa.png"
    alt="Claude"
    className={`object-contain ${className}`}
    style={{ maxWidth: '14px', maxHeight: '14px', width: 'auto', height: 'auto' }}
  />
);

const PerplexityIcon = ({ className }: { className?: string }) => (
  <img
    src="/PPLX LOGO.png"
    alt="Perplexity"
    className={`object-contain ${className}`}
    style={{ maxWidth: '14px', maxHeight: '14px', width: 'auto', height: 'auto' }}
  />
);

interface VotesChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName?: string | null;
  memberParty?: string | null;
  memberVoteDetails?: string | null;
  billTitle?: string | null;
  billNumber?: string | null;
  billResult?: string | null;
  billVoteDetails?: string | null;
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
  memberVoteDetails,
  billTitle,
  billNumber,
  billResult,
  billVoteDetails,
}: VotesChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { selectedModel, setSelectedModel } = useModel();
  const [wordCountLimit, setWordCountLimit] = useState<number>(250);
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Context label for the pill
  const contextLabel = memberName || billNumber || 'NYS Votes';

  // Build context-specific system prompt
  const systemPrompt = memberName
    ? `${VOTES_SYSTEM_PROMPT}\n\nThe user is asking about ${memberName} (${memberParty || 'unknown party'})'s voting record.${memberVoteDetails ? `\n\nHere is their actual voting record:\n${memberVoteDetails}` : ''}\n\nProvide specific information about their voting patterns, party alignment, and notable votes. Use the vote data above when answering questions about specific bills they supported or opposed.`
    : billTitle
      ? `${VOTES_SYSTEM_PROMPT}\n\nThe user is asking about ${billNumber}: ${billTitle}${billResult ? `, which ${billResult}` : ''}.${billVoteDetails ? `\n\nHere are the actual roll call votes for this bill:\n${billVoteDetails}` : ''}\n\nProvide specific information about how members voted, whether it was party-line, and what the bill does. Use the vote data above when answering questions about who voted yes or no.`
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
            prompt: `${text} (limit response to approximately ${wordCountLimit} words)`,
            type: 'chat',
            stream: true,
            model: selectedModel,
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
                    <ChatResponseFooter
                      messageContent={
                        <div className="dark:prose-invert">
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
                      }
                      bills={[]}
                      sources={[]}
                      isStreaming={msg.isStreaming}
                      userMessage={messages[index - 1]?.role === 'user' ? messages[index - 1]?.content : undefined}
                      assistantMessageText={displayContent}
                      onSendMessage={sendMessage}
                      hideCreateExcerpt={false}
                    />
                  )}
                </div>
              );
            })}

          </div>
        </ScrollArea>

        {/* Enhanced Input area */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-background">
          <div className="border rounded-t-lg rounded-b-lg bg-background overflow-hidden">
            {/* Context Pill */}
            <div className="px-3 py-2 border-b bg-muted/30 rounded-t-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">
                  {contextLabel}
                </span>
              </div>
            </div>

            {/* Textarea */}
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What are you researching?"
              className="min-h-[60px] max-h-[120px] resize-none border-0 border-x border-transparent focus-visible:ring-0 focus-visible:border-x focus-visible:border-transparent rounded-none bg-background"
              rows={2}
              disabled={isLoading}
            />

            {/* Toolbar: model selector + word count + send/stop */}
            <div className="px-2 py-2 flex items-center justify-between border-t bg-background">
              <div className="flex items-center gap-1">
                {/* Model Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs px-2">
                      {selectedModel.startsWith("gpt") ? (
                        <OpenAIIcon className="h-3.5 w-3.5" />
                      ) : selectedModel.startsWith("claude") ? (
                        <ClaudeIcon className="h-3.5 w-3.5" />
                      ) : (
                        <PerplexityIcon className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {selectedModel === "gpt-4o" ? "GPT-4o" :
                         selectedModel === "gpt-4o-mini" ? "GPT-4o Mini" :
                         selectedModel === "gpt-4-turbo" ? "GPT-4 Turbo" :
                         selectedModel === "claude-sonnet-4-5-20250929" ? "Claude Sonnet" :
                         selectedModel === "claude-haiku-4-5-20251001" ? "Claude Haiku" :
                         selectedModel === "claude-opus-4-5-20251101" ? "Claude Opus" :
                         "Model"}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">OpenAI</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedModel("gpt-4o")} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <OpenAIIcon className="h-4 w-4" />
                        <span>GPT-4o</span>
                      </div>
                      {selectedModel === "gpt-4o" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedModel("gpt-4o-mini")} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <OpenAIIcon className="h-4 w-4" />
                        <span>GPT-4o Mini</span>
                      </div>
                      {selectedModel === "gpt-4o-mini" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedModel("gpt-4-turbo")} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <OpenAIIcon className="h-4 w-4" />
                        <span>GPT-4 Turbo</span>
                      </div>
                      {selectedModel === "gpt-4-turbo" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Anthropic</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedModel("claude-sonnet-4-5-20250929")} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ClaudeIcon className="h-4 w-4" />
                        <span>Claude Sonnet</span>
                      </div>
                      {selectedModel === "claude-sonnet-4-5-20250929" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedModel("claude-haiku-4-5-20251001")} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ClaudeIcon className="h-4 w-4" />
                        <span>Claude Haiku</span>
                      </div>
                      {selectedModel === "claude-haiku-4-5-20251001" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedModel("claude-opus-4-5-20251101")} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ClaudeIcon className="h-4 w-4" />
                        <span>Claude Opus</span>
                      </div>
                      {selectedModel === "claude-opus-4-5-20251101" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Word Count Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs px-2">
                      <span>{wordCountLimit} words</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setWordCountLimit(100)}>
                      100 words
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setWordCountLimit(250)}>
                      250 words
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setWordCountLimit(500)}>
                      500 words
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Send/Stop Button */}
              {isLoading ? (
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-7 w-7 rounded-full"
                  onClick={stopStream}
                >
                  <Square className="h-3 w-3 fill-current" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  className="h-7 w-7 rounded-full bg-foreground hover:bg-foreground/90 text-background"
                  disabled={!inputValue.trim()}
                  onClick={handleSend}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
