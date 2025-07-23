
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { AIChatSheet } from "@/components/AIChatSheet";
import { useCommitteeChatSessions } from "@/hooks/useCommitteeChatSessions";
import { useMemberCommittees } from "@/hooks/useMemberCommittees";
import { useCommitteeFavorites } from "@/hooks/useCommitteeFavorites";

type Member = Tables<"People">;

interface MemberCommitteesTableProps {
  member: Member;
}

export const MemberCommitteesTable = ({ member }: MemberCommitteesTableProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedCommitteeForChat, setSelectedCommitteeForChat] = useState<any>(null);
  const { createOrGetChatSession, loading: chatLoading } = useCommitteeChatSessions();
  const { committees, loading, error } = useMemberCommittees(member);
  const { favoriteCommitteeIds, toggleFavorite } = useCommitteeFavorites();

  const handleAIAnalysis = async (committee: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create the committee object with the correct structure for AIChatSheet
    const committeeForChat = {
      committee_id: committee.committee_id,
      name: committee.committee_name,
      chamber: committee.chamber,
      description: committee.description,
    };

    const session = await createOrGetChatSession({
      committee_id: committee.committee_id,
      committee_name: committee.committee_name,
      description: committee.description,
    });
    
    if (session !== null) {
      setSelectedCommitteeForChat(committeeForChat);
      setChatOpen(true);
    }
  };

  const handleFavorite = async (committee: any, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(committee.committee_id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Committees</h3>
          <Button variant="outline" size="sm">
            All Committees
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading committee assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Committees</h3>
          <Button variant="outline" size="sm">
            All Committees
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">Error loading committee assignments: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Committees</h3>
        <Button variant="outline" size="sm">
          All Committees
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <div className="relative">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] bg-background sticky left-0 z-10 border-r">Actions</TableHead>
                  <TableHead className="min-w-[200px]">Committee</TableHead>
                  <TableHead className="min-w-[120px]">Role</TableHead>
                  <TableHead className="min-w-[110px]">Chamber</TableHead>
                  <TableHead className="min-w-[300px]">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {committees.map((committee) => (
                  <TableRow 
                    key={committee.committee_id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {}}
                  >
                    <TableCell className="bg-background sticky left-0 z-10 border-r">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleFavorite(committee, e)}
                          className="h-8 w-8 p-0 hover:bg-muted"
                          disabled={chatLoading}
                        >
                          <Heart className={`h-4 w-4 ${favoriteCommitteeIds.has(committee.committee_id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleAIAnalysis(committee, e)}
                          className="h-8 w-8 p-0 hover:bg-muted"
                          disabled={chatLoading}
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {committee.committee_name}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        committee.role === 'Chair' 
                          ? 'bg-blue-100 text-blue-700'
                          : committee.role === 'Ranking'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {committee.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {committee.chamber}
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      {committee.description || "No description available"}
                    </TableCell>
                  </TableRow>
                ))}
                {committees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No committee assignments found for this member
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        committee={selectedCommitteeForChat}
      />
    </div>
  );
};
