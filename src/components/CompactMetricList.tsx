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

export default function CompactMetricList() {
  const [chamber, setChamber] = useState("both");
  const [status, setStatus] = useState("any");
  const [page, setPage] = useState(1);
  const [bills, setBills] = useState<Record<string, LegislativeBill[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [pdfSheetOpen, setPdfSheetOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<LegislativeBill | null>(null);

  // Build cache key from filters and page
  const getCacheKey = (chamberVal: string, statusVal: string, pageNum: number) => `${chamberVal}-${statusVal}-${pageNum}`;

  // Build LegiScan URL from filters and page
  const buildUrl = (chamberVal: string, statusVal: string, pageNum: number): string => {
    const baseUrl = 'https://legiscan.com/NY/legislation';
    const params = new URLSearchParams();

    if (statusVal !== 'any') {
      params.append('status', statusVal);
    }

    if (chamberVal !== 'both') {
      params.append('chamber', chamberVal);
    }

    if (pageNum > 1) {
      params.append('page', pageNum.toString());
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Parse HTML table to extract bill data
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

    return parsedBills.slice(0, BILLS_PER_PAGE);
  };

  // Track if we've reached the end of results
  const [endOfResults, setEndOfResults] = useState<Record<string, boolean>>({});

  // Fetch data from LegiScan
  const fetchData = useCallback(async (chamberVal: string, statusVal: string, pageNum: number, forceRefresh = false) => {
    const cacheKey = getCacheKey(chamberVal, statusVal, pageNum);

    // Check if already cached (use functional check to avoid stale closure)
    const alreadyCached = await new Promise<boolean>(resolve => {
      setBills(prev => {
        resolve(!!prev[cacheKey] && !forceRefresh);
        return prev;
      });
    });

    if (alreadyCached) {
      return;
    }

    // Show mock data immediately for instant feedback (only for page 1)
    if (pageNum === 1) {
      setBills(prev => {
        if (!prev[cacheKey]) {
          return { ...prev, [cacheKey]: getMockBills(chamberVal, statusVal) };
        }
        return prev;
      });
    }

    setLoading(prev => ({ ...prev, [cacheKey]: true }));

    try {
      const url = buildUrl(chamberVal, statusVal, pageNum);
      // Use a CORS proxy for client-side fetching
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const htmlText = await response.text();
      const parsedBills = parseHTMLPage(htmlText);

      if (parsedBills.length > 0) {
        setBills(prev => ({ ...prev, [cacheKey]: parsedBills }));
        setEndOfResults(prev => ({ ...prev, [cacheKey]: parsedBills.length < BILLS_PER_PAGE }));
      } else {
        // No results for this page - mark as end of results
        setEndOfResults(prev => ({ ...prev, [cacheKey]: true }));
        // If page > 1 and no results, auto-revert to page 1
        if (pageNum > 1) {
          setPage(1);
        }
      }

      setLastUpdated(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }));
    } catch (err) {
      console.error(`Error fetching data for ${cacheKey}:`, err);
      // On error for page > 1, revert to page 1
      if (pageNum > 1) {
        setPage(1);
      }
    } finally {
      setLoading(prev => ({ ...prev, [cacheKey]: false }));
    }
  }, []);

  // Mock data fallback - context-aware based on filters (expanded to 10 bills)
  const getMockBills = (chamberVal: string, statusVal: string): LegislativeBill[] => {
    const senateBills: LegislativeBill[] = [
      { id: 's1', billNumber: 'S04448', title: 'Authorizes the county of Clinton to employ retired former members of the division of state police as special patrol officers.', status: 'Engross 50%', lastAction: 'To Senate Civil Service Committee', lastActionDate: 'Jan 16, 2026', link: 'https://legiscan.com/NY/bill/S04448' },
      { id: 's2', billNumber: 'S02505', title: 'Establishes a task force to conduct a comprehensive study on the presence of educator diversity in the state.', status: 'Engross 50%', lastAction: 'To Senate Education Committee', lastActionDate: 'Jan 16, 2026', link: 'https://legiscan.com/NY/bill/S02505' },
      { id: 's3', billNumber: 'S00620', title: 'Relates to the practice of professional geology.', status: 'Engross 50%', lastAction: 'To Senate Higher Education Committee', lastActionDate: 'Jan 15, 2026', link: 'https://legiscan.com/NY/bill/S00620' },
      { id: 's4', billNumber: 'S05553', title: 'Enacts the "rate hike notice act" which requires utilities to provide notice of a proposed rate hike.', status: 'Engross 50%', lastAction: 'To Senate Energy Committee', lastActionDate: 'Jan 15, 2026', link: 'https://legiscan.com/NY/bill/S05553' },
      { id: 's5', billNumber: 'S08762', title: 'Allows the removal of criminal actions to a mental health court in an adjoining county.', status: 'Intro 25%', lastAction: 'To Senate Codes Committee', lastActionDate: 'Jan 14, 2026', link: 'https://legiscan.com/NY/bill/S08762' },
      { id: 's6', billNumber: 'S08824', title: 'Clarifies standards for glass repair and calibration of advanced driver assistance systems.', status: 'Intro 25%', lastAction: 'To Senate Transportation Committee', lastActionDate: 'Jan 14, 2026', link: 'https://legiscan.com/NY/bill/S08824' },
      { id: 's7', billNumber: 'S09123', title: 'Relates to the use of automated lending decision-making tools by banks.', status: 'Intro 25%', lastAction: 'To Senate Banks Committee', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/S09123' },
      { id: 's8', billNumber: 'S07891', title: 'Establishes the New York state climate adaptation fund.', status: 'Intro 25%', lastAction: 'To Senate Environmental Conservation Committee', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/S07891' },
      { id: 's9', billNumber: 'S06543', title: 'Relates to expanding access to affordable housing programs in urban areas.', status: 'Intro 25%', lastAction: 'To Senate Housing Committee', lastActionDate: 'Jan 12, 2026', link: 'https://legiscan.com/NY/bill/S06543' },
      { id: 's10', billNumber: 'S05432', title: 'Amends the education law to require financial literacy instruction in high schools.', status: 'Intro 25%', lastAction: 'To Senate Education Committee', lastActionDate: 'Jan 12, 2026', link: 'https://legiscan.com/NY/bill/S05432' },
    ];

    const assemblyBills: LegislativeBill[] = [
      { id: 'a1', billNumber: 'A08022', title: 'Requires an operator of a covered platform with at least one million users to provide a process for law enforcement agencies.', status: 'Intro 25%', lastAction: 'To Assembly Codes Committee', lastActionDate: 'Jan 16, 2026', link: 'https://legiscan.com/NY/bill/A08022' },
      { id: 'a2', billNumber: 'A09316', title: 'Limits the circumstances under which the case of an adolescent offender may be removed to family court.', status: 'Intro 25%', lastAction: 'To Assembly Codes Committee', lastActionDate: 'Jan 15, 2026', link: 'https://legiscan.com/NY/bill/A09316' },
      { id: 'a3', billNumber: 'A08235', title: 'Designates dog control officers of the village of Holley as peace officers.', status: 'Engross 50%', lastAction: 'To Assembly Codes Committee', lastActionDate: 'Jan 15, 2026', link: 'https://legiscan.com/NY/bill/A08235' },
      { id: 'a4', billNumber: 'A07654', title: 'Relates to the regulation of short-term rental properties in residential zones.', status: 'Intro 25%', lastAction: 'To Assembly Housing Committee', lastActionDate: 'Jan 14, 2026', link: 'https://legiscan.com/NY/bill/A07654' },
      { id: 'a5', billNumber: 'A06543', title: 'Establishes guidelines for the use of artificial intelligence in state agencies.', status: 'Intro 25%', lastAction: 'To Assembly Governmental Operations Committee', lastActionDate: 'Jan 14, 2026', link: 'https://legiscan.com/NY/bill/A06543' },
      { id: 'a6', billNumber: 'A05432', title: 'Provides for the establishment of a statewide broadband infrastructure program.', status: 'Intro 25%', lastAction: 'To Assembly Energy Committee', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/A05432' },
      { id: 'a7', billNumber: 'A04321', title: 'Amends the vehicle and traffic law relating to electric vehicle charging stations.', status: 'Intro 25%', lastAction: 'To Assembly Transportation Committee', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/A04321' },
      { id: 'a8', billNumber: 'A03210', title: 'Relates to the establishment of community solar programs for low-income residents.', status: 'Intro 25%', lastAction: 'To Assembly Energy Committee', lastActionDate: 'Jan 12, 2026', link: 'https://legiscan.com/NY/bill/A03210' },
      { id: 'a9', billNumber: 'A02109', title: 'Provides for enhanced penalties for wage theft violations by employers.', status: 'Intro 25%', lastAction: 'To Assembly Labor Committee', lastActionDate: 'Jan 12, 2026', link: 'https://legiscan.com/NY/bill/A02109' },
      { id: 'a10', billNumber: 'A01098', title: 'Establishes a task force to study the impact of remote work on commercial real estate.', status: 'Intro 25%', lastAction: 'To Assembly Economic Development Committee', lastActionDate: 'Jan 11, 2026', link: 'https://legiscan.com/NY/bill/A01098' },
    ];

    const passedBills: LegislativeBill[] = [
      { id: 'p1', billNumber: 'J01343', title: 'Memorializing Governor Kathy Hochul to proclaim May 10-16, 2026, as Police Week in the State of New York.', status: 'Pass', lastAction: 'ADOPTED', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/J01343' },
      { id: 'p2', billNumber: 'J01289', title: 'Commending Johnathan Rudat upon the occasion of his designation as recipient of a Liberty Medal.', status: 'Pass', lastAction: 'ADOPTED', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/J01289' },
      { id: 'p3', billNumber: 'J01291', title: 'Commending Danielle Johnson upon the occasion of her designation as recipient of a Liberty Medal.', status: 'Pass', lastAction: 'ADOPTED', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/J01291' },
      { id: 'p4', billNumber: 'J01304', title: 'Congratulating Ava Walia upon the occasion of being crowned the 2025 National All-American Miss Preteen.', status: 'Pass', lastAction: 'ADOPTED', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/J01304' },
      { id: 'p5', billNumber: 'J01292', title: 'Commending Brandon Orlikowski upon the occasion of his designation as recipient of a Liberty Medal.', status: 'Pass', lastAction: 'ADOPTED', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/J01292' },
      { id: 'p6', billNumber: 'J01337', title: 'Memorializing Governor Kathy Hochul to proclaim February 14, 2026, as Snowmobile Ride Day.', status: 'Pass', lastAction: 'ADOPTED', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/J01337' },
      { id: 'p7', billNumber: 'J01316', title: 'Congratulating the Burnt Hills-Ballston Lake Field Hockey Team upon capturing the 2025 Class B Championship.', status: 'Pass', lastAction: 'ADOPTED', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/J01316' },
      { id: 'p8', billNumber: 'J01261', title: 'Commending Salvatore J. Costanze posthumously upon his designation as recipient of a Liberty Medal.', status: 'Pass', lastAction: 'ADOPTED', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/J01261' },
      { id: 'p9', billNumber: 'J01245', title: 'Honoring the New York State Volunteer Firefighters Association on its 150th anniversary.', status: 'Pass', lastAction: 'ADOPTED', lastActionDate: 'Jan 12, 2026', link: 'https://legiscan.com/NY/bill/J01245' },
      { id: 'p10', billNumber: 'J01198', title: 'Commending the City of Buffalo upon the occasion of its bicentennial celebration.', status: 'Pass', lastAction: 'ADOPTED', lastActionDate: 'Jan 12, 2026', link: 'https://legiscan.com/NY/bill/J01198' },
    ];

    const enrolledBills: LegislativeBill[] = [
      { id: 'e1', billNumber: 'S07234', title: 'Establishes the New York state climate adaptation fund to provide financial assistance for climate resilience projects.', status: 'Enrolled', lastAction: 'Sent to Governor', lastActionDate: 'Jan 10, 2026', link: 'https://legiscan.com/NY/bill/S07234' },
      { id: 'e2', billNumber: 'A05123', title: 'Relates to expanding access to affordable housing programs in urban areas.', status: 'Enrolled', lastAction: 'Sent to Governor', lastActionDate: 'Jan 9, 2026', link: 'https://legiscan.com/NY/bill/A05123' },
    ];

    const engrossedBills: LegislativeBill[] = [
      { id: 'eg1', billNumber: 'S04448', title: 'Authorizes the county of Clinton to employ retired former members of the division of state police.', status: 'Engross 50%', lastAction: 'To Senate Civil Service Committee', lastActionDate: 'Jan 16, 2026', link: 'https://legiscan.com/NY/bill/S04448' },
      { id: 'eg2', billNumber: 'S02505', title: 'Establishes a task force to conduct a comprehensive study on educator diversity.', status: 'Engross 50%', lastAction: 'To Senate Education Committee', lastActionDate: 'Jan 16, 2026', link: 'https://legiscan.com/NY/bill/S02505' },
      { id: 'eg3', billNumber: 'S00620', title: 'Relates to the practice of professional geology.', status: 'Engross 50%', lastAction: 'To Senate Higher Education Committee', lastActionDate: 'Jan 15, 2026', link: 'https://legiscan.com/NY/bill/S00620' },
      { id: 'eg4', billNumber: 'S05553', title: 'Enacts the "rate hike notice act" for utilities.', status: 'Engross 50%', lastAction: 'To Senate Energy Committee', lastActionDate: 'Jan 15, 2026', link: 'https://legiscan.com/NY/bill/S05553' },
      { id: 'eg5', billNumber: 'A08235', title: 'Designates dog control officers of the village of Holley as peace officers.', status: 'Engross 50%', lastAction: 'To Assembly Codes Committee', lastActionDate: 'Jan 15, 2026', link: 'https://legiscan.com/NY/bill/A08235' },
    ];

    const introducedBills: LegislativeBill[] = [
      { id: 'i1', billNumber: 'A08022', title: 'Requires an operator of a covered platform with at least one million users to provide a process for law enforcement.', status: 'Intro 25%', lastAction: 'To Assembly Codes Committee', lastActionDate: 'Jan 16, 2026', link: 'https://legiscan.com/NY/bill/A08022' },
      { id: 'i2', billNumber: 'A09316', title: 'Limits the circumstances under which an adolescent offender may be removed to family court.', status: 'Intro 25%', lastAction: 'To Assembly Codes Committee', lastActionDate: 'Jan 15, 2026', link: 'https://legiscan.com/NY/bill/A09316' },
      { id: 'i3', billNumber: 'S08762', title: 'Allows the removal of criminal actions to a mental health court in an adjoining county.', status: 'Intro 25%', lastAction: 'To Senate Codes Committee', lastActionDate: 'Jan 14, 2026', link: 'https://legiscan.com/NY/bill/S08762' },
      { id: 'i4', billNumber: 'S08824', title: 'Clarifies standards for glass repair and calibration of advanced driver assistance systems.', status: 'Intro 25%', lastAction: 'To Senate Transportation Committee', lastActionDate: 'Jan 14, 2026', link: 'https://legiscan.com/NY/bill/S08824' },
      { id: 'i5', billNumber: 'A07654', title: 'Relates to the regulation of short-term rental properties in residential zones.', status: 'Intro 25%', lastAction: 'To Assembly Housing Committee', lastActionDate: 'Jan 14, 2026', link: 'https://legiscan.com/NY/bill/A07654' },
      { id: 'i6', billNumber: 'S09123', title: 'Relates to the use of automated lending decision-making tools by banks.', status: 'Intro 25%', lastAction: 'To Senate Banks Committee', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/S09123' },
      { id: 'i7', billNumber: 'A06543', title: 'Establishes guidelines for the use of artificial intelligence in state agencies.', status: 'Intro 25%', lastAction: 'To Assembly Governmental Operations Committee', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/A06543' },
      { id: 'i8', billNumber: 'S07891', title: 'Establishes the New York state climate adaptation fund.', status: 'Intro 25%', lastAction: 'To Senate Environmental Conservation Committee', lastActionDate: 'Jan 13, 2026', link: 'https://legiscan.com/NY/bill/S07891' },
      { id: 'i9', billNumber: 'A05432', title: 'Provides for the establishment of a statewide broadband infrastructure program.', status: 'Intro 25%', lastAction: 'To Assembly Energy Committee', lastActionDate: 'Jan 12, 2026', link: 'https://legiscan.com/NY/bill/A05432' },
      { id: 'i10', billNumber: 'A04321', title: 'Amends the vehicle and traffic law relating to electric vehicle charging stations.', status: 'Intro 25%', lastAction: 'To Assembly Transportation Committee', lastActionDate: 'Jan 12, 2026', link: 'https://legiscan.com/NY/bill/A04321' },
    ];

    // Filter based on status first
    if (statusVal === 'passed') return passedBills;
    if (statusVal === 'enrolled') return enrolledBills;
    if (statusVal === 'engrossed') return engrossedBills;
    if (statusVal === 'introduced') return introducedBills;

    // Filter based on chamber
    if (chamberVal === 'senate') return senateBills;
    if (chamberVal === 'house') return assemblyBills;

    // Both chambers, any status - interleave
    const combined: LegislativeBill[] = [];
    for (let i = 0; i < Math.max(senateBills.length, assemblyBills.length); i++) {
      if (senateBills[i]) combined.push(senateBills[i]);
      if (assemblyBills[i]) combined.push(assemblyBills[i]);
    }
    return combined.slice(0, 10);
  };

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
    fetchData(chamber, status, page, true);
  };

  // Fetch data when filters or page change
  useEffect(() => {
    fetchData(chamber, status, page);
  }, [chamber, status, page, fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData('both', 'any', 1);
  }, []);

  const cacheKey = getCacheKey(chamber, status, page);
  const currentBills = bills[cacheKey] || [];
  const isLoading = loading[cacheKey];
  const isEndOfResults = endOfResults[cacheKey];

  // Check if there might be more pages (full page and not marked as end)
  const hasMorePages = currentBills.length === BILLS_PER_PAGE && !isEndOfResults;

  return (
    <section className="bg-background w-full py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
        <div className="mb-8 flex flex-col items-center justify-center space-y-4 text-center">
          <Badge className="px-3.5 py-1.5 bg-foreground text-background hover:bg-foreground/90">Live Feed</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            NYS Legislative Activity
          </h2>
          <p className="text-muted-foreground max-w-[700px] md:text-lg">
            Real-time bills from the New York State Senate and Assembly.
          </p>
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

        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-muted-foreground order-2 text-sm sm:order-1">
            <span className="font-medium">Last updated:</span> {lastUpdated || 'Loading...'}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="group order-1 sm:order-2"
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
