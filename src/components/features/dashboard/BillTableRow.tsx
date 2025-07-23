
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { Bill } from "./types";
import { formatLastAction, getStatusBadgeVariant } from "./utils";

interface BillTableRowProps {
  bill: Bill;
  onBillSelect?: (bill: Bill) => void;
  onAIAnalysis: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite: (bill: Bill, e: React.MouseEvent) => void;
  isFavorited: boolean;
}

export const BillTableRow = ({
  bill,
  onBillSelect,
  onAIAnalysis,
  onFavorite,
  isFavorited
}: BillTableRowProps) => {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onBillSelect && onBillSelect(bill)}
    >
      <TableCell className="font-medium">
        {bill.bill_number || "No Number"}
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(bill.status_desc)} className="text-xs">
          {bill.status_desc || "Unknown"}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatLastAction(bill.last_action_date)}
      </TableCell>
      <TableCell>
        <div className="max-w-[250px] truncate text-sm" title={bill.title || ""}>
          {bill.title || "No Title"}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-end">
          <CardActionButtons
            onFavorite={(e) => onFavorite(bill, e)}
            onAIAnalysis={(e) => onAIAnalysis(bill, e)}
            isFavorited={isFavorited}
            variant="outline"
            size="sm"
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
