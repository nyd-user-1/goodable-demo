/**
 * CitationTabs Component
 * Tabbed interface for Referenced Bills and Research Sources
 */

import { FileText, Globe } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PerplexityCitation } from "@/utils/citationParser";
import { getSourceCredibilityBadge, extractDomain } from "@/config/domainFilters";
import { Badge } from "@/components/ui/badge";

interface BillCitation {
  bill_number: string;
  title: string;
  status_desc: string;
  description?: string;
  committee?: string;
  session_id?: number;
}

interface CitationTabsProps {
  bills: BillCitation[];
  sources: PerplexityCitation[];
  onCitationClick?: (citationNumber: number) => void;
}

export function CitationTabs({ bills, sources, onCitationClick }: CitationTabsProps) {
  const hasBills = bills && bills.length > 0;
  const hasSources = sources && sources.length > 0;

  if (!hasBills && !hasSources) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <Tabs defaultValue={hasBills ? "bills" : "sources"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="bills" className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            <span>Referenced Bills ({bills.length})</span>
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            <span>Research Sources ({sources.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Referenced Bills Tab */}
        <TabsContent value="bills" className="mt-0">
          {hasBills ? (
            <div className="space-y-2">
              {bills.map((citation, idx) => (
                <a
                  key={idx}
                  href={`/bills`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/bills`;
                  }}
                  className="block text-xs p-3 rounded-md bg-muted/40 border hover:bg-muted/60 transition-colors cursor-pointer"
                >
                  <div className="font-medium text-primary mb-1 hover:underline">
                    {citation.bill_number}
                  </div>
                  <div className="text-muted-foreground line-clamp-2 mb-1">
                    {citation.title}
                  </div>
                  {citation.status_desc && (
                    <div className="text-muted-foreground/80 text-xs">
                      Status: {citation.status_desc}
                    </div>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No bills referenced in this response.
            </p>
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
                  <div
                    key={citation.number}
                    className="p-3 rounded-md bg-muted/40 border hover:bg-muted/60 transition-colors cursor-pointer"
                    onClick={() => onCitationClick?.(citation.number)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Citation Number Badge */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-medium">
                        {citation.number}
                      </div>

                      {/* Citation Content */}
                      <div className="flex-1 space-y-2">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm leading-tight">
                            {citation.title || domain}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                credibilityBadge.color === 'green'
                                  ? 'text-green-600 border-green-200'
                                  : credibilityBadge.color === 'blue'
                                  ? 'text-blue-600 border-blue-200'
                                  : credibilityBadge.color === 'orange'
                                  ? 'text-orange-600 border-orange-200'
                                  : 'text-gray-600 border-gray-200'
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
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View source →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No research sources available for this response.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
