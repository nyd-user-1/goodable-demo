import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

interface BillKeyInformationProps {
  bill: Bill;
}

export const BillKeyInformation = ({ bill }: BillKeyInformationProps) => {
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

  return (
    <Card className="card bg-card rounded-xl shadow-sm border overflow-hidden">
      <CardHeader className="card-header px-6 py-4 border-b">
        <CardTitle className="text-lg font-semibold">Key Information</CardTitle>
      </CardHeader>
      <CardContent className="card-body p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </CardContent>
    </Card>
  );
};