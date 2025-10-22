/**
 * CitationAccordion Component
 * Collapsible accordion interface for References, Related Bills, and Research Sources
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Globe, Link as LinkIcon } from "lucide-react";
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
      <Accordion type="multiple" className="w-full space-y-2">
        {/* References Accordion */}
        {hasBills && (
          <AccordionItem
            value="references"
            className="border-0 relative before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-dashed before:border-border/50 data-[state=open]:before:border-border/70 before:transition-colors before:duration-300"
          >
            <div className="relative p-0.5">
              <AccordionTrigger className="hover:no-underline px-4 py-2.5 rounded-t-lg text-xs font-medium">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span>References ({bills.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-3 pt-2">
                  {bills.map((citation, idx) => (
                    <div key={idx} className="group">
                      <Link
                        to={`/bills/${citation.bill_number}`}
                        className="block text-xs p-4 rounded-md bg-muted/40 border hover:bg-muted/60 hover:border-primary/50 transition-all cursor-pointer"
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
              </AccordionContent>
            </div>
          </AccordionItem>
        )}

        {/* Related Bills Accordion */}
        {hasRelated && (
          <AccordionItem
            value="related"
            className="border-0 relative before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-dashed before:border-border/50 data-[state=open]:before:border-border/70 before:transition-colors before:duration-300"
          >
            <div className="relative p-0.5">
              <AccordionTrigger className="hover:no-underline px-4 py-2.5 rounded-t-lg text-xs font-medium">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Related ({relatedBills.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-3 pt-2">
                  {relatedBills.map((citation, idx) => (
                    <div key={idx} className="group">
                      <Link
                        to={`/bills/${citation.bill_number}`}
                        className="block text-xs p-4 rounded-md bg-muted/40 border hover:bg-muted/60 hover:border-primary/50 transition-all cursor-pointer"
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
              </AccordionContent>
            </div>
          </AccordionItem>
        )}

        {/* Resources Accordion */}
        {hasSources && (
          <AccordionItem
            value="resources"
            className="border-0 relative before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-dashed before:border-border/50 data-[state=open]:before:border-border/70 before:transition-colors before:duration-300"
          >
            <div className="relative p-0.5">
              <AccordionTrigger className="hover:no-underline px-4 py-2.5 rounded-t-lg text-xs font-medium">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Resources ({sources.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-3 pt-2">
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
              </AccordionContent>
            </div>
          </AccordionItem>
        )}
      </Accordion>

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
