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
import { formatLobbyingCurrency } from "@/hooks/useLobbyingSearch";

// Column definitions for the clients table
const clientColumns: ColumnDef<LobbyistClient>[] = [
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
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("start_date") || "N/A"}</div>
    ),
  },
];

// Clients DataTable Component
interface ClientsDataTableProps {
  data: LobbyistClient[];
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
      const compensation = spendRecord.compensation || 'N/A';
      const totalExpenses = spendRecord.total_expenses || 'N/A';

      const initialPrompt = `Tell me about lobbying spending by ${client}. They paid ${compensation} in compensation with ${totalExpenses} in total expenses.`;
      navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
    } else if (isCompensation && compensationRecord) {
      const lobbyist = compensationRecord.principal_lobbyist || 'this lobbyist';
      const compensation = compensationRecord.compensation || 'N/A';
      const expenses = compensationRecord.reimbursed_expenses || 'N/A';

      const initialPrompt = `Tell me about ${lobbyist}. They received ${compensation} in compensation plus ${expenses} in reimbursed expenses.`;
      navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
    }
  };

  const handleBack = () => {
    navigate('/lobbying');
  };

  // Sidebar + Header JSX shared across render paths
  const renderSidebarAndHeader = () => (
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

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-5 py-2 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
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
          <button
            onClick={() => navigate('/?prompt=What%20is%20NYSgpt%3F')}
            className="inline-flex items-center justify-center h-10 rounded-md px-3 text-foreground hover:bg-muted transition-colors font-semibold text-xl"
          >
            NYSgpt
          </button>
        </div>
      </nav>
    </>
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
      <div className="min-h-screen bg-muted/30 flex flex-col">
        {renderSidebarAndHeader()}

        {/* Content */}
        <main className="flex-1 pt-16 md:px-2 md:pb-2">
          <div className="w-full md:rounded-2xl md:border bg-background overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 py-6">
              <div className="max-w-[1300px] mx-auto space-y-6">
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
                        {spendRecord.expenses_less_than_75 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              <DollarSign className="h-4 w-4" />
                              <span>Expenses less than $75</span>
                            </div>
                            <div className="text-muted-foreground ml-6">
                              {spendRecord.expenses_less_than_75}
                            </div>
                          </div>
                        )}
                        {spendRecord.salaries_no_lobbying_employees && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              <DollarSign className="h-4 w-4" />
                              <span>Non-Lobbying Salaries</span>
                            </div>
                            <div className="text-muted-foreground ml-6">
                              {spendRecord.salaries_no_lobbying_employees}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-6">
                        {spendRecord.itemized_expenses && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              <DollarSign className="h-4 w-4" />
                              <span>Itemized Expenses</span>
                            </div>
                            <div className="text-muted-foreground ml-6">
                              {spendRecord.itemized_expenses}
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
        </main>
      </div>
    );
  }

  // Render Compensation Detail
  if (isCompensation && compensationRecord) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col">
        {renderSidebarAndHeader()}

        {/* Content */}
        <main className="flex-1 pt-16 md:px-2 md:pb-2">
          <div className="w-full md:rounded-2xl md:border bg-background overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 py-6">
              <div className="max-w-[1300px] mx-auto space-y-6">
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
                    <ClientsDataTable data={lobbyistClients} />
                  </CardContent>
                </Card>
              )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default LobbyingDetail;
