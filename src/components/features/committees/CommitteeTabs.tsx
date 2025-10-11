import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Info,
  Users,
  Vote
} from "lucide-react";
import { CommitteeBillsTable } from "./CommitteeBillsTable";
import { CommitteeMembersTable } from "./CommitteeMembersTable";
import { CommitteeVotesTable } from "./CommitteeVotesTable";

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

interface CommitteeTabsProps {
  committee: Committee;
}

export const CommitteeTabs = ({ committee }: CommitteeTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted rounded-lg">
        <TabsTrigger value="overview" className="h-10 rounded-md text-sm font-medium">
          Overview
        </TabsTrigger>
        <TabsTrigger value="bills" className="h-10 rounded-md text-sm font-medium">
          Bills
        </TabsTrigger>
        <TabsTrigger value="members" className="h-10 rounded-md text-sm font-medium">
          Members
        </TabsTrigger>
        <TabsTrigger value="votes" className="h-10 rounded-md text-sm font-medium">
          Votes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Committee Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {committee.description ? (
                <div className="prose prose-sm max-w-none">
                  {committee.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Committee description is not available.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Additional committee details may be available through the New York State Legislature website.
                  </p>
                </div>
              )}

              {/* Meeting Information */}
              {(committee.meeting_schedule || committee.next_meeting) && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-foreground mb-4">Meeting Information</h4>
                  <div className="space-y-3">
                    {committee.meeting_schedule && (
                      <div>
                        <span className="text-sm font-medium text-foreground">Schedule:</span>
                        <p className="text-muted-foreground mt-1">{committee.meeting_schedule}</p>
                      </div>
                    )}
                    {committee.next_meeting && (
                      <div>
                        <span className="text-sm font-medium text-foreground">Next Meeting:</span>
                        <p className="text-muted-foreground mt-1">{committee.next_meeting}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upcoming Agenda */}
              {committee.upcoming_agenda && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-foreground mb-4">Upcoming Agenda</h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground leading-relaxed">{committee.upcoming_agenda}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bills">
        <CommitteeBillsTable committee={committee} />
      </TabsContent>

      <TabsContent value="members">
        <CommitteeMembersTable committee={committee} />
      </TabsContent>

      <TabsContent value="votes">
        <CommitteeVotesTable committee={committee} />
      </TabsContent>
    </Tabs>
  );
};
