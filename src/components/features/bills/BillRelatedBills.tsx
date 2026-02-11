import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillVersion } from "@/hooks/useBillExtendedData";

interface BillRelatedBillsProps {
  sameAs: BillVersion[];
  previousVersions: BillVersion[];
  substitutedBy: BillVersion | null;
  lawSection: string | null;
  lawCode: string | null;
}

export const BillRelatedBills = ({
  sameAs,
  previousVersions,
  substitutedBy,
  lawSection,
  lawCode,
}: BillRelatedBillsProps) => {
  const hasContent =
    sameAs.length > 0 ||
    previousVersions.length > 0 ||
    substitutedBy ||
    lawSection;

  if (!hasContent) return null;

  const formatSession = (session: number) =>
    `${session}-${session + 1}`;

  return (
    <Card className="card bg-card rounded-xl shadow-sm border overflow-hidden">
      <CardHeader className="card-header px-6 py-4 border-b">
        <CardTitle className="text-lg font-semibold">Related Bills</CardTitle>
      </CardHeader>
      <CardContent className="card-body p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Same-As / Companion Bills */}
          {sameAs.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Same-As Bill{sameAs.length > 1 ? "s" : ""}
              </h4>
              <div className="flex flex-wrap gap-2">
                {sameAs.map((bill) => (
                  <Link
                    key={`${bill.basePrintNo}-${bill.session}`}
                    to={`/bills/${bill.basePrintNo}?session=${bill.session}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {bill.basePrintNo}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Substituted By */}
          {substitutedBy && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Substituted By
              </h4>
              <Link
                to={`/bills/${substitutedBy.basePrintNo}?session=${substitutedBy.session}`}
                className="text-sm text-primary hover:underline"
              >
                {substitutedBy.basePrintNo}
              </Link>
            </div>
          )}

          {/* Law Section */}
          {lawSection && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Law Section
              </h4>
              <p className="text-sm">{lawSection}</p>
              {lawCode && (
                <p className="text-xs text-muted-foreground mt-1">{lawCode}</p>
              )}
            </div>
          )}

          {/* Previous Versions */}
          {previousVersions.length > 0 && (
            <div className={sameAs.length === 0 && !substitutedBy && !lawSection ? "" : "md:col-span-2 lg:col-span-4"}>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Prior Sessions
              </h4>
              <div className="flex flex-wrap gap-2">
                {previousVersions.map((bill) => (
                  <Link
                    key={`${bill.basePrintNo}-${bill.session}`}
                    to={`/bills/${bill.basePrintNo}?session=${bill.session}`}
                  >
                    <Badge variant="outline" className="hover:bg-muted transition-colors">
                      {formatSession(bill.session)}: {bill.basePrintNo}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
