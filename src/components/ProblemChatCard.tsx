
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Heart } from "lucide-react";
import { format } from "date-fns";
import { ProblemChat } from "@/hooks/useProblemChats";
import { ConversationView } from "@/pages/chats/components/ConversationView";
import { Message } from "@/pages/chats/types";
import { useToast } from "@/hooks/use-toast";

interface ProblemChatCardProps {
  problemChat: ProblemChat;
  onDelete: (chatId: string) => void;
  onCopy: (text: string) => void;
  onFeedback: (type: "thumbs-up" | "thumbs-down") => void;
}

export const ProblemChatCard = ({
  problemChat,
  onDelete,
  onCopy,
  onFeedback,
}: ProblemChatCardProps) => {
  const { toast } = useToast();
  
  // Placeholder for problem favorites (since no problem favorites system exists yet)
  const [isFavorited, setIsFavorited] = useState(false);

  // Parse the current_state to get messages
  const parseCurrentState = (): Message[] => {
    try {
      // If current_state is a JSON string (array of messages), parse it
      if (typeof problemChat.current_state === 'string' && problemChat.current_state.startsWith('[')) {
        const parsedMessages = JSON.parse(problemChat.current_state);
        if (Array.isArray(parsedMessages)) {
          return parsedMessages.map((msg: any) => ({
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp || new Date().toISOString()
          }));
        }
      }
      
      // If current_state is just the AI response string, create the conversation
      const messages: Message[] = [
        {
          id: 'user-problem',
          role: 'user' as const,
          content: problemChat.problem_statement,
          timestamp: problemChat.created_at
        }
      ];

      // Add AI response if it exists and is not a draft state
      if (problemChat.current_state && 
          problemChat.current_state !== 'draft' && 
          problemChat.current_state !== 'generating' &&
          !problemChat.current_state.startsWith('[')) {
        messages.push({
          id: 'ai-analysis',
          role: 'assistant' as const,
          content: problemChat.current_state,
          timestamp: problemChat.updated_at
        });
      }

      return messages;
    } catch (error) {
      // Fallback to just the problem statement
      return [
        {
          id: 'user-problem',
          role: 'user' as const,
          content: problemChat.problem_statement,
          timestamp: problemChat.created_at
        }
      ];
    }
  };

  const messages = parseCurrentState();
  const messageCount = messages.length;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // For now, just toggle local state until problem favorites system is implemented
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited ? "Problem removed from your favorites" : "Problem added to your favorites",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{problemChat.title}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFavorite}
                className="h-auto p-1 hover:bg-transparent"
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{format(new Date(problemChat.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
              <span>{messageCount} messages</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(problemChat.id)}
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="problem-content" className="border-none">
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
