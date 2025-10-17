/**
 * ResponseTabs Component
 * Enhanced tabbed interface for AI responses with Analysis, Bills, Sources, and Process tabs
 * Inspired by Perplexity's UI/UX patterns
 */

import { Link } from "react-router-dom";
import { FileText, Globe, SearchIcon, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PerplexityCitation } from "@/utils/citationParser";
import { getSourceCredibilityBadge, extractDomain } from "@/config/domainFilters";
import { Badge } from "@/components/ui/badge";
import { CitationText } from "@/components/CitationText";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BillCitation {
  bill_number: string;
  title: string;
  status_desc: string;
  description?: string;
  committee?: string;
  session_id?: number;
}

interface ResponseTabsProps {
  content: string;
  isStreaming?: boolean;
  streamedContent?: string;
  bills: BillCitation[];
  sources: PerplexityCitation[];
  searchQueries?: string[];
  reviewedInfo?: string;
  isPerplexityResponse?: boolean;
  perplexityCitations?: PerplexityCitation[];
  onCitationClick?: (citationNumber: number) => void;
}

export function ResponseTabs({
  content,
  isStreaming,
  streamedContent,
  bills,
  sources,
  searchQueries,
  reviewedInfo,
  isPerplexityResponse,
  perplexityCitations,
  onCitationClick,
}: ResponseTabsProps) {
  const hasBills = bills && bills.length > 0;
  const hasSources = sources && sources.length > 0;
  const hasProcess = searchQueries || reviewedInfo;

  const displayContent = isStreaming ? streamedContent || '' : content;

  return (
    <Tabs defaultValue="analysis" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="analysis" className="flex items-center gap-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Analysis</span>
        </TabsTrigger>
        <TabsTrigger value="bills" className="flex items-center gap-1.5 text-xs">
          <FileText className="h-3.5 w-3.5" />
          <span>Bills · {bills.length}</span>
        </TabsTrigger>
        <TabsTrigger value="sources" className="flex items-center gap-1.5 text-xs">
          <Globe className="h-3.5 w-3.5" />
          <span>Sources · {sources.length}</span>
        </TabsTrigger>
        <TabsTrigger value="process" className="flex items-center gap-1.5 text-xs">
          <SearchIcon className="h-3.5 w-3.5" />
          <span>Process</span>
        </TabsTrigger>
      </TabsList>

      {/* Analysis Tab - Main Response */}
      <TabsContent value="analysis" className="mt-0">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isPerplexityResponse && perplexityCitations ? (
            // Render Perplexity response with inline citation badges
            <ReactMarkdown
              components={{
                p: ({ children }) => {
                  const textContent = String(children);
                  return (
                    <p className="mb-3 leading-relaxed text-foreground">
                      <CitationText
                        text={textContent}
                        citations={perplexityCitations || []}
                        onCitationClick={onCitationClick}
                      />
                    </p>
                  );
                },
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-semibold mb-3 text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold mb-2 text-foreground">
                    {children}
                  </h2>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-3 space-y-1">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="text-foreground text-sm">{children}</li>
                ),
              }}
            >
              {displayContent}
            </ReactMarkdown>
          ) : (
            // Standard markdown rendering
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 leading-relaxed text-foreground">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-semibold mb-3 text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold mb-2 text-foreground">
                    {children}
                  </h2>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-3 space-y-1">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="text-foreground text-sm">{children}</li>
                ),
              }}
            >
              {displayContent}
            </ReactMarkdown>
          )}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5">|</span>
          )}
        </div>
      </TabsContent>

      {/* Referenced Bills Tab - Enhanced Cards */}
      <TabsContent value="bills" className="mt-0">
        {hasBills ? (
          <div className="space-y-3">
            {bills.map((citation, idx) => (
              <Link
                key={idx}
                to={`/bills/${citation.bill_number}`}
              >
                <Card className={cn(
                  "p-4 hover:shadow-md transition-all duration-200 cursor-pointer border hover:border-primary/50 group"
                )}>
                  <div className="flex items-start gap-3">
                    {/* Bill Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-5 w-5" />
                    </div>

                    {/* Bill Content */}
                    <div className="flex-1 space-y-2">
                      {/* Bill Number */}
                      <div className="font-bold text-base text-primary group-hover:underline">
                        {citation.bill_number}
                      </div>

                      {/* Bill Title */}
                      <div className="font-semibold text-sm text-foreground leading-snug">
                        {citation.title}
                      </div>

                      {/* Metadata Row */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {citation.status_desc && (
                          <Badge variant="outline" className="font-normal">
                            {citation.status_desc}
                          </Badge>
                        )}
                        {citation.committee && (
                          <span>Committee: {citation.committee}</span>
                        )}
                      </div>

                      {/* Description */}
                      {citation.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {citation.description}
                        </p>
                      )}

                      {/* CTA */}
                      <div className="text-xs text-primary font-medium group-hover:underline pt-1">
                        View Full Bill →
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              No bills referenced in this response.
            </p>
          </div>
        )}
      </TabsContent>

      {/* Research Sources Tab */}
      <TabsContent value="sources" className="mt-0">
        {hasSources ? (
          <div className="space-y-3">
            {sources.map((citation) => {
              const domain = extractDomain(citation.url);
              const credibilityBadge = getSourceCredibilityBadge(domain);

              return (
                <Card
                  key={citation.number}
                  className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border hover:border-primary/50 group"
                  onClick={() => onCitationClick?.(citation.number)}
                >
                  <div className="flex items-start gap-3">
                    {/* Citation Number Badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm font-semibold group-hover:bg-primary/20 transition-colors">
                      {citation.number}
                    </div>

                    {/* Citation Content */}
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm leading-tight text-foreground">
                          {citation.title || domain}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              credibilityBadge.color === 'green'
                                ? 'text-green-600 border-green-200 dark:text-green-400 dark:border-green-800'
                                : credibilityBadge.color === 'blue'
                                ? 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800'
                                : credibilityBadge.color === 'orange'
                                ? 'text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800'
                                : 'text-gray-600 border-gray-200 dark:text-gray-400 dark:border-gray-800'
                            }`}
                          >
                            {credibilityBadge.icon && (
                              <span className="mr-1">{credibilityBadge.icon}</span>
                            )}
                            {credibilityBadge.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{domain}</span>
                        </div>
                      </div>

                      {citation.excerpt && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {citation.excerpt}
                        </p>
                      )}

                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View source →
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              No research sources available for this response.
            </p>
          </div>
        )}
      </TabsContent>

      {/* Process Tab - Search & Review Steps */}
      <TabsContent value="process" className="mt-0">
        {hasProcess ? (
          <div className="space-y-4">
            {/* Search Queries */}
            {searchQueries && searchQueries.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <SearchIcon className="h-4 w-4 text-primary" />
                  Searching
                </h3>
                <div className="space-y-2 pl-6">
                  {searchQueries.map((query, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0",
                        isStreaming ? "bg-primary animate-pulse" : "bg-muted-foreground/50"
                      )} />
                      <span>{query}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviewed Info */}
            {reviewedInfo && !isStreaming && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Reviewing sources · {bills.length}
                </h3>
                <div className="pl-6">
                  <p className="text-sm text-muted-foreground">{reviewedInfo}</p>
                </div>
              </div>
            )}

            {/* Completion State */}
            {!isStreaming && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
                  </div>
                  Finished
                </h3>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              No process information available.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
