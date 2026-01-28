"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

// Types
export interface CitationSource {
  url: string;
  title?: string;
  description?: string;
  quote?: string;
}

// Context for carousel state
interface CarouselContextType {
  current: number;
  count: number;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselContext = createContext<CarouselContextType | null>(null);

function useCarouselContext() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("Carousel components must be used within InlineCitationCarousel");
  }
  return context;
}

// Helper to extract domain from URL
function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Main wrapper
interface InlineCitationProps extends React.ComponentProps<"span"> {
  children: ReactNode;
}

export function InlineCitation({ children, className, ...props }: InlineCitationProps) {
  return (
    <span className={cn("inline", className)} {...props}>
      {children}
    </span>
  );
}

// Text wrapper (optional, for styling cited text)
interface InlineCitationTextProps extends React.ComponentProps<"span"> {
  children: ReactNode;
}

export function InlineCitationText({ children, className, ...props }: InlineCitationTextProps) {
  return (
    <span className={cn("inline", className)} {...props}>
      {children}
    </span>
  );
}

// Card wrapper using HoverCard
interface InlineCitationCardProps {
  children: ReactNode;
}

export function InlineCitationCard({ children }: InlineCitationCardProps) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      {children}
    </HoverCard>
  );
}

// Trigger pill showing "hostname +N"
interface InlineCitationCardTriggerProps extends React.ComponentProps<"button"> {
  sources: string[];
}

export function InlineCitationCardTrigger({ sources, className, ...props }: InlineCitationCardTriggerProps) {
  const domain = sources.length > 0 ? getDomain(sources[0]) : '';
  const additionalCount = sources.length - 1;

  return (
    <HoverCardTrigger asChild>
      <button
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 ml-1",
          "text-xs font-medium text-muted-foreground",
          "bg-muted/60 hover:bg-muted rounded-md",
          "border border-border/50",
          "transition-colors cursor-pointer",
          "align-baseline",
          className
        )}
        {...props}
      >
        <span className="truncate max-w-[100px]">{domain}</span>
        {additionalCount > 0 && (
          <span className="text-muted-foreground/70">+{additionalCount}</span>
        )}
      </button>
    </HoverCardTrigger>
  );
}

// Card body
interface InlineCitationCardBodyProps extends React.ComponentProps<"div"> {
  children: ReactNode;
}

export function InlineCitationCardBody({ children, className, ...props }: InlineCitationCardBodyProps) {
  return (
    <HoverCardContent
      className={cn("w-80 p-0", className)}
      align="start"
      side="bottom"
      {...props}
    >
      {children}
    </HoverCardContent>
  );
}

// Carousel wrapper
interface InlineCitationCarouselProps {
  children: ReactNode;
  className?: string;
}

export function InlineCitationCarousel({ children, className }: InlineCitationCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });
  }, [api]);

  const scrollPrev = () => api?.scrollPrev();
  const scrollNext = () => api?.scrollNext();

  return (
    <CarouselContext.Provider value={{ current, count, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}>
      <Carousel setApi={setApi} className={cn("w-full", className)}>
        {children}
      </Carousel>
    </CarouselContext.Provider>
  );
}

// Carousel header with navigation
interface InlineCitationCarouselHeaderProps extends React.ComponentProps<"div"> {
  children?: ReactNode;
}

export function InlineCitationCarouselHeader({ children, className, ...props }: InlineCitationCarouselHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-3 py-2 border-b bg-muted/30", className)} {...props}>
      {children}
    </div>
  );
}

// Carousel index display (1/5)
interface InlineCitationCarouselIndexProps extends React.ComponentProps<"div"> {
  children?: ReactNode;
}

export function InlineCitationCarouselIndex({ children, className, ...props }: InlineCitationCarouselIndexProps) {
  const { current, count } = useCarouselContext();

  return (
    <div className={cn("text-xs text-muted-foreground tabular-nums", className)} {...props}>
      {children || `${current}/${count}`}
    </div>
  );
}

// Carousel prev button
interface InlineCitationCarouselPrevProps extends React.ComponentProps<typeof Button> {}

export function InlineCitationCarouselPrev({ className, ...props }: InlineCitationCarouselPrevProps) {
  const { scrollPrev, canScrollPrev } = useCarouselContext();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6", className)}
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      {...props}
    >
      <ChevronLeft className="h-3 w-3" />
      <span className="sr-only">Previous</span>
    </Button>
  );
}

// Carousel next button
interface InlineCitationCarouselNextProps extends React.ComponentProps<typeof Button> {}

export function InlineCitationCarouselNext({ className, ...props }: InlineCitationCarouselNextProps) {
  const { scrollNext, canScrollNext } = useCarouselContext();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6", className)}
      onClick={scrollNext}
      disabled={!canScrollNext}
      {...props}
    >
      <ChevronRight className="h-3 w-3" />
      <span className="sr-only">Next</span>
    </Button>
  );
}

// Carousel content
interface InlineCitationCarouselContentProps extends React.ComponentProps<"div"> {
  children: ReactNode;
}

export function InlineCitationCarouselContent({ children, className, ...props }: InlineCitationCarouselContentProps) {
  return (
    <CarouselContent className={cn("-ml-0", className)} {...props}>
      {children}
    </CarouselContent>
  );
}

// Carousel item
interface InlineCitationCarouselItemProps extends React.ComponentProps<"div"> {
  children: ReactNode;
}

export function InlineCitationCarouselItem({ children, className, ...props }: InlineCitationCarouselItemProps) {
  return (
    <CarouselItem className={cn("pl-0 basis-full", className)} {...props}>
      {children}
    </CarouselItem>
  );
}

// Source display
interface InlineCitationSourceProps extends React.ComponentProps<"div"> {
  title: string;
  url: string;
  description?: string;
}

export function InlineCitationSource({ title, url, description, className, ...props }: InlineCitationSourceProps) {
  const domain = getDomain(url);

  return (
    <div className={cn("p-3 space-y-2", className)} {...props}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {domain}
          <ExternalLink className="h-3 w-3 opacity-50" />
        </p>
      </a>
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-3">
          {description}
        </p>
      )}
    </div>
  );
}

// Quote block
interface InlineCitationQuoteProps extends React.ComponentProps<"blockquote"> {
  children: ReactNode;
}

export function InlineCitationQuote({ children, className, ...props }: InlineCitationQuoteProps) {
  return (
    <blockquote
      className={cn(
        "mx-3 mb-3 px-3 py-2 text-xs text-muted-foreground",
        "border-l-2 border-primary/30 bg-muted/30 rounded-r",
        "italic",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}

// Utility: Parse citation markers and render with components
export function parseCitationMarkers(
  text: string,
  citations: CitationSource[]
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

    // Get sources for these citation numbers
    const sources = numbers
      .map(num => citations[num - 1])
      .filter((c): c is CitationSource => c !== undefined && !!c.url);

    if (sources.length > 0) {
      parts.push(
        <InlineCitation key={match.index}>
          <InlineCitationCard>
            <InlineCitationCardTrigger sources={sources.map(s => s.url)} />
            <InlineCitationCardBody>
              <InlineCitationCarousel>
                <InlineCitationCarouselHeader>
                  <InlineCitationCarouselPrev />
                  <InlineCitationCarouselIndex />
                  <InlineCitationCarouselNext />
                </InlineCitationCarouselHeader>
                <InlineCitationCarouselContent>
                  {sources.map((source, idx) => (
                    <InlineCitationCarouselItem key={idx}>
                      <InlineCitationSource
                        title={source.title || `Source ${numbers[idx]}`}
                        url={source.url}
                        description={source.description}
                      />
                      {source.quote && (
                        <InlineCitationQuote>{source.quote}</InlineCitationQuote>
                      )}
                    </InlineCitationCarouselItem>
                  ))}
                </InlineCitationCarouselContent>
              </InlineCitationCarousel>
            </InlineCitationCardBody>
          </InlineCitationCard>
        </InlineCitation>
      );
    } else {
      // No sources found, show plain text
      parts.push(fullMatch);
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
