import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { supabase } from "@/integrations/supabase/client";
import { useMemberFavorites } from "@/hooks/useMemberFavorites";

type Member = {
  people_id: number;
  first_name: string;
  last_name: string;
  party: string;
  chamber: string;
  district: string;
  email?: string;
  phone?: string;
};

interface MembersTableProps {
  limit?: number;
}

export const MembersTable = ({ limit = 10 }: MembersTableProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersWithAIChat, setMembersWithAIChat] = useState<Set<number>>(new Set());
  const { favoriteMemberIds, toggleFavorite } = useMemberFavorites();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await supabase
          .from('People')
          .select('*')
          .order('last_name', { ascending: true })
          .limit(limit);

        if (data) {
          setMembers(data);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [limit]);

  useEffect(() => {
    const fetchMembersWithAIChat = async () => {
      try {
        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("member_id")
          .not("member_id", "is", null);

        if (sessions) {
          const memberIdsWithChat = new Set(
            sessions.map((session: any) => session.member_id).filter(Boolean)
          );
          setMembersWithAIChat(memberIdsWithChat);
        }
      } catch (error) {
        console.error('Error fetching AI chat sessions:', error);
      }
    };

    fetchMembersWithAIChat();
  }, []);

  const handleMemberSelect = (member: Member) => {
    window.location.href = `/members?selected=${member.people_id}`;
  };

  const handleFavorite = async (member: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(member.people_id);
  };

  const handleAIAnalysis = (member: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    // This would open AI chat with the member
    console.log('AI Analysis for member:', member);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-muted rounded w-full"></div>
        <div className="h-40 bg-muted rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto max-w-full">
        <Table className="min-w-[600px] w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px] whitespace-nowrap">Name</TableHead>
              <TableHead className="min-w-[80px] whitespace-nowrap">Party</TableHead>
              <TableHead className="min-w-[100px] whitespace-nowrap">Chamber</TableHead>
              <TableHead className="min-w-[80px] whitespace-nowrap">District</TableHead>
              <TableHead className="min-w-[120px] text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow
                key={member.people_id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleMemberSelect(member)}
              >
                <TableCell className="font-medium whitespace-nowrap">
                  {member.first_name} {member.last_name}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {member.party || "N/A"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {member.chamber || "N/A"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {member.district || "N/A"}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end">
                    <CardActionButtons
                      onFavorite={(e) => handleFavorite(member, e)}
                      onAIAnalysis={(e) => handleAIAnalysis(member, e)}
                      isFavorited={favoriteMemberIds.has(member.people_id)}
                      hasAIChat={membersWithAIChat.has(member.people_id)}
                      size="sm"
                      variant="outline"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};