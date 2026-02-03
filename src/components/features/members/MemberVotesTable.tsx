
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { VotesTable } from "./votes/VotesTable";
import { VotesPagination } from "./votes/VotesPagination";
import { mockVoteData } from "./votes/mockVoteData";

type Member = Tables<"People">;

interface MemberVotesTableProps {
  member: Member;
}

const VOTES_PER_PAGE = 25;

export const MemberVotesTable = ({ member }: MemberVotesTableProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleVoteClick = (vote: any) => {
    navigate(`/bills?selected=${vote.bill_id}`);
  };

  const handleAIAnalysis = (vote: any, e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleFavorite = async (vote: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement favorite functionality for votes/bills
  };

  // Filter votes based on search query (searches ALL votes)
  const filteredVotes = useMemo(() => {
    if (!searchQuery.trim()) return mockVoteData;

    const query = searchQuery.toLowerCase();
    return mockVoteData.filter(vote => 
      // Basic bill information
      vote.bill_number?.toLowerCase().includes(query) ||
      vote.description?.toLowerCase().includes(query) ||
      vote.bill_text?.toLowerCase().includes(query) ||
      vote.status?.toLowerCase().includes(query) ||
      
      // Sponsor and co-sponsor search
      vote.sponsor?.toLowerCase().includes(query) ||
      vote.co_sponsors?.some(coSponsor => 
        coSponsor.toLowerCase().includes(query)
      ) ||
      
      // Committee search
      vote.committee?.toLowerCase().includes(query) ||
      
      // Vote type search
      vote.vote_type?.toLowerCase().includes(query) ||
      
      // Date search (supports partial matches like "2025" or "01/05")
      vote.vote_date?.includes(query)
    );
  }, [searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredVotes.length / VOTES_PER_PAGE);
  const startIndex = (currentPage - 1) * VOTES_PER_PAGE;
  const endIndex = startIndex + VOTES_PER_PAGE;
  const currentPageVotes = filteredVotes.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Member Votes ({filteredVotes.length} total)</CardTitle>
            <Button variant="outline" size="sm">
              View All Votes
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search votes by bill number, description, sponsor, co-sponsor, committee, vote type, or date..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <VotesTable
            votes={currentPageVotes}
            onVoteClick={handleVoteClick}
            onAIAnalysis={handleAIAnalysis}
            onFavorite={handleFavorite}
            searchQuery={searchQuery}
          />
          
          {filteredVotes.length > VOTES_PER_PAGE && (
            <VotesPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalVotes={filteredVotes.length}
              votesPerPage={VOTES_PER_PAGE}
            />
          )}
        </CardContent>
      </Card>
  );
};
