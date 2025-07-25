import React, { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChatMessages } from "@/components/features/chat/ChatMessages";
import { ChatInput } from "@/components/features/chat/ChatInput";
import { ChatContainer } from "@/components/features/chat/ChatContainer";
import { useChatLogic } from "@/hooks/useChatLogic";
import { Problem } from "@/data/problems";

interface PolicyProblemData {
  Title: string;
  'Why This Matters Now': string;
  "What We're Seeing": string;
  'The Real Challenge': string;
  'The Path Forward': string;
  'Your Role': string;
}

interface ProblemAIChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problem: Problem;
  policyData: PolicyProblemData | null;
  initialPrompt?: string;
}

export const ProblemAIChatSheet = ({ 
  open, 
  onOpenChange, 
  problem, 
  policyData,
  initialPrompt 
}: ProblemAIChatSheetProps) => {
  const { toast } = useToast();
  const hasInitialized = useRef(false);
  const hasExecutedInitialPrompt = useRef(false);
  
  // Create a problem entity that includes policy data
  const problemEntity = {
    ...problem,
    policyData: policyData
  };
  
  const {
    inputValue,
    setInputValue,
    isLoading,
    messages,
    citations,
    sendMessage,
    handleShareChat,
    getTitle,
    initializeSession
  } = useChatLogic(problemEntity, 'problem');

  // Initialize session when sheet opens
  useEffect(() => {
    if (open && problem && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeSession(true);
    }
    
    // Reset when sheet closes
    if (!open) {
      hasInitialized.current = false;
      hasExecutedInitialPrompt.current = false;
    }
  }, [open, problem, initializeSession]);

  // Execute initial prompt after initialization
  useEffect(() => {
    if (open && initialPrompt && !hasExecutedInitialPrompt.current && messages.length === 0 && !isLoading) {
      hasExecutedInitialPrompt.current = true;
      // Small delay to ensure UI is ready
      setTimeout(() => {
        sendMessage(initialPrompt);
      }, 100);
    }
  }, [open, initialPrompt, messages.length, isLoading, sendMessage]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  const handlePromptClick = (label: string, content: string) => {
    sendMessage(content);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied to clipboard.",
    });
  };

  const handleFeedback = (type: "thumbs-up" | "thumbs-down" | "citations") => {
    toast({
      title: "Feedback received",
      description: `Thank you for your ${type} feedback!`,
    });
  };

  // Generate suggested prompts from policy data
  const generateSuggestedPrompts = () => {
    if (!policyData) return [];
    
    const prompts = [
      {
        label: "Why This Matters Now",
        content: policyData['Why This Matters Now'],
        colorClass: "bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950/20 dark:hover:bg-red-950/30 dark:border-red-900/50"
      },
      {
        label: "What We're Seeing",
        content: policyData["What We're Seeing"],
        colorClass: "bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 dark:border-blue-900/50"
      },
      {
        label: "The Real Challenge",
        content: policyData['The Real Challenge'],
        colorClass: "bg-orange-50 hover:bg-orange-100 border-orange-200 dark:bg-orange-950/20 dark:hover:bg-orange-950/30 dark:border-orange-900/50"
      },
      {
        label: "The Path Forward",
        content: policyData['The Path Forward'],
        colorClass: "bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-950/20 dark:hover:bg-green-950/30 dark:border-green-900/50"
      },
      {
        label: "Your Role",
        content: policyData['Your Role'],
        colorClass: "bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950/20 dark:hover:bg-purple-950/30 dark:border-purple-900/50"
      }
    ];
    
    return prompts.map(prompt => ({
      ...prompt,
      // Truncate label for display (40 chars max)
      displayLabel: prompt.content.length > 40 
        ? `${prompt.label}: ${prompt.content.substring(0, 40)}...`
        : `${prompt.label}: ${prompt.content}`
    }));
  };

  const suggestedPrompts = generateSuggestedPrompts();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>AI Analysis: {problem.title}</SheetTitle>
        </SheetHeader>

        <ChatContainer>
          {/* Dynamic Suggested Prompts - Show only when no messages */}
          {messages.length === 0 && !isLoading && suggestedPrompts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Policy Analysis Sections:</h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    className={`h-auto py-3 px-4 text-left whitespace-normal min-w-[200px] max-w-[250px] flex-shrink-0 leading-tight text-sm rounded-md transition-colors ${prompt.colorClass} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => !isLoading && handlePromptClick(prompt.label, prompt.content)}
                    disabled={isLoading}
                  >
                    {prompt.displayLabel}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            onCopy={handleCopy}
            onShare={handleShareChat}
            onSendPrompt={sendMessage}
            entity={problemEntity}
            entityType="problem"
            onFeedback={handleFeedback}
          />

          {/* Input Area */}
          <ChatInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </ChatContainer>
      </SheetContent>
    </Sheet>
  );
};