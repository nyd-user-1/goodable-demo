import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vote } from "lucide-react";

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

interface CommitteeVotesTableProps {
  committee: Committee;
}

export const CommitteeVotesTable = ({ committee }: CommitteeVotesTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Committee Votes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Vote information for this committee is not currently available.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Committee voting records and decisions may be available through the New York State Legislature website.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
