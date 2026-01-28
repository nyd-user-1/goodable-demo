/**
 * CitationText Component
 * Renders text with inline superscript citation badges with rich popover cards
 */

import { parseInlineCitations, PerplexityCitation } from "@/utils/citationParser";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ExternalLink, Globe, Calendar, User } from "lucide-react";

interface CitationTextProps {
  text: string;
  citations: PerplexityCitation[];
  onCitationClick?: (citationNumber: number) => void;
}

// Helper to extract domain from URL
const getDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

// Helper to get favicon URL
const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return '';
  }
};

export function CitationText({ text, citations, onCitationClick }: CitationTextProps) {
  const segments = parseInlineCitations(text);

  const getCitationInfo = (num: number) => {
    return citations.find(c => c.number === num);
  };

  return (
    <span>
      {segments.map((segment, idx) => (
        <span key={idx}>
          {segment.text}
          {segment.citations.length > 0 && (
            <span className="inline-flex items-baseline gap-0.5">
              {segment.citations.map((citNum) => {
                const citation = getCitationInfo(citNum);
                return (
                  <Popover key={citNum}>
                    <PopoverTrigger asChild>
                      <sup
                        className={cn(
                          "inline-flex items-center justify-center",
                          "min-w-[1.25rem] h-4 px-1",
                          "text-[10px] font-medium",
                          "bg-primary/10 text-primary",
                          "rounded border border-primary/20",
                          "cursor-pointer hover:bg-primary/20 transition-colors",
                          "ml-0.5"
                        )}
                        onClick={() => onCitationClick?.(citNum)}
                      >
                        {citNum}
                      </sup>
                    </PopoverTrigger>
                    {citation && citation.url && (
                      <PopoverContent
                        side="top"
                        align="start"
                        className="w-80 p-0"
                        sideOffset={8}
                      >
                        <div className="p-3 space-y-2">
                          {/* Header with favicon and domain */}
                          <div className="flex items-start gap-2">
                            <img
                              src={getFaviconUrl(citation.url)}
                              alt=""
                              className="w-4 h-4 rounded flex-shrink-0 mt-0.5"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-xs font-medium text-primary flex-shrink-0">
                                  {citNum}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {getDomainFromUrl(citation.url)}
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

                          {/* Excerpt/Snippet */}
                          {citation.excerpt && (
                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {citation.excerpt}
                            </p>
                          )}

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
                      </PopoverContent>
                    )}
                  </Popover>
                );
              })}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
