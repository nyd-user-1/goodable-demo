
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  placeholder?: string;
  onStop?: () => void;
}

export const ChatInput = ({
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
  placeholder = "Ask about this legislation...",
  onStop
}: ChatInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        onSendMessage();
      }
    }
  };

  const handleButtonClick = () => {
    if (isLoading && onStop) {
      onStop();
    } else {
      onSendMessage();
    }
  };

  return (
    <div className="chat-input-container flex-shrink-0 space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleButtonClick}
          disabled={!isLoading && !inputValue.trim()}
          size="icon"
          variant={isLoading ? "destructive" : "default"}
        >
          {isLoading ? (
            <Square className="w-4 h-4" fill="currentColor" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
