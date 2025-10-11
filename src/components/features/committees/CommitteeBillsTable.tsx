import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

type Committee = {
  committee_id: number;
  name: string;
  memberCount: string;
  billCount: string;
  description?: string;
  chair_name?: string;
  chair_email?: string;
  chamber: string;
  committee_url?: string;
  meeting_schedule?: string;
  next_meeting?: string;
  upcoming_agenda?: string;
  address?: string;
  slug?: string;
};

interface CommitteeBillsTableProps {
  committee: Committee;
}

export const CommitteeBillsTable = ({ committee }: CommitteeBillsTableProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        // Match bills where committee contains the committee name
        // e.g., "Aging" matches "Senate Aging" or "Assembly Aging"
        const { data: billData } = await supabase
          .from("Bills")
          .select("*")
          .ilike("committee", `%${committee.name}%`)
          .order("last_action_date", { ascending: false })
          .limit(50);

        setBills(billData || []);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [committee.name]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No bills found for this committee.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bills ({bills.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bills.map((bill) => (
            <div
              key={bill.bill_id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors duration-200"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground break-words">
                  {bill.bill_number && (
                    <span className="text-primary mr-2">{bill.bill_number}</span>
                  )}
                  {bill.title || "Untitled Bill"}
                </div>
                {bill.description && (
                  <div className="text-sm text-muted-foreground mt-1 break-words">
                    {bill.description.length > 200
                      ? `${bill.description.substring(0, 200)}...`
                      : bill.description
                    }
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {bill.last_action_date && `Last action: ${new Date(bill.last_action_date).toLocaleDateString()}`}
                </div>
              </div>
              <Badge variant="outline" className="ml-3 flex-shrink-0">
                {bill.status_desc || 'Unknown'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
