import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, LayoutGrid } from 'lucide-react';
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
} from '@/hooks/useVotesDashboard';
import {
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const VotesDashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAuthenticated = !!session;
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [displayCount, setDisplayCount] = useState(20);
  const [timeRange, setTimeRange] = useState('90');

  useEffect(() => {
    const timer = setTimeout(() => setSidebarMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const {
    isLoading,
    error,
    byMember,
    chartData,
    getDrillDown,
    totalVotes,
    totalMembers,
  } = useVotesDashboard();

  // Filter chart data by time range
  const filteredChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    const days = parseInt(timeRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return chartData.filter((p) => p.date >= cutoffStr);
  }, [chartData, timeRange]);

  // Toggle row expand
  const toggleRow = (peopleId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(peopleId)) {
        next.delete(peopleId);
      } else {
        next.add(peopleId);
      }
      return next;
    });
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

              {/* Chart with time range filter */}
              {!isLoading && filteredChartData.length > 1 && (
                <div className="mb-4">
                  <div className="flex items-center justify-end mb-2">
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
                  </div>
                  <div className="h-24 md:h-28 -mx-2">
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
                        <Area
                          type="monotone"
                          dataKey="yes"
                          stroke="hsl(142 76% 36%)"
                          strokeWidth={1.5}
                          fill="url(#votesYesGradient)"
                          dot={false}
                          animationDuration={500}
                        />
                        <Area
                          type="monotone"
                          dataKey="no"
                          stroke="hsl(0 84% 60%)"
                          strokeWidth={1.5}
                          fill="url(#votesNoGradient)"
                          dot={false}
                          animationDuration={500}
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                          tickFormatter={(value: string) => {
                            const d = new Date(value + 'T00:00:00');
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          }}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          labelFormatter={(label: string) => {
                            const d = new Date(label + 'T00:00:00');
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-2 px-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(142 76% 36%)' }} />
                      <span className="text-xs text-muted-foreground">Yes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(0 84% 60%)' }} />
                      <span className="text-xs text-muted-foreground">No</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Title row + Dashboards button */}
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold mr-1">Votes Dashboard</h2>
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
                <p className="text-destructive">Error loading votes data: {String(error)}</p>
              </div>
            ) : isLoading ? (
              <div className="px-4 md:px-6 py-4 space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : byMember.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground">No vote records found.</p>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {/* Column headers */}
                  <div className="hidden md:grid grid-cols-[1fr_80px_80px_80px_80px] gap-4 px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider bg-background sticky top-0 z-10 border-b">
                    <span>Name</span>
                    <span className="text-right">Votes</span>
                    <span className="text-right">Yes</span>
                    <span className="text-right">No</span>
                    <span className="text-right">% Yes</span>
                  </div>

                  {(isAuthenticated ? byMember.slice(0, displayCount) : byMember.slice(0, 6)).map((row) => (
                    <VoteRowItem
                      key={row.people_id}
                      row={row}
                      isExpanded={expandedRows.has(row.people_id)}
                      onToggle={() => toggleRow(row.people_id)}
                      getDrillDown={getDrillDown}
                    />
                  ))}
                </div>
                {!isAuthenticated && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Please log in to view all vote records.
                    </p>
                    <Button variant="ghost" onClick={() => navigate('/auth-4')}
                      className="mt-4 h-9 px-3 font-semibold text-base hover:bg-muted">
                      Sign Up
                    </Button>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Vote Row Component ───────────────────────────────────────

interface VoteRowItemProps {
  row: VotesDashboardRow;
  isExpanded: boolean;
  onToggle: () => void;
  getDrillDown: (peopleId: number) => VotesDrillDownRow[];
}

function VoteRowItem({ row, isExpanded, onToggle, getDrillDown }: VoteRowItemProps) {
  const drillDownRows = isExpanded ? getDrillDown(row.people_id) : [];

  return (
    <div>
      {/* Main row */}
      <div
        onClick={onToggle}
        className="group grid grid-cols-[1fr_auto] md:grid-cols-[1fr_80px_80px_80px_80px] gap-4 px-4 md:px-6 py-4 cursor-pointer hover:bg-muted/30 transition-all duration-200 items-center"
      >
        {/* Name with expand chevron */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
          <span className="font-medium truncate">{row.name}</span>
          {/* Mobile: show total votes inline */}
          <span className="md:hidden text-sm text-muted-foreground ml-auto pl-2 whitespace-nowrap">
            {row.totalVotes.toLocaleString()} votes
          </span>
        </div>

        {/* Desktop columns */}
        <span className="hidden md:block text-right font-medium tabular-nums">
          {row.totalVotes.toLocaleString()}
        </span>
        <span className="hidden md:block text-right text-sm tabular-nums text-muted-foreground">
          {row.yesCount.toLocaleString()}
        </span>
        <span className="hidden md:block text-right text-sm tabular-nums text-muted-foreground">
          {row.noCount.toLocaleString()}
        </span>
        <span className="hidden md:block text-right text-sm tabular-nums text-muted-foreground">
          {row.pctYes.toFixed(0)}%
        </span>
      </div>

      {/* Mobile supplementary info */}
      <div className="md:hidden px-4 pb-3 -mt-2 flex items-center gap-3 text-xs text-muted-foreground pl-10">
        <span>{row.yesCount} yes</span>
        <span>{row.noCount} no</span>
        <span>{row.pctYes.toFixed(0)}% yes</span>
      </div>

      {/* Drill-down rows */}
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

// ── Vote Drill-Down Row ─────────────────────────────────────────

interface VoteDrillRowProps {
  vote: VotesDrillDownRow;
}

function VoteDrillRow({ vote }: VoteDrillRowProps) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:grid grid-cols-[1fr_120px_80px] gap-4 px-6 py-3 pl-14 hover:bg-muted/20 transition-colors items-center">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm truncate">{vote.billTitle || 'No title'}</span>
          {vote.billNumber && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
              {vote.billNumber}
            </span>
          )}
        </div>
        <span className="text-right text-sm text-muted-foreground">
          {vote.date ? new Date(vote.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
        </span>
        <span className={cn(
          "text-right text-sm font-medium",
          vote.vote === 'Yes' && "text-green-600",
          vote.vote === 'No' && "text-red-500",
          vote.vote === 'Other' && "text-muted-foreground"
        )}>
          {vote.vote}
        </span>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-4 py-3 pl-10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm truncate">{vote.billTitle || 'No title'}</span>
            {vote.billNumber && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
                {vote.billNumber}
              </span>
            )}
          </div>
          <span className={cn(
            "text-sm font-medium ml-2 whitespace-nowrap",
            vote.vote === 'Yes' && "text-green-600",
            vote.vote === 'No' && "text-red-500",
            vote.vote === 'Other' && "text-muted-foreground"
          )}>
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

export default VotesDashboard;
