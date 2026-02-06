import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";
import { useStickyTableHeader } from "@/hooks/useStickyTableHeader";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{ name: string | null; party: string | null; chamber: string | null }>;
};

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
};

interface CommitteeBillsTableFullProps {
  committee: Committee;
}

type SortField = 'bill_number' | 'sponsor' | 'title' | 'status_desc' | 'last_action' | 'last_action_date';
type SortDirection = 'asc' | 'desc' | null;

export const CommitteeBillsTableFull = ({ committee }: CommitteeBillsTableFullProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const tableRef = useStickyTableHeader();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Fetch bills for this committee with sponsors
  useEffect(() => {
    const fetchCommitteeBills = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch bills for this committee
        const { data: billsData, error: billsError } = await supabase
          .from("Bills")
          .select("*")
          .ilike("committee", `%${committee.name}%`)
          .order("last_action_date", { ascending: false });

        if (billsError) throw billsError;
        if (!billsData || billsData.length === 0) {
          setBills([]);
          return;
        }

        // Step 2: Fetch sponsors for all bills
        const billIds = billsData.map(b => b.bill_id);
        const { data: sponsorsData } = await supabase
          .from("Sponsors")
          .select("bill_id, people_id, position")
          .in("bill_id", billIds);

        // Step 3: Fetch people data for sponsors
        const peopleIds = [...new Set(sponsorsData?.map(s => s.people_id).filter(Boolean) || [])];
        const { data: peopleData } = peopleIds.length > 0 ? await supabase
          .from("People")
          .select("people_id, name, party, chamber")
          .in("people_id", peopleIds) : { data: [] };

        // Create lookup map for people
        const peopleMap = new Map(peopleData?.map(p => [p.people_id, p]) || []);

        // Step 4: Group sponsors by bill (sorted by position - primary sponsor first)
        const sponsorsByBill = new Map<number, Array<{ name: string | null; party: string | null; chamber: string | null }>>();

        // Sort sponsors by position before grouping
        const sortedSponsors = [...(sponsorsData || [])].sort((a, b) => (a.position || 99) - (b.position || 99));

        sortedSponsors.forEach(sponsor => {
          if (!sponsor.bill_id) return;
          if (!sponsorsByBill.has(sponsor.bill_id)) {
            sponsorsByBill.set(sponsor.bill_id, []);
          }
          const person = peopleMap.get(sponsor.people_id!);
          if (person) {
            sponsorsByBill.get(sponsor.bill_id)!.push({
              name: person.name,
              party: person.party,
              chamber: person.chamber,
            });
          }
        });

        // Step 5: Attach sponsors to bills
        const billsWithSponsors = billsData.map(bill => ({
          ...bill,
          sponsors: sponsorsByBill.get(bill.bill_id) || []
        }));

        setBills(billsWithSponsors);
      } catch (err) {
        setError("Failed to load bills. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load bills. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommitteeBills();
  }, [committee.name, toast]);

  const handleBillClick = (bill: any) => {
    navigate(`/bills?selected=${bill.bill_id}`);
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
        bill.status_desc?.toLowerCase().includes(query) ||
        bill.sponsors?.some(s => s.name?.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        // Special handling for sponsor (use primary sponsor name)
        if (sortField === 'sponsor') {
          aValue = a.sponsors?.[0]?.name || '';
          bValue = b.sponsors?.[0]?.name || '';
        } else {
          aValue = a[sortField] || '';
          bValue = b[sortField] || '';
        }

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
      <TooltipProvider>
        <div className="space-y-4">
          {/* Search Section */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bills by number, title, description, or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Bills Table */}
          <div ref={tableRef} className="border rounded-md overflow-hidden bg-card">
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
                  {searchQuery ? "No bills found matching your search" : "No bills found for this committee"}
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Fixed Header - outside ScrollArea so it stays visible */}
                <Table>
                  <TableHeader className="bg-background border-b">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[80px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('bill_number')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Bill {getSortIcon('bill_number')}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[140px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('sponsor')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Sponsor {getSortIcon('sponsor')}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[30%]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('title')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Description {getSortIcon('title')}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[140px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('status_desc')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Status {getSortIcon('status_desc')}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[18%]">
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
                      <TableHead className="w-[100px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('last_action_date')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Action Date {getSortIcon('last_action_date')}
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>

                {/* Scrollable Body */}
                <ScrollArea className="h-[500px] w-full">
                  <Table>
                    <TableBody>
                      {filteredAndSortedBills.map((bill) => {
                        const primarySponsor = bill.sponsors?.[0]?.name || "—";
                        return (
                          <TableRow
                            key={bill.bill_id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleBillClick(bill)}
                          >
                            <TableCell className="w-[80px] font-medium">
                              {bill.bill_number}
                            </TableCell>
                            <TableCell className="w-[140px]">
                              <div className="text-sm truncate" title={primarySponsor}>
                                {primarySponsor}
                              </div>
                            </TableCell>
                            <TableCell className="w-[30%]">
                              <div className="text-sm truncate max-w-[350px]" title={bill.title || ""}>
                                {bill.title}
                              </div>
                            </TableCell>
                            <TableCell className="w-[140px]">
                              <Badge
                                variant={bill.status_desc?.toLowerCase() === "passed" ? "success" : "secondary"}
                                className="whitespace-nowrap"
                              >
                                {bill.status_desc || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell className="w-[18%] text-sm text-muted-foreground">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-help truncate max-w-[180px]" title={bill.last_action || ""}>
                                    {bill.last_action || "No action recorded"}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>ALL CAPS = Senate, lowercase = Assembly</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="w-[100px] text-sm text-muted-foreground whitespace-nowrap">
                              {formatDate(bill.last_action_date)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
  );
};
