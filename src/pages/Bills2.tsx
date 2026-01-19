import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Filter, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBillsSearch, formatBillDate } from '@/hooks/useBillsSearch';
import { Bill } from '@/types/bill';

const Bills2 = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    bills,
    totalCount,
    isLoading,
    error,
    statuses,
    committees,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    committeeFilter,
    setCommitteeFilter,
  } = useBillsSearch();

  // Focus search on mount and keyboard shortcut
  useEffect(() => {
    searchInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate a prompt for a bill - varies based on available data
  const generatePrompt = (bill: Bill): string => {
    const billNum = bill.bill_number || 'this bill';
    const title = bill.title ? ` "${bill.title}"` : '';
    const status = bill.status_desc ? ` (Status: ${bill.status_desc})` : '';

    // Use description if available to vary the prompt
    if (bill.description) {
      const shortDesc = bill.description.length > 150
        ? bill.description.substring(0, 150) + '...'
        : bill.description;
      return `Tell me about bill ${billNum}${title}${status}. The bill's summary: "${shortDesc}". What are the key provisions and who would be affected?`;
    }

    return `Tell me about bill ${billNum}${title}${status}. What are the key provisions and who would be affected?`;
  };

  // Navigate to bill detail page
  const handleBillClick = (bill: Bill) => {
    navigate(`/bills/${bill.bill_number}`);
  };

  // Navigate to new chat with prompt and bill_id
  const handleChatClick = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    const prompt = generatePrompt(bill);
    navigate(`/new-chat?prompt=${encodeURIComponent(prompt)}&billId=${bill.bill_id}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCommitteeFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter || committeeFilter;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Title and stats */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">Bills</h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading
                    ? 'Loading...'
                    : `Showing ${bills.length.toLocaleString()} of ${totalCount.toLocaleString()} bills`
                  }
                </p>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search bills by number, title, or description... (press / to focus)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-12 text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={committeeFilter || "all"} onValueChange={(v) => setCommitteeFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[220px]">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Committees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Committees</SelectItem>
                  {committees.map((committee) => (
                    <SelectItem key={committee} value={committee}>
                      {committee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results - Grid */}
      <div className="container mx-auto px-4 py-6">
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading bills: {String(error)}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted/30 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No bills found matching your criteria.</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bills.map((bill) => (
              <BillCard
                key={bill.bill_id}
                bill={bill}
                onClick={() => handleBillClick(bill)}
                onChatClick={(e) => handleChatClick(bill, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Bill card component
interface BillCardProps {
  bill: Bill;
  onClick: () => void;
  onChatClick: (e: React.MouseEvent) => void;
}

function BillCard({ bill, onClick, onChatClick }: BillCardProps) {
  // Build varied preview text based on available data
  let previewText: string;
  if (bill.title) {
    // Truncate title if too long
    previewText = bill.title.length > 120
      ? bill.title.substring(0, 120) + '...'
      : bill.title;
  } else if (bill.description) {
    const shortDesc = bill.description.length > 120
      ? bill.description.substring(0, 120) + '...'
      : bill.description;
    previewText = shortDesc;
  } else {
    previewText = bill.status_desc || 'Legislative bill';
  }

  return (
    <div
      onClick={onClick}
      className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200"
    >
      <h3 className="font-semibold text-base mb-3">
        {bill.bill_number || 'Unknown Bill'}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {previewText}
      </p>

      {/* Details and button - render on hover */}
      <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
        {/* Bill details grid - balanced 2x2 layout */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
          {/* Column 1 */}
          {bill.status_desc && (
            <div>
              <span className="text-muted-foreground">Status</span>
              <p className="font-medium">{bill.status_desc}</p>
            </div>
          )}
          {/* Column 2 */}
          {bill.committee && (
            <div>
              <span className="text-muted-foreground">Committee</span>
              <p className="font-medium truncate">{bill.committee}</p>
            </div>
          )}
          {/* Column 1 */}
          {bill.last_action_date && (
            <div>
              <span className="text-muted-foreground">Last Action</span>
              <p className="font-medium">{formatBillDate(bill.last_action_date)}</p>
            </div>
          )}
          {/* Column 2 */}
          {bill.session_id && (
            <div>
              <span className="text-muted-foreground">Session</span>
              <p className="font-medium">{bill.session_id}</p>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onChatClick}
                  className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ask AI</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

export default Bills2;
