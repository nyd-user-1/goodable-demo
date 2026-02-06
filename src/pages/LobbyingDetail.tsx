import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Plus, ExternalLink, DollarSign, ArrowUpDown, ChevronDown } from "lucide-react";
import { NoteViewSidebar } from "@/components/NoteViewSidebar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { supabase } from "@/integrations/supabase/client";
import { LobbyingSpend, LobbyistCompensation, LobbyistClient } from "@/types/lobbying";
import { formatLobbyingCurrency, parseCurrencyToNumber } from "@/hooks/useLobbyingSearch";

// Extended type that includes spending data for each client
interface LobbyistClientWithSpending extends LobbyistClient {
  spending?: LobbyingSpend | null;
}

// Column definitions for the clients table (with spending data)
const clientColumns: ColumnDef<LobbyistClientWithSpending>[] = [
  {
    accessorKey: "contractual_client",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Client Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("contractual_client") || "Unknown Client"}</div>
    ),
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Relationship Start
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("start_date") || "N/A"}</div>
    ),
    // Custom sort function to sort dates chronologically instead of alphabetically
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.getValue("start_date") as string | null;
      const dateB = rowB.getValue("start_date") as string | null;

      // Handle null/empty values - push them to the end
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      // Parse MM/DD/YYYY format to Date objects
      const parseDate = (str: string): Date => {
        const parts = str.split('/');
        if (parts.length === 3) {
          // MM/DD/YYYY format
          return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        }
        // Fallback: try native Date parsing
        return new Date(str);
      };

      const parsedA = parseDate(dateA);
      const parsedB = parseDate(dateB);

      // Handle invalid dates
      if (isNaN(parsedA.getTime()) && isNaN(parsedB.getTime())) return 0;
      if (isNaN(parsedA.getTime())) return 1;
      if (isNaN(parsedB.getTime())) return -1;

      return parsedA.getTime() - parsedB.getTime();
    },
  },
  {
    accessorKey: "spending",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          2025 Spending
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const spending = row.original.spending;
      const amount = spending?.compensation_and_expenses;
      return (
        <div className="text-right font-medium text-green-600 dark:text-green-400">
          {amount != null ? formatLobbyingCurrency(amount) : "—"}
        </div>
      );
    },
    // Sort by the numeric spending amount
    sortingFn: (rowA, rowB) => {
      const spendingA = rowA.original.spending?.compensation_and_expenses;
      const spendingB = rowB.original.spending?.compensation_and_expenses;

      const valA = parseCurrencyToNumber(spendingA ?? null);
      const valB = parseCurrencyToNumber(spendingB ?? null);

      return valA - valB;
    },
  },
];

// Clients DataTable Component
interface ClientsDataTableProps {
  data: LobbyistClientWithSpending[];
}

function ClientsDataTable({ data }: ClientsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns: clientColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 px-6">
        <Input
          placeholder="Filter clients..."
          value={(table.getColumn("contractual_client")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("contractual_client")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "contractual_client" ? "Client Name" : "Start Date"}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden border-t">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="first:pl-6">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="first:pl-6">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={clientColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4 px-6">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredRowModel().rows.length} client(s) total
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

const LobbyingDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [relatedChats, setRelatedChats] = useState<Array<{ id: string; title: string; created_at: string }>>([]);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);

  useEffect(() => {
    setSidebarMounted(true);
  }, []);

  // Parse the ID to determine type and actual ID
  const isSpend = id?.startsWith('spend-');
  const isCompensation = id?.startsWith('comp-');
  const recordId = id?.replace('spend-', '').replace('comp-', '');

  // Fetch spend record
  const { data: spendRecord, isLoading: spendLoading, error: spendError } = useQuery({
    queryKey: ['lobbying-spend', recordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lobbying_spend')
        .select('*')
        .eq('id', Number(recordId))
        .single();

      if (error) throw error;
      return data as LobbyingSpend;
    },
    enabled: isSpend && !!recordId,
  });

  // Fetch compensation record
  const { data: compensationRecord, isLoading: compensationLoading, error: compensationError } = useQuery({
    queryKey: ['lobbyist-compensation', recordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lobbyist_compensation')
        .select('*')
        .eq('id', Number(recordId))
        .single();

      if (error) throw error;
      return data as LobbyistCompensation;
    },
    enabled: isCompensation && !!recordId,
  });

  // Fetch clients using FK relationship (lobbyist_id) for efficient querying
  // Falls back to normalized_lobbyist text match for records without FK
  const { data: lobbyistClients } = useQuery({
    queryKey: ['lobbyist-clients-by-fk', compensationRecord?.lobbyist_id, compensationRecord?.normalized_lobbyist],
    queryFn: async () => {
      if (!compensationRecord) return [];

      // Try FK-based lookup first (most efficient)
      if (compensationRecord.lobbyist_id) {
        const { data, error } = await supabase
          .from('lobbyists_clients')
          .select('*')
          .eq('lobbyist_id', compensationRecord.lobbyist_id);

        if (error) throw error;
        return (data || []) as LobbyistClient[];
      }

      // Fallback to normalized_lobbyist text match
      if (compensationRecord.normalized_lobbyist) {
        const { data, error } = await supabase
          .from('lobbyists_clients')
          .select('*')
          .eq('normalized_lobbyist', compensationRecord.normalized_lobbyist);

        if (error) throw error;
        return (data || []) as LobbyistClient[];
      }

      return [];
    },
    enabled: isCompensation && !!compensationRecord,
  });

  // Fetch spending data for each client to show what they spent
  const { data: clientSpendingData } = useQuery({
    queryKey: ['client-spending', lobbyistClients?.map(c => c.contractual_client)],
    queryFn: async () => {
      if (!lobbyistClients || lobbyistClients.length === 0) return [];

      // Get unique client names
      const clientNames = lobbyistClients
        .map(c => c.contractual_client)
        .filter((name): name is string => !!name);

      if (clientNames.length === 0) return [];

      // Fetch spending records for these clients
      const { data, error } = await supabase
        .from('lobbying_spend')
        .select('*')
        .in('contractual_client', clientNames);

      if (error) throw error;
      return (data || []) as LobbyingSpend[];
    },
    enabled: isCompensation && !!lobbyistClients && lobbyistClients.length > 0,
  });

  // Merge clients with their spending data
  const clientsWithSpending: LobbyistClientWithSpending[] = useMemo(() => {
    if (!lobbyistClients) return [];

    // Create a map of client name -> spending record
    const spendingMap = new Map<string, LobbyingSpend>();
    if (clientSpendingData) {
      clientSpendingData.forEach(spend => {
        if (spend.contractual_client) {
          spendingMap.set(spend.contractual_client, spend);
        }
      });
    }

    // Merge clients with their spending
    return lobbyistClients.map(client => ({
      ...client,
      spending: client.contractual_client ? spendingMap.get(client.contractual_client) ?? null : null,
    }));
  }, [lobbyistClients, clientSpendingData]);

  const isLoading = isSpend ? spendLoading : compensationLoading;
  const error = isSpend ? spendError : compensationError;
  const record = isSpend ? spendRecord : compensationRecord;

  // Fetch related chats
  useEffect(() => {
    const fetchRelatedChats = async () => {
      if (!record) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const searchTerm = isSpend
          ? (spendRecord?.contractual_client || '')
          : (compensationRecord?.principal_lobbyist || '');

        if (!searchTerm) return;

        const { data, error } = await supabase
          .from("chat_sessions")
          .select("id, title, created_at")
          .eq("user_id", user.id)
          .ilike("title", `%${searchTerm}%`)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data) {
          setRelatedChats(data);
        }
      } catch (error) {
        console.error("Error fetching related chats:", error);
      }
    };

    fetchRelatedChats();
  }, [record, isSpend, spendRecord, compensationRecord]);

  const formatNoteDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleNewChat = () => {
    if (isSpend && spendRecord) {
      const client = spendRecord.contractual_client || 'this client';
      const compensation = formatLobbyingCurrency(spendRecord.compensation);
      const totalExpenses = formatLobbyingCurrency(spendRecord.total_expenses);

      const initialPrompt = `Tell me about lobbying spending by ${client}. They paid ${compensation} in compensation with ${totalExpenses} in total expenses.`;
      navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
    } else if (isCompensation && compensationRecord) {
      const lobbyist = compensationRecord.principal_lobbyist || 'this lobbyist';
      const compensation = formatLobbyingCurrency(compensationRecord.compensation);
      const expenses = formatLobbyingCurrency(compensationRecord.reimbursed_expenses);

      const initialPrompt = `Tell me about ${lobbyist}. They received ${compensation} in compensation plus ${expenses} in reimbursed expenses.`;
      navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
    }
  };

  const handleBack = () => {
    navigate('/lobbying');
  };

  // Sidebar JSX shared across render paths
  const renderSidebar = () => (
    <>
      {/* Slide-in sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm md:w-72 bg-background border-r z-[60]",
          sidebarMounted && "transition-transform duration-300 ease-in-out",
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NoteViewSidebar onClose={() => setLeftSidebarOpen(false)} />
      </div>
      {leftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-50 transition-opacity"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}
    </>
  );

  // Header JSX to be rendered inside each card container
  const renderHeader = () => (
    <div className="flex-shrink-0 bg-background">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLeftSidebarOpen(true)}
              className="inline-flex items-center justify-center h-10 w-10 rounded-md text-foreground hover:bg-muted transition-colors"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5h1"/><path d="M3 12h1"/><path d="M3 19h1"/>
                <path d="M8 5h1"/><path d="M8 12h1"/><path d="M8 19h1"/>
                <path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/>
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/?prompt=What%20is%20NYSgpt%3F')}
              className="inline-flex items-center justify-center h-10 rounded-md px-3 text-foreground hover:bg-muted transition-colors font-semibold text-xl"
            >
              NYSgpt
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
        <div className="max-w-[1300px] mx-auto space-y-6">
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
          <div className="h-32 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
        <div className="max-w-[1300px] mx-auto">
          <Button variant="outline" onClick={handleBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobbying
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Record not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render Spend Detail
  if (isSpend && spendRecord) {
    return (
      <div className="fixed inset-0 overflow-hidden">
        {renderSidebar()}

        <div className="h-full md:p-2 bg-muted/30">
          <div className="w-full h-full md:rounded-2xl md:border bg-background overflow-hidden flex flex-col">
            {renderHeader()}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
              {/* Back button */}
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Lobbying</span>
                <span className="sm:hidden">Back</span>
              </Button>

              {/* Header Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-6 relative">
                    <div className="pb-4 border-b">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Client Spending</Badge>
                      </div>
                      <h1 className="text-2xl font-semibold text-foreground">
                        {spendRecord.contractual_client || 'Unknown Client'}
                      </h1>
                    </div>

                    {/* Summary Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="text-xs text-muted-foreground mb-1">Compensation</div>
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          {formatLobbyingCurrency(spendRecord.compensation)}
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="text-xs text-muted-foreground mb-1">Total Expenses</div>
                        <div className="font-semibold">
                          {formatLobbyingCurrency(spendRecord.total_expenses)}
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="text-xs text-muted-foreground mb-1">Total (Comp + Expenses)</div>
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          {formatLobbyingCurrency(spendRecord.compensation_and_expenses)}
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        {spendRecord.expenses_less_than_75 != null && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              <DollarSign className="h-4 w-4" />
                              <span>Expenses less than $75</span>
                            </div>
                            <div className="text-muted-foreground ml-6">
                              {formatLobbyingCurrency(spendRecord.expenses_less_than_75)}
                            </div>
                          </div>
                        )}
                        {spendRecord.salaries_no_lobbying_employees != null && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              <DollarSign className="h-4 w-4" />
                              <span>Non-Lobbying Salaries</span>
                            </div>
                            <div className="text-muted-foreground ml-6">
                              {formatLobbyingCurrency(spendRecord.salaries_no_lobbying_employees)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-6">
                        {spendRecord.itemized_expenses != null && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              <DollarSign className="h-4 w-4" />
                              <span>Itemized Expenses</span>
                            </div>
                            <div className="text-muted-foreground ml-6">
                              {formatLobbyingCurrency(spendRecord.itemized_expenses)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Chats Section */}
              <Card className="bg-card rounded-xl shadow-sm border">
                <CardHeader className="px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg font-semibold">
                        Related Chats
                      </CardTitle>
                      {relatedChats.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {relatedChats.length} {relatedChats.length === 1 ? 'chat' : 'chats'}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewChat}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Chat
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {relatedChats.length === 0 ? (
                    <div className="bg-muted/30 rounded-lg p-4 text-sm">
                      <span className="text-muted-foreground italic">No chats yet. Start a conversation about this client.</span>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {relatedChats.map((chat) => (
                        <AccordionItem key={chat.id} value={chat.id} className="border-b last:border-b-0">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-3 text-left">
                              <span className="text-xs text-muted-foreground">
                                {formatNoteDate(chat.created_at)}
                              </span>
                              <span className="text-sm truncate max-w-[300px]">
                                {chat.title}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/c/${chat.id}`)}
                                className="gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Open Chat
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Compensation Detail
  if (isCompensation && compensationRecord) {
    return (
      <div className="fixed inset-0 overflow-hidden">
        {renderSidebar()}

        <div className="h-full md:p-2 bg-muted/30">
          <div className="w-full h-full md:rounded-2xl md:border bg-background overflow-hidden flex flex-col">
            {renderHeader()}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
              {/* Back button */}
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Lobbying</span>
                <span className="sm:hidden">Back</span>
              </Button>

              {/* Header Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-6 relative">
                    <div className="pb-4 border-b">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Lobbyist Earnings</Badge>
                      </div>
                      <h1 className="text-2xl font-semibold text-foreground">
                        {compensationRecord.principal_lobbyist || 'Unknown Lobbyist'}
                      </h1>
                    </div>

                    {/* Summary Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="text-xs text-muted-foreground mb-1">Compensation</div>
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          {formatLobbyingCurrency(compensationRecord.compensation)}
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="text-xs text-muted-foreground mb-1">Reimbursed Expenses</div>
                        <div className="font-semibold">
                          {formatLobbyingCurrency(compensationRecord.reimbursed_expenses)}
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="text-xs text-muted-foreground mb-1">Grand Total</div>
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          {formatLobbyingCurrency(compensationRecord.grand_total_compensation_expenses)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Chats Section */}
              <Card className="bg-card rounded-xl shadow-sm border">
                <CardHeader className="px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg font-semibold">
                        Related Chats
                      </CardTitle>
                      {relatedChats.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {relatedChats.length} {relatedChats.length === 1 ? 'chat' : 'chats'}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewChat}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Chat
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {relatedChats.length === 0 ? (
                    <div className="bg-muted/30 rounded-lg p-4 text-sm">
                      <span className="text-muted-foreground italic">No chats yet. Start a conversation about this lobbyist.</span>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {relatedChats.map((chat) => (
                        <AccordionItem key={chat.id} value={chat.id} className="border-b last:border-b-0">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-3 text-left">
                              <span className="text-xs text-muted-foreground">
                                {formatNoteDate(chat.created_at)}
                              </span>
                              <span className="text-sm truncate max-w-[300px]">
                                {chat.title}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/c/${chat.id}`)}
                                className="gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Open Chat
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>

              {/* Clients Section */}
              {lobbyistClients && lobbyistClients.length > 0 && (
                <Card className="bg-card rounded-xl shadow-sm border">
                  <CardHeader className="px-6 py-4 border-b">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg font-semibold">
                        Clients
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {lobbyistClients.length} {lobbyistClients.length === 1 ? 'client' : 'clients'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ClientsDataTable data={clientsWithSpending} />
                  </CardContent>
                </Card>
              )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LobbyingDetail;
