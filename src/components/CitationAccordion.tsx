/**
 * CitationAccordion Component
 * Tabbed interface with dashed border aesthetic for References, Related Bills, and Research Sources
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Globe, Link as LinkIcon } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

interface CitationAccordionProps {
  bills: BillCitation[];
  sources: PerplexityCitation[];
  relatedBills?: BillCitation[];
  onCitationClick?: (citationNumber: number) => void;
}

export function CitationAccordion({ bills, sources, relatedBills = [], onCitationClick }: CitationAccordionProps) {
  const hasBills = bills && bills.length > 0;
  const hasSources = sources && sources.length > 0;
  const hasRelated = relatedBills && relatedBills.length > 0;
  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedBillNumber, setSelectedBillNumber] = useState<string>("");
  const [selectedBillTitle, setSelectedBillTitle] = useState<string>("");

  if (!hasBills && !hasSources && !hasRelated) {
    return null;
  }

  const handlePDFView = (billNumber: string, billTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBillNumber(billNumber);
    setSelectedBillTitle(billTitle);
    setPdfOpen(true);
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="border-2 border-dashed border-border/50 rounded-lg p-0.5">
        <Tabs defaultValue="" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-transparent h-auto p-2 gap-1">
            <TabsTrigger
              value="references"
              className="data-[state=active]:bg-muted/50 text-xs font-medium py-2 px-3 rounded-md"
            >
              <div className="flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span>References ({bills.length})</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="related"
              className="data-[state=active]:bg-muted/50 text-xs font-medium py-2 px-3 rounded-md"
            >
              <div className="flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground">
                <LinkIcon className="h-3.5 w-3.5" />
                <span>Related ({relatedBills.length})</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-muted/50 text-xs font-medium py-2 px-3 rounded-md"
            >
              <div className="flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground">
                <Globe className="h-3.5 w-3.5" />
                <span>Resources ({sources.length})</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* References Tab Content */}
          <TabsContent value="references" className="px-4 pb-3 mt-2">
            {hasBills ? (
              <div className="space-y-3">
                  {bills.map((citation, idx) => (
                    <div key={idx} className="group">
                      <Link
                        to={`/bills/${citation.bill_number}`}
                        className="block text-xs p-4 rounded-md border hover:border-primary/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          {/* PDF View Button */}
                          <button
                            onClick={(e) => handlePDFView(citation.bill_number, citation.title, e)}
                            className="flex-shrink-0 w-8 h-8 rounded-md bg-background border hover:bg-muted hover:border-primary transition-colors flex items-center justify-center"
                            title="View Full Text"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </button>

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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No bills referenced in this response.
                </p>
              )}
          </TabsContent>

          {/* Related Bills Tab Content */}
          <TabsContent value="related" className="px-4 pb-3 mt-2">
            {hasRelated ? (
              <div className="space-y-3">
                  {relatedBills.map((citation, idx) => (
                    <div key={idx} className="group">
                      <Link
                        to={`/bills/${citation.bill_number}`}
                        className="block text-xs p-4 rounded-md border hover:border-primary/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          {/* PDF View Button */}
                          <button
                            onClick={(e) => handlePDFView(citation.bill_number, citation.title, e)}
                            className="flex-shrink-0 w-8 h-8 rounded-md bg-background border hover:bg-muted hover:border-primary transition-colors flex items-center justify-center"
                            title="View Full Text"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </button>

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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No related bills found for this response.
                </p>
              )}
          </TabsContent>

          {/* Resources Tab Content */}
          <TabsContent value="resources" className="px-4 pb-3 mt-2">
            {hasSources ? (
              <div className="space-y-3">
                  {sources.map((citation) => {
                    const domain = extractDomain(citation.url);

                    return (
                      <div
                        key={citation.number}
                        className="p-3 rounded-md border hover:border-primary/50 transition-colors cursor-pointer"
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
