import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillStatusBadge } from "@/components/BillStatusBadge";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { Tables } from "@/integrations/supabase/types";

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

  const primarySponsor = sponsors.find(s => s.position === 1);

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
            <p className="text-sm font-medium">
              {primarySponsor?.person?.name || "Not specified"}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Party</h4>
            <p className="text-sm">{primarySponsor?.person?.party || "Not specified"}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Committee</h4>
            <p className="text-sm">{bill.committee || "Not assigned"}</p>
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