
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { Bill } from "./types";
import { getStatusBadgeVariant } from "./utils";

interface BillsTableDesktopProps {
  bills: Bill[];
  onBillSelect?: (bill: Bill) => void;
  onAIAnalysis: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite: (bill: Bill, e: React.MouseEvent) => void;
  favoriteBillIds: Set<number>;
  billsWithAIChat?: Set<number>;
}

export const BillsTableDesktop = ({
  bills,
  onBillSelect,
  onAIAnalysis,
  onFavorite,
  favoriteBillIds,
  billsWithAIChat = new Set()
}: BillsTableDesktopProps) => {
  return (
    <div className="hidden md:block">
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <Table className="min-w-[800px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px] whitespace-nowrap">Bill</TableHead>
                <TableHead className="min-w-[300px] whitespace-nowrap">Title</TableHead>
                <TableHead className="min-w-[120px] whitespace-nowrap">Status</TableHead>
                <TableHead className="min-w-[150px] whitespace-nowrap">Committee</TableHead>
                <TableHead className="min-w-[150px] whitespace-nowrap">Last Action</TableHead>
                <TableHead className="min-w-[120px] text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow
                  key={bill.bill_id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onBillSelect && onBillSelect(bill)}
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    {bill.bill_number || "No Number"}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={bill.title || ""}>
                      {bill.title || "No Title"}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(bill.status_desc)}>
                      {bill.status_desc || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{bill.committee || "N/A"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {bill.last_action || "No recent action"}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end">
                      <CardActionButtons
                        onFavorite={(e) => onFavorite(bill, e)}
                        onAIAnalysis={(e) => onAIAnalysis(bill, e)}
                        isFavorited={favoriteBillIds.has(bill.bill_id)}
                        hasAIChat={billsWithAIChat.has(bill.bill_id)}
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
