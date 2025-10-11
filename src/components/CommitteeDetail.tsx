import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  CommitteeInformation,
  CommitteeTabs
} from "./features/committees";

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

interface CommitteeDetailProps {
  committee: Committee;
  onBack: () => void;
}

export const CommitteeDetail = ({ committee, onBack }: CommitteeDetailProps) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Section */}
        <div className="pb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Committees</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Committee Header Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <CommitteeInformation committee={committee} />
          </CardContent>
        </Card>

        {/* Committee Tabs Section */}
        <section>
          <CommitteeTabs committee={committee} />
        </section>
      </div>
    </div>
  );
};
