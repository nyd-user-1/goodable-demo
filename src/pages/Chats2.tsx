import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MessageSquare, FileText, Users, Building2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useChatSessions } from '@/pages/chats/hooks/useChatSessions';
import { ChatSession } from '@/pages/chats/types';

type ChatType = 'all' | 'bill' | 'member' | 'committee' | 'general';

const Chats2 = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const { chatSessions, loading, deleteSession } = useChatSessions();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ChatType>('all');

  // Focus search on mount and keyboard shortcut
  useEffect(() => {
    searchInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine chat type
  const getChatType = (session: ChatSession): ChatType => {
    if (session.bill_id) return 'bill';
    if (session.member_id) return 'member';
    if (session.committee_id) return 'committee';
    return 'general';
  };

  // Filter chats based on search and type
  const filteredChats = chatSessions.filter((session) => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase());
    const chatType = getChatType(session);
    const matchesType = typeFilter === 'all' || chatType === typeFilter;
    return matchesSearch && matchesType;
  });

  // Navigate to chat
  const handleChatClick = (session: ChatSession) => {
    navigate(`/c/${session.id}`);
  };

  // Delete chat with confirmation
  const handleDeleteClick = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete);
    }
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
  };

  const hasActiveFilters = searchTerm || typeFilter !== 'all';

  // Get counts by type
  const typeCounts = {
    all: chatSessions.length,
    bill: chatSessions.filter(s => s.bill_id).length,
    member: chatSessions.filter(s => s.member_id).length,
    committee: chatSessions.filter(s => s.committee_id).length,
    general: chatSessions.filter(s => !s.bill_id && !s.member_id && !s.committee_id).length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Title and stats */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">Chat History</h1>
                <p className="text-sm text-muted-foreground">
                  {loading
                    ? 'Loading...'
                    : `Showing ${filteredChats.length.toLocaleString()} of ${chatSessions.length.toLocaleString()} conversations`
                  }
                </p>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search chats by title... (press / to focus)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-12 text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ChatType)}>
                <SelectTrigger className="w-[200px]">
                  <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types ({typeCounts.all})</SelectItem>
                  <SelectItem value="bill">Bills ({typeCounts.bill})</SelectItem>
                  <SelectItem value="member">Members ({typeCounts.member})</SelectItem>
                  <SelectItem value="committee">Committees ({typeCounts.committee})</SelectItem>
                  <SelectItem value="general">General ({typeCounts.general})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results - Grid */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted/30 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No chats found matching your criteria.</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChats.map((session) => (
              <ChatCard
                key={session.id}
                session={session}
                onClick={() => handleChatClick(session)}
                onDeleteClick={(e) => handleDeleteClick(session.id, e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Chat card component
interface ChatCardProps {
  session: ChatSession;
  onClick: () => void;
  onDeleteClick: (e: React.MouseEvent) => void;
}

function ChatCard({ session, onClick, onDeleteClick }: ChatCardProps) {
  // Determine chat type and icon
  const getChatTypeInfo = () => {
    if (session.bill_id) return { type: 'Bill', icon: FileText, color: 'text-blue-500' };
    if (session.member_id) return { type: 'Member', icon: Users, color: 'text-green-500' };
    if (session.committee_id) return { type: 'Committee', icon: Building2, color: 'text-purple-500' };
    return { type: 'General', icon: MessageSquare, color: 'text-muted-foreground' };
  };

  const typeInfo = getChatTypeInfo();
  const TypeIcon = typeInfo.icon;

  // Get message count from messages JSON
  const messages = session.messages as unknown as Array<{ role: string; content: string }>;
  const messageCount = Array.isArray(messages) ? messages.length : 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get preview from first user message
  const getPreview = () => {
    if (Array.isArray(messages) && messages.length > 0) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      if (firstUserMsg?.content) {
        const preview = firstUserMsg.content.substring(0, 100);
        return preview.length < firstUserMsg.content.length ? `${preview}...` : preview;
      }
    }
    return 'No messages yet';
  };

  return (
    <div
      onClick={onClick}
      className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-start gap-3 mb-3">
        <TypeIcon className={`h-5 w-5 mt-0.5 ${typeInfo.color}`} />
        <h3 className="font-semibold text-base flex-1 line-clamp-2">
          {session.title}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {getPreview()}
      </p>

      {/* Details and button - render on hover */}
      <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
        {/* Chat details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
          <div>
            <span className="text-muted-foreground">Type</span>
            <p className="font-medium">{typeInfo.type}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Messages</span>
            <p className="font-medium">{messageCount}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Last Updated</span>
            <p className="font-medium">{formatDate(session.updated_at)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Created</span>
            <p className="font-medium">{formatDate(session.created_at)}</p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onDeleteClick}
                  className="w-10 h-10 bg-destructive/10 text-destructive rounded-full flex items-center justify-center hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

export default Chats2;
