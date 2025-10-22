/**
 * CitationTabs Component
 * Tabbed interface for Referenced Bills and Research Sources
 */

import { Link } from "react-router-dom";
import { FileText, Globe } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PerplexityCitation } from "@/utils/citationParser";
import { extractDomain } from "@/config/domainFilters";
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
            <div className="space-y-3">
              {bills.map((citation, idx) => (
                <Link
                  key={idx}
                  to={`/bills/${citation.bill_number}`}
                  className="block text-xs p-4 rounded-md bg-muted/40 border hover:bg-muted/60 hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    {/* Bill Icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>

                    {/* Bill Content */}
                    <div className="flex-1 space-y-1.5">
                      {/* Bill Number */}
                      <div className="font-bold text-sm text-primary group-hover:underline">
                        {citation.bill_number}
                      </div>

                      {/* Bill Title */}
                      <div className="font-medium text-xs text-foreground leading-snug line-clamp-2">
                        {citation.title}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center flex-wrap gap-2 text-[10px] text-muted-foreground">
                        {citation.status_desc && (
                          <Badge variant="outline" className="font-normal text-[10px] px-1.5 py-0">
                            {citation.status_desc}
                          </Badge>
                        )}
                        {citation.committee && (
                          <span>Committee: {citation.committee}</span>
                        )}
                      </div>

                      {/* Description */}
                      {citation.description && (
                        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 pt-0.5">
                          {citation.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
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

                return (
                  <div
                    key={citation.number}
                    className="p-3 rounded-md bg-muted/40 border hover:bg-muted/60 transition-colors cursor-pointer"
                    onClick={() => onCitationClick?.(citation.number)}
                  >
                    {/* Citation Content */}
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm leading-tight">
                          {citation.title || domain}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
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
