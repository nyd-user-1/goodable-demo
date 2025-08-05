import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, FileText, Calendar } from "lucide-react";
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

type Member = Tables<"People">;
type Bill = Tables<"Bills">;

interface CommitteeDetailProps {
  committee: Committee;
  onBack: () => void;
}

export const CommitteeDetail = ({ committee, onBack }: CommitteeDetailProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommitteeData = async () => {
      setLoading(true);
      
      try {
        // Fetch members associated with this committee
        const { data: memberData } = await supabase
          .from("People")
          .select("*")
          .or(`committee_id.eq.${committee.name},committee_id.ilike.%${committee.name}%`)
          .order("name");

        // Fetch bills associated with this committee
        const { data: billData } = await supabase
          .from("Bills")
          .select("*")
          .eq("committee", committee.name)
          .order("last_action_date", { ascending: false });

        setMembers(memberData || []);
        setBills(billData || []);
      } catch {
        // Failed to fetch committee details
      } finally {
        setLoading(false);
      }
    };

    fetchCommitteeData();
  }, [committee.name]);

  return (
    <div className="page-container min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Navigation Section */}
          <section className="section-container bg-card rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={onBack} 
                className="btn-secondary font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Committees</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          </section>

          {/* Committee Header Section */}
          <section className="section-container bg-card rounded-xl shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl leading-tight break-words">
                  {committee.name}
                </CardTitle>
                {committee.description && (
                  <p className="text-muted-foreground mt-2 text-base sm:text-lg break-words">
                    {committee.description}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 self-start">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
            </div>
          </section>

          {/* Committee Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card bg-card rounded-xl shadow-sm border">
              <CardContent className="card-body p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{committee.memberCount}</div>
                    <div className="text-sm text-muted-foreground">Members</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card bg-card rounded-xl shadow-sm border">
              <CardContent className="card-body p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{committee.billCount}</div>
                    <div className="text-sm text-muted-foreground">Bills</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card bg-card rounded-xl shadow-sm border">
              <CardContent className="card-body p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">Active</div>
                    <div className="text-sm text-muted-foreground">Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Members Section */}
          <section className="section-container bg-card rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Committee Members</h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : members.length > 0 ? (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.people_id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || `Member #${member.people_id}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.party && member.district ? `${member.party} - District ${member.district}` : member.party || member.district || 'Legislative Member'}
                      </div>
                    </div>
                    <Badge variant="outline" className="">
                      {member.chamber || 'Member'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No members found for this committee.</p>
            )}
          </section>

          {/* Recent Bills Section */}
          <section className="section-container bg-card rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Bills</h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : bills.length > 0 ? (
              <div className="space-y-3">
                {bills.slice(0, 10).map((bill) => (
                  <div
                    key={bill.bill_id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground break-words">
                        {bill.bill_number && (
                          <span className="text-blue-600 mr-2">{bill.bill_number}</span>
                        )}
                        {bill.title || "Untitled Bill"}
                      </div>
                      {bill.description && (
                        <div className="text-sm text-muted-foreground mt-1 break-words">
                          {bill.description.length > 150 
                            ? `${bill.description.substring(0, 150)}...` 
                            : bill.description
                          }
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        {bill.last_action_date && `Last action: ${bill.last_action_date}`}
                      </div>
                    </div>
                    <Badge variant="outline" className=" ml-3 flex-shrink-0">
                      {bill.status_desc || 'Unknown'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No bills found for this committee.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};