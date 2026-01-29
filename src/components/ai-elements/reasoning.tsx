"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Brain } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Context for sharing reasoning state
interface ReasoningContextType {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number | undefined;
}

const ReasoningContext = createContext<ReasoningContextType | null>(null);

export function useReasoning() {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning");
  }
  return context;
}

// Main container
interface ReasoningProps {
  children: ReactNode;
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
  className?: string;
}

export function Reasoning({
  children,
  isStreaming = false,
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  duration,
  className
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [streamingDuration, setStreamingDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setInternalOpen(open);
    }
    onOpenChange?.(open);
  };

  // Track streaming duration
  useEffect(() => {
    if (isStreaming && !startTime) {
      setStartTime(Date.now());
      setIsOpen(true);
    } else if (!isStreaming && startTime) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setStreamingDuration(elapsed);
      setStartTime(null);
      // Auto-close after streaming ends
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, startTime]);

  // Update duration while streaming
  useEffect(() => {
    if (!isStreaming || !startTime) return;

    const interval = setInterval(() => {
      setStreamingDuration(Math.round((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, startTime]);

  const finalDuration = duration ?? streamingDuration;

  return (
    <ReasoningContext.Provider value={{ isStreaming, isOpen, setIsOpen, duration: finalDuration }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
        {children}
      </Collapsible>
    </ReasoningContext.Provider>
  );
}

// Header/trigger with "Thought for X seconds" display
interface ReasoningTriggerProps extends React.ComponentProps<typeof CollapsibleTrigger> {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
  showChevron?: boolean;
}

export function ReasoningTrigger({ className, getThinkingMessage, showChevron = true, ...props }: ReasoningTriggerProps) {
  const { isStreaming, isOpen, duration } = useReasoning();

  const defaultMessage = () => {
    if (isStreaming) {
      return (
        <span className="flex items-center gap-1.5">
          <span>Thinking</span>
          <span className="inline-flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </span>
      );
    }
    if (duration && duration > 0) {
      return `Thought for ${duration} second${duration !== 1 ? 's' : ''}`;
    }
    return "Thinking";
  };

  const message = getThinkingMessage ? getThinkingMessage(isStreaming, duration) : defaultMessage();

  // If no chevron needed, just render a simple div (not clickable)
  if (!showChevron) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 w-full py-2",
          "text-sm text-muted-foreground",
          className
        )}
      >
        <Brain className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left">{message}</span>
      </div>
    );
  }

  return (
    <CollapsibleTrigger
      className={cn(
        "flex items-center gap-2 w-full py-2",
        "text-sm text-muted-foreground hover:text-foreground",
        "transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      <Brain className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 text-left">{message}</span>
      <ChevronDown
        className={cn(
          "h-4 w-4 flex-shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </CollapsibleTrigger>
  );
}

// Content area
interface ReasoningContentProps extends React.ComponentProps<typeof CollapsibleContent> {
  children: ReactNode;
}

export function ReasoningContent({ children, className, ...props }: ReasoningContentProps) {
  const { isStreaming } = useReasoning();

  return (
    <CollapsibleContent {...props}>
      <div className={cn(
        "pt-2 pb-3 text-sm text-muted-foreground leading-relaxed",
        className
      )}>
        {children}
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </CollapsibleContent>
  );
}

// Utility to extract reasoning from AI response
export function extractReasoning(content: string): { reasoning: string | null; mainContent: string } {
  // Check for <think>...</think> blocks
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkMatch) {
    const reasoning = thinkMatch[1].trim();
    const mainContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    return { reasoning, mainContent };
  }

  // Check for <thinking>...</thinking> blocks
  const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/i);
  if (thinkingMatch) {
    const reasoning = thinkingMatch[1].trim();
    const mainContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
    return { reasoning, mainContent };
  }

  // No reasoning found
  return { reasoning: null, mainContent: content };
}
