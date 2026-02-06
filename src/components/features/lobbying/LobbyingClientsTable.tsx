import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { formatLobbyingCurrency, parseCurrencyToNumber } from "@/hooks/useLobbyingSearch";
import { LobbyingSpend, LobbyistClient } from "@/types/lobbying";

// Extended type that includes spending data for each client
interface LobbyistClientWithSpending extends LobbyistClient {
  spending?: LobbyingSpend | null;
}

interface LobbyingClientsTableProps {
  clients: LobbyistClientWithSpending[];
}

type SortField = 'contractual_client' | 'start_date' | 'spending';
type SortDirection = 'asc' | 'desc' | null;

export const LobbyingClientsTable = ({ clients }: LobbyingClientsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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

  // Parse date from MM/DD/YYYY format
  const parseDate = (str: string | null): Date | null => {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
    }
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = clients.filter(client =>
        client.contractual_client?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        if (sortField === 'spending') {
          const aVal = parseCurrencyToNumber(a.spending?.compensation_and_expenses ?? null);
          const bVal = parseCurrencyToNumber(b.spending?.compensation_and_expenses ?? null);
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        if (sortField === 'start_date') {
          const aDate = parseDate(a.start_date);
          const bDate = parseDate(b.start_date);
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return sortDirection === 'asc'
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }

        // Default string sort for client name
        const aValue = (a[sortField] || '').toLowerCase();
        const bValue = (b[sortField] || '').toLowerCase();
        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [clients, searchQuery, sortField, sortDirection]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Search Section */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Clients Table */}
        <div className="border rounded-md overflow-hidden bg-card">
          {filteredAndSortedClients.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                {searchQuery ? "No clients found matching your search" : "No clients found"}
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Fixed Header */}
              <Table className="table-fixed w-full">
                <TableHeader className="bg-background border-b">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[280px] px-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('contractual_client')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Client Name {getSortIcon('contractual_client')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[120px] px-3 text-left">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('start_date')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Registered {getSortIcon('start_date')}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>When the lobbying relationship began</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="w-[120px] px-3 text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('spending')}
                            className="h-auto p-0 font-semibold hover:bg-transparent ml-auto"
                          >
                            2025 {getSortIcon('spending')}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total client spending on lobbying in 2025</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>

              {/* Scrollable Body */}
              <ScrollArea className="h-[500px] w-full">
                <Table className="table-fixed w-full">
                  <TableBody>
                    {filteredAndSortedClients.map((client, index) => (
                      <TableRow
                        key={client.id || index}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="w-[280px] px-3 font-medium text-left">
                          <div className="truncate" title={client.contractual_client || ""}>
                            {client.contractual_client || "Unknown Client"}
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px] px-3 text-sm text-muted-foreground text-left">
                          {client.start_date || "N/A"}
                        </TableCell>
                        <TableCell className="w-[120px] px-3 text-sm text-right">
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {client.spending?.compensation_and_expenses
                              ? formatLobbyingCurrency(client.spending.compensation_and_expenses)
                              : "—"}
                          </span>
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
    </TooltipProvider>
  );
};
