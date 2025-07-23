
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { Bill } from "./types";

interface BillCardProps {
  bill: Bill;
  onBillSelect?: (bill: Bill) => void;
  onAIAnalysis: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite: (bill: Bill, e: React.MouseEvent) => void;
  isFavorited: boolean;
  hasAIChat?: boolean;
}

export const BillCard = ({
  bill,
  onBillSelect,
  onAIAnalysis,
  onFavorite,
  isFavorited,
  hasAIChat = false
}: BillCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden"
      onClick={() => onBillSelect && onBillSelect(bill)}
    >
      <InteractiveGridPattern
        width={20}
        height={20}
        className="absolute inset-0 opacity-5 hover:opacity-10 transition-opacity duration-300 [mask:radial-gradient(300px_circle_at_center,white,transparent)]"
      />
      <CardContent className="p-4 min-h-[120px] flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {bill.bill_number || "No Number"}
              </span>
            </div>
          </div>
          
          <CardActionButtons
            onFavorite={(e) => onFavorite(bill, e)}
            onAIAnalysis={(e) => onAIAnalysis(bill, e)}
            isFavorited={isFavorited}
            hasAIChat={hasAIChat}
          />
        </div>
        
        {/* Description moved to bottom with full width and 3-line limit */}
        {bill.title && (
          <div className="w-full">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-tight">
              {bill.title}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
