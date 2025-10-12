import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, MessageSquare, FileText, Users, Building2, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchChats, SearchableChat } from "@/hooks/useSearchChats";
import { cn } from "@/lib/utils";

interface SearchChatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getChatIcon = (type: SearchableChat["type"]) => {
  switch (type) {
    case "problem":
      return Target;
    case "bill":
      return FileText;
    case "member":
      return Users;
    case "committee":
      return Building2;
    default:
      return MessageSquare;
  }
};

const getChatTypeLabel = (type: SearchableChat["type"]) => {
  switch (type) {
    case "problem":
      return "Problem";
    case "bill":
      return "Bill";
    case "member":
      return "Member";
    case "committee":
      return "Committee";
    default:
      return "Chat";
  }
};

export function SearchChatsModal({ open, onOpenChange }: SearchChatsModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { filteredChats, searchQuery, setSearchQuery, loading } = useSearchChats();

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      // Close on Escape
      if (e.key === "Escape") {
        onOpenChange(false);
      }

      // Navigate to first result on Enter
      if (e.key === "Enter" && filteredChats.length > 0) {
        handleChatClick(filteredChats[0]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredChats]);

  const handleChatClick = (chat: SearchableChat) => {
    navigate(chat.url);
    onOpenChange(false);
    setSearchQuery("");
  };

  const handleNewChat = () => {
    navigate("/chats");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2 border-b">
          <DialogTitle className="text-base font-medium">Search past conversations</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search past conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 py-2 border-b bg-muted/30">
          <Button
            variant="ghost"
            onClick={handleNewChat}
            className="w-full justify-start h-auto py-2 px-3 hover:bg-accent"
          >
            <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">New chat</span>
          </Button>
        </div>

        {/* Chat History Search */}
        <div className="px-4 py-2">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Chat History Search</h3>
        </div>

        {/* Results List */}
        <ScrollArea className="max-h-[400px] px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading chats...</div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No chats found" : "No chat history yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => {
                const Icon = getChatIcon(chat.type);
                return (
                  <button
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg text-left",
                      "hover:bg-accent transition-colors group"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{chat.title}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0 px-1.5 py-0.5 bg-muted rounded">
                          {getChatTypeLabel(chat.type)}
                        </span>
                      </div>
                      {chat.preview && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {chat.preview}
                          {chat.preview.length >= 100 && "..."}
                        </p>
                      )}
                      {chat.created_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(chat.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">↑↓</kbd> to navigate{" "}
            <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">Enter</kbd> to select{" "}
            <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">Esc</kbd> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
