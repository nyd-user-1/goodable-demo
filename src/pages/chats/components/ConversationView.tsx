import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { Message } from "../types";

interface ConversationViewProps {
  messages: Message[];
  onCopy: (text: string) => void;
  onFeedback: (type: "thumbs-up" | "thumbs-down") => void;
  onSendPrompt?: (prompt: string) => void;
}

export const ConversationView = ({ messages, onCopy, onFeedback, onSendPrompt }: ConversationViewProps) => {
  return (
    <ScrollArea className="h-[300px] sm:h-[400px] w-full rounded-md border p-2 sm:p-4">
      <div className="space-y-4">
        {messages.map((message, index) => {
          // Check if this is the first assistant message
          const assistantMessageIndex = messages.filter((m, i) => i <= index && m.role === 'assistant').length;
          const isFirstAssistantMessage = message.role === 'assistant' && assistantMessageIndex === 1;
          
          return (
            <MessageBubble
              key={index}
              message={message}
              onCopy={onCopy}
              onFeedback={onFeedback}
              onSendPrompt={onSendPrompt}
              isFirstAssistantMessage={isFirstAssistantMessage}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};