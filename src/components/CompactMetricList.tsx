'use client';

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, Loader2, Menu, RefreshCw, ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BillPDFSheet } from "@/components/features/bills/BillPDFSheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LegislativeBill {
  id: string;
  billNumber: string;
  title: string;
  status: string;
  lastAction: string;
  lastActionDate: string;
  link: string;
}

// Filter options
const chamberOptions = [
  { id: 'both', label: 'Both' },
  { id: 'senate', label: 'Senate' },
  { id: 'house', label: 'Assembly' },
];

const statusOptions = [
  { id: 'any', label: 'All' },
  { id: 'introduced', label: 'Introduced' },
  { id: 'engrossed', label: 'Engrossed' },
  { id: 'enrolled', label: 'Enrolled' },
  { id: 'passed', label: 'Passed' },
];

const BILLS_PER_PAGE = 10;

// LegiScan RSS feed URL for NY legislation
const RSS_FEED_URL = 'https://legiscan.com/gaits/feed/17608aebc160d8aa0e1d7df491f4fc08.rss';

export default function CompactMetricList() {
  const [chamber, setChamber] = useState("both");
  const [status, setStatus] = useState("any");
  const [page, setPage] = useState(1);
  const [allBills, setAllBills] = useState<LegislativeBill[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [pdfSheetOpen, setPdfSheetOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<LegislativeBill | null>(null);

  // Parse RSS feed XML to extract bill data
  const parseRSSFeed = (xmlText: string): LegislativeBill[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = doc.querySelectorAll('item');
    const parsedBills: LegislativeBill[] = [];

    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';

      // Try multiple patterns to extract bill number
      // Pattern 1: "NY S08952 - Title..."
      // Pattern 2: "S08952 - Title..."
      // Pattern 3: Extract from link like "/NY/bill/S08952"
      let billNumber = '';
      let billTitle = title;

      const patterns = [
        /^NY\s+([A-Z]\d+)\s*[-:]\s*(.*)$/i,
        /^([A-Z]\d+)\s*[-:]\s*(.*)$/i,
        /^([SAKJ]\d+)\s*[-:]\s*(.*)$/i,
      ];

      for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match) {
          billNumber = match[1].toUpperCase();
          billTitle = match[2] || title;
          break;
        }
      }

      // Try to extract from link if not found in title
      if (!billNumber && link) {
        const linkMatch = link.match(/\/bill\/([A-Z]\d+)/i);
        if (linkMatch) {
          billNumber = linkMatch[1].toUpperCase();
        }
      }

      // Skip if we couldn't extract a bill number
      if (!billNumber) return;

      // Parse description for status and action info
      let billStatus = 'Intro 25%';
      let lastAction = '';
      let lastActionDate = '';

      // Extract status from description or title
      const statusPatterns = [
        /Status:\s*(\w+)/i,
        /\b(Intro|Introduced|Engross|Engrossed|Enroll|Enrolled|Pass|Passed)\b/i,
      ];

      for (const pattern of statusPatterns) {
        const match = (description + ' ' + title).match(pattern);
        if (match) {
          const rawStatus = match[1].toLowerCase();
          if (rawStatus.startsWith('intro')) {
            billStatus = 'Intro 25%';
          } else if (rawStatus.startsWith('engross')) {
            billStatus = 'Engross 50%';
          } else if (rawStatus.startsWith('enroll')) {
            billStatus = 'Enrolled';
          } else if (rawStatus.startsWith('pass')) {
            billStatus = 'Passed';
          }
          break;
        }
      }

      // Extract last action date
      const datePatterns = [
        /Last Action:\s*(\d{4}-\d{2}-\d{2})\s*(.*?)(?:\||$)/i,
        /(\d{4}-\d{2}-\d{2})/,
      ];

      for (const pattern of datePatterns) {
        const match = description.match(pattern);
        if (match) {
          const [year, month, day] = match[1].split('-');
          lastActionDate = `${month}-${day}-${year}`;
          if (match[2]) {
            lastAction = match[2].trim();
          }
          break;
        }
      }

      // Fallback to pubDate
      if (!lastActionDate && pubDate) {
        const date = new Date(pubDate);
        if (!isNaN(date.getTime())) {
          lastActionDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }

      // Extract action from description if not found
      if (!lastAction) {
        const actionMatch = description.match(/To\s+(Senate|Assembly)\s+[\w\s]+Committee/i);
        if (actionMatch) {
          lastAction = actionMatch[0];
        } else {
          lastAction = 'To Committee';
        }
      }

      parsedBills.push({
        id: `${billNumber}-${index}`,
        billNumber,
        title: billTitle.substring(0, 200).trim(),
        status: billStatus,
        lastAction,
        lastActionDate: lastActionDate || 'Recent',
        link: link || `https://legiscan.com/NY/bill/${billNumber}`,
      });
    });

    return parsedBills;
  };

  // Legacy HTML parser (kept as fallback)
  const parseHTMLPage = (htmlText: string): LegislativeBill[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const parsedBills: LegislativeBill[] = [];

    // Find the table rows - LegiScan uses a table with bill data
    const rows = doc.querySelectorAll('table tr');

    rows.forEach((row, index) => {
      // Skip header row
      if (index === 0 || row.querySelector('th')) return;

      const cells = row.querySelectorAll('td');
      if (cells.length < 4) return;

      // Extract bill number from first cell (contains link)
      const billLink = cells[0]?.querySelector('a');
      const billNumber = billLink?.textContent?.trim() || '';
      const link = billLink?.getAttribute('href') || '';
      const fullLink = link.startsWith('/') ? `https://legiscan.com${link}` : link;

      // Extract status from second cell
      let statusText = cells[1]?.textContent?.trim() || '';
      // Ensure space between letters and numbers (e.g., "Intro25%" → "Intro 25%")
      statusText = statusText.replace(/([a-zA-Z])(\d)/g, '$1 $2');

      // Extract title/summary from third cell
      const titleCell = cells[2];
      // Get just the text, not the [Detail][Text][Discuss] links
      let title = '';
      const titleNodes = titleCell?.childNodes;
      if (titleNodes) {
        for (const node of titleNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            title += node.textContent || '';
          }
        }
      }
      title = title.trim();
      if (!title) {
        title = titleCell?.textContent?.replace(/\[Detail\]|\[Text\]|\[Discuss\]/g, '').trim() || '';
      }

      // Extract last action date from fourth cell
      const lastActionCell = cells[3];
      const dateText = lastActionCell?.textContent?.trim() || '';

      // Extract date (YYYY-MM-DD format) from the beginning of the text
      const dateMatch = dateText.match(/^(\d{4}-\d{2}-\d{2})/);
      let rawDate = '';
      let lastAction = dateText;

      if (dateMatch) {
        rawDate = dateMatch[1];
        // Get everything after the date as the action text
        lastAction = dateText.substring(rawDate.length).trim() || 'To Committee';
      }

      // Format the date as MM-DD-YYYY
      let formattedDate = rawDate;
      if (rawDate) {
        const [year, month, day] = rawDate.split('-');
        formattedDate = `${month}-${day}-${year}`;
      }

      if (billNumber) {
        parsedBills.push({
          id: `${billNumber}-${index}`,
          billNumber: billNumber.toUpperCase(),
          title: title.substring(0, 200),
          status: statusText,
          lastAction,
          lastActionDate: formattedDate,
          link: fullLink,
        });
      }
    });

    return parsedBills.slice(0, 50); // Return more bills for client-side filtering
  };

  // Helper function to fetch HTML and parse it
  const fetchHTMLFallback = async (): Promise<LegislativeBill[]> => {
    const htmlUrl = 'https://legiscan.com/NY/legislation';
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(htmlUrl)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const htmlText = await response.text();
      return parseHTMLPage(htmlText);
    }
    return [];
  };

  // Fetch data from RSS feed with HTML fallback
  const fetchRSSFeed = useCallback(async (forceRefresh = false) => {
    // Don't refetch if we already have data (unless forced)
    if (allBills.length > 0 && !forceRefresh) {
      return;
    }

    setLoading(true);
    let parsedBills: LegislativeBill[] = [];

    // Try RSS feed first
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_FEED_URL)}`;
      const response = await fetch(proxyUrl);

      if (response.ok) {
        const xmlText = await response.text();
        parsedBills = parseRSSFeed(xmlText);
      }
    } catch (err) {
      console.error('Error fetching RSS feed:', err);
    }

    // If RSS returned no results, try HTML scraping
    if (parsedBills.length === 0) {
      console.log('RSS returned no results, trying HTML fallback...');
      try {
        parsedBills = await fetchHTMLFallback();
      } catch (fallbackErr) {
        console.error('HTML fallback also failed:', fallbackErr);
      }
    }

    // Update state with whatever we got
    if (parsedBills.length > 0) {
      setAllBills(parsedBills);
    }

    setLastUpdated(new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }));

    setLoading(false);
  }, [allBills.length]);

  // Filter bills based on chamber and status
  const getFilteredBills = useCallback(() => {
    let filtered = [...allBills];

    // Filter by chamber
    if (chamber === 'senate') {
      filtered = filtered.filter(bill => bill.billNumber.startsWith('S'));
    } else if (chamber === 'house') {
      filtered = filtered.filter(bill => bill.billNumber.startsWith('A') || bill.billNumber.startsWith('K'));
    }

    // Filter by status
    if (status !== 'any') {
      filtered = filtered.filter(bill => {
        const billStatus = bill.status.toLowerCase();
        if (status === 'introduced') {
          return billStatus.includes('intro');
        } else if (status === 'engrossed') {
          return billStatus.includes('engross');
        } else if (status === 'enrolled') {
          return billStatus.includes('enroll');
        } else if (status === 'passed') {
          return billStatus.includes('pass');
        }
        return true;
      });
    }

    return filtered;
  }, [allBills, chamber, status]);

  // Get paginated bills
  const getPaginatedBills = useCallback(() => {
    const filtered = getFilteredBills();
    const startIndex = (page - 1) * BILLS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + BILLS_PER_PAGE);
  }, [getFilteredBills, page]);

  // Reset page when filters change
  const handleChamberChange = (newChamber: string) => {
    setChamber(newChamber);
    setPage(1);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  // Refresh current data
  const handleRefresh = () => {
    fetchRSSFeed(true);
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchRSSFeed();
  }, []);

  // Get current bills for display
  const currentBills = getPaginatedBills();
  const filteredBills = getFilteredBills();
  const isLoading = loading;

  // Check if there are more pages
  const totalPages = Math.ceil(filteredBills.length / BILLS_PER_PAGE);
  const hasMorePages = page < totalPages;

  return (
    <section className="bg-background w-full py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
        <div className="mb-8 flex flex-col items-center justify-center space-y-4 text-center">
          <Badge className="px-3.5 py-1.5 bg-foreground text-background hover:bg-foreground/90 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Feed
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            NYS Legislative Activity
          </h2>
          <p className="text-muted-foreground max-w-[700px] md:text-lg">
            Real-time bills from the New York State Senate and Assembly.
          </p>
        </div>

        {/* Last updated indicator */}
        <div className="text-muted-foreground text-sm mb-4">
          <span className="font-medium">Last updated:</span> {lastUpdated || 'Loading...'}
        </div>

        <Card className="border p-0 shadow-sm">
          <CardContent className="p-0">
            {/* Filter Controls - Tab Style */}
            <div className="hidden border-b px-4 md:block">
              <div className="flex items-center justify-between">
                <div className="flex h-12 items-center gap-0">
                  {/* Chamber Filters */}
                  {chamberOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleChamberChange(opt.id)}
                      className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-none",
                        chamber === opt.id
                          ? "bg-muted shadow-none"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}

                  {/* Status Filters */}
                  {statusOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleStatusChange(opt.id)}
                      className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-none",
                        status === opt.id
                          ? "bg-muted shadow-none"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}

                  {/* Pagination Chevrons */}
                  <div className="flex items-center ml-2">
                    {page > 1 && (
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted/50 transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}
                    {hasMorePages && (
                      <button
                        onClick={() => setPage(p => p + 1)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted/50 transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Refresh button */}
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground"
                  aria-label="Refresh"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </button>
              </div>
            </div>

            {/* Mobile view: Dropdown for filters */}
            <div className="border-b p-3 md:hidden">
              <div className="flex items-center justify-between gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-between">
                      <span>
                        {chamberOptions.find(o => o.id === chamber)?.label} · {statusOptions.find(o => o.id === status)?.label}
                      </span>
                      <Menu className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Chamber</div>
                    {chamberOptions.map(opt => (
                      <DropdownMenuItem key={opt.id} onClick={() => handleChamberChange(opt.id)}>
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">Status</div>
                    {statusOptions.map(opt => (
                      <DropdownMenuItem key={opt.id} onClick={() => handleStatusChange(opt.id)}>
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-1">
                  {page > 1 && (
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  {hasMorePages && (
                    <button
                      onClick={() => setPage(p => p + 1)}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-md border hover:bg-muted/50 transition-colors text-muted-foreground"
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  </button>
                </div>
              </div>
            </div>

            {/* Bills List */}
            <div>
              {currentBills.length === 0 && isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading bills...</span>
                </div>
              ) : currentBills.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  No bills found for the selected filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 divide-y">
                    {currentBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="hover:bg-muted/50 flex items-start justify-between gap-4 px-4 py-4 transition-colors md:px-6"
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-blue-600">
                              {bill.billNumber}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {bill.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground mt-1 line-clamp-2">
                            {bill.title}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mt-1">
                            <span className="text-muted-foreground text-xs">
                              {bill.lastAction}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {bill.lastActionDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setPdfSheetOpen(true);
                                }}
                              >
                                <ScrollText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View bill</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="group"
            asChild
          >
            <Link to="/bills">
              View all legislation
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* PDF Sheet */}
      <BillPDFSheet
        isOpen={pdfSheetOpen}
        onClose={() => setPdfSheetOpen(false)}
        billNumber={selectedBill?.billNumber || ''}
        billTitle={selectedBill?.title}
      />
    </section>
  );
}
