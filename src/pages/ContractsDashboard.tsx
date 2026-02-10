import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, ArrowUp, X, LayoutGrid, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileMenuIcon, MobileNYSgpt } from '@/components/MobileMenuButton';
import { NoteViewSidebar } from '@/components/NoteViewSidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  useContractsDashboard,
  formatCompactCurrency,
  formatFullCurrency,
  type ContractsDashboardTab,
  type ContractsDashboardRow,
  type ContractsDrillDownRow,
  TAB_LABELS,
} from '@/hooks/useContractsDashboard';
import {
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const TABS: ContractsDashboardTab[] = ['department', 'type'];

const ContractsDashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAuthenticated = !!session;
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ContractsDashboardTab>('department');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(25);

  useEffect(() => {
    const timer = setTimeout(() => setSidebarMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const {
    isLoading,
    error,
    byDepartment,
    byType,
    grandTotal,
    totalContracts,
    getDrillDown,
    historicalTotals,
    getHistoricalForGroup,
  } = useContractsDashboard();

  // Get rows for the active tab
  const rows: ContractsDashboardRow[] = useMemo(() => {
    switch (activeTab) {
      case 'department': return byDepartment;
      case 'type': return byType;
    }
  }, [activeTab, byDepartment, byType]);

  // Total contract count for displayed rows
  const displayedTotalContracts = useMemo(() => {
    return rows.reduce((sum, row) => sum + row.contractCount, 0);
  }, [rows]);

  // Toggle row: expand drill-down AND select
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

  // Reset expanded rows and display count when tab changes
  useEffect(() => {
    setExpandedRows(new Set());
    setSelectedRow(null);
    setDisplayCount(25);
  }, [activeTab]);

  // Selected row data for header display
  const selectedRowData = useMemo(() => {
    if (!selectedRow) return null;
    return rows.find((r) => r.name === selectedRow) || null;
  }, [selectedRow, rows]);

  // Chart data: either filtered for selected row or grand totals
  const chartData = useMemo(() => {
    if (selectedRow) {
      return getHistoricalForGroup(activeTab, selectedRow);
    }
    return historicalTotals;
  }, [selectedRow, activeTab, getHistoricalForGroup, historicalTotals]);

  // Header values
  const headerAmount = selectedRowData ? selectedRowData.amount : grandTotal;

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
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => navigate('/contracts')}
                        className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-foreground/80 transition-colors flex-shrink-0"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <span className="text-3xl md:text-4xl font-bold tracking-tight transition-all duration-300">
                        {formatCompactCurrency(headerAmount)}
                      </span>
                      {selectedRow && (
                        <button
                          onClick={() => setSelectedRow(null)}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedRow
                        ? `${selectedRowData?.pctOfTotal.toFixed(1)}% of total`
                        : 'Total Contract Value'}
                    </span>
                  </div>
                )}

                <MobileNYSgpt />
              </div>

              {/* Mini Historical Chart */}
              {!isLoading && chartData.length > 1 && (
                <div className="h-24 md:h-28 mb-4 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                      <defs>
                        <linearGradient id="contractsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(217 91% 60%)"
                        strokeWidth={1.5}
                        fill="url(#contractsGradient)"
                        dot={false}
                        animationDuration={500}
                      />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        tickFormatter={(value) => `'${value.slice(-2)}`}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value: number) => [formatFullCurrency(value), selectedRow || 'Cumulative']}
                        labelFormatter={(label) => `Contracts starting ${label}`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Title + Tabs + Dashboards button */}
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold mr-1">Contracts Dashboard</h2>
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
                <div className="ml-auto">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <LayoutGrid className="h-4 w-4" />
                        <span className="hidden sm:inline">Dashboards</span>
                      </button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Dashboards</DrawerTitle>
                        <DrawerDescription>Explore NYS data dashboards</DrawerDescription>
                      </DrawerHeader>
                      <div className="flex gap-4 overflow-x-auto px-4 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <DrawerClose asChild>
                          <button onClick={() => navigate('/budget-dashboard')} className="group flex flex-col items-center gap-3 rounded-xl border border-transparent hover:border-border p-4 hover:bg-muted/50 hover:shadow-lg transition-all duration-200 flex-none" style={{ width: 'calc((100% - 2rem) / 3)' }}>
                            <img src="/dashboard-budget.avif" alt="Budget Dashboard" className="w-full aspect-[4/3] rounded-lg object-cover" />
                            <span className="text-sm font-medium">Budget</span>
                          </button>
                        </DrawerClose>
                        <DrawerClose asChild>
                          <button onClick={() => navigate('/lobbying-dashboard')} className="group flex flex-col items-center gap-3 rounded-xl border border-transparent hover:border-border p-4 hover:bg-muted/50 hover:shadow-lg transition-all duration-200 flex-none" style={{ width: 'calc((100% - 2rem) / 3)' }}>
                            <img src="/dashboard-lobbying-line.avif" alt="Lobbying Dashboard" className="w-full aspect-[4/3] rounded-lg object-cover" />
                            <span className="text-sm font-medium">Lobbying</span>
                          </button>
                        </DrawerClose>
                        <DrawerClose asChild>
                          <button onClick={() => navigate('/contracts-dashboard')} className="group flex flex-col items-center gap-3 rounded-xl border border-transparent hover:border-border p-4 hover:bg-muted/50 hover:shadow-lg transition-all duration-200 flex-none" style={{ width: 'calc((100% - 2rem) / 3)' }}>
                            <img src="/dashboard-contracts.avif" alt="Contracts Dashboard" className="w-full aspect-[4/3] rounded-lg object-cover" />
                            <span className="text-sm font-medium">Contracts</span>
                          </button>
                        </DrawerClose>
                        <DrawerClose asChild>
                          <button onClick={() => navigate('/votes-dashboard')} className="group flex flex-col items-center gap-3 rounded-xl border border-transparent hover:border-border p-4 hover:bg-muted/50 hover:shadow-lg transition-all duration-200 flex-none" style={{ width: 'calc((100% - 2rem) / 3)' }}>
                            <img src="/dashboard-votes.png" alt="Votes Dashboard" className="w-full aspect-[4/3] rounded-lg object-cover" />
                            <span className="text-sm font-medium">Votes</span>
                          </button>
                        </DrawerClose>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {error ? (
              <div className="text-center py-12 px-4">
                <p className="text-destructive">Error loading contracts data: {String(error)}</p>
              </div>
            ) : isLoading ? (
              <div className="px-4 md:px-6 py-4 space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground">No contract records found.</p>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {/* Column headers */}
                  <div className="hidden md:grid grid-cols-[1fr_120px_80px_80px] gap-4 px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider bg-background sticky top-0 z-10 border-b">
                    <span>Name</span>
                    <span className="text-right">Amount</span>
                    <span className="text-right">Contracts</span>
                    <span className="text-right">Share</span>
                  </div>

                  {(isAuthenticated ? rows.slice(0, displayCount) : rows.slice(0, 6)).map((row) => (
                    <ContractRowItem
                      key={row.name}
                      row={row}
                      isExpanded={expandedRows.has(row.name)}
                      isSelected={selectedRow === row.name}
                      hasSelection={selectedRow !== null}
                      onToggle={() => toggleRow(row.name)}
                      tab={activeTab}
                      getDrillDown={getDrillDown}
                    />
                  ))}

                  {/* Grand total row */}
                  <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_120px_80px_80px] gap-4 px-4 md:px-6 py-4 bg-muted/30 font-semibold">
                    <span>Total</span>
                    <span className="text-right">{formatCompactCurrency(grandTotal)}</span>
                    <span className="hidden md:block text-right">{displayedTotalContracts.toLocaleString()}</span>
                    <span className="hidden md:block text-right">100%</span>
                  </div>
                </div>
                {!isAuthenticated && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Please log in to view all contract records.
                    </p>
                    <Button variant="ghost" onClick={() => navigate('/auth-4')}
                      className="mt-4 h-9 px-3 font-semibold text-base hover:bg-muted">
                      Sign Up
                    </Button>
                  </div>
                )}
                {isAuthenticated && displayCount < rows.length && (
                  <div className="flex justify-center py-6">
                    <button
                      onClick={() => setDisplayCount((prev) => prev + 50)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      Load More ({Math.min(displayCount, rows.length)} of {rows.length})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Contract Row Component ───────────────────────────────────────

interface ContractRowItemProps {
  row: ContractsDashboardRow;
  isExpanded: boolean;
  isSelected: boolean;
  hasSelection: boolean;
  onToggle: () => void;
  tab: ContractsDashboardTab;
  getDrillDown: (tab: ContractsDashboardTab, groupValue: string) => ContractsDrillDownRow[];
}

function ContractRowItem({
  row,
  isExpanded,
  isSelected,
  hasSelection,
  onToggle,
  tab,
  getDrillDown,
}: ContractRowItemProps) {
  const drillDownRows = isExpanded ? getDrillDown(tab, row.name) : [];

  return (
    <div>
      {/* Main row */}
      <div
        onClick={onToggle}
        className={cn(
          "group grid grid-cols-[1fr_auto] md:grid-cols-[1fr_120px_80px_80px] gap-4 px-4 md:px-6 py-4 cursor-pointer transition-all duration-200 items-center",
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
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
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
          {/* Contract count badge */}
          <span className="hidden md:inline-flex text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {row.contractCount} contracts
          </span>
          {/* Mobile: show amount inline */}
          <span className="md:hidden text-sm text-muted-foreground ml-auto pl-2 whitespace-nowrap">
            {formatCompactCurrency(row.amount)}
          </span>
        </div>

        {/* Desktop columns */}
        <span className="hidden md:block text-right font-medium tabular-nums">
          {formatCompactCurrency(row.amount)}
        </span>
        <span className="hidden md:block text-right text-sm tabular-nums text-muted-foreground">
          {row.contractCount.toLocaleString()}
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
        <span>{row.contractCount} contracts</span>
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[120px]">
          <div
            className="h-full bg-foreground/60 rounded-full"
            style={{ width: `${Math.min(row.pctOfTotal, 100)}%` }}
          />
        </div>
        <span>{row.pctOfTotal.toFixed(0)}%</span>
      </div>

      {/* Drill-down rows */}
      {isExpanded && drillDownRows.length > 0 && (
        <div className="bg-muted/10 border-t border-b">
          {drillDownRows.slice(0, 10).map((contract, idx) => (
            <ContractDrillRow
              key={`${contract.contractNumber}-${idx}`}
              contract={contract}
            />
          ))}
          {drillDownRows.length > 10 && (
            <div className="px-6 py-2 text-xs text-muted-foreground text-center">
              + {drillDownRows.length - 10} more contracts
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Contract Drill-Down Row ─────────────────────────────────────────

interface ContractDrillRowProps {
  contract: ContractsDrillDownRow;
}

function ContractDrillRow({ contract }: ContractDrillRowProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (contract.contractNumber) {
      navigate(`/contracts/${contract.contractNumber}`);
    }
  };

  return (
    <>
      {/* Desktop */}
      <div
        onClick={handleClick}
        className={cn(
          "hidden md:grid grid-cols-[1fr_120px_80px_80px] gap-4 px-6 py-3 pl-14 hover:bg-muted/20 transition-colors items-center group",
          contract.contractNumber && "cursor-pointer"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm truncate">{contract.name}</span>
          {contract.contractNumber && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
              {contract.contractNumber}
            </span>
          )}
        </div>
        <span className="text-right text-sm tabular-nums">
          {formatCompactCurrency(contract.amount)}
        </span>
        <span className="text-right text-sm text-muted-foreground">—</span>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground/40 rounded-full"
              style={{ width: `${Math.min(contract.pctOfParent, 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
            {contract.pctOfParent.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Mobile */}
      <div
        onClick={handleClick}
        className={cn(
          "md:hidden px-4 py-3 pl-10",
          contract.contractNumber && "cursor-pointer"
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm truncate">{contract.name}</span>
            {contract.contractNumber && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
                {contract.contractNumber}
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">
            {formatCompactCurrency(contract.amount)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[100px]">
            <div
              className="h-full bg-foreground/40 rounded-full"
              style={{ width: `${Math.min(contract.pctOfParent, 100)}%` }}
            />
          </div>
          <span>{contract.pctOfParent.toFixed(0)}%</span>
        </div>
      </div>
    </>
  );
}

export default ContractsDashboard;
