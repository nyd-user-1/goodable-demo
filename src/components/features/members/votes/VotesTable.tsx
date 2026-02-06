import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

type SortField = 'bill_number' | 'sponsor' | 'description' | 'vote_date' | 'vote_type';
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
      <div className="relative border-t">
        {/* Fixed Header */}
        <Table className="table-fixed w-full">
          <TableHeader className="bg-background border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px] px-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('bill_number')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Bill {getSortIcon('bill_number')}
                </Button>
              </TableHead>
              <TableHead className="w-[120px] px-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('sponsor')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Sponsor {getSortIcon('sponsor')}
                </Button>
              </TableHead>
              <TableHead className="w-[250px] px-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('description')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Description {getSortIcon('description')}
                </Button>
              </TableHead>
              <TableHead className="w-[100px] px-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('vote_date')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Date {getSortIcon('vote_date')}
                </Button>
              </TableHead>
              <TableHead className="w-[80px] px-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('vote_type')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Vote {getSortIcon('vote_type')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>

        {/* Scrollable Body */}
        <ScrollArea className="h-[500px] w-full">
          <Table className="table-fixed w-full">
            <TableBody>
              {sortedVotes.map((vote) => (
                <TableRow
                  key={vote.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onVoteClick(vote)}
                >
                  <TableCell className="w-[80px] px-3 font-medium text-left">
                    {vote.bill_number}
                  </TableCell>
                  <TableCell className="w-[120px] px-3 text-left">
                    <div className="text-sm truncate" title={vote.sponsor || ""}>
                      {vote.sponsor || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="w-[250px] px-3 text-left">
                    <div className="text-sm truncate" title={vote.description || ""}>
                      {vote.description}
                    </div>
                  </TableCell>
                  <TableCell className="w-[100px] px-3 text-sm text-muted-foreground text-left whitespace-nowrap">
                    {formatDate(vote.vote_date)}
                  </TableCell>
                  <TableCell className="w-[80px] px-3 text-left">
                    <Badge variant={getVoteBadgeVariant(vote.vote_type)}>
                      {vote.vote_type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};
