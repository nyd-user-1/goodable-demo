import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

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

interface CommitteeMembersTableProps {
  committee: Committee;
}

export const CommitteeMembersTable = ({ committee }: CommitteeMembersTableProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const { data: memberData } = await supabase
          .from("People")
          .select("*")
          .or(`committee_id.eq.${committee.name},committee_id.ilike.%${committee.name}%`)
          .order("name");

        setMembers(memberData || []);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [committee.name]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No members found for this committee.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.people_id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors duration-200"
            >
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || `Member #${member.people_id}`}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {member.party && member.district
                    ? `${member.party} - District ${member.district}`
                    : member.party || member.district || 'Legislative Member'
                  }
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {member.chamber || 'Member'}
                </Badge>
                {committee.chair_name === member.name && (
                  <Badge variant="default" className="bg-primary">
                    Chair
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
