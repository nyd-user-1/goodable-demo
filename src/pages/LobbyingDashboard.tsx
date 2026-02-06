import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, ArrowUp, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileMenuIcon, MobileNYSgpt } from '@/components/MobileMenuButton';
import { NoteViewSidebar } from '@/components/NoteViewSidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LobbyingChatDrawer } from '@/components/LobbyingChatDrawer';
import {
  useLobbyingDashboard,
  formatCompactCurrency,
  type LobbyingDashboardTab,
  type LobbyingDashboardRow,
  type LobbyingDrillDownRow,
  TAB_LABELS,
} from '@/hooks/useLobbyingDashboard';

const TABS: LobbyingDashboardTab[] = ['lobbyist', 'client'];

const LobbyingDashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAuthenticated = !!session;
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<LobbyingDashboardTab>('lobbyist');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLobbyistName, setChatLobbyistName] = useState<string | null>(null);
  const [chatClientName, setChatClientName] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSidebarMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const {
    isLoading,
    error,
    byLobbyist,
    byClient,
    lobbyistGrandTotal,
    clientGrandTotal,
    totalLobbyists,
    totalClients,
    getClientsForLobbyist,
  } = useLobbyingDashboard();

  // Get rows for the active tab
  const rows: LobbyingDashboardRow[] = useMemo(() => {
    switch (activeTab) {
      case 'lobbyist': return byLobbyist;
      case 'client': return byClient;
    }
  }, [activeTab, byLobbyist, byClient]);

  const grandTotal = activeTab === 'lobbyist' ? lobbyistGrandTotal : clientGrandTotal;

  // Toggle row expansion
  const toggleRow = (name: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
    setSelectedRow((prev) => (prev === name ? null : name));
  };

  // Reset expanded rows when tab changes
  useEffect(() => {
    setExpandedRows(new Set());
    setSelectedRow(null);
  }, [activeTab]);

  // Selected row data for header display
  const selectedRowData = useMemo(() => {
    if (!selectedRow) return null;
    return rows.find((r) => r.name === selectedRow) || null;
  }, [selectedRow, rows]);

  // Header values: show selected row's values when selected, otherwise grand totals
  const headerAmount = selectedRowData ? selectedRowData.amount : grandTotal;

  // Open chat drawer
  const openChat = (lobbyistName?: string | null, clientName?: string | null) => {
    setChatLobbyistName(lobbyistName || null);
    setChatClientName(clientName || null);
    setChatOpen(true);
  };

  // Chat click for main row
  const handleChatClick = (row: LobbyingDashboardRow) => {
    if (activeTab === 'lobbyist') {
      openChat(row.name, null);
    } else {
      openChat(null, row.name);
    }
  };

  // Chat click for drill-down row
  const handleDrillDownChatClick = (drillRow: LobbyingDrillDownRow) => {
    openChat(null, drillRow.name);
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Left Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm md:w-72 bg-background border-r z-50",
          sidebarMounted && "transition-transform duration-300 ease-in-out",
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NoteViewSidebar onClose={() => setLeftSidebarOpen(false)} />
      </div>

      {leftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="h-full md:p-2 bg-muted/30">
        <div className="w-full h-full md:rounded-2xl md:border bg-background overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-background border-b">
            <div className="px-4 py-4 md:px-6">
              {/* Top row: sidebar + title left, amount right */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MobileMenuIcon onOpenSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)} />
                  <button
                    onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                    className={cn("hidden md:inline-flex items-center justify-center h-10 w-10 rounded-md text-foreground hover:bg-muted transition-colors", leftSidebarOpen && "bg-muted")}
                    aria-label="Open menu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 5h1"/><path d="M3 12h1"/><path d="M3 19h1"/>
                      <path d="M8 5h1"/><path d="M8 12h1"/><path d="M8 19h1"/>
                      <path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/>
                    </svg>
                  </button>
                </div>

                {/* Amount — top right */}
                {!isLoading && !error && (
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-baseline gap-2 justify-end">
                      <span className="text-3xl md:text-4xl font-bold tracking-tight transition-all duration-300">
                        {formatCompactCurrency(headerAmount)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {activeTab === 'lobbyist' ? 'Total Lobbyist Earnings' : 'Total Client Spending'}
                    </span>
                  </div>
                )}

                <MobileNYSgpt />
              </div>

              {/* Stats row */}
              {!isLoading && (
                <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{totalLobbyists.toLocaleString()} Lobbyists</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{totalClients.toLocaleString()} Clients</span>
                  </div>
                </div>
              )}

              {/* Tabs + Chat button */}
              <div className="flex items-center gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm transition-colors',
                      activeTab === tab
                        ? 'bg-muted text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
                <button
                  onClick={() => openChat()}
                  className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center ml-1 hover:bg-foreground/80 transition-colors flex-shrink-0"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {error ? (
              <div className="text-center py-12 px-4">
                <p className="text-destructive">Error loading lobbying data: {String(error)}</p>
              </div>
            ) : isLoading ? (
              <div className="px-4 md:px-6 py-4 space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground">No lobbying records found.</p>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {/* Column headers */}
                  <div className="hidden md:grid grid-cols-[1fr_44px_120px_80px] gap-4 px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider bg-background sticky top-0 z-10 border-b">
                    <span>Name</span>
                    <span className="flex items-center justify-center">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-right">Amount</span>
                    <span className="text-right">Share</span>
                  </div>

                  {(isAuthenticated ? rows : rows.slice(0, 10)).map((row) => (
                    <DashboardRowItem
                      key={row.name}
                      row={row}
                      isExpanded={expandedRows.has(row.name)}
                      isSelected={selectedRow === row.name}
                      hasSelection={selectedRow !== null}
                      onToggle={() => toggleRow(row.name)}
                      onChatClick={() => handleChatClick(row)}
                      tab={activeTab}
                      getClientsForLobbyist={getClientsForLobbyist}
                      onDrillDownChatClick={handleDrillDownChatClick}
                    />
                  ))}

                  {/* Grand total row */}
                  <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_44px_120px_80px] gap-4 px-4 md:px-6 py-4 bg-muted/30 font-semibold">
                    <span>Total</span>
                    <span className="hidden md:block" />
                    <span className="text-right">{formatCompactCurrency(grandTotal)}</span>
                    <span className="hidden md:block text-right">100%</span>
                  </div>
                </div>
                {!isAuthenticated && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Please log in to view all lobbying records.
                    </p>
                    <Button variant="ghost" onClick={() => navigate('/auth-4')}
                      className="mt-4 h-9 px-3 font-semibold text-base hover:bg-muted">
                      Sign Up
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lobbying Chat Drawer */}
      <LobbyingChatDrawer
        open={chatOpen}
        onOpenChange={setChatOpen}
        lobbyistName={chatLobbyistName}
        clientName={chatClientName}
      />
    </div>
  );
};

// ── Dashboard Row Component ───────────────────────────────────────

interface DashboardRowItemProps {
  row: LobbyingDashboardRow;
  isExpanded: boolean;
  isSelected: boolean;
  hasSelection: boolean;
  onToggle: () => void;
  onChatClick: () => void;
  tab: LobbyingDashboardTab;
  getClientsForLobbyist: (name: string) => LobbyingDrillDownRow[];
  onDrillDownChatClick: (row: LobbyingDrillDownRow) => void;
}

function DashboardRowItem({
  row,
  isExpanded,
  isSelected,
  hasSelection,
  onToggle,
  onChatClick,
  tab,
  getClientsForLobbyist,
  onDrillDownChatClick,
}: DashboardRowItemProps) {
  const drillDownRows = isExpanded && tab === 'lobbyist' ? getClientsForLobbyist(row.name) : [];

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChatClick();
  };

  return (
    <div>
      {/* Main row */}
      <div
        onClick={onToggle}
        className={cn(
          "group grid grid-cols-[1fr_auto] md:grid-cols-[1fr_44px_120px_80px] gap-4 px-4 md:px-6 py-4 cursor-pointer transition-all duration-200 items-center",
          isSelected
            ? "bg-muted/50"
            : hasSelection
              ? "opacity-50 hover:opacity-100 hover:bg-muted/30"
              : "hover:bg-muted/30"
        )}
      >
        {/* Name with expand chevron */}
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn(
            "flex-shrink-0 transition-colors",
            isSelected ? "text-foreground" : "text-muted-foreground"
          )}>
            {tab === 'lobbyist' ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <div className="w-4" />
            )}
          </span>
          <span className={cn(
            "font-medium truncate transition-colors",
            isSelected && "text-foreground"
          )}>
            {row.name}
          </span>
          {isSelected && (
            <span className="hidden md:inline-flex h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
          )}
          {/* Client count badge for lobbyists */}
          {tab === 'lobbyist' && row.clientCount !== undefined && row.clientCount > 0 && (
            <span className="hidden md:inline-flex text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {row.clientCount} clients
            </span>
          )}
          {/* Mobile: show amount inline */}
          <span className="md:hidden text-sm text-muted-foreground ml-auto pl-2 whitespace-nowrap">
            {formatCompactCurrency(row.amount)}
          </span>
        </div>

        {/* Chat button column (desktop) */}
        <div className="hidden md:flex justify-center">
          <button
            onClick={handleChatClick}
            className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground/80"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>

        {/* Desktop columns */}
        <span className="hidden md:block text-right font-medium tabular-nums">
          {formatCompactCurrency(row.amount)}
        </span>

        {/* Percentage bar */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground/60 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(row.pctOfTotal, 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
            {row.pctOfTotal.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Mobile supplementary info */}
      <div className={cn(
        "md:hidden px-4 pb-3 -mt-2 flex items-center gap-3 text-xs text-muted-foreground pl-10 transition-opacity duration-200",
        hasSelection && !isSelected && "opacity-50"
      )}>
        {tab === 'lobbyist' && row.clientCount !== undefined && row.clientCount > 0 && (
          <span>{row.clientCount} clients</span>
        )}
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[120px]">
          <div
            className="h-full bg-foreground/60 rounded-full"
            style={{ width: `${Math.min(row.pctOfTotal, 100)}%` }}
          />
        </div>
        <span>{row.pctOfTotal.toFixed(0)}%</span>
        <button
          onClick={handleChatClick}
          className="ml-auto w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Drill-down rows (clients for a lobbyist) */}
      {isExpanded && drillDownRows.length > 0 && (
        <div className="bg-muted/10 border-t border-b">
          {drillDownRows.slice(0, 20).map((client) => (
            <ClientRow
              key={client.name}
              client={client}
              onChatClick={() => onDrillDownChatClick(client)}
            />
          ))}
          {drillDownRows.length > 20 && (
            <div className="px-6 py-2 text-xs text-muted-foreground text-center">
              + {drillDownRows.length - 20} more clients
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Client Drill-Down Row ─────────────────────────────────────────

interface ClientRowProps {
  client: LobbyingDrillDownRow;
  onChatClick: () => void;
}

function ClientRow({ client, onChatClick }: ClientRowProps) {
  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChatClick();
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:grid grid-cols-[1fr_44px_120px_80px] gap-4 px-6 py-3 pl-14 hover:bg-muted/20 transition-colors items-center group">
        <span className="text-sm truncate">{client.name}</span>
        <div className="flex justify-center">
          <button
            onClick={handleChatClick}
            className="w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground/80"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-right text-sm tabular-nums">
          {client.amount > 0 ? formatCompactCurrency(client.amount) : '—'}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground/40 rounded-full"
              style={{ width: `${Math.min(client.pctOfParent, 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
            {client.pctOfParent.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-4 py-3 pl-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm truncate flex-1 min-w-0">{client.name}</span>
          <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">
            {client.amount > 0 ? formatCompactCurrency(client.amount) : '—'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[100px]">
            <div
              className="h-full bg-foreground/40 rounded-full"
              style={{ width: `${Math.min(client.pctOfParent, 100)}%` }}
            />
          </div>
          <button
            onClick={handleChatClick}
            className="ml-auto w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>
    </>
  );
}

export default LobbyingDashboard;
