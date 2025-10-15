import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillStatusBadge } from "@/components/BillStatusBadge";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { Tables } from "@/integrations/supabase/types";
import { generateMemberSlug } from "@/utils/memberSlug";

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
}

export const BillSummary = ({
  bill,
  sponsors,
  onFavorite,
  onAIAnalysis,
  isFavorited = false,
  hasAIChat = false
}: BillSummaryProps) => {
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
  // e.g., "Senate Education" → "senate-education"
  const generateCommitteeSlugFromName = (committeeName: string | null): string | null => {
    if (!committeeName) return null;
    return committeeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const primarySponsor = sponsors.find(s => s.position === 1);
  const memberSlug = primarySponsor?.person ? generateMemberSlug(primarySponsor.person) : null;
  const committeeSlug = generateCommitteeSlugFromName(bill.committee);

  return (
    <Card className="card bg-card rounded-xl shadow-sm border overflow-hidden">
      <CardHeader className="card-header px-6 py-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold mb-2">
              {bill.bill_number || "Unknown Bill Number"}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <CardActionButtons
              onFavorite={onFavorite}
              onAIAnalysis={onAIAnalysis}
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
    </Card>
  );
};