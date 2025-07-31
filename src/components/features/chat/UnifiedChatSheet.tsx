import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Send, Paperclip, ThumbsUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  streamedContent?: string;
}

interface UnifiedChatSheetProps {
  chatType: 'bill' | 'member' | 'committee' | 'problem';
  relatedId: string | number;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UnifiedChatSheet({ 
  chatType, 
  relatedId, 
  title, 
  subtitle,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: UnifiedChatSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load existing chat when sheet opens
  useEffect(() => {
    if (open && user) {
      loadExistingChat();
    }
  }, [open, user, chatType, relatedId]);

  const loadExistingChat = async () => {
    try {
      // Build the query based on chat type
      let query = supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('chat_type', chatType);

      // Add specific filtering based on chat type
      if (chatType === 'bill') {
        query = query.eq('bill_id', relatedId);
      } else if (chatType === 'member') {
        query = query.eq('member_id', relatedId);
      } else if (chatType === 'committee') {
        query = query.eq('committee_id', relatedId);
      } else if (chatType === 'problem') {
        query = query.eq('problem_id', relatedId);
      }

      const { data, error } = await query.single();

      if (data && !error) {
        setChatSessionId(data.id);
        setMessages(data.messages || []);
      } else {
        // Create new chat session
        await createNewChatSession();
      }
    } catch (err) {
      console.error('Error loading chat:', err);
      await createNewChatSession();
    }
  };


  const createNewChatSession = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const sessionData: any = {
        user_id: user.id,
        title: `Chat about ${title}`,
        messages: [],
        chat_type: chatType,
      };

      // Set the appropriate related ID based on chat type
      if (chatType === 'bill') {
        sessionData.bill_id = Number(relatedId);
      } else if (chatType === 'member') {
        sessionData.member_id = Number(relatedId);
      } else if (chatType === 'committee') {
        sessionData.committee_id = Number(relatedId);
      } else if (chatType === 'problem') {
        sessionData.problem_id = String(relatedId);
      }

      console.log('Creating chat session with data:', sessionData);

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Chat session created:', data);
      setChatSessionId(data.id);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: getWelcomeMessage(),
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (err) {
      console.error('Error creating chat session:', err);
      toast({
        title: 'Error',
        description: `Failed to start chat session: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const getWelcomeMessage = () => {
    switch (chatType) {
      case 'bill':
        return `Hi! I'm here to help you understand this bill. Ask me anything about its content, implications, or legislative process.`;
      case 'member':
        return `Hello! I can help you learn about this legislator's positions, voting record, and how to engage with their office.`;
      case 'committee':
        return `Hi there! I can provide insights about this committee's role, current bills, and how the legislative process works here.`;
      case 'problem':
        return `Hey! What's your problem? 🤔 Tell me what's bothering you, what challenge you're facing, or what issue needs solving. I'm here to help you think through it!`;
      default:
        return `Hello! How can I help you today?`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatSessionId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Generate AI response
      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: {
          prompt: inputValue,
          type: chatType,
          context: {
            chatType,
            relatedId,
            title,
            previousMessages: messages.slice(-5) // Last 5 messages for context
          }
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: data.generatedText || 'I apologize, but I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);

      // Save to database
      await supabase
        .from('chat_sessions')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatSessionId);

    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <SheetTrigger asChild>
          {children || (
            <Button size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Chat
            </Button>
          )}
        </SheetTrigger>
      )}
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/goodable%20pwa.jpg" alt="Goodable Assistant" />
              <AvatarFallback className="bg-red-50">❤️</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-semibold">Goodable.dev</div>
              <div className="text-sm text-muted-foreground">
                {subtitle || `Chat about ${title}`}
              </div>
            </div>
            <Badge variant="outline" className="ml-auto">
              <span className="mr-2 h-2 w-2 rounded-full bg-green-500 shadow-green-500/50 shadow-md animate-pulse"></span>
              Live
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                )}
              >
                {message.sender === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>
                      {message.isStreaming ? message.streamedContent || '' : message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
                <div
                  className={cn(
                    "mt-1 flex items-center gap-2 text-xs",
                    message.sender === "user"
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
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

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg rounded-bl-none p-3">
                <div className="flex items-center space-x-2">
                  <span>❤️</span>
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

        {/* Input */}
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
              placeholder="Type your message..."
              className="flex-grow"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || loading}
              className="rounded-full"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}