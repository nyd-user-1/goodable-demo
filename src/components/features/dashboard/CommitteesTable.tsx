import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCommitteeFavorites } from "@/hooks/useCommitteeFavorites";
import { useToast } from "@/hooks/use-toast";

type Committee = {
  committee_id: number;
  name: string;
  chamber: string;
  description?: string;
  chair_name?: string;
  chair_email?: string;
  memberCount?: string;
  billCount?: string;
  committee_type?: string;
  meeting_schedule?: string;
  next_meeting?: string;
  address?: string;
};

type SortField = 'name' | 'chamber' | 'chair_name' | 'committee_type' | 'meeting_schedule';
type SortDirection = 'asc' | 'desc' | null;

interface CommitteesTableProps {
  limit?: number;
}

export const CommitteesTable = ({ limit = 100 }: CommitteesTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [committeesWithAIChat, setCommitteesWithAIChat] = useState<Set<number>>(new Set());
  const { favoriteCommitteeIds, toggleFavorite } = useCommitteeFavorites();

  // Fetch all committees
  useEffect(() => {
    const fetchAllCommittees = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: committeesData, error: committeesError } = await supabase
          .from("Committees")
          .select("*")
          .limit(limit);

        if (committeesError) {
          console.error("Supabase error:", committeesError);
          throw committeesError;
        }

        console.log("Raw committees data:", committeesData);

        // Transform data - handle various column name possibilities
        const transformedCommittees = (committeesData || []).map((committee) => {
          // Log first committee to see structure
          if (committeesData.indexOf(committee) === 0) {
            console.log("Sample committee structure:", committee);
          }
          
          return {
            committee_id: committee.committee_id,
            name: committee.committee_name || committee.name || "Unknown Committee",
            chamber: committee.chamber || "Unknown",
            chair_name: committee.chair_name || committee.chair || null,
            chair_email: committee.chair_email || null,
            committee_type: committee.committee_type || committee.type || null,
            description: committee.description || null,
            meeting_schedule: committee.meeting_schedule || null,
            next_meeting: committee.next_meeting || null,
            address: committee.address || null,
            memberCount: committee.member_count || committee.memberCount || "0",
            billCount: committee.bill_count || committee.billCount || committee.active_bills_count || "0"
          };
        });

        setCommittees(transformedCommittees);
      } catch (err: any) {
        console.error("Error loading committees:", err);
        setError(err.message || "Failed to load committees. Please try again.");
        toast({
          title: "Error",
          description: err.message || "Failed to load committees. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllCommittees();
  }, [limit, toast]);

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

  const handleCommitteeClick = (committee: Committee) => {
    navigate(`/committees?selected=${committee.committee_id}`);
  };

  const handleAIAnalysis = async (committee: Committee, e: React.MouseEvent) => {
    e.stopPropagation();
    // This would open AI chat with the committee
    console.log('AI Analysis for committee:', committee);
  };

  const handleFavorite = async (committee: Committee, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(committee.committee_id);
  };

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

  // Filter and sort committees
  const filteredAndSortedCommittees = useMemo(() => {
    let filtered = committees;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = committees.filter(committee => 
        committee.name?.toLowerCase().includes(query) ||
        committee.chamber?.toLowerCase().includes(query) ||
        committee.chair_name?.toLowerCase().includes(query) ||
        committee.description?.toLowerCase().includes(query) ||
        committee.committee_type?.toLowerCase().includes(query) ||
        committee.meeting_schedule?.toLowerCase().includes(query) ||
        committee.address?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortField] || '';
        let bValue: any = b[sortField] || '';
        
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [committees, searchQuery, sortField, sortDirection]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Search Section */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search committees by name, chamber, chair, type, or meeting schedule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Committees Table */}
        <div className="border rounded-md overflow-hidden bg-card">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading committees...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">{error}</div>
            </div>
          ) : filteredAndSortedCommittees.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                {searchQuery ? "No committees found matching your search" : "No committees found"}
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical ScrollArea for rows with fixed height */}
              <ScrollArea className="h-[600px] w-full">
                {/* Horizontal ScrollArea for columns */}
                <ScrollArea orientation="horizontal" className="w-full">
                  <div className="min-w-[1200px] relative">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-30 border-b shadow-sm supports-[backdrop-filter]:bg-background/60">
                        <TableRow className="hover:bg-transparent">
                          {/* Pinned first column */}
                          <TableHead className="sticky left-0 bg-background/95 backdrop-blur-sm z-40 w-[250px] border-r shadow-sm supports-[backdrop-filter]:bg-background/60">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSort('name')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Committee Name {getSortIcon('name')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[120px]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSort('chamber')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Chamber {getSortIcon('chamber')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[180px]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSort('chair_name')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Chair {getSortIcon('chair_name')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[150px]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSort('committee_type')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Type {getSortIcon('committee_type')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[180px]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSort('meeting_schedule')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Meeting Schedule {getSortIcon('meeting_schedule')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[80px] text-center">Members</TableHead>
                          <TableHead className="w-[80px] text-center">Bills</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedCommittees.map((committee) => (
                          <TableRow 
                            key={committee.committee_id} 
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleCommitteeClick(committee)}
                          >
                            {/* Pinned first cell */}
                            <TableCell className="sticky left-0 bg-background/95 backdrop-blur-sm z-20 font-medium border-r supports-[backdrop-filter]:bg-background/60">
                              <div className="max-w-[230px]">
                                <div className="line-clamp-2 text-sm" title={committee.name}>
                                  {committee.name}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={committee.chamber === 'Assembly' ? 'default' : committee.chamber === 'Senate' ? 'secondary' : 'outline'}>
                                {committee.chamber || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {committee.chair_name || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {committee.committee_type || committee.description || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {committee.meeting_schedule || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-center">
                              <Badge variant="outline" className="min-w-[40px]">
                                {committee.memberCount || "0"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-center">
                              <Badge variant="outline" className="min-w-[40px]">
                                {committee.billCount || "0"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <CardActionButtons
                                onFavorite={(e) => handleFavorite(committee, e)}
                                onAIAnalysis={(e) => handleAIAnalysis(committee, e)}
                                isFavorited={favoriteCommitteeIds.has(committee.committee_id)}
                                hasAIChat={committeesWithAIChat.has(committee.committee_id)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};