import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Eye, FileText, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: "draft_updated" | "co_author_invited" | "co_author_joined" | "draft_shared";
  title: string;
  message: string;
  draftId?: string;
  draftTitle?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface CoAuthorNotificationsProps {
  userId: string;
}

export const CoAuthorNotifications = ({ userId }: CoAuthorNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // In a real implementation, you would:
    // 1. Fetch notifications from the database
    // 2. Set up real-time subscriptions for new notifications
    // 3. Handle notification state management
    
    // For now, we'll create some mock notifications
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "co_author_invited",
        title: "Co-Author Invitation",
        message: "You've been invited to collaborate on 'Climate Action Bill'",
        draftId: "draft-1",
        draftTitle: "Climate Action Bill",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        actionUrl: "/drafts/draft-1"
      },
      {
        id: "2",
        type: "draft_updated",
        title: "Draft Updated",
        message: "John Doe made changes to 'Healthcare Reform Act'",
        draftId: "draft-2",
        draftTitle: "Healthcare Reform Act",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        actionUrl: "/drafts/draft-2"
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      // In a real implementation, update the database
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      // In a real implementation, update the database
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "draft_updated": return FileText;
      case "co_author_invited": return Users;
      case "co_author_joined": return Users;
      case "draft_shared": return Eye;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "draft_updated": return "default";
      case "co_author_invited": return "secondary";
      case "co_author_joined": return "default";
      case "draft_shared": return "outline";
      default: return "outline";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Notifications
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-6 px-2"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer ${
                          !notification.read ? "bg-primary/5 border-l-2 border-l-primary" : ""
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                          if (notification.actionUrl) {
                            // Navigate to the URL
                            window.location.href = notification.actionUrl;
                          }
                        }}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium truncate">
                              {notification.title}
                            </p>
                            <Badge variant={getTypeColor(notification.type)} className="text-xs ml-2">
                              {notification.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};