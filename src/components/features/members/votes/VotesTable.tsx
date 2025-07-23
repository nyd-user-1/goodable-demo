import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

type SortField = 'bill_number' | 'description' | 'vote_date' | 'vote_type' | 'sponsor' | 'committee';
type SortDirection = 'asc' | 'desc' | null;

interface VotesTableProps {
  votes: any[];
  onVoteClick: (vote: any) => void;
  onAIAnalysis: (vote: any, e: React.MouseEvent) => void;
  onFavorite: (vote: any, e: React.MouseEvent) => void;
  searchQuery: string;
}

export const VotesTable = ({ 
  votes, 
  onVoteClick, 
  onAIAnalysis, 
  onFavorite,
  searchQuery 
}: VotesTableProps) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const getVoteBadgeVariant = (voteType: string) => {
    switch (voteType.toLowerCase()) {
      case 'yes':
        return 'default';
      case 'no':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Sort the current page votes
  const sortedVotes = [...votes].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: any = a[sortField] || '';
    let bValue: any = b[sortField] || '';
    
    // Special handling for dates
    if (sortField === 'vote_date') {
      const aDate = new Date(aValue || 0);
      const bDate = new Date(bValue || 0);
      if (sortDirection === 'asc') {
        return aDate.getTime() - bDate.getTime();
      } else {
        return bDate.getTime() - aDate.getTime();
      }
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    }
  });

  if (votes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {searchQuery ? "No votes found matching your search" : "No voting records found"}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="w-full">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('bill_number')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Bill {getSortIcon('bill_number')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[300px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('description')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Description {getSortIcon('description')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('vote_date')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Vote Date {getSortIcon('vote_date')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('vote_type')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Vote Type {getSortIcon('vote_type')}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVotes.map((vote) => (
                <TableRow 
                  key={vote.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onVoteClick(vote)}
                >
                  <TableCell className="font-medium">{vote.bill_number}</TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="line-clamp-2 text-sm">{vote.description}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(vote.vote_date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getVoteBadgeVariant(vote.vote_type)}>
                      {vote.vote_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <CardActionButtons
                      onFavorite={(e) => onFavorite(vote, e)}
                      onAIAnalysis={(e) => onAIAnalysis(vote, e)}
                      isFavorited={false}
                      hasAIChat={false}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
};