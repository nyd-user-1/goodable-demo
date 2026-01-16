import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillStatusBadge } from "@/components/BillStatusBadge";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { Tables } from "@/integrations/supabase/types";
import { generateMemberSlug } from "@/utils/memberSlug";
import { ThumbsUp, ThumbsDown, Minus, StickyNote } from "lucide-react";
import { ReviewStatus } from "@/hooks/useBillReviews";
import { BillPDFSheet } from "./BillPDFSheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Bill = Tables<"Bills">;
type Sponsor = Tables<"Sponsors"> & {
  person?: Tables<"People">;
};

interface BillSummaryProps {
  bill: Bill;
  sponsors: Sponsor[];
  onFavorite?: (e: React.MouseEvent) => void;
  onAIAnalysis?: (e: React.MouseEvent) => void;
  isFavorited?: boolean;
  hasAIChat?: boolean;
  reviewStatus?: ReviewStatus;
  reviewNote?: string | null;
}

export const BillSummary = ({
  bill,
  sponsors,
  onFavorite,
  onAIAnalysis,
  isFavorited = false,
  hasAIChat = false,
  reviewStatus,
  reviewNote
}: BillSummaryProps) => {
  const [pdfSheetOpen, setPdfSheetOpen] = useState(false);

  const handlePDFView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPdfSheetOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Helper to generate committee slug from committee name
  // Bill committee names often include chamber prefix: "Assembly Governmental Operations"
  // We need to extract chamber and committee name separately
  const generateCommitteeSlugFromName = (committeeName: string | null): string | null => {
    if (!committeeName) return null;

    // Normalize the name
    const normalized = committeeName.toLowerCase().trim();

    // Check if it starts with "assembly" or "senate"
    let chamber = '';
    let name = normalized;

    if (normalized.startsWith('assembly ')) {
      chamber = 'assembly';
      name = normalized.replace(/^assembly\s+/, '');
    } else if (normalized.startsWith('senate ')) {
      chamber = 'senate';
      name = normalized.replace(/^senate\s+/, '');
    }

    // Clean up the name part
    const cleanName = name
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Return in format: chamber-name
    return chamber ? `${chamber}-${cleanName}` : cleanName;
  };

  const primarySponsor = sponsors.find(s => s.position === 1);
  const memberSlug = primarySponsor?.person ? generateMemberSlug(primarySponsor.person) : null;
  const committeeSlug = generateCommitteeSlugFromName(bill.committee);

  // Get review status badge
  const getReviewBadge = () => {
    if (!reviewStatus) return null;

    const config = {
      support: {
        icon: ThumbsUp,
        label: 'Support',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      },
      oppose: {
        icon: ThumbsDown,
        label: 'Oppose',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      },
      neutral: {
        icon: Minus,
        label: 'Neutral',
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400'
      }
    };

    const { icon: Icon, label, className } = config[reviewStatus];

    return (
      <Badge variant="outline" className={`gap-1 ${className}`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  return (
    <Card className="card bg-card rounded-xl shadow-sm border overflow-hidden">
      <CardHeader className="card-header px-6 py-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl font-semibold">
                {bill.bill_number || "Unknown Bill Number"}
              </CardTitle>
              {getReviewBadge()}
              {reviewNote && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 cursor-pointer">
                        <StickyNote className="h-3 w-3" />
                        Has Note
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[300px]">
                      <p className="text-sm whitespace-pre-wrap">{reviewNote}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CardActionButtons
              onFavorite={onFavorite}
              onAIAnalysis={onAIAnalysis}
              onPDFView={handlePDFView}
              isFavorited={isFavorited}
              hasAIChat={hasAIChat}
              showFavorite={!!onFavorite}
              showAIAnalysis={!!onAIAnalysis}
              billNumber={bill.bill_number}
              showPDF={true}
              size="sm"
              variant="outline"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="card-body p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Primary Sponsor</h4>
            {memberSlug ? (
              <Link
                to={`/members/${memberSlug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {primarySponsor?.person?.name || "Not specified"}
              </Link>
            ) : (
              <p className="text-sm font-medium">
                {primarySponsor?.person?.name || "Not specified"}
              </p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Party</h4>
            <p className="text-sm">{primarySponsor?.person?.party || "Not specified"}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Committee</h4>
            {committeeSlug ? (
              <Link
                to={`/committees/${committeeSlug}`}
                className="text-sm text-primary hover:underline"
              >
                {bill.committee || "Not assigned"}
              </Link>
            ) : (
              <p className="text-sm">{bill.committee || "Not assigned"}</p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Last Action</h4>
            <p className="text-sm">{formatDate(bill.last_action_date)}</p>
          </div>
        </div>
        
        {bill.description && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {bill.description}
            </p>
          </div>
        )}
      </CardContent>

      {/* PDF Viewer Sheet */}
      <BillPDFSheet
        isOpen={pdfSheetOpen}
        onClose={() => setPdfSheetOpen(false)}
        billNumber={bill.bill_number || ""}
        billTitle={bill.title || ""}
        bill={bill}
      />
    </Card>
  );
};