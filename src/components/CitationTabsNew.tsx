/**
 * CitationTabsNew Component
 * Perplexity-style layout with content, action buttons, and "More" accordion section
 */

import { useState, ReactNode, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, ThumbsUp, ThumbsDown, Copy, Check, Mail, BookOpenCheck, MoreHorizontal, Star, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { EmailLetterSheet } from "@/components/features/bills/EmailLetterSheet";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

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
  onSendMessage?: (message: string) => void;
}

export function CitationTabsNew({
  messageContent,
  bills,
  sources,
  relatedBills = [],
  onCitationClick,
  isStreaming = false,
  onSendMessage
}: CitationTabsNewProps) {
  const hasBills = bills && bills.length > 0;
  const hasSources = sources && sources.length > 0;
  const hasRelated = relatedBills && relatedBills.length > 0;
  const { toast } = useToast();

  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedBillNumber, setSelectedBillNumber] = useState<string>("");
  const [selectedBillTitle, setSelectedBillTitle] = useState<string>("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showCitations, setShowCitations] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailSheetOpen, setEmailSheetOpen] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);

  const handlePDFView = async (billNumber: string, billTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBillNumber(billNumber);
    setSelectedBillTitle(billTitle);

    // Fetch the bill data BEFORE opening the sheet for Quick Review functionality
    try {
      const { data } = await supabase
        .from("Bills")
        .select("*")
        .ilike("bill_number", billNumber)
        .single();

      if (data) {
        setSelectedBill(data);
      }
    } catch (error) {
      console.error("Error fetching bill:", error);
    }

    // Open the sheet after bill is fetched
    setPdfOpen(true);
  };

  const handleCopy = async () => {
    const extractText = (node: ReactNode): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(extractText).join('');
      if (node && typeof node === 'object' && 'props' in node) {
        return extractText(node.props.children);
      }
      return '';
    };

    const text = extractText(messageContent);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: "Copied to clipboard",
      description: "Response text has been copied",
    });
  };

  const handleExport = () => {
    const extractText = (node: ReactNode): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(extractText).join('');
      if (node && typeof node === 'object' && 'props' in node) {
        return extractText(node.props.children);
      }
      return '';
    };

    const text = extractText(messageContent);

    // Create PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add title
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Goodable Response", margin, margin);

    // Add date
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(128, 128, 128);
    pdf.text(new Date().toLocaleDateString(), margin, margin + 8);
    pdf.setTextColor(0, 0, 0);

    let yPosition = margin + 20;

    // Helper to check/add new page
    const checkNewPage = (neededHeight: number) => {
      if (yPosition + neededHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Helper to render text with inline bold support
    const renderTextWithBold = (line: string, x: number, fontSize: number) => {
      pdf.setFontSize(fontSize);
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      let currentX = x;

      for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Bold text
          const boldText = part.slice(2, -2);
          pdf.setFont("helvetica", "bold");
          pdf.text(boldText, currentX, yPosition);
          currentX += pdf.getTextWidth(boldText);
        } else if (part) {
          // Normal text
          pdf.setFont("helvetica", "normal");
          pdf.text(part, currentX, yPosition);
          currentX += pdf.getTextWidth(part);
        }
      }
    };

    // Process content line by line
    const rawLines = text.split('\n');

    for (const rawLine of rawLines) {
      const trimmedLine = rawLine.trim();

      // Skip empty lines but add spacing
      if (!trimmedLine) {
        yPosition += 4;
        continue;
      }

      // Handle headers (### Header)
      if (trimmedLine.startsWith('### ')) {
        checkNewPage(12);
        yPosition += 6; // Extra space before header
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        const headerText = trimmedLine.replace(/^###\s*/, '').replace(/\*\*/g, '');
        pdf.text(headerText, margin, yPosition);
        yPosition += 8;
        continue;
      }

      // Handle H2 headers (## Header)
      if (trimmedLine.startsWith('## ')) {
        checkNewPage(14);
        yPosition += 8;
        pdf.setFontSize(15);
        pdf.setFont("helvetica", "bold");
        const headerText = trimmedLine.replace(/^##\s*/, '').replace(/\*\*/g, '');
        pdf.text(headerText, margin, yPosition);
        yPosition += 10;
        continue;
      }

      // Handle list items (- item)
      if (trimmedLine.startsWith('- ')) {
        const listContent = trimmedLine.slice(2);
        const listMaxWidth = maxWidth - 10;

        // Split for word wrap
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        const wrappedLines = pdf.splitTextToSize(listContent.replace(/\*\*/g, ''), listMaxWidth);

        for (let i = 0; i < wrappedLines.length; i++) {
          checkNewPage(6);
          if (i === 0) {
            pdf.text("•", margin, yPosition);
          }
          // Check if original line had bold markers and render accordingly
          if (listContent.includes('**')) {
            renderTextWithBold(wrappedLines[i], margin + 8, 11);
          } else {
            pdf.text(wrappedLines[i], margin + 8, yPosition);
          }
          yPosition += 6;
        }
        continue;
      }

      // Regular paragraph - handle word wrap and bold
      pdf.setFontSize(11);
      const cleanLine = trimmedLine.replace(/\*\*/g, '');
      const wrappedLines = pdf.splitTextToSize(cleanLine, maxWidth);

      for (const wrappedLine of wrappedLines) {
        checkNewPage(6);
        // If original has bold markers, render with bold support
        if (trimmedLine.includes('**')) {
          renderTextWithBold(wrappedLine, margin, 11);
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.text(wrappedLine, margin, yPosition);
        }
        yPosition += 6;
      }
    }

    // Save PDF
    pdf.save(`goodable-response-${Date.now()}.pdf`);

    toast({
      title: "Exported successfully",
      description: "Response has been downloaded as a PDF",
    });
  };

  const handleFavorite = () => {
    toast({
      title: "Added to favorites",
      description: "This response has been saved to your favorites",
    });
    // TODO: Implement actual favorite functionality
  };

  const handleSupportLetter = () => {
    if (onSendMessage && hasBills) {
      const billNumber = bills[0].bill_number;
      onSendMessage(`Can you help me write a letter in support of ${billNumber}?`);
    }
  };

  const handleOppositionLetter = () => {
    if (onSendMessage && hasBills) {
      const billNumber = bills[0].bill_number;
      onSendMessage(`Can you help me write a letter opposing ${billNumber}?`);
    }
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
        <div className="flex items-center gap-3 pt-4 border-t animate-in fade-in duration-300">
          {/* Citations Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${showCitations
                  ? "text-foreground bg-muted hover:bg-muted/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setShowCitations(!showCitations)}
              >
                <BookOpenCheck className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Citations</TooltipContent>
          </Tooltip>

          {/* View Bill */}
          {hasBills && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={(e) => handlePDFView(bills[0].bill_number, bills[0].title, e)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View bill</TooltipContent>
            </Tooltip>
          )}

          {/* Write Support Letter */}
          {hasBills && onSendMessage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-green-600 hover:bg-muted"
                  onClick={handleSupportLetter}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Write support letter</TooltipContent>
            </Tooltip>
          )}

          {/* Write Opposition Letter */}
          {hasBills && onSendMessage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-muted"
                  onClick={handleOppositionLetter}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Write opposition letter</TooltipContent>
            </Tooltip>
          )}

          {/* Email to Sponsor */}
          {hasBills && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted"
                  onClick={() => setEmailSheetOpen(true)}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Email to sponsor</TooltipContent>
            </Tooltip>
          )}

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>More actions</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied!" : "Copy"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFavorite}>
                <Star className="h-4 w-4 mr-2" />
                Favorite
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                      <div key={idx} className="relative">
                        {/* PDF View Button - Top Right */}
                        <button
                          onClick={(e) => handlePDFView(citation.bill_number, citation.title, e)}
                          className="absolute top-2 right-2 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors z-10"
                          title="View Full Text"
                        >
                          <FileText className="h-4 w-4" />
                        </button>

                        <Link
                          to={`/bills/${citation.bill_number}`}
                          className="block p-4 pr-12 rounded-lg group"
                        >
                          {/* Bill Content */}
                          <div className="space-y-2">
                              {/* Bill Number */}
                              <h3 className="font-semibold text-base text-foreground group-hover:underline">
                                {citation.bill_number}
                              </h3>

                              {/* Bill Title */}
                              <p className="text-sm text-foreground leading-snug">
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
                      <div key={idx} className="relative">
                        {/* PDF View Button - Top Right */}
                        <button
                          onClick={(e) => handlePDFView(citation.bill_number, citation.title, e)}
                          className="absolute top-2 right-2 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors z-10"
                          title="View Full Text"
                        >
                          <FileText className="h-4 w-4" />
                        </button>

                        <Link
                          to={`/bills/${citation.bill_number}`}
                          className="block p-4 pr-12 rounded-lg group"
                        >
                          {/* Bill Content */}
                          <div className="space-y-2">
                              {/* Bill Number */}
                              <h3 className="font-semibold text-base text-foreground group-hover:underline">
                                {citation.bill_number}
                              </h3>

                              {/* Bill Title */}
                              <p className="text-sm text-foreground leading-snug">
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
                        <a
                          key={citation.number}
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          {/* Citation Content */}
                          <div className="space-y-1">
                            <h3 className="font-semibold text-sm leading-tight">
                              {citation.title || domain}
                            </h3>
                            <p className="text-xs text-muted-foreground">{domain}</p>
                          </div>
                        </a>
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
        onClose={() => {
          setPdfOpen(false);
          setSelectedBill(null);
        }}
        billNumber={selectedBillNumber}
        billTitle={selectedBillTitle}
        bill={selectedBill}
      />

      {/* Email Letter Sheet */}
      {hasBills && (
        <EmailLetterSheet
          isOpen={emailSheetOpen}
          onClose={() => setEmailSheetOpen(false)}
          billNumber={bills[0].bill_number}
          billTitle={bills[0].title}
          messageContent={messageContent}
        />
      )}
    </div>
  );
}
