import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Send,
  Users,
  Hash,
  Smile,
  Paperclip,
  MoreVertical,
  Heart,
  Reply,
  Pin,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Problem } from '@/data/problems';

interface CollabMessage {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  created_at: string;
  is_edited: boolean;
  type: 'message' | 'join' | 'leave' | 'system';
  reactions?: { emoji: string; count: number; users: string[] }[];
}

interface ProblemCollabStreamProps {
  problem: Problem;
}

export const ProblemCollabStream = ({ problem }: ProblemCollabStreamProps) => {
  const { user } = useAuth();
  const { profile: currentUserProfile } = useCurrentUserProfile();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CollabMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`problem-${problem.id}-chat`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'problem_chat_messages',
          filter: `problem_id=eq.${problem.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          loadMessages(); // Reload to get author info
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [problem.id]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      // Create a chat room for this problem if it doesn't exist
      await ensureChatRoom();
      
      // Load messages with author information
      const { data, error } = await (supabase as any)
        .from('problem_chat_messages')
        .select(`
          id,
          content,
          author_id,
          created_at,
          is_edited,
          type,
          profiles!problem_chat_messages_author_id_fkey (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('problem_id', problem.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        // Create table if it doesn't exist
        await createChatTables();
        return;
      }

      const formattedMessages: CollabMessage[] = (data || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        author_id: msg.author_id,
        author_name: msg.profiles?.display_name || msg.profiles?.username || 'Unknown User',
        author_avatar: msg.profiles?.avatar_url,
        created_at: msg.created_at,
        is_edited: msg.is_edited || false,
        type: msg.type || 'message'
      }));

      setMessages(formattedMessages);
      
      // Simulate online users (in real app, this would be actual presence)
      setOnlineUsers([
        {
          id: 'current',
          name: currentUserProfile?.display_name || currentUserProfile?.username || 'You',
          avatar: currentUserProfile?.avatar_url,
          status: 'online'
        },
        {
          id: '1',
          name: 'Sarah Wilson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
          status: 'online'
        },
        {
          id: '2',
          name: 'Alex Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
          status: 'online'
        }
      ]);

    } catch (error) {
      console.error('Error in loadMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChatTables = async () => {
    try {
      // Create the chat messages table via SQL
      const { error } = await (supabase as any).rpc('create_problem_chat_tables');
      
      if (error) {
        console.error('Error creating chat tables:', error);
        // Fall back to manual table creation
        await (supabase as any)
          .from('problem_chat_messages')
          .insert({
            id: 'temp-id',
            problem_id: problem.id,
            author_id: user?.id || 'system',
            content: 'Chat room initialized',
            type: 'system'
          });
      }
    } catch (error) {
      console.error('Error setting up chat infrastructure:', error);
    }
  };

  const ensureChatRoom = async () => {
    try {
      // Check if chat room exists, if not create it
      const { data: existing } = await (supabase as any)
        .from('problem_chat_rooms')
        .select('id')
        .eq('problem_id', problem.id)
        .single();

      if (!existing) {
        await (supabase as any)
          .from('problem_chat_rooms')
          .insert({
            problem_id: problem.id,
            name: `${problem.title} Discussion`,
            description: `Collaborative discussion for ${problem.title}`
          });
      }
    } catch (error) {
      console.error('Error ensuring chat room:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const { error } = await (supabase as any)
        .from('problem_chat_messages')
        .insert({
          problem_id: problem.id,
          author_id: user.id,
          content: newMessage.trim(),
          type: 'message'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setNewMessage('');
      toast({
        title: "Message sent",
        description: "Your message has been posted to the collaboration stream.",
      });

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Join the Collaboration</h3>
            <p className="text-muted-foreground mb-4">
              Sign in to participate in the collaborative discussion about this problem.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In to Collaborate
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                {problem.title} Discussion
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {onlineUsers.length} collaborators online
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Pin className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8"
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Collaborative Stream</h3>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className="group">
                      {message.type === 'system' ? (
                        <div className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {message.content}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex gap-3 hover:bg-muted/50 rounded-lg p-2 -mx-2">
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={message.author_avatar || undefined} />
                              <AvatarFallback>
                                {message.author_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background bg-green-500" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{message.author_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(message.created_at)}
                              </span>
                              {message.is_edited && (
                                <span className="text-xs text-muted-foreground">(edited)</span>
                              )}
                            </div>
                            
                            <div className="text-sm text-foreground mb-2">
                              {message.content}
                            </div>

                            {/* Message Actions (shown on hover) */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Reply className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Heart className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Smile className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Start the Discussion</h3>
                    <p className="text-muted-foreground">
                      Be the first to share your thoughts on {problem.title}.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Share your thoughts on ${problem.title}...`}
                      className="pr-20"
                      disabled={sending}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button type="button" variant="ghost" size="icon" className="w-6 h-6">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="w-6 h-6">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3" />
                    <span>Real-time collaboration</span>
                  </div>
                  <span>Press Enter to send</span>
                </div>
              </form>
            </div>
          </Card>
        </div>

        {/* Online Users Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4" />
                Online ({onlineUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background ${getStatusColor(user.status)}`} />
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{user.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};