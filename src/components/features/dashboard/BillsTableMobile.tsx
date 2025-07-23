
import { BillCard } from "./BillCard";
import { Bill } from "./types";

interface BillsTableMobileProps {
  bills: Bill[];
  onBillSelect?: (bill: Bill) => void;
  onAIAnalysis: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite: (bill: Bill, e: React.MouseEvent) => void;
  favoriteBillIds: Set<number>;
  billsWithAIChat?: Set<number>;
}

export const BillsTableMobile = ({
  bills,
  onBillSelect,
  onAIAnalysis,
  onFavorite,
  favoriteBillIds,
  billsWithAIChat = new Set()
}: BillsTableMobileProps) => {
  return (
    <div className="md:hidden space-y-4">
      {bills.map((bill) => (
        <BillCard
          key={bill.bill_id}
          bill={bill}
          onBillSelect={onBillSelect}
          onAIAnalysis={onAIAnalysis}
          onFavorite={onFavorite}
          isFavorited={favoriteBillIds.has(bill.bill_id)}
          hasAIChat={billsWithAIChat.has(bill.bill_id)}
        />
      ))}
    </div>
  );
};
