/**
 * CitationText Component
 * Renders text with inline superscript citation badges
 */

import { parseInlineCitations, PerplexityCitation } from "@/utils/citationParser";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CitationTextProps {
  text: string;
  citations: PerplexityCitation[];
  onCitationClick?: (citationNumber: number) => void;
}

export function CitationText({ text, citations, onCitationClick }: CitationTextProps) {
  const segments = parseInlineCitations(text);

  const getCitationInfo = (num: number) => {
    return citations.find(c => c.number === num);
  };

  return (
    <TooltipProvider>
      <span>
        {segments.map((segment, idx) => (
          <span key={idx}>
            {segment.text}
            {segment.citations.length > 0 && (
              <span className="inline-flex items-baseline gap-0.5">
                {segment.citations.map((citNum) => {
                  const citation = getCitationInfo(citNum);
                  return (
                    <Tooltip key={citNum} delayDuration={300}>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      {citation && (
                        <TooltipContent
                          side="top"
                          className="max-w-xs"
                        >
                          <div className="text-xs space-y-1">
                            <p className="font-medium">{citation.title || "Source"}</p>
                            {citation.url && (
                              <p className="text-muted-foreground truncate">
                                {new URL(citation.url).hostname}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </span>
            )}
          </span>
        ))}
      </span>
    </TooltipProvider>
  );
}
