import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  User,
  Users,
  Vote
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { MemberVotesTable } from "./MemberVotesTable";
import { MemberCommitteesTable } from "./MemberCommitteesTable";
import { MemberBillsTable } from "./MemberBillsTable";

type Member = Tables<"People">;

interface MemberTabsProps {
  member: Member;
}

export const MemberTabs = ({ member }: MemberTabsProps) => {
  const getLatestAction = () => {
    if (member.committee_id) return "COMMITTEE ASSIGNED";
    if (member.chamber) return "CHAMBER VERIFIED";
    return "MEMBER REGISTERED";
  };

  return (
    <Tabs defaultValue="bio" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted rounded-lg">
        <TabsTrigger value="bio" className="h-10 rounded-md text-sm font-medium">
          Bio
        </TabsTrigger>
        <TabsTrigger value="bills" className="h-10 rounded-md text-sm font-medium">
          Bills
        </TabsTrigger>
        <TabsTrigger value="committees" className="h-10 rounded-md text-sm font-medium">
          Committees
        </TabsTrigger>
        <TabsTrigger value="votes" className="h-10 rounded-md text-sm font-medium">
          Votes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="bio">
        <Card>
          <CardHeader>
            <CardTitle>Member Biography</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {member.bio_long ? (
                <div className="prose max-w-none">
                  <p className="text-sm leading-relaxed">{member.bio_long}</p>
                </div>
              ) : member.bio_short ? (
                <div className="prose max-w-none">
                  <p className="text-sm leading-relaxed">{member.bio_short}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Biography information is not available for this member.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Additional biographical details may be available through the New York State Legislature website.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bills">
        <MemberBillsTable member={member} />
      </TabsContent>

      <TabsContent value="committees">
        <MemberCommitteesTable member={member} />
      </TabsContent>

      <TabsContent value="votes">
        <MemberVotesTable member={member} />
      </TabsContent>
    </Tabs>
  );
};