import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Users } from "lucide-react";
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
  committee_members?: string;
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
        // First, get the committee data to access committee_members field
        const { data: committeeData } = await supabase
          .from("Committees")
          .select("committee_members")
          .eq("committee_id", committee.committee_id)
          .single();

        if (committeeData && committeeData.committee_members) {
          // Split the semicolon-separated names
          const memberNames = committeeData.committee_members
            .split(';')
            .map(name => name.trim())
            .filter(name => name.length > 0);

          if (memberNames.length > 0) {
            // Try to fetch members using pattern matching for more flexible matching
            const memberPromises = memberNames.map(name =>
              supabase
                .from("People")
                .select("*")
                .ilike("name", `%${name}%`)
                .limit(1)
                .single()
            );

            const results = await Promise.all(memberPromises);
            const foundMembers = results
              .filter(result => result.data)
              .map(result => result.data)
              .filter((member): member is Member => member !== null);

            // Remove duplicates by people_id
            const uniqueMembers = Array.from(
              new Map(foundMembers.map(m => [m.people_id, m])).values()
            );

            setMembers(uniqueMembers);
          } else {
            setMembers([]);
          }
        } else {
          setMembers([]);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [committee.committee_id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Committee Members</h2>
        <Badge variant="secondary" className="text-xs">
          {loading ? '...' : `${members.length} ${members.length === 1 ? 'Member' : 'Members'}`}
        </Badge>
      </div>
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No members found for this committee.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div key={member.people_id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    {committee.chair_name === member.name && (
                      <Badge variant="default" className="text-xs">
                        Chair
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">
                    {member.name ||
                     `${member.first_name || ''} ${member.last_name || ''}`.trim() ||
                     `Member #${member.people_id}`}
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {member.party && (
                      <Badge variant="outline" className="text-xs">
                        {member.party}
                      </Badge>
                    )}
                    {member.chamber && (
                      <Badge variant="outline" className="text-xs">
                        {member.chamber}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    {member.role && (
                      <p>{member.role}</p>
                    )}
                    {member.district && (
                      <p>District {member.district}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
