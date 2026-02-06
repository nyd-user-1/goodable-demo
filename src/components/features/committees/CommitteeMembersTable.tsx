import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Users, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { generateMemberSlug } from "@/utils/memberSlug";

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

type SortField = 'name' | 'party' | 'chamber' | 'district' | 'role';
type SortDirection = 'asc' | 'desc' | null;

export const CommitteeMembersTable = ({ committee }: CommitteeMembersTableProps) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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

        const allMembers: Member[] = [];

        // Fetch the chair separately if available
        if (committee.chair_name) {
          const { data: chairData } = await supabase
            .from("People")
            .select("*")
            .ilike("name", `%${committee.chair_name}%`)
            .limit(1)
            .single();

          if (chairData) {
            allMembers.push(chairData);
          }
        }

        if (committeeData && committeeData.committee_members) {
          // Split the semicolon-separated slugs (e.g., "rebecca-seawright; george-alvarez")
          const memberSlugs = committeeData.committee_members
            .split(';')
            .map(slug => slug.trim())
            .filter(slug => slug.length > 0);

          if (memberSlugs.length > 0) {
            // Convert slugs to search patterns
            const memberPromises = memberSlugs.map(async (slug) => {
              const searchName = slug.replace(/-/g, ' ');

              const { data: memberData } = await supabase
                .from("People")
                .select("*")
                .or(`name.ilike.%${searchName}%,first_name.ilike.%${searchName.split(' ')[0]}%`)
                .limit(1)
                .single();

              return memberData;
            });

            const results = await Promise.all(memberPromises);
            const foundMembers = results.filter((member): member is Member => member !== null);
            allMembers.push(...foundMembers);
          }
        }

        // Remove duplicates by people_id
        const uniqueMembers = Array.from(
          new Map(allMembers.map(m => [m.people_id, m])).values()
        );

        setMembers(uniqueMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [committee.committee_id, committee.chair_name]);

  const handleMemberClick = (member: Member) => {
    navigate(`/members/${generateMemberSlug(member)}`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
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

  // Check if member is the chair
  const isChair = (member: Member): boolean => {
    if (!committee.chair_name || !member.name) return false;
    const chairLastName = committee.chair_name.trim().split(' ').pop()?.toLowerCase();
    const memberLastName = member.name.trim().split(' ').pop()?.toLowerCase();
    const chairFirstName = committee.chair_name.trim().split(' ')[0]?.toLowerCase();
    const memberFirstName = member.name.trim().split(' ')[0]?.toLowerCase();
    return chairLastName === memberLastName && chairFirstName === memberFirstName;
  };

  // Filter and sort members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = members.filter(member =>
        member.name?.toLowerCase().includes(query) ||
        member.party?.toLowerCase().includes(query) ||
        member.chamber?.toLowerCase().includes(query) ||
        member.district?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = String(a[sortField] || '').toLowerCase();
        let bValue = String(b[sortField] || '').toLowerCase();

        // Special handling for district (numeric sort)
        if (sortField === 'district') {
          const aNum = parseInt(aValue) || 0;
          const bNum = parseInt(bValue) || 0;
          if (sortDirection === 'asc') {
            return aNum - bNum;
          } else {
            return bNum - aNum;
          }
        }

        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [members, searchQuery, sortField, sortDirection]);

  return (
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
      <div className="border rounded-md overflow-hidden bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading members...</div>
          </div>
        ) : filteredAndSortedMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No members found matching your search" : "No members found for this committee"}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Fixed Header */}
            <Table className="table-fixed w-full">
              <TableHeader className="bg-background border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px] px-4 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Name {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px] px-4 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('party')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Party {getSortIcon('party')}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px] px-4 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('chamber')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Chamber {getSortIcon('chamber')}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[80px] px-4 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('district')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      District {getSortIcon('district')}
                    </Button>
                  </TableHead>
                  <TableHead className="px-4 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('role')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Role {getSortIcon('role')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>

            {/* Scrollable Body */}
            <ScrollArea className="h-[500px] w-full">
              <Table className="table-fixed w-full">
                <TableBody>
                  {filteredAndSortedMembers.map((member) => (
                    <TableRow
                      key={member.people_id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleMemberClick(member)}
                    >
                      <TableCell className="w-[200px] px-4 text-left">
                        <div className="flex items-center gap-3">
                          {member.photo_url && !failedImages.has(member.people_id) ? (
                            <img
                              src={member.photo_url}
                              alt={member.name || 'Member photo'}
                              className="w-8 h-8 rounded-full object-cover bg-primary/10 flex-shrink-0"
                              onError={() => {
                                setFailedImages(prev => new Set([...prev, member.people_id]));
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium truncate" title={member.name || ""}>
                              {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || `Member #${member.people_id}`}
                            </span>
                            {isChair(member) && (
                              <Badge variant="default" className="text-xs flex-shrink-0">
                                Chair
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-[100px] px-4 text-left">
                        {member.party ? (
                          <Badge variant="outline" className="text-xs">
                            {member.party}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="w-[100px] px-4 text-left text-sm text-muted-foreground">
                        {member.chamber || "—"}
                      </TableCell>
                      <TableCell className="w-[80px] px-4 text-left text-sm text-muted-foreground">
                        {member.district || "—"}
                      </TableCell>
                      <TableCell className="px-4 text-left text-sm text-muted-foreground">
                        <div className="truncate" title={member.role || ""}>
                          {member.role || "—"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};
