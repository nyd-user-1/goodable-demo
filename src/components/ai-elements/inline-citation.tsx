"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink, Globe, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PerplexityCitation } from "@/hooks/chat/types";

// Context for sharing citation data
interface InlineCitationContextType {
  citations: PerplexityCitation[];
  activeCitation: number | null;
  setActiveCitation: (index: number | null) => void;
}

const InlineCitationContext = createContext<InlineCitationContextType | null>(null);

function useInlineCitation() {
  const context = useContext(InlineCitationContext);
  if (!context) {
    throw new Error("InlineCitation components must be used within InlineCitation");
  }
  return context;
}

// Main wrapper component
interface InlineCitationProps {
  children: ReactNode;
  citations: PerplexityCitation[];
  className?: string;
}

export function InlineCitation({ children, citations, className }: InlineCitationProps) {
  const [activeCitation, setActiveCitation] = useState<number | null>(null);

  return (
    <InlineCitationContext.Provider value={{ citations, activeCitation, setActiveCitation }}>
      <span className={cn("inline", className)}>
        {children}
      </span>
    </InlineCitationContext.Provider>
  );
}

// Text that has citations associated with it
interface InlineCitationTextProps {
  children: ReactNode;
  className?: string;
}

export function InlineCitationText({ children, className }: InlineCitationTextProps) {
  return (
    <span className={cn("inline", className)}>
      {children}
    </span>
  );
}

// The clickable citation number trigger [1], [2], etc.
interface InlineCitationCardTriggerProps {
  citationIndices: number[];
  className?: string;
}

export function InlineCitationCardTrigger({ citationIndices, className }: InlineCitationCardTriggerProps) {
  const { citations } = useInlineCitation();
  const relevantCitations = citationIndices
    .map(idx => citations.find(c => c.index === idx))
    .filter((c): c is PerplexityCitation => c !== undefined);

  if (relevantCitations.length === 0) {
    return (
      <span className="text-muted-foreground text-xs">
        [{citationIndices.join('][')}]
      </span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer align-super",
            className
          )}
        >
          {citationIndices.map((idx, i) => (
            <span
              key={idx}
              className="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {idx}
            </span>
          ))}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="start"
        side="top"
        sideOffset={8}
      >
        {relevantCitations.length === 1 ? (
          <InlineCitationSource citation={relevantCitations[0]} />
        ) : (
          <InlineCitationCarousel citations={relevantCitations} />
        )}
      </PopoverContent>
    </Popover>
  );
}

// The popover card content
interface InlineCitationCardProps {
  citation: PerplexityCitation;
  className?: string;
}

export function InlineCitationCard({ citation, className }: InlineCitationCardProps) {
  return (
    <div className={cn("p-3", className)}>
      <InlineCitationSource citation={citation} />
    </div>
  );
}

// Carousel for multiple citations
interface InlineCitationCarouselProps {
  citations: PerplexityCitation[];
  className?: string;
}

export function InlineCitationCarousel({ citations, className }: InlineCitationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (citations.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <Carousel
        opts={{
          align: "start",
          loop: citations.length > 1,
        }}
        className="w-full"
      >
        <CarouselContent>
          {citations.map((citation, index) => (
            <CarouselItem key={citation.id || index}>
              <InlineCitationSource citation={citation} showIndex />
            </CarouselItem>
          ))}
        </CarouselContent>
        {citations.length > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30">
            <span className="text-xs text-muted-foreground">
              {citations.length} sources
            </span>
            <div className="flex gap-1">
              <CarouselPrevious className="static translate-y-0 h-6 w-6" />
              <CarouselNext className="static translate-y-0 h-6 w-6" />
            </div>
          </div>
        )}
      </Carousel>
    </div>
  );
}

// Individual source display
interface InlineCitationSourceProps {
  citation: PerplexityCitation;
  showIndex?: boolean;
  className?: string;
}

export function InlineCitationSource({ citation, showIndex = false, className }: InlineCitationSourceProps) {
  const domain = getDomainFromUrl(citation.url);

  return (
    <div className={cn("p-3 space-y-2", className)}>
      {/* Header with favicon and domain */}
      <div className="flex items-start gap-2">
        {citation.favicon ? (
          <img
            src={citation.favicon}
            alt=""
            className="w-4 h-4 rounded flex-shrink-0 mt-0.5"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {showIndex && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-xs font-medium text-primary flex-shrink-0">
                {citation.index}
              </span>
            )}
            <span className="text-xs text-muted-foreground truncate">
              {domain}
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      {citation.title && (
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
        >
          {citation.title}
        </a>
      )}

      {/* Snippet */}
      {citation.snippet && (
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {citation.snippet}
        </p>
      )}

      {/* Metadata row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {citation.author && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{citation.author}</span>
          </span>
        )}
        {citation.publishedDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(citation.publishedDate)}</span>
          </span>
        )}
      </div>

      {/* Visit link */}
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        Visit source
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

// Helper function to extract domain from URL
function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Helper function to format date
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return dateStr;
  }
}

// Utility function to parse citation markers from text and render with components
export function parseCitationMarkers(
  text: string,
  citations: PerplexityCitation[]
): ReactNode[] {
  // Match patterns like [1], [2], [1][2], [1,2], [1, 2]
  const citationPattern = /\[(\d+(?:\s*,\s*\d+)*)\](?:\[(\d+(?:\s*,\s*\d+)*)\])*/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = citationPattern.exec(text)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Parse all citation numbers from the match
    const fullMatch = match[0];
    const numbers = fullMatch.match(/\d+/g)?.map(Number) || [];

    if (numbers.length > 0) {
      parts.push(
        <InlineCitation key={match.index} citations={citations}>
          <InlineCitationCardTrigger citationIndices={numbers} />
        </InlineCitation>
      );
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
