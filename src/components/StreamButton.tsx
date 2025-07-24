import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ScrollArea
} from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send,
  Smile,
  Paperclip,
  Hash,
  AtSign,
  MoreVertical,
  Pin,
  Star,
  Reply,
  Heart,
  Users,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreamMessage {
  id: string;
  user: {
    name: string;
    avatar: string;
    status: 'online' | 'away' | 'offline';
    role?: string;
  };
  content: string;
  timestamp: Date;
  type: 'message' | 'join' | 'leave' | 'system';
  reactions?: { emoji: string; count: number; users: string[] }[];
  isEdited?: boolean;
}

const StreamButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChannel, setCurrentChannel] = useState('general');
  const [notifications, setNotifications] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock messages for demonstration
  const [messages] = useState<StreamMessage[]>([
    {
      id: '1',
      user: {
        name: 'Sarah Wilson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        status: 'online',
        role: 'Moderator'
      },
      content: 'Good morning everyone! The new housing bill discussion is live. Feel free to join and share your thoughts.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: 'message'
    },
    {
      id: '2',
      user: {
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        status: 'online'
      },
      content: 'Thanks Sarah! I\'ve been following the amendments closely. The affordable housing provision looks promising.',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      type: 'message',
      reactions: [{ emoji: '👍', count: 3, users: ['Sarah Wilson', 'Mike Johnson', 'Emily Davis'] }]
    },
    {
      id: '3',
      user: {
        name: 'System',
        avatar: '',
        status: 'online'
      },
      content: 'Mike Johnson joined the channel',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      type: 'join'
    },
    {
      id: '4',
      user: {
        name: 'Mike Johnson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        status: 'online'
      },
      content: 'Hey everyone! Just caught up on the discussion. @Alex what\'s your take on the timeline for implementation?',
      timestamp: new Date(Date.now() - 1000 * 60 * 18),
      type: 'message'
    },
    {
      id: '5',
      user: {
        name: 'Emily Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
        status: 'away',
        role: 'Admin'
      },
      content: 'Great points everyone! I\'ve pinned the key resources in the #resources channel for reference.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      type: 'message',
      reactions: [
        { emoji: '📌', count: 2, users: ['Sarah Wilson', 'Mike Johnson'] },
        { emoji: '❤️', count: 1, users: ['Alex Chen'] }
      ]
    },
    {
      id: '6',
      user: {
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
        status: 'online'
      },
      content: 'This is incredibly helpful. The real-time collaboration features are making policy discussions so much more productive.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'message'
    }
  ]);

  const channels = [
    { name: 'general', unread: 3, active: true },
    { name: 'policy-discussion', unread: 1, active: false },
    { name: 'announcements', unread: 0, active: false },
    { name: 'resources', unread: 0, active: false },
    { name: 'feedback', unread: 2, active: false }
  ];

  const onlineUsers = [
    { name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face', status: 'online' },
    { name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face', status: 'online' },
    { name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face', status: 'online' },
    { name: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face', status: 'away' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // In a real app, this would send the message to the server
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const formatTimestamp = (date: Date) => {
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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="small-button relative h-9 w-9">
          <MessageCircle className="h-4 w-4" />
          {/* Notification indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">6</span>
          </div>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                {currentChannel}
              </SheetTitle>
              <SheetDescription>
                {onlineUsers.length} members online
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Pin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Star className="w-4 h-4" />
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

          {/* Channel Tabs */}
          <div className="flex gap-1 mt-3 overflow-x-auto">
            {channels.map((channel) => (
              <Button
                key={channel.name}
                variant={channel.name === currentChannel ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-1 shrink-0"
                onClick={() => setCurrentChannel(channel.name)}
              >
                <Hash className="w-3 h-3" />
                {channel.name}
                {channel.unread > 0 && (
                  <Badge variant="destructive" className="w-4 h-4 text-xs p-0 flex items-center justify-center">
                    {channel.unread}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </SheetHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="group">
                {message.type === 'join' || message.type === 'leave' || message.type === 'system' ? (
                  <div className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      {message.content}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex gap-3 hover:bg-muted/50 rounded-lg p-2 -mx-2">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.user.avatar} />
                        <AvatarFallback>{message.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                        getStatusColor(message.user.status)
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{message.user.name}</span>
                        {message.user.role && (
                          <Badge variant="outline" className="text-xs">
                            {message.user.role}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.isEdited && (
                          <span className="text-xs text-muted-foreground">(edited)</span>
                        )}
                      </div>
                      
                      <div className="text-sm text-foreground mb-2">
                        {message.content}
                      </div>

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {message.reactions.map((reaction, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs hover:bg-muted"
                            >
                              {reaction.emoji} {reaction.count}
                            </Button>
                          ))}
                        </div>
                      )}

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
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                Someone is typing...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Online Users Sidebar */}
        <div className="border-t border-l bg-muted/20 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Online ({onlineUsers.length})</span>
          </div>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div key={user.name} className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background",
                    getStatusColor(user.status)
                  )} />
                </div>
                <span className="text-xs text-muted-foreground truncate">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${currentChannel}`}
                  className="pr-20"
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
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <AtSign className="w-3 h-3" />
                <span>@mention users</span>
                <Hash className="w-3 h-3" />
                <span>#reference channels</span>
              </div>
              <span>Ctrl + Enter to send</span>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StreamButton;