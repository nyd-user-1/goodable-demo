"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Brain, Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Context for sharing reasoning state
interface ReasoningContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isStreaming: boolean;
}

const ReasoningContext = createContext<ReasoningContextType | null>(null);

function useReasoning() {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning");
  }
  return context;
}

// Main container
interface ReasoningProps {
  children: ReactNode;
  defaultOpen?: boolean;
  isStreaming?: boolean;
  className?: string;
}

export function Reasoning({
  children,
  defaultOpen = false,
  isStreaming = false,
  className
}: ReasoningProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Auto-open when streaming starts, auto-collapse when streaming ends
  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
    }
  }, [isStreaming]);

  // When streaming ends, collapse after a short delay
  useEffect(() => {
    if (!isStreaming && isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isStreaming]);

  return (
    <ReasoningContext.Provider value={{ isOpen, setIsOpen, isStreaming }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className={cn(
          "rounded-lg border bg-muted/30 overflow-hidden transition-all duration-200",
          isStreaming && "border-primary/30 bg-primary/5",
          className
        )}>
          {children}
        </div>
      </Collapsible>
    </ReasoningContext.Provider>
  );
}

// Header/trigger for expanding/collapsing
interface ReasoningTriggerProps {
  className?: string;
  label?: string;
}

export function ReasoningTrigger({ className, label = "Thinking" }: ReasoningTriggerProps) {
  const { isOpen, isStreaming } = useReasoning();

  return (
    <CollapsibleTrigger asChild>
      <button
        type="button"
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
          isStreaming && "text-primary",
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1">
          {isStreaming ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <Brain className="h-3.5 w-3.5" />
          )}
          <span>
            {isStreaming ? `${label}...` : label}
          </span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse delay-150" />
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse delay-300" />
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>
    </CollapsibleTrigger>
  );
}

// Content area
interface ReasoningContentProps {
  children: ReactNode;
  className?: string;
}

export function ReasoningContent({ children, className }: ReasoningContentProps) {
  const { isStreaming } = useReasoning();

  return (
    <CollapsibleContent>
      <div className={cn(
        "px-3 pb-3 text-xs text-muted-foreground leading-relaxed",
        "prose prose-xs dark:prose-invert max-w-none",
        "[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5",
        className
      )}>
        {children}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3 bg-primary/60 animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </CollapsibleContent>
  );
}

// Utility to extract reasoning from Perplexity response
// Perplexity often includes <think> or similar markers, or we can parse based on patterns
export function extractReasoning(content: string): { reasoning: string | null; mainContent: string } {
  // Check for <think>...</think> blocks (common AI reasoning format)
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

  // Check for **Reasoning:** or **Thinking:** prefixed sections
  const reasoningPrefixMatch = content.match(/\*\*(Reasoning|Thinking|Analysis):\*\*\s*([\s\S]*?)(?=\n\n|\*\*[A-Z])/i);
  if (reasoningPrefixMatch) {
    const reasoning = reasoningPrefixMatch[2].trim();
    const mainContent = content.replace(/\*\*(Reasoning|Thinking|Analysis):\*\*\s*[\s\S]*?(?=\n\n|\*\*[A-Z])/i, '').trim();
    return { reasoning, mainContent };
  }

  // No reasoning found
  return { reasoning: null, mainContent: content };
}

// Simple component for displaying reasoning if present
interface ReasoningBlockProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export function ReasoningBlock({ content, isStreaming = false, className }: ReasoningBlockProps) {
  const { reasoning, mainContent } = extractReasoning(content);

  if (!reasoning) {
    return null;
  }

  return (
    <Reasoning isStreaming={isStreaming} className={className}>
      <ReasoningTrigger />
      <ReasoningContent>
        {reasoning}
      </ReasoningContent>
    </Reasoning>
  );
}
