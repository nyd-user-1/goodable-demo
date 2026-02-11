import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ChevronDown, LayoutGrid } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useVotesDashboard,
  type VotesDashboardRow,
  type VotesDrillDownRow,
  type BillPassFailRow,
  type BillMemberVoteRow,
} from '@/hooks/useVotesDashboard';
import {
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const CHART_LABELS = ['Votes by Day', 'Roll Calls', 'Passed vs. Failed', 'By Party', 'Closest Votes'];
const NUM_MODES = CHART_LABELS.length;

const VotesDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const isAuthenticated = !!session;
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [expandedBillRows, setExpandedBillRows] = useState<Set<number>>(new Set());
  const [displayCount, setDisplayCount] = useState(20);
  const [billDisplayCount, setBillDisplayCount] = useState(20);
  const [timeRange, setTimeRange] = useState('90');
  const [chartMode, setChartMode] = useState(() => {
    const m = parseInt(searchParams.get('mode') || '0');
    return m >= 0 && m < NUM_MODES ? m : 0;
  });

  useEffect(() => {
    const timer = setTimeout(() => setSidebarMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const {
    isLoading,
    error,
    byMember,
    chartData,
    rollCallsPerDay,
    passFailPerDay,
    partyPerDay,
    marginPerDay,
    billsPassFail,
    getDrillDown,
    getBillMemberVotes,
    totalVotes,
    totalMembers,
  } = useVotesDashboard();

  // ── Time-range filtered chart data ──────────────────────────
  const cutoffStr = useMemo(() => {
    const days = parseInt(timeRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return cutoff.toISOString().split('T')[0];
  }, [timeRange]);

  const filteredChartData = useMemo(() =>
    chartData.filter((p) => p.date >= cutoffStr), [chartData, cutoffStr]);
  const filteredRollCallData = useMemo(() =>
    rollCallsPerDay.filter((p) => p.date >= cutoffStr), [rollCallsPerDay, cutoffStr]);
  const filteredPassFailData = useMemo(() =>
    passFailPerDay.filter((p) => p.date >= cutoffStr), [passFailPerDay, cutoffStr]);
  const filteredPartyData = useMemo(() =>
    partyPerDay.filter((p) => p.date >= cutoffStr), [partyPerDay, cutoffStr]);
  const filteredMarginData = useMemo(() =>
    marginPerDay.filter((p) => p.date >= cutoffStr), [marginPerDay, cutoffStr]);

  // ── Bills sorted by closest margin (for mode 4) ────────────
  const billsByMargin = useMemo(() =>
    [...billsPassFail].sort((a, b) =>
      Math.abs(a.yesCount - a.noCount) - Math.abs(b.yesCount - b.noCount)
    ), [billsPassFail]);

  // Active chart data for show/hide logic
  const chartDataSets = [filteredChartData, filteredRollCallData, filteredPassFailData, filteredPartyData, filteredMarginData];
  const activeChartHasData = (chartDataSets[chartMode]?.length ?? 0) > 1;

  // Toggle helpers
  const toggleRow = (peopleId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(peopleId) ? next.delete(peopleId) : next.add(peopleId);
      return next;
    });
  };

  const toggleBillRow = (rollCallId: number) => {
    setExpandedBillRows((prev) => {
      const next = new Set(prev);
      next.has(rollCallId) ? next.delete(rollCallId) : next.add(rollCallId);
      return next;
    });
  };

  // Which table type does this mode use?
  const isBillsTable = chartMode === 1 || chartMode === 2 || chartMode === 4;
  const isMembersTable = chartMode === 0 || chartMode === 3;

  // Get the bill rows for the current mode
  const activeBillRows = chartMode === 4 ? billsByMargin : billsPassFail;

  // Shared tooltip/axis styling
  const xAxisProps = {
    dataKey: 'date' as const,
    tick: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' },
    tickLine: false,
    axisLine: false,
    interval: 'preserveStartEnd' as const,
    tickFormatter: (value: string) => { const d = new Date(value + 'T00:00:00'); return `${d.getMonth() + 1}/${d.getDate()}`; },
  };
  const tooltipProps = {
    contentStyle: { backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' },
    labelFormatter: (label: string) => { const d = new Date(label + 'T00:00:00'); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); },
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
              {/* Top row: sidebar toggle left, total votes right */}
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

                {/* Total votes — top right */}
                {!isLoading && !error && (
                  <div className="text-right flex-shrink-0">
                    <span className="text-3xl md:text-4xl font-bold tracking-tight">
                      {totalVotes.toLocaleString()}
                    </span>
                    <div className="text-sm text-muted-foreground">
                      Total Votes &middot; {totalMembers} Members
                    </div>
                  </div>
                )}

                <MobileNYSgpt />
              </div>

              {/* Chart */}
              {!isLoading && activeChartHasData && (
                <div className="mb-4">
                  <div className="h-24 md:h-28 -mx-2">
                    {/* Mode 0: Yes/No votes per day */}
                    {chartMode === 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredChartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                          <defs>
                            <linearGradient id="votesYesGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="votesNoGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="yes" stroke="hsl(142 76% 36%)" strokeWidth={1.5} fill="url(#votesYesGradient)" dot={false} animationDuration={500} />
                          <Area type="monotone" dataKey="no" stroke="hsl(0 84% 60%)" strokeWidth={1.5} fill="url(#votesNoGradient)" dot={false} animationDuration={500} />
                          <XAxis {...xAxisProps} />
                          <RechartsTooltip {...tooltipProps} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}

                    {/* Mode 1: Roll calls per day */}
                    {chartMode === 1 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredRollCallData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                          <defs>
                            <linearGradient id="rollCallGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="rollCalls" stroke="hsl(217 91% 60%)" strokeWidth={1.5} fill="url(#rollCallGradient)" dot={false} animationDuration={500} />
                          <XAxis {...xAxisProps} />
                          <RechartsTooltip {...tooltipProps} formatter={(value: number) => [value, 'Roll Calls']} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}

                    {/* Mode 2: Passed vs Failed per day */}
                    {chartMode === 2 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredPassFailData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                          <defs>
                            <linearGradient id="passedGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="passed" stroke="hsl(142 76% 36%)" strokeWidth={1.5} fill="url(#passedGradient)" dot={false} animationDuration={500} />
                          <Area type="monotone" dataKey="failed" stroke="hsl(0 84% 60%)" strokeWidth={1.5} fill="url(#failedGradient)" dot={false} animationDuration={500} />
                          <XAxis {...xAxisProps} />
                          <RechartsTooltip {...tooltipProps} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}

                    {/* Mode 3: Party breakdown — D vs R yes votes */}
                    {chartMode === 3 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredPartyData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                          <defs>
                            <linearGradient id="demGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="repGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="demYes" stroke="hsl(217 91% 60%)" strokeWidth={1.5} fill="url(#demGradient)" dot={false} animationDuration={500} />
                          <Area type="monotone" dataKey="repYes" stroke="hsl(0 84% 60%)" strokeWidth={1.5} fill="url(#repGradient)" dot={false} animationDuration={500} />
                          <XAxis {...xAxisProps} />
                          <RechartsTooltip {...tooltipProps} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}

                    {/* Mode 4: Average margin per day */}
                    {chartMode === 4 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredMarginData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                          <defs>
                            <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(280 67% 55%)" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(280 67% 55%)" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="avgMargin" stroke="hsl(280 67% 55%)" strokeWidth={1.5} fill="url(#marginGradient)" dot={false} animationDuration={500} />
                          <XAxis {...xAxisProps} />
                          <RechartsTooltip {...tooltipProps} formatter={(value: number) => [value, 'Avg Margin']} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-2 px-2">
                    {chartMode === 0 && (
                      <>
                        <LegendDot color="hsl(142 76% 36%)" label="Yes" />
                        <LegendDot color="hsl(0 84% 60%)" label="No" />
                      </>
                    )}
                    {chartMode === 1 && <LegendDot color="hsl(217 91% 60%)" label="Roll Calls" />}
                    {chartMode === 2 && (
                      <>
                        <LegendDot color="hsl(142 76% 36%)" label="Passed" />
                        <LegendDot color="hsl(0 84% 60%)" label="Failed" />
                      </>
                    )}
                    {chartMode === 3 && (
                      <>
                        <LegendDot color="hsl(217 91% 60%)" label="Democrat Yes" />
                        <LegendDot color="hsl(0 84% 60%)" label="Republican Yes" />
                      </>
                    )}
                    {chartMode === 4 && <LegendDot color="hsl(280 67% 55%)" label="Avg Margin" />}
                  </div>
                </div>
              )}

              {/* Dashboards picker + time range + chart toggle */}
              <div className="flex items-center gap-3">
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

                {/* Time range filter */}
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted rounded-lg px-3 py-2 h-auto text-muted-foreground data-[state=open]:bg-muted [&>svg]:hidden focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90" className="focus:bg-muted focus:text-foreground">90 days</SelectItem>
                    <SelectItem value="30" className="focus:bg-muted focus:text-foreground">30 days</SelectItem>
                    <SelectItem value="7" className="focus:bg-muted focus:text-foreground">7 days</SelectItem>
                  </SelectContent>
                </Select>

                {/* Chart mode toggle */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setChartMode((prev) => (prev - 1 + NUM_MODES) % NUM_MODES)}
                    className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[120px] text-center">
                    {CHART_LABELS[chartMode]}
                  </span>
                  <button
                    onClick={() => setChartMode((prev) => (prev + 1) % NUM_MODES)}
                    className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {error ? (
              <div className="text-center py-12 px-4">
                <p className="text-destructive">Error loading votes data: {String(error)}</p>
              </div>
            ) : isLoading ? (
              <div className="px-4 md:px-6 py-4 space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>

            /* ── Bills Tables (modes 1, 2, 4) ────────────── */
            ) : isBillsTable ? (
              activeBillRows.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-muted-foreground">No bill vote records found.</p>
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {/* Column headers vary by mode */}
                    {chartMode === 1 && (
                      <div className="hidden md:grid grid-cols-[1fr_90px_60px_60px_60px] gap-4 px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider bg-background sticky top-0 z-10 border-b">
                        <span>Bill</span>
                        <span className="text-right">Date</span>
                        <span className="text-right">Total</span>
                        <span className="text-right">Yes</span>
                        <span className="text-right">No</span>
                      </div>
                    )}
                    {chartMode === 2 && (
                      <div className="hidden md:grid grid-cols-[1fr_90px_60px_60px_70px] gap-4 px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider bg-background sticky top-0 z-10 border-b">
                        <span>Bill</span>
                        <span className="text-right">Date</span>
                        <span className="text-right">Yes</span>
                        <span className="text-right">No</span>
                        <span className="text-right">Result</span>
                      </div>
                    )}
                    {chartMode === 4 && (
                      <div className="hidden md:grid grid-cols-[1fr_90px_60px_60px_70px] gap-4 px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider bg-background sticky top-0 z-10 border-b">
                        <span>Bill</span>
                        <span className="text-right">Date</span>
                        <span className="text-right">Yes</span>
                        <span className="text-right">No</span>
                        <span className="text-right">Margin</span>
                      </div>
                    )}

                    {(isAuthenticated ? activeBillRows.slice(0, billDisplayCount) : activeBillRows.slice(0, 6)).map((row) => (
                      <BillRowItem
                        key={`${chartMode}-${row.rollCallId}`}
                        row={row}
                        mode={chartMode as 1 | 2 | 4}
                        isExpanded={expandedBillRows.has(row.rollCallId)}
                        onToggle={() => toggleBillRow(row.rollCallId)}
                        getBillMemberVotes={getBillMemberVotes}
                      />
                    ))}
                  </div>
                  {!isAuthenticated && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Please log in to view all bill records.</p>
                      <Button variant="ghost" onClick={() => navigate('/auth-4')}
                        className="mt-4 h-9 px-3 font-semibold text-base hover:bg-muted">Sign Up</Button>
                    </div>
                  )}
                  {isAuthenticated && billDisplayCount < activeBillRows.length && (
                    <div className="flex justify-center py-6">
                      <button
                        onClick={() => setBillDisplayCount((prev) => prev + 20)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        Load More ({Math.min(billDisplayCount, activeBillRows.length)} of {activeBillRows.length})
                      </button>
                    </div>
                  )}
                </>
              )

            /* ── Members Tables (modes 0, 3) ─────────────── */
            ) : isMembersTable ? (
              byMember.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-muted-foreground">No vote records found.</p>
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {chartMode === 0 && (
                      <div className="hidden md:grid grid-cols-[1fr_80px_80px_80px_80px] gap-4 px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider bg-background sticky top-0 z-10 border-b">
                        <span>Name</span>
                        <span className="text-right">Votes</span>
                        <span className="text-right">Yes</span>
                        <span className="text-right">No</span>
                        <span className="text-right">% Yes</span>
                      </div>
                    )}
                    {chartMode === 3 && (
                      <div className="hidden md:grid grid-cols-[1fr_60px_80px_80px_80px_80px] gap-4 px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider bg-background sticky top-0 z-10 border-b">
                        <span>Name</span>
                        <span>Party</span>
                        <span className="text-right">Votes</span>
                        <span className="text-right">Yes</span>
                        <span className="text-right">No</span>
                        <span className="text-right">% Yes</span>
                      </div>
                    )}

                    {(isAuthenticated ? byMember.slice(0, displayCount) : byMember.slice(0, 6)).map((row) => (
                      <VoteRowItem
                        key={row.people_id}
                        row={row}
                        showParty={chartMode === 3}
                        isExpanded={expandedRows.has(row.people_id)}
                        onToggle={() => toggleRow(row.people_id)}
                        getDrillDown={getDrillDown}
                      />
                    ))}
                  </div>
                  {!isAuthenticated && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Please log in to view all vote records.</p>
                      <Button variant="ghost" onClick={() => navigate('/auth-4')}
                        className="mt-4 h-9 px-3 font-semibold text-base hover:bg-muted">Sign Up</Button>
                    </div>
                  )}
                  {isAuthenticated && displayCount < byMember.length && (
                    <div className="flex justify-center py-6">
                      <button
                        onClick={() => setDisplayCount((prev) => prev + 20)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        Load More ({Math.min(displayCount, byMember.length)} of {byMember.length})
                      </button>
                    </div>
                  )}
                </>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Legend Dot ─────────────────────────────────────────────────
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Vote Row Component (Members table) ────────────────────────

interface VoteRowItemProps {
  row: VotesDashboardRow;
  showParty: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  getDrillDown: (peopleId: number) => VotesDrillDownRow[];
}

function VoteRowItem({ row, showParty, isExpanded, onToggle, getDrillDown }: VoteRowItemProps) {
  const drillDownRows = isExpanded ? getDrillDown(row.people_id) : [];

  const gridCols = showParty
    ? 'md:grid-cols-[1fr_60px_80px_80px_80px_80px]'
    : 'md:grid-cols-[1fr_80px_80px_80px_80px]';

  return (
    <div>
      <div
        onClick={onToggle}
        className={cn("group grid grid-cols-[1fr_auto] gap-4 px-4 md:px-6 py-4 cursor-pointer hover:bg-muted/30 transition-all duration-200 items-center", gridCols)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 text-muted-foreground">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
          <span className="font-medium truncate">{row.name}</span>
          <span className="md:hidden text-sm text-muted-foreground ml-auto pl-2 whitespace-nowrap">
            {row.totalVotes.toLocaleString()} votes
          </span>
        </div>

        {showParty && (
          <span className={cn(
            "hidden md:block text-xs font-medium px-1.5 py-0.5 rounded w-fit",
            row.party === 'D' && "bg-blue-100 text-blue-700",
            row.party === 'R' && "bg-red-100 text-red-600",
            row.party !== 'D' && row.party !== 'R' && "bg-muted text-muted-foreground"
          )}>
            {row.party}
          </span>
        )}

        <span className="hidden md:block text-right font-medium tabular-nums">{row.totalVotes.toLocaleString()}</span>
        <span className="hidden md:block text-right text-sm tabular-nums text-muted-foreground">{row.yesCount.toLocaleString()}</span>
        <span className="hidden md:block text-right text-sm tabular-nums text-muted-foreground">{row.noCount.toLocaleString()}</span>
        <span className="hidden md:block text-right text-sm tabular-nums text-muted-foreground">{row.pctYes.toFixed(0)}%</span>
      </div>

      <div className="md:hidden px-4 pb-3 -mt-2 flex items-center gap-3 text-xs text-muted-foreground pl-10">
        {showParty && (
          <span className={cn(
            "font-medium px-1.5 py-0.5 rounded",
            row.party === 'D' && "bg-blue-100 text-blue-700",
            row.party === 'R' && "bg-red-100 text-red-600",
          )}>
            {row.party}
          </span>
        )}
        <span>{row.yesCount} yes</span>
        <span>{row.noCount} no</span>
        <span>{row.pctYes.toFixed(0)}% yes</span>
      </div>

      {isExpanded && drillDownRows.length > 0 && (
        <div className="bg-muted/10 border-t border-b">
          {drillDownRows.map((vote, idx) => (
            <VoteDrillRow key={`${vote.billNumber}-${idx}`} vote={vote} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Vote Drill-Down Row ───────────────────────────────────────

function VoteDrillRow({ vote }: { vote: VotesDrillDownRow }) {
  return (
    <>
      <div className="hidden md:grid grid-cols-[1fr_120px_80px] gap-4 px-6 py-3 pl-14 hover:bg-muted/20 transition-colors items-center">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm truncate">{vote.billTitle || 'No title'}</span>
          {vote.billNumber && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">{vote.billNumber}</span>
          )}
        </div>
        <span className="text-right text-sm text-muted-foreground">
          {vote.date ? new Date(vote.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
        </span>
        <span className={cn("text-right text-sm font-medium", vote.vote === 'Yes' && "text-green-600", vote.vote === 'No' && "text-red-500", vote.vote === 'Other' && "text-muted-foreground")}>
          {vote.vote}
        </span>
      </div>
      <div className="md:hidden px-4 py-3 pl-10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm truncate">{vote.billTitle || 'No title'}</span>
            {vote.billNumber && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">{vote.billNumber}</span>
            )}
          </div>
          <span className={cn("text-sm font-medium ml-2 whitespace-nowrap", vote.vote === 'Yes' && "text-green-600", vote.vote === 'No' && "text-red-500", vote.vote === 'Other' && "text-muted-foreground")}>
            {vote.vote}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {vote.date ? new Date(vote.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </span>
      </div>
    </>
  );
}

// ── Bill Row Component (Bills table — modes 1, 2, 4) ─────────

interface BillRowItemProps {
  row: BillPassFailRow;
  mode: 1 | 2 | 4;
  isExpanded: boolean;
  onToggle: () => void;
  getBillMemberVotes: (rollCallId: number) => BillMemberVoteRow[];
}

function BillRowItem({ row, mode, isExpanded, onToggle, getBillMemberVotes }: BillRowItemProps) {
  const memberVotes = isExpanded ? getBillMemberVotes(row.rollCallId) : [];
  const margin = Math.abs(row.yesCount - row.noCount);

  const gridCols = mode === 1
    ? 'md:grid-cols-[1fr_90px_60px_60px_60px]'
    : 'md:grid-cols-[1fr_90px_60px_60px_70px]';

  return (
    <div>
      <div
        onClick={onToggle}
        className={cn("group grid grid-cols-[1fr_auto] gap-4 px-4 md:px-6 py-4 cursor-pointer hover:bg-muted/30 transition-all duration-200 items-center", gridCols)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 text-muted-foreground">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
          <span className="font-medium truncate" title={row.billTitle || 'No title'}>{row.billTitle || 'No title'}</span>
          {row.billNumber && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">{row.billNumber}</span>
          )}
          {/* Mobile: last column value */}
          <span className={cn(
            "md:hidden text-sm font-medium ml-auto pl-2 whitespace-nowrap",
            mode === 2 && row.result === 'Passed' && "text-green-600",
            mode === 2 && row.result === 'Failed' && "text-red-500",
          )}>
            {mode === 1 ? `${row.yesCount + row.noCount}` : mode === 2 ? row.result : margin}
          </span>
        </div>

        <span className="hidden md:block text-right text-sm text-muted-foreground whitespace-nowrap">
          {row.date ? new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
        </span>

        {mode === 1 ? (
          <>
            <span className="hidden md:block text-right text-sm font-medium tabular-nums">{(row.yesCount + row.noCount).toLocaleString()}</span>
            <span className="hidden md:block text-right text-sm tabular-nums text-muted-foreground">{row.yesCount.toLocaleString()}</span>
            <span className="hidden md:block text-right text-sm tabular-nums text-muted-foreground">{row.noCount.toLocaleString()}</span>
          </>
        ) : (
          <>
            <span className="hidden md:block text-right text-sm tabular-nums text-muted-foreground">{row.yesCount.toLocaleString()}</span>
            <span className="hidden md:block text-right text-sm tabular-nums text-muted-foreground">{row.noCount.toLocaleString()}</span>
            {mode === 2 ? (
              <span className={cn("hidden md:block text-right text-sm font-medium", row.result === 'Passed' && "text-green-600", row.result === 'Failed' && "text-red-500")}>
                {row.result}
              </span>
            ) : (
              <span className="hidden md:block text-right text-sm font-medium tabular-nums">{margin}</span>
            )}
          </>
        )}
      </div>

      <div className="md:hidden px-4 pb-3 -mt-2 flex items-center gap-3 text-xs text-muted-foreground pl-10">
        <span>{row.yesCount} yes</span>
        <span>{row.noCount} no</span>
        {row.date && (
          <span>{new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        )}
      </div>

      {isExpanded && memberVotes.length > 0 && (
        <div className="bg-muted/10 border-t border-b">
          {memberVotes.map((mv, idx) => (
            <BillMemberVoteDrillRow key={`${mv.name}-${idx}`} memberVote={mv} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bill Member Vote Drill-Down Row ──────────────────────────

function BillMemberVoteDrillRow({ memberVote }: { memberVote: BillMemberVoteRow }) {
  return (
    <>
      <div className="hidden md:grid grid-cols-[1fr_80px] gap-4 px-6 py-3 pl-14 hover:bg-muted/20 transition-colors items-center">
        <span className="text-sm truncate">{memberVote.name}</span>
        <span className={cn("text-right text-sm font-medium", memberVote.vote === 'Yes' && "text-green-600", memberVote.vote === 'No' && "text-red-500", memberVote.vote === 'Other' && "text-muted-foreground")}>
          {memberVote.vote}
        </span>
      </div>
      <div className="md:hidden px-4 py-3 pl-10 flex items-center justify-between">
        <span className="text-sm truncate">{memberVote.name}</span>
        <span className={cn("text-sm font-medium ml-2 whitespace-nowrap", memberVote.vote === 'Yes' && "text-green-600", memberVote.vote === 'No' && "text-red-500", memberVote.vote === 'Other' && "text-muted-foreground")}>
          {memberVote.vote}
        </span>
      </div>
    </>
  );
}

export default VotesDashboard;
