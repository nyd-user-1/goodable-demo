import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { supabase } from "@/integrations/supabase/client";
import { useCommitteeFavorites } from "@/hooks/useCommitteeFavorites";

type Committee = {
  committee_id: number;
  name: string;
  chamber: string;
  description?: string;
  chair_name?: string;
  memberCount?: string;
  billCount?: string;
};

interface CommitteesTableProps {
  limit?: number;
}

export const CommitteesTable = ({ limit = 10 }: CommitteesTableProps) => {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [committeesWithAIChat, setCommitteesWithAIChat] = useState<Set<number>>(new Set());
  const { favoriteCommitteeIds, toggleFavorite } = useCommitteeFavorites();

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        const { data } = await supabase
          .from('Committees')
          .select('*')
          .order('name', { ascending: true })
          .limit(limit);

        if (data) {
          setCommittees(data);
        }
      } catch (error) {
        console.error('Error fetching committees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommittees();
  }, [limit]);

  useEffect(() => {
    const fetchCommitteesWithAIChat = async () => {
      try {
        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("committee_id")
          .not("committee_id", "is", null);

        if (sessions) {
          const committeeIdsWithChat = new Set(
            sessions.map((session: any) => session.committee_id).filter(Boolean)
          );
          setCommitteesWithAIChat(committeeIdsWithChat);
        }
      } catch (error) {
        console.error('Error fetching AI chat sessions:', error);
      }
    };

    fetchCommitteesWithAIChat();
  }, []);

  const handleCommitteeSelect = (committee: Committee) => {
    window.location.href = `/committees?selected=${committee.committee_id}`;
  };

  const handleFavorite = async (committee: Committee, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(committee.committee_id);
  };

  const handleAIAnalysis = (committee: Committee, e: React.MouseEvent) => {
    e.stopPropagation();
    // This would open AI chat with the committee
    console.log('AI Analysis for committee:', committee);
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
              <TableHead className="min-w-[200px] whitespace-nowrap">Committee Name</TableHead>
              <TableHead className="min-w-[100px] whitespace-nowrap">Chamber</TableHead>
              <TableHead className="min-w-[150px] whitespace-nowrap">Chair</TableHead>
              <TableHead className="min-w-[80px] whitespace-nowrap">Members</TableHead>
              <TableHead className="min-w-[120px] text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {committees.map((committee) => (
              <TableRow
                key={committee.committee_id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleCommitteeSelect(committee)}
              >
                <TableCell className="font-medium">
                  <div className="max-w-xs">
                    <div className="truncate" title={committee.name}>
                      {committee.name}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {committee.chamber || "N/A"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {committee.chair_name || "N/A"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {committee.memberCount || "N/A"}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end">
                    <CardActionButtons
                      onFavorite={(e) => handleFavorite(committee, e)}
                      onAIAnalysis={(e) => handleAIAnalysis(committee, e)}
                      isFavorited={favoriteCommitteeIds.has(committee.committee_id)}
                      hasAIChat={committeesWithAIChat.has(committee.committee_id)}
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