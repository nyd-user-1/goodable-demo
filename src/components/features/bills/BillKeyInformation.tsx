import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import { BillPDFSheet } from "./BillPDFSheet";
import { BillVersion } from "@/hooks/useBillExtendedData";

type Bill = Tables<"Bills">;

interface BillKeyInformationProps {
  bill: Bill;
  previousVersions?: BillVersion[];
  sameAs?: BillVersion[];
  substitutedBy?: BillVersion | null;
  lawSection?: string | null;
  lawCode?: string | null;
}

export const BillKeyInformation = ({
  bill,
  previousVersions = [],
  sameAs = [],
  substitutedBy = null,
  lawSection = null,
  lawCode = null,
}: BillKeyInformationProps) => {
  const [pdfSheetOpen, setPdfSheetOpen] = useState(false);
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

  const formatSession = (session: number) =>
    `${session}-${session + 1}`;

  const hasRelatedContent =
    previousVersions.length > 0 || sameAs.length > 0 || substitutedBy || lawSection;

  return (
    <Card className="card bg-card rounded-xl shadow-sm border overflow-hidden">
      <CardHeader className="card-header px-6 py-4 border-b">
        <CardTitle className="text-lg font-semibold">Key Information</CardTitle>
      </CardHeader>
      <CardContent className="card-body p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Last Action</h4>
            <p className="text-sm leading-relaxed">
              {bill.last_action || "No action recorded"}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Last Action Date</h4>
            <p className="text-sm">{formatDate(bill.last_action_date)}</p>
          </div>

          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">View PDF</h4>
            <button
              onClick={() => setPdfSheetOpen(true)}
              className="text-sm text-primary hover:text-primary/80 underline cursor-pointer"
            >
              {bill.bill_number || "View"}
            </button>
          </div>

          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">State Link</h4>
            {bill.state_link ? (
              <a
                href={bill.state_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 underline"
              >
                View on NY Senate
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Not available</p>
            )}
          </div>
        </div>

        {/* Related Bills Section — 3-column row */}
        {hasRelatedContent && (
          <>
            <div className="border-t my-5" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Same-As / Companion Bills */}
              <div>
                {(sameAs.length > 0 || substitutedBy) ? (
                  <>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      {substitutedBy ? "Substituted By" : `Same-As Bill${sameAs.length > 1 ? "s" : ""}`}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {substitutedBy ? (
                        <Link
                          to={`/bills/${substitutedBy.basePrintNo}?session=${substitutedBy.session}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {substitutedBy.basePrintNo}
                        </Link>
                      ) : (
                        sameAs.map((b) => (
                          <Link
                            key={`${b.basePrintNo}-${b.session}`}
                            to={`/bills/${b.basePrintNo}?session=${b.session}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {b.basePrintNo}
                          </Link>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Same-As Bill</h4>
                    <p className="text-sm text-muted-foreground">—</p>
                  </>
                )}
              </div>

              {/* Law Section */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Law Section</h4>
                {lawSection ? (
                  <>
                    <p className="text-sm">{lawSection}</p>
                    {lawCode && (
                      <p className="text-xs text-muted-foreground mt-1">{lawCode}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>

              {/* Prior Sessions */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Prior Sessions</h4>
                {previousVersions.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {previousVersions.map((b) => (
                      <Link
                        key={`${b.basePrintNo}-${b.session}`}
                        to={`/bills/${b.basePrintNo}?session=${b.session}`}
                      >
                        <Badge variant="outline" className="hover:bg-muted transition-colors w-full justify-center">
                          {formatSession(b.session)}: {b.basePrintNo}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
          </>
        )}

        <BillPDFSheet
          isOpen={pdfSheetOpen}
          onClose={() => setPdfSheetOpen(false)}
          billNumber={bill.bill_number || ""}
          billTitle={bill.title || ""}
          bill={bill}
        />
      </CardContent>
    </Card>
  );
};