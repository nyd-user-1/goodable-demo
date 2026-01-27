"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Loader2, LucideIcon } from "lucide-react";

// Context for sharing state
interface ChainOfThoughtContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextType | null>(null);

function useChainOfThought() {
  const context = useContext(ChainOfThoughtContext);
  if (!context) {
    throw new Error("ChainOfThought components must be used within ChainOfThought");
  }
  return context;
}

// Main container
interface ChainOfThoughtProps {
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function ChainOfThought({ children, defaultOpen = false, className }: ChainOfThoughtProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <ChainOfThoughtContext.Provider value={{ isOpen, setIsOpen }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </ChainOfThoughtContext.Provider>
  );
}

// Header with toggle
interface ChainOfThoughtHeaderProps {
  className?: string;
}

export function ChainOfThoughtHeader({ className }: ChainOfThoughtHeaderProps) {
  const { isOpen, setIsOpen } = useChainOfThought();

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full px-4 py-2.5 rounded-t-lg",
        className
      )}
    >
      <ChevronDown
        className={cn(
          "h-3.5 w-3.5 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
      <span>Reasoning</span>
    </button>
  );
}

// Content wrapper
interface ChainOfThoughtContentProps {
  children: ReactNode;
  className?: string;
}

export function ChainOfThoughtContent({ children, className }: ChainOfThoughtContentProps) {
  const { isOpen } = useChainOfThought();

  if (!isOpen) return null;

  return (
    <div className={cn("px-4 pb-3 space-y-3", className)}>
      {children}
    </div>
  );
}

// Step component
interface ChainOfThoughtStepProps {
  icon?: LucideIcon;
  label: string;
  status?: "pending" | "active" | "complete";
  children?: ReactNode;
  className?: string;
}

export function ChainOfThoughtStep({
  icon: Icon,
  label,
  status = "pending",
  children,
  className,
}: ChainOfThoughtStepProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5">
          {status === "complete" ? (
            <div className="w-4 h-4 rounded-full bg-green-600 dark:bg-green-400 flex items-center justify-center">
              <Check className="h-2.5 w-2.5 text-white dark:text-green-950" />
            </div>
          ) : status === "active" ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
            <span className="leading-relaxed">{label}</span>
          </div>
          {children && <div className="mt-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}

// Search results container
interface ChainOfThoughtSearchResultsProps {
  children: ReactNode;
  className?: string;
}

export function ChainOfThoughtSearchResults({ children, className }: ChainOfThoughtSearchResultsProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {children}
    </div>
  );
}

// Individual search result badge
interface ChainOfThoughtSearchResultProps {
  children: ReactNode;
  className?: string;
}

export function ChainOfThoughtSearchResult({ children, className }: ChainOfThoughtSearchResultProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md bg-muted/50 border border-border/50 text-xs text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

// Image display component
interface ChainOfThoughtImageProps {
  children: ReactNode;
  caption?: string;
  className?: string;
}

export function ChainOfThoughtImage({ children, caption, className }: ChainOfThoughtImageProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {children}
      {caption && (
        <p className="text-xs text-muted-foreground/70 leading-relaxed">{caption}</p>
      )}
    </div>
  );
}
