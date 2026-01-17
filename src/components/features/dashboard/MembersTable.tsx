import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateMemberSlug } from "@/utils/memberSlug";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMemberFavorites } from "@/hooks/useMemberFavorites";
import { useToast } from "@/hooks/use-toast";
import { useStickyTableHeader } from "@/hooks/useStickyTableHeader";

type Member = {
  people_id: number;
  first_name: string;
  last_name: string;
  party: string;
  chamber: string;
  district: string;
  email?: string;
  phone?: string;
  name?: string;
  role?: string;
};

type SortField = 'name' | 'party' | 'chamber' | 'district' | 'role' | 'phone' | 'email';
type SortDirection = 'asc' | 'desc' | null;

interface MembersTableProps {
  limit?: number;
}

export const MembersTable = ({ limit = 500 }: MembersTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const tableRef = useStickyTableHeader();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [membersWithAIChat, setMembersWithAIChat] = useState<Set<number>>(new Set());
  const { favoriteMemberIds, toggleFavorite } = useMemberFavorites();

  // Fetch all members
  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: membersData, error: membersError } = await supabase
          .from("People")
          .select("*")
          .order("last_name", { ascending: true })
          .limit(limit);

        if (membersError) throw membersError;

        // Process the data to ensure we have consistent name field and filter out Suite 212
        const processedMembers = (membersData || [])
          .filter(member => {
            const fullName = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim();
            return !fullName.toLowerCase().includes('suite 212');
          })
          .map(member => ({
            ...member,
            name: member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim()
          }));

        setMembers(processedMembers);
      } catch (err) {
        setError("Failed to load members. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load members. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllMembers();
  }, [limit, toast]);

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

  const handleMemberClick = (member: Member) => {
    const slug = generateMemberSlug(member);
    navigate(`/members/${slug}`);
  };

  const handleAIAnalysis = (member: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to chat with prompt - the chat page will create the session
    const memberName = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim();
    const initialPrompt = `Tell me about ${memberName}`;
    navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
  };

  const handleFavorite = async (member: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(member.people_id);
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

  // Filter and sort members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = members.filter(member => 
        member.name?.toLowerCase().includes(query) ||
        member.first_name?.toLowerCase().includes(query) ||
        member.last_name?.toLowerCase().includes(query) ||
        member.party?.toLowerCase().includes(query) ||
        member.chamber?.toLowerCase().includes(query) ||
        member.district?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query) ||
        member.phone?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = '';
        let bValue: any = '';
        
        // Handle different sort fields
        switch (sortField) {
          case 'name':
            aValue = a.name || `${a.first_name || ''} ${a.last_name || ''}`.trim();
            bValue = b.name || `${b.first_name || ''} ${b.last_name || ''}`.trim();
            break;
          default:
            aValue = a[sortField] || '';
            bValue = b[sortField] || '';
        }
        
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
  }, [members, searchQuery, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = filteredAndSortedMembers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Remove duplicates and sort
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Add dots between non-consecutive numbers
    let prev = 0;
    for (const page of uniqueRange) {
      if (page - prev > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      prev = page;
    }

    return rangeWithDots;
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Search Section */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name, party, chamber, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Members Table */}
        <div ref={tableRef} className="border rounded-md overflow-hidden bg-card">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading members...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">{error}</div>
            </div>
          ) : filteredAndSortedMembers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                {searchQuery ? "No members found matching your search" : "No members found"}
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical ScrollArea for rows with fixed height */}
              <ScrollArea className="h-[600px] w-full">
                {/* Horizontal ScrollArea for columns */}
                <ScrollArea orientation="horizontal" className="w-full">
                  <div className="min-w-[800px] relative">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-30 border-b shadow-sm supports-[backdrop-filter]:bg-background/60">
                        <TableRow className="hover:bg-transparent">
                          {/* Pinned first column */}
                          <TableHead className="sticky left-0 bg-background/95 backdrop-blur-sm z-40 w-[160px] border-r shadow-sm supports-[backdrop-filter]:bg-background/60">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSort('name')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Name {getSortIcon('name')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[100px]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSort('party')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Party {getSortIcon('party')}
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
                          <TableHead className="w-[100px]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSort('district')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              District {getSortIcon('district')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[120px]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSort('role')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Role {getSortIcon('role')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[140px]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSort('phone')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Phone {getSortIcon('phone')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[200px]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSort('email')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Email {getSortIcon('email')}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedMembers.map((member) => (
                          <TableRow 
                            key={member.people_id} 
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleMemberClick(member)}
                          >
                            {/* Pinned first cell */}
                            <TableCell className="sticky left-0 bg-background/95 backdrop-blur-sm z-20 font-medium border-r supports-[backdrop-filter]:bg-background/60">
                              {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={member.party === 'Republican' ? 'destructive' : member.party === 'Democratic' ? 'default' : 'secondary'}>
                                {member.party || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {member.chamber || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {member.district || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {member.role || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {member.phone || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="max-w-[180px] truncate" title={member.email}>
                                {member.email || "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <CardActionButtons
                                onFavorite={(e) => handleFavorite(member, e)}
                                onAIAnalysis={(e) => handleAIAnalysis(member, e)}
                                isFavorited={favoriteMemberIds.has(member.people_id)}
                                hasAIChat={membersWithAIChat.has(member.people_id)}
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

        {/* Pagination Controls */}
        {filteredAndSortedMembers.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedMembers.length)} of {filteredAndSortedMembers.length} members
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                ‹
              </Button>
              
              {getVisiblePages().map((page, index) => (
                page === '...' ? (
                  <span key={`dots-${index}`} className="px-2 text-muted-foreground">
                    …
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                )
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                ›
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};