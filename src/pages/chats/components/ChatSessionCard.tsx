import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Heart, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ChatSession } from "../types";
import { ConversationView } from "./ConversationView";
import { parseMessages } from "../utils/messageParser";
import { getBillChamber } from "@/hooks/chat/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";

interface ChatSessionCardProps {
  session: ChatSession;
  onDelete: (sessionId: string) => void;
  onCopy: (text: string) => void;
  onFeedback: (type: "thumbs-up" | "thumbs-down") => void;
}

export const ChatSessionCard = ({
  session,
  onDelete,
  onCopy,
  onFeedback
}: ChatSessionCardProps) => {
  const messages = parseMessages(session.messages);
  const messageCount = messages.length;
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize favorites hook
  const { favoriteBillIds, toggleFavorite } = useFavorites();
  const isFavorited = session.bill_id ? favoriteBillIds.has(session.bill_id) : false;

  // Extract chamber information for bill sessions
  const getChamberInfo = () => {
    if (session.title.startsWith('Analysis:') && session.bill_id) {
      // Extract bill number from title (e.g., "Analysis: S1234" -> "S1234")
      const billNumber = session.title.replace('Analysis: ', '');
      const chamber = getBillChamber(billNumber);
      return chamber;
    }
    return null;
  };

  const chamberInfo = getChamberInfo();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session.bill_id) {
      toast({
        title: "Cannot favorite",
        description: "Only bill chat sessions can be favorited",
        variant: "destructive",
      });
      return;
    }

    try {
      await toggleFavorite(session.bill_id);
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Chat session removed from your favorites" : "Chat session added to your favorites",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{session.title}</CardTitle>
              {session.bill_id && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleFavorite}
                  className="h-auto p-1 hover:bg-transparent"
                  title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{format(new Date(session.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
              <span>{messageCount} messages</span>
              {chamberInfo && <span>{chamberInfo}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/c/${session.id}`)}
              className="hover:bg-accent"
              title="Continue conversation"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(session.id)}
              className="hover:bg-destructive hover:text-destructive-foreground"
              title="Delete chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="chat-content" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              View conversation
            </AccordionTrigger>
            <AccordionContent>
              <ConversationView
                messages={messages}
                onCopy={onCopy}
                onFeedback={onFeedback}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};