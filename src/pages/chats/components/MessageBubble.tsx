import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, BookOpen, MessageSquareMore, PictureInPicture } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Message } from "../types";
import { ContextBuilder } from "@/utils/contextBuilder";
import { useNavigate } from "react-router-dom";

interface MessageBubbleProps {
  message: Message & { isStreaming?: boolean };
  onCopy: (text: string) => void;
  onFeedback: (type: "thumbs-up" | "thumbs-down" | "citations") => void;
  onShare?: () => void;
  onSendPrompt?: (prompt: string) => void;
  entity?: any;
  entityType?: 'bill' | 'member' | 'committee' | 'problem' | null;
  isFirstAssistantMessage?: boolean;
  hasYesNoButtons?: boolean;
}

export const MessageBubble = ({ 
  message, 
  onCopy, 
  onFeedback, 
  onShare, 
  onSendPrompt,
  entity,
  entityType,
  isFirstAssistantMessage = false,
  hasYesNoButtons = false
}: MessageBubbleProps) => {
  const navigate = useNavigate();
  
  // Check if message contains a question (AI asking user something)
  const containsQuestion = message.role === "assistant" && message.content.includes("?");
  
  // Extract the last question from the message
  const extractLastQuestion = (content: string): string => {
    const sentences = content.split(/[.!?]+/);
    const questions = sentences.filter(sentence => sentence.trim().endsWith("?") || sentence.includes("?"));
    return questions.length > 0 ? questions[questions.length - 1].trim() + "?" : "";
  };
  
  const handleRepeatQuestion = () => {
    const question = extractLastQuestion(message.content);
    if (question && onSendPrompt) {
      onSendPrompt(question);
    }
  };
  
  const handleMoveToPortal = () => {
    // Navigate to policy portal - in the future this could also transfer the chat context
    navigate("/policy-portal");
  };
  
  const handleYesNoClick = (response: 'yes' | 'no') => {
    if (onSendPrompt) {
      onSendPrompt(response);
    }
  };
  
  // Generate dynamic prompts based on AI content for subsequent messages
  const getDynamicPrompts = () => {
    if (isFirstAssistantMessage) {
      return ContextBuilder.generateDynamicPrompts(entity, entityType);
    }
    
    // For subsequent messages, generate prompts based on the AI response content
    return generateResponseBasedPrompts(message.content);
  };
  
  // Generate prompts based on AI response content
  const generateResponseBasedPrompts = (content: string): string[] => {
    const prompts = [];
    
    // Extract key topics from the AI response
    if (content.toLowerCase().includes('bill') || content.toLowerCase().includes('legislation')) {
      prompts.push("Show me similar bills");
      prompts.push("What's the voting record?");
    }
    
    if (content.toLowerCase().includes('committee') || content.toLowerCase().includes('hearing')) {
      prompts.push("Committee schedule");
      prompts.push("Meeting minutes");
    }
    
    if (content.toLowerCase().includes('sponsor') || content.toLowerCase().includes('author')) {
      prompts.push("Sponsor background");
      prompts.push("Other bills by sponsor");
    }
    
    if (content.toLowerCase().includes('impact') || content.toLowerCase().includes('effect')) {
      prompts.push("Economic impact");
      prompts.push("Implementation timeline");
    }
    
    if (content.toLowerCase().includes('vote') || content.toLowerCase().includes('voting')) {
      prompts.push("Voting history");
      prompts.push("Party positions");
    }
    
    // Add some generic follow-up prompts if we didn't find specific topics
    if (prompts.length === 0) {
      prompts.push("Tell me more");
      prompts.push("What are the details?");
      prompts.push("How does this work?");
    }
    
    // Always add these common follow-ups
    prompts.push("Sources and citations");
    prompts.push("Related information");
    
    return prompts.slice(0, 6); // Limit to 6 prompts
  };

  return (
    <div className="message-bubble-container space-y-2 min-w-0">
      <div
        className={`flex min-w-0 ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`rounded-lg p-3 relative ${
            message.role === "user"
              ? "bg-slate-800 text-white max-w-[75%] ml-auto mr-4"
              : "bg-muted max-w-[75%] ml-4 mr-4"
          }`}
          style={{ 
            maxWidth: '75%', 
            wordWrap: 'break-word', 
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            overflow: 'hidden'
          }}
        >
          {/* Copy button in top right for assistant messages */}
          {message.role === "assistant" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(message.content)}
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-60 hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          
          {message.role === "assistant" ? (
            <div
              className="chat-markdown-content text-sm prose prose-sm dark:prose-invert max-w-full pr-8 pb-8"
              style={{
                maxWidth: '100%',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word'
              }}
            >
              <ReactMarkdown 
                components={{
                  p: ({ children }) => <p style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}>{children}</p>,
                  li: ({ children }) => <li style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}>{children}</li>,
                  div: ({ children }) => <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}>{children}</div>
                }}
              >
                {message.content}
              </ReactMarkdown>
              {/* Add streaming cursor like FeatureChat */}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1">|</span>
              )}
            </div>
          ) : (
            <p 
              className="chat-text-content text-sm whitespace-pre-wrap"
              style={{ 
                wordWrap: 'break-word', 
                overflowWrap: 'break-word', 
                wordBreak: 'break-word',
                maxWidth: '100%'
              }}
            >
              {message.content}
            </p>
          )}
          {message.timestamp && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs opacity-70">
                {format(new Date(message.timestamp), "h:mm a")}
              </p>
              {message.role === "assistant" && hasYesNoButtons && (
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleYesNoClick('yes')}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => handleYesNoClick('no')}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Bottom right action buttons for assistant messages */}
          {message.role === "assistant" && (
            <div className="message-actions absolute bottom-2 right-2 flex gap-1">
              {containsQuestion && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRepeatQuestion}
                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                  title="Repeat question"
                >
                  <MessageSquareMore className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMoveToPortal}
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                title="Move to Policy Portal"
              >
                <PictureInPicture className="h-3 w-3" />
              </Button>
              {onShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShare}
                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                  title="Share"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {message.role === "assistant" && (
        <div className="space-y-2">
          {/* Dynamic suggested prompts with horizontal scrolling */}
          <div className="prompt-scroll-container flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {getDynamicPrompts().map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="suggested-prompt-button h-7 px-3 text-xs whitespace-nowrap flex-shrink-0"
                onClick={() => onSendPrompt?.(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
          
          {/* Action buttons (only citations, share moved to bottom right of message) */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback("citations")}
              className="h-8 px-2"
            >
              <BookOpen className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};