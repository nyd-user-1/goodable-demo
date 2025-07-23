import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { AIChatSheet } from "@/components/AIChatSheet";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, HelpCircle } from "lucide-react";
import { useMemberBills } from "@/hooks/useMemberBills";
import { useFavorites } from "@/hooks/useFavorites";
import { useBillChatSessions } from "@/hooks/useBillChatSessions";
import { Tables } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/dateUtils";

type Member = Tables<"People">;

interface MemberBillsTableProps {
  member: Member;
}

type SortField = 'bill_number' | 'title' | 'status_desc' | 'committee' | 'last_action' | 'last_action_date';
type SortDirection = 'asc' | 'desc' | null;

export const MemberBillsTable = ({ member }: MemberBillsTableProps) => {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  const { bills, loading, error } = useMemberBills(member.people_id);
  const { favoriteBillIds, toggleFavorite } = useFavorites();
  const { createOrGetChatSession, loading: chatLoading } = useBillChatSessions();

  const handleBillClick = (bill: any) => {
    navigate(`/bills?selected=${bill.bill_id}`);
  };

  const handleAIAnalysis = async (bill: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const session = await createOrGetChatSession(bill);
    if (session) {
      setSelectedBill(bill);
      setChatOpen(true);
    }
  };

  const handleFavorite = async (bill: any, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(bill.bill_id);
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

  // Filter and sort bills
  const filteredAndSortedBills = useMemo(() => {
    let filtered = bills;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = bills.filter(bill => 
        bill.bill_number?.toLowerCase().includes(query) ||
        bill.title?.toLowerCase().includes(query) ||
        bill.description?.toLowerCase().includes(query) ||
        bill.last_action?.toLowerCase().includes(query) ||
        bill.committee?.toLowerCase().includes(query) ||
        bill.status_desc?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortField] || '';
        let bValue: any = b[sortField] || '';
        
        // Special handling for dates
        if (sortField === 'last_action_date') {
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
    }

    return filtered;
  }, [bills, searchQuery, sortField, sortDirection]);

  return (
    <>
      <TooltipProvider>
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Member Bills</CardTitle>
              <Button variant="outline" size="sm">
                View All Bills
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills by number, title, description, or text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading bills...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-destructive">{error}</div>
              </div>
            ) : filteredAndSortedBills.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  {searchQuery ? "No bills found matching your search" : "No bills found for this member"}
                </div>
              </div>
            ) : (
              <ScrollArea className="w-full">
                <div className="min-w-[700px]">
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
                            onClick={() => handleSort('title')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Description {getSortIcon('title')}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[120px]">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSort('status_desc')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Status {getSortIcon('status_desc')}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[160px]">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSort('committee')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Committee {getSortIcon('committee')}
                          </Button>
                        </TableHead>
                        <TableHead className="min-w-[250px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleSort('last_action')}
                                className="h-auto p-0 font-semibold hover:bg-transparent flex items-center gap-1"
                              >
                                Last Action {getSortIcon('last_action')} <HelpCircle className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>ALL CAPS indicates Senate action, lowercase indicates Assembly action</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedBills.map((bill) => (
                        <TableRow 
                          key={bill.bill_id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleBillClick(bill)}
                        >
                          <TableCell className="font-medium">{bill.bill_number}</TableCell>
                          <TableCell className="max-w-[300px]">
                            <div className="line-clamp-2 text-sm">{bill.title}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={bill.status_desc?.toLowerCase() === "passed" ? "success" : "secondary"}>
                              {bill.status_desc || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[160px]">
                            <div className="line-clamp-2 text-sm" style={{ maxWidth: '20ch' }}>
                              {bill.committee || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help">
                                  {bill.last_action || "No action recorded"}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{formatDate(bill.last_action_date)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <CardActionButtons
                              onFavorite={(e) => handleFavorite(bill, e)}
                              onAIAnalysis={(e) => handleAIAnalysis(bill, e)}
                              isFavorited={favoriteBillIds.has(bill.bill_id)}
                              hasAIChat={false}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </TooltipProvider>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        bill={selectedBill}
      />
    </>
  );
};
