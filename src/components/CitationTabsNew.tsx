/**
 * CitationTabsNew Component
 * Perplexity-style tabbed interface with Answer, References, Related Bills, and Research Sources
 */

import { useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { FileText, Share2, FileDown, RefreshCw, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
}

export function CitationTabsNew({
  messageContent,
  bills,
  sources,
  relatedBills = [],
  onCitationClick
}: CitationTabsNewProps) {
  const hasBills = bills && bills.length > 0;
  const hasSources = sources && sources.length > 0;
  const hasRelated = relatedBills && relatedBills.length > 0;

  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedBillNumber, setSelectedBillNumber] = useState<string>("");
  const [selectedBillTitle, setSelectedBillTitle] = useState<string>("");

  // Always start with "answer" tab
  const [activeCategory, setActiveCategory] = useState("answer");

  const handlePDFView = (billNumber: string, billTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBillNumber(billNumber);
    setSelectedBillTitle(billTitle);
    setPdfOpen(true);
  };

  const categories = [
    {
      id: "answer",
      label: "Answer",
      count: null,
    },
    {
      id: "references",
      label: "References",
      count: bills.length,
    },
    {
      id: "related",
      label: "Related",
      count: relatedBills.length,
    },
    {
      id: "resources",
      label: "Resources",
      count: sources.length,
    },
  ];

  return (
    <div className="mt-6">
      {/* Tabs for larger screens */}
      <div className="mb-8 hidden space-x-6 border-b md:flex">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "relative px-1 pb-4 font-medium transition-colors",
              activeCategory === category.id
                ? "text-foreground border-foreground -mb-px border-b-2"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {category.label}{category.count !== null && ` (${category.count})`}
          </button>
        ))}
      </div>

      {/* Dropdown for mobile */}
      <div className="mb-8 md:hidden">
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.label}{category.count !== null && ` (${category.count})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {/* Answer Tab Content */}
        {activeCategory === "answer" && (
          <div className="animate-in fade-in duration-300">
            {/* Message Content */}
            <div className="prose prose-sm max-w-none">
              {messageContent}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-6 pt-6 border-t">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => {
                      console.log('Share clicked');
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share this response</TooltipContent>
              </Tooltip>

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
          </div>
        )}

        {/* References Content */}
        {activeCategory === "references" && (
          <div className="animate-in fade-in duration-300">
            {hasBills ? (
              <div className="space-y-4">
                {bills.map((citation, idx) => (
                  <div key={idx} className="group">
                    <Link
                      to={`/bills/${citation.bill_number}`}
                      className="block p-4 rounded-lg border hover:border-foreground/20 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* PDF View Button */}
                        <button
                          onClick={(e) => handlePDFView(citation.bill_number, citation.title, e)}
                          className="flex-shrink-0 w-10 h-10 rounded-md bg-muted hover:bg-muted/80 border hover:border-foreground/20 transition-colors flex items-center justify-center"
                          title="View Full Text"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </button>

                        {/* Bill Content */}
                        <div className="flex-1 space-y-2">
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
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                No bills referenced in this response.
              </p>
            )}
          </div>
        )}

        {/* Related Bills Content */}
        {activeCategory === "related" && (
          <div className="animate-in fade-in duration-300">
            {hasRelated ? (
              <div className="space-y-4">
                {relatedBills.map((citation, idx) => (
                  <div key={idx} className="group">
                    <Link
                      to={`/bills/${citation.bill_number}`}
                      className="block p-4 rounded-lg border hover:border-foreground/20 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* PDF View Button */}
                        <button
                          onClick={(e) => handlePDFView(citation.bill_number, citation.title, e)}
                          className="flex-shrink-0 w-10 h-10 rounded-md bg-muted hover:bg-muted/80 border hover:border-foreground/20 transition-colors flex items-center justify-center"
                          title="View Full Text"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </button>

                        {/* Bill Content */}
                        <div className="flex-1 space-y-2">
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
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                No related bills found for this response.
              </p>
            )}
          </div>
        )}

        {/* Resources Content */}
        {activeCategory === "resources" && (
          <div className="animate-in fade-in duration-300">
            {hasSources ? (
              <div className="space-y-4">
                {sources.map((citation) => {
                  const domain = extractDomain(citation.url);

                  return (
                    <div
                      key={citation.number}
                      className="p-4 rounded-lg border hover:border-foreground/20 transition-colors cursor-pointer"
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
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                No research sources available for this response.
              </p>
            )}
          </div>
        )}
      </div>

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
