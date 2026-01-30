import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelLeft, ChevronRight, ChevronDown, ArrowUp, TrendingUp, TrendingDown, Minus, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileMenuIcon, MobileNYSgpt } from '@/components/MobileMenuButton';
import { NoteViewSidebar } from '@/components/NoteViewSidebar';
import { Button } from '@/components/ui/button';
import {
  useBudgetDashboard,
  formatCompactCurrency,
  formatFullCurrency,
  type DashboardTab,
  type DashboardRow,
  type DrillDownRow,
  TAB_LABELS,
} from '@/hooks/useBudgetDashboard';
import { reformatAgencyName } from '@/hooks/useBudgetSearch';
import {
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const TABS: DashboardTab[] = ['function', 'fundType', 'fpCategory'];

const BudgetDashboard = () => {
  const navigate = useNavigate();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('function');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSidebarMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const {
    isLoading,
    error,
    byFunction,
    byFundType,
    byFpCategory,
    grandTotal,
    priorGrandTotal,
    historicalTotals,
    primaryYear,
    priorYear,
    getDrillDown,
    getHistoricalForGroup,
  } = useBudgetDashboard();

  // Get rows for the active tab
  const rows: DashboardRow[] = useMemo(() => {
    switch (activeTab) {
      case 'function': return byFunction;
      case 'fundType': return byFundType;
      case 'fpCategory': return byFpCategory;
    }
  }, [activeTab, byFunction, byFundType, byFpCategory]);

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
  };

  // Toggle chart selection (independent of drill-down expand)
  const toggleChartSelection = (name: string) => {
    setSelectedRow((prev) => (prev === name ? null : name));
  };

  // Reset expanded rows and chart selection when tab changes
  useEffect(() => {
    setExpandedRows(new Set());
    setSelectedRow(null);
  }, [activeTab]);

  // Chart data: either filtered for selected row or grand totals
  const chartData = useMemo(() => {
    if (selectedRow) {
      return getHistoricalForGroup(activeTab, selectedRow);
    }
    return historicalTotals;
  }, [selectedRow, activeTab, getHistoricalForGroup, historicalTotals]);

  // Selected row data for header display
  const selectedRowData = useMemo(() => {
    if (!selectedRow) return null;
    return rows.find((r) => r.name === selectedRow) || null;
  }, [selectedRow, rows]);

  // Grand total YoY change
  const grandTotalYoy = priorGrandTotal !== 0
    ? ((grandTotal - priorGrandTotal) / Math.abs(priorGrandTotal)) * 100
    : 0;

  // Primary year label (e.g. "2026-27")
  const primaryYearLabel = primaryYear.replace(/\s+(Actuals|Estimates)$/i, '');

  // Header values: show selected row's values when selected, otherwise grand totals
  const headerAmount = selectedRowData ? selectedRowData.amount : grandTotal;
  const headerYoy = selectedRowData ? selectedRowData.yoyChange : grandTotalYoy;
  const headerLabel = selectedRowData
    ? `${selectedRowData.name} — FY ${primaryYearLabel}`
    : `FY ${primaryYearLabel} Estimated Total Spending`;

  // Chat click: start a chat about a specific function/category
  const handleChatClick = (row: DashboardRow) => {
    const tabLabel = activeTab === 'function' ? 'functional area' : activeTab === 'fundType' ? 'fund type' : 'financial plan category';
    const prompt = `Analyze NYS budget spending for the ${tabLabel} "${row.name}". Total estimated spending for FY ${primaryYearLabel}: ${formatFullCurrency(row.amount)}. Year-over-year change: ${row.yoyChange >= 0 ? '+' : ''}${row.yoyChange.toFixed(1)}%. What are the key trends and notable items?`;
    navigate(`/new-chat?prompt=${encodeURIComponent(prompt)}`);
  };

  // Chat click for drill-down agency row
  const handleAgencyChatClick = (agency: DrillDownRow, parentName: string) => {
    const displayName = reformatAgencyName(agency.name);
    const prompt = `Tell me about NYS spending by ${displayName} under "${parentName}". Estimated spending for FY ${primaryYearLabel}: ${formatFullCurrency(agency.amount)}. Year-over-year change: ${agency.yoyChange >= 0 ? '+' : ''}${agency.yoyChange.toFixed(1)}%. What should I know?`;
    navigate(`/new-chat?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Left Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm md:w-64 bg-background border-r z-50",
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MobileMenuIcon onOpenSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                    className={cn("hidden md:inline-flex flex-shrink-0", leftSidebarOpen && "bg-muted")}
                  >
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="hidden md:block text-xl font-semibold">Budget Explorer</h1>
                </div>
                <MobileNYSgpt />
              </div>

              {/* Total Header */}
              {!isLoading && !error && (
                <div className="mb-4">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl md:text-4xl font-bold tracking-tight transition-all duration-300">
                      {formatCompactCurrency(headerAmount)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {headerLabel}
                    </span>
                    {selectedRow && (
                      <button
                        onClick={() => setSelectedRow(null)}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        <X className="h-3 w-3" />
                        Show All
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {headerYoy > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : headerYoy < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      headerYoy > 0 ? "text-green-600 dark:text-green-400" :
                      headerYoy < 0 ? "text-red-600 dark:text-red-400" :
                      "text-muted-foreground"
                    )}>
                      {headerYoy >= 0 ? '+' : ''}{headerYoy.toFixed(1)}% from prior year
                    </span>
                  </div>
                </div>
              )}

              {/* Mini Historical Chart */}
              {!isLoading && chartData.length > 1 && (
                <div className="h-24 md:h-28 mb-4 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                      <defs>
                        <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--foreground))"
                        strokeWidth={1.5}
                        fill="url(#budgetGradient)"
                        dot={false}
                        animationDuration={500}
                      />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value: number) => [formatFullCurrency(value), selectedRow || 'Total']}
                        labelFormatter={(label) => `FY ${label}`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      activeTab === tab
                        ? 'bg-foreground text-background'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    )}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {error ? (
              <div className="text-center py-12 px-4">
                <p className="text-destructive">Error loading budget data: {String(error)}</p>
              </div>
            ) : isLoading ? (
              <div className="px-4 md:px-6 py-4 space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground">No spending data available.</p>
              </div>
            ) : (
              <div className="divide-y">
                {/* Column headers */}
                <div className="hidden md:grid grid-cols-[44px_1fr_120px_100px_80px] gap-4 px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider bg-muted/20 sticky top-0 z-10">
                  <span className="flex items-center justify-center">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </span>
                  <span>Name</span>
                  <span className="text-right">FY {primaryYearLabel}</span>
                  <span className="text-right">Change</span>
                  <span className="text-right">Share</span>
                </div>

                {rows.map((row) => (
                  <DashboardRowItem
                    key={row.name}
                    row={row}
                    isExpanded={expandedRows.has(row.name)}
                    isSelected={selectedRow === row.name}
                    hasSelection={selectedRow !== null}
                    onToggle={() => toggleRow(row.name)}
                    onSelectForChart={() => toggleChartSelection(row.name)}
                    onChatClick={() => handleChatClick(row)}
                    tab={activeTab}
                    getDrillDown={getDrillDown}
                    onAgencyChatClick={(agency) => handleAgencyChatClick(agency, row.name)}
                    primaryYearLabel={primaryYearLabel}
                  />
                ))}

                {/* Grand total row */}
                <div className="grid grid-cols-[1fr_auto] md:grid-cols-[44px_1fr_120px_100px_80px] gap-4 px-4 md:px-6 py-4 bg-muted/30 font-semibold">
                  <span className="hidden md:block" />
                  <span>Total</span>
                  <span className="text-right">{formatCompactCurrency(grandTotal)}</span>
                  <span className={cn(
                    "hidden md:block text-right",
                    grandTotalYoy > 0 ? "text-green-600 dark:text-green-400" :
                    grandTotalYoy < 0 ? "text-red-600 dark:text-red-400" :
                    "text-muted-foreground"
                  )}>
                    {grandTotalYoy >= 0 ? '+' : ''}{grandTotalYoy.toFixed(1)}%
                  </span>
                  <span className="hidden md:block text-right">100%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Dashboard Row Component ───────────────────────────────────────

interface DashboardRowItemProps {
  row: DashboardRow;
  isExpanded: boolean;
  isSelected: boolean;
  hasSelection: boolean;
  onToggle: () => void;
  onSelectForChart: () => void;
  onChatClick: () => void;
  tab: DashboardTab;
  getDrillDown: (tab: DashboardTab, groupValue: string) => DrillDownRow[];
  onAgencyChatClick: (agency: DrillDownRow) => void;
  primaryYearLabel: string;
}

function DashboardRowItem({
  row,
  isExpanded,
  isSelected,
  hasSelection,
  onToggle,
  onSelectForChart,
  onChatClick,
  tab,
  getDrillDown,
  onAgencyChatClick,
  primaryYearLabel,
}: DashboardRowItemProps) {
  const drillDownRows = isExpanded ? getDrillDown(tab, row.name) : [];

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChatClick();
  };

  const handleChartSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectForChart();
  };

  return (
    <div>
      {/* Main row */}
      <div
        onClick={onToggle}
        className={cn(
          "group grid grid-cols-[1fr_auto] md:grid-cols-[44px_1fr_120px_100px_80px] gap-4 px-4 md:px-6 py-4 cursor-pointer transition-all duration-200 items-center",
          isSelected
            ? "bg-muted/50"
            : hasSelection
              ? "opacity-50 hover:opacity-100 hover:bg-muted/30"
              : "hover:bg-muted/30"
        )}
      >
        {/* Chat button - first column (desktop) */}
        <div className="hidden md:flex justify-center">
          <button
            onClick={handleChatClick}
            className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground/80"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>

        {/* Name with expand chevron */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={handleChartSelect}
            className={cn(
              "flex-shrink-0 transition-colors",
              isSelected ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <span
            className={cn(
              "font-medium truncate cursor-pointer transition-colors",
              isSelected && "text-foreground"
            )}
            onClick={(e) => { e.stopPropagation(); onSelectForChart(); }}
          >
            {row.name}
          </span>
          {isSelected && (
            <span className="hidden md:inline-flex h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
          )}
          {/* Mobile: show amount inline */}
          <span className="md:hidden text-sm text-muted-foreground ml-auto pl-2 whitespace-nowrap">
            {formatCompactCurrency(row.amount)}
          </span>
        </div>

        {/* Desktop columns */}
        <span className="hidden md:block text-right font-medium tabular-nums">
          {formatCompactCurrency(row.amount)}
        </span>
        <span className={cn(
          "hidden md:block text-right text-sm tabular-nums",
          row.yoyChange > 0 ? "text-green-600 dark:text-green-400" :
          row.yoyChange < 0 ? "text-red-600 dark:text-red-400" :
          "text-muted-foreground"
        )}>
          {row.yoyChange >= 0 ? '+' : ''}{row.yoyChange.toFixed(1)}%
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
        <span className={cn(
          row.yoyChange > 0 ? "text-green-600 dark:text-green-400" :
          row.yoyChange < 0 ? "text-red-600 dark:text-red-400" :
          ""
        )}>
          {row.yoyChange >= 0 ? '+' : ''}{row.yoyChange.toFixed(1)}%
        </span>
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

      {/* Drill-down rows */}
      {isExpanded && drillDownRows.length > 0 && (
        <div className="bg-muted/10 border-t border-b">
          {drillDownRows.map((agency) => (
            <AgencyRow
              key={agency.name}
              agency={agency}
              onChatClick={() => onAgencyChatClick(agency)}
              primaryYearLabel={primaryYearLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Agency Drill-Down Row ─────────────────────────────────────────

interface AgencyRowProps {
  agency: DrillDownRow;
  onChatClick: () => void;
  primaryYearLabel: string;
}

function AgencyRow({ agency, onChatClick, primaryYearLabel }: AgencyRowProps) {
  const displayName = reformatAgencyName(agency.name);

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChatClick();
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:grid grid-cols-[44px_1fr_120px_100px_80px] gap-4 px-6 py-3 pl-14 hover:bg-muted/20 transition-colors items-center group">
        <div className="flex justify-center">
          <button
            onClick={handleChatClick}
            className="w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground/80"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-sm truncate">{displayName}</span>
        <span className="text-right text-sm tabular-nums">
          {formatCompactCurrency(agency.amount)}
        </span>
        <span className={cn(
          "text-right text-sm tabular-nums",
          agency.yoyChange > 0 ? "text-green-600 dark:text-green-400" :
          agency.yoyChange < 0 ? "text-red-600 dark:text-red-400" :
          "text-muted-foreground"
        )}>
          {agency.yoyChange >= 0 ? '+' : ''}{agency.yoyChange.toFixed(1)}%
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground/40 rounded-full"
              style={{ width: `${Math.min(agency.pctOfParent, 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
            {agency.pctOfParent.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-4 py-3 pl-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm truncate flex-1 min-w-0">{displayName}</span>
          <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">
            {formatCompactCurrency(agency.amount)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className={cn(
            agency.yoyChange > 0 ? "text-green-600 dark:text-green-400" :
            agency.yoyChange < 0 ? "text-red-600 dark:text-red-400" :
            ""
          )}>
            {agency.yoyChange >= 0 ? '+' : ''}{agency.yoyChange.toFixed(1)}%
          </span>
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[100px]">
            <div
              className="h-full bg-foreground/40 rounded-full"
              style={{ width: `${Math.min(agency.pctOfParent, 100)}%` }}
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

export default BudgetDashboard;
