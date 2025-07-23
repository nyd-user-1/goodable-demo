
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { Calendar, User, MapPin } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/dateUtils";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

interface BillCardProps {
  bill: Bill;
  onBillSelect: (bill: Bill) => void;
  onAIAnalysis?: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite?: (bill: Bill, e: React.MouseEvent) => void;
  isFavorited?: boolean;
  hasAIChat?: boolean;
}

export const BillCard = ({ 
  bill, 
  onBillSelect, 
  onAIAnalysis, 
  onFavorite, 
  isFavorited = false, 
  hasAIChat = false 
}: BillCardProps) => {
  // Get primary sponsor (first one)
  const primarySponsor = bill.sponsors?.[0];

  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onBillSelect(bill)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2">
              {bill.bill_number || "No Number"}
            </h3>
          </div>
          
          <CardActionButtons
            onFavorite={onFavorite ? (e) => onFavorite(bill, e) : undefined}
            onAIAnalysis={onAIAnalysis ? (e) => onAIAnalysis(bill, e) : undefined}
            isFavorited={isFavorited}
            hasAIChat={hasAIChat}
            showFavorite={!!onFavorite}
            showAIAnalysis={!!onAIAnalysis}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-6">
          <div className="space-y-2 pt-2 border-t">
            {primarySponsor?.name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate font-medium">{primarySponsor.name}</span>
                {primarySponsor.party && (
                  <span className="text-muted-foreground">({primarySponsor.party})</span>
                )}
              </div>
            )}

            {bill.last_action_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{formatDate(bill.last_action_date)}</span>
              </div>
            )}

            {bill.last_action && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{bill.last_action}</span>
              </div>
            )}
          </div>

          {/* Description section with more breathing room */}
          {bill.title && (
            <div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {bill.title}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
