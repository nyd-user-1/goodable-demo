import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Vote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

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

type RollCall = Tables<"Roll Call">;
type VoteRecord = Tables<"Votes">;
type Person = Tables<"People">;
type Bill = Tables<"Bills">;

interface RollCallWithVotes extends RollCall {
  votes?: (VoteRecord & { person?: Person })[];
  bill?: Bill;
}

interface CommitteeVotesTableProps {
  committee: Committee;
}

export const CommitteeVotesTable = ({ committee }: CommitteeVotesTableProps) => {
  const [rollCalls, setRollCalls] = useState<RollCallWithVotes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommitteeVotes = async () => {
      setLoading(true);
      try {
        // First, find bills that belong to this committee
        // Match by committee name (case-insensitive partial match)
        const { data: committeeBills, error: billsError } = await supabase
          .from("Bills")
          .select("bill_id, bill_number")
          .ilike("committee", `%${committee.name}%`);

        if (billsError) {
          console.error("Error fetching committee bills:", billsError);
          setRollCalls([]);
          return;
        }

        if (!committeeBills || committeeBills.length === 0) {
          setRollCalls([]);
          return;
        }

        const billIds = committeeBills.map(b => b.bill_id);

        // Get roll calls for these bills where description is COMMITTEE
        const { data: rollCallData, error: rollCallError } = await supabase
          .from("Roll Call")
          .select("*")
          .in("bill_id", billIds)
          .ilike("description", "%COMMITTEE%")
          .order("date", { ascending: false })
          .limit(50);

        if (rollCallError) {
          console.error("Error fetching roll calls:", rollCallError);
          setRollCalls([]);
          return;
        }

        if (!rollCallData || rollCallData.length === 0) {
          setRollCalls([]);
          return;
        }

        // Fetch detailed vote records for each roll call
        const rollCallsWithVotes: RollCallWithVotes[] = await Promise.all(
          rollCallData.map(async (rollCall) => {
            // Get votes for this roll call
            const { data: votesData } = await supabase
              .from("Votes")
              .select("*")
              .eq("roll_call_id", rollCall.roll_call_id);

            // Get person data for the votes
            let votesWithPeople: (VoteRecord & { person?: Person })[] = [];
            if (votesData && votesData.length > 0) {
              const voterIds = votesData.map(v => v.people_id);
              const { data: votersData } = await supabase
                .from("People")
                .select("*")
                .in("people_id", voterIds);

              votesWithPeople = votesData.map(vote => ({
                ...vote,
                person: votersData?.find(p => p.people_id === vote.people_id)
              }));
            }

            // Get bill info
            const bill = committeeBills.find(b => b.bill_id === rollCall.bill_id);

            return {
              ...rollCall,
              votes: votesWithPeople,
              bill: bill as Bill | undefined
            };
          })
        );

        setRollCalls(rollCallsWithVotes);
      } catch (error) {
        console.error("Error fetching committee votes:", error);
        setRollCalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommitteeVotes();
  }, [committee.committee_id, committee.name]);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Committee Votes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rollCalls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Committee Votes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No committee vote records found.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Committee voting records may become available as bills are processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Committee Votes</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {rollCalls.length} {rollCalls.length === 1 ? 'Vote' : 'Votes'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-6 pr-4">
            {rollCalls.map((rollCall) => (
              <div key={rollCall.roll_call_id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-sm">
                        {formatDate(rollCall.date)}
                      </h4>
                      {rollCall.chamber && (
                        <Badge variant="outline" className="text-xs">
                          {rollCall.chamber}
                        </Badge>
                      )}
                    </div>
                    {rollCall.bill && (
                      <p className="text-sm text-primary mb-2">
                        {rollCall.bill.bill_number}
                      </p>
                    )}
                    {rollCall.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {rollCall.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">{rollCall.yea || 0} Yes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-medium">{rollCall.nay || 0} No</span>
                      </div>
                      {rollCall.absent && Number(rollCall.absent) > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-muted rounded-full"></div>
                          <span className="font-medium">{rollCall.absent} Absent</span>
                        </div>
                      )}
                      {rollCall.nv && Number(rollCall.nv) > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="font-medium">{rollCall.nv} NV</span>
                        </div>
                      )}
                      <div className="text-muted-foreground">
                        Total: {rollCall.total || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {rollCall.votes && rollCall.votes.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <h5 className="font-medium text-sm mb-3">Individual Votes</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {rollCall.votes.map((vote) => (
                        <div key={`${vote.people_id}-${vote.roll_call_id}`} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                          <span className="font-medium">
                            {vote.person?.name || `Person ${vote.people_id}`}
                          </span>
                          <div className="flex items-center gap-1">
                            {vote.person?.party && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {vote.person.party}
                              </Badge>
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              vote.vote_desc === 'Yes' || vote.vote_desc === 'Yea' ? 'bg-green-100 text-green-800' :
                              vote.vote_desc === 'No' || vote.vote_desc === 'Nay' ? 'bg-red-100 text-red-800' :
                              vote.vote_desc === 'NV' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {vote.vote_desc || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
