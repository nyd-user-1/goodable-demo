/**
 * CitationTabsNew Component
 * Perplexity-style layout with content, action buttons, and "More" accordion section
 */

import { useState, ReactNode, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, FileDown, RefreshCw, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PerplexityCitation } from "@/utils/citationParser";
import { extractDomain } from "@/config/domainFilters";
import { Badge } from "@/components/ui/badge";
import { BillPDFSheet } from "@/components/features/bills/BillPDFSheet";

interface BillCitation {
  bill_number: string;
  title: string;
  status_desc: string;
  description?: string;
  committee?: string;
  session_id?: number;
}

interface CitationTabsNewProps {
  messageContent: ReactNode;
  bills: BillCitation[];
  sources: PerplexityCitation[];
  relatedBills?: BillCitation[];
  onCitationClick?: (citationNumber: number) => void;
  isStreaming?: boolean;
}

export function CitationTabsNew({
  messageContent,
  bills,
  sources,
  relatedBills = [],
  onCitationClick,
  isStreaming = false
}: CitationTabsNewProps) {
  const hasBills = bills && bills.length > 0;
  const hasSources = sources && sources.length > 0;
  const hasRelated = relatedBills && relatedBills.length > 0;

  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedBillNumber, setSelectedBillNumber] = useState<string>("");
  const [selectedBillTitle, setSelectedBillTitle] = useState<string>("");
  const [showCitations, setShowCitations] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);

  const handlePDFView = (billNumber: string, billTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBillNumber(billNumber);
    setSelectedBillTitle(billTitle);
    setPdfOpen(true);
  };

  // Auto-scroll to accordion when Citations is toggled on
  useEffect(() => {
    if (showCitations && accordionRef.current) {
      setTimeout(() => {
        accordionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [showCitations]);

  return (
    <div className="space-y-6">
      {/* Message Content */}
      <div className="prose prose-sm max-w-none">
        {messageContent}
      </div>

      {/* Action Buttons - Only show when NOT streaming */}
      {!isStreaming && (
        <div className="flex items-center gap-2 pt-4 border-t animate-in fade-in duration-300">
          <Button
            variant="ghost"
            size="sm"
            className={showCitations
              ? "text-foreground bg-muted hover:bg-muted/80 hover:text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }
            onClick={() => {
              setShowCitations(!showCitations);
              console.log('Citations clicked, new state:', !showCitations);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Citations
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => {
                  console.log('Export clicked');
                }}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export answer</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => {
                  console.log('Rewrite clicked');
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Rewrite
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rewrite this answer</TooltipContent>
          </Tooltip>

          <div className="ml-auto flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => {
                    console.log('Thumbs up clicked');
                  }}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Good response</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => {
                    console.log('Thumbs down clicked');
                  }}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bad response</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => {
                    // Copy messageContent text
                    const text = typeof messageContent === 'string' ? messageContent : '';
                    navigator.clipboard.writeText(text);
                    console.log('Copied to clipboard');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy answer</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* "More" Section - Accordion with References, Related, Resources */}
      {!isStreaming && showCitations && (hasBills || hasRelated || hasSources) && (
        <div ref={accordionRef} className="pt-4 animate-in fade-in duration-300">
          <Accordion type="multiple" className="w-full">
            {/* References Accordion */}
            {hasBills && (
              <AccordionItem value="references" className="border-b">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-sm font-medium">References ({bills.length})</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2">
                  <div className="space-y-3">
                    {bills.map((citation, idx) => (
                      <div key={idx} className="group relative">
                        {/* PDF View Button - Top Right */}
                        <button
                          onClick={(e) => handlePDFView(citation.bill_number, citation.title, e)}
                          className="absolute top-2 right-2 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
                          title="View Full Text"
                        >
                          <FileText className="h-4 w-4" />
                        </button>

                        <Link
                          to={`/bills/${citation.bill_number}`}
                          className="block p-4 pr-12 rounded-lg hover:bg-muted/50 transition-all"
                        >
                          {/* Bill Content */}
                          <div className="space-y-2">
                              {/* Bill Number */}
                              <h3 className="font-semibold text-base text-foreground group-hover:underline">
                                {citation.bill_number}
                              </h3>

                              {/* Bill Title */}
                              <p className="font-medium text-sm text-foreground leading-snug">
                                {citation.title}
                              </p>

                              {/* Metadata */}
                              <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
                                {citation.status_desc && (
                                  <Badge variant="outline" className="font-normal text-xs">
                                    {citation.status_desc}
                                  </Badge>
                                )}
                                {citation.committee && (
                                  <span>Committee: {citation.committee}</span>
                                )}
                              </div>

                            {/* Description */}
                            {citation.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                {citation.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Related Bills Accordion */}
            {hasRelated && (
              <AccordionItem value="related" className="border-b">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-sm font-medium">Related ({relatedBills.length})</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2">
                  <div className="space-y-3">
                    {relatedBills.map((citation, idx) => (
                      <div key={idx} className="group relative">
                        {/* PDF View Button - Top Right */}
                        <button
                          onClick={(e) => handlePDFView(citation.bill_number, citation.title, e)}
                          className="absolute top-2 right-2 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
                          title="View Full Text"
                        >
                          <FileText className="h-4 w-4" />
                        </button>

                        <Link
                          to={`/bills/${citation.bill_number}`}
                          className="block p-4 pr-12 rounded-lg hover:bg-muted/50 transition-all"
                        >
                          {/* Bill Content */}
                          <div className="space-y-2">
                              {/* Bill Number */}
                              <h3 className="font-semibold text-base text-foreground group-hover:underline">
                                {citation.bill_number}
                              </h3>

                              {/* Bill Title */}
                              <p className="font-medium text-sm text-foreground leading-snug">
                                {citation.title}
                              </p>

                              {/* Metadata */}
                              <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
                                {citation.status_desc && (
                                  <Badge variant="outline" className="font-normal text-xs">
                                    {citation.status_desc}
                                  </Badge>
                                )}
                                {citation.committee && (
                                  <span>Committee: {citation.committee}</span>
                                )}
                              </div>

                            {/* Description */}
                            {citation.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                {citation.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Resources Accordion */}
            {hasSources && (
              <AccordionItem value="resources" className="border-b">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-sm font-medium">Resources ({sources.length})</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2">
                  <div className="space-y-3">
                    {sources.map((citation) => {
                      const domain = extractDomain(citation.url);

                      return (
                        <div
                          key={citation.number}
                          className="p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => onCitationClick?.(citation.number)}
                        >
                          {/* Citation Content */}
                          <div className="space-y-2">
                            <h3 className="font-semibold text-base leading-tight">
                              {citation.title || domain}
                            </h3>

                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{domain}</span>
                            </div>

                            {citation.excerpt && (
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {citation.excerpt}
                              </p>
                            )}

                            {citation.url && (
                              <a
                                href={citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-foreground hover:underline inline-flex items-center gap-1 mt-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View source →
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      )}

      {/* PDF Viewer Sheet */}
      <BillPDFSheet
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        billNumber={selectedBillNumber}
        billTitle={selectedBillTitle}
        bill={null}
      />
    </div>
  );
}
