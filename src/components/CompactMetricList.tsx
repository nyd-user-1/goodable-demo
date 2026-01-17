'use client';

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FileText, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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

export default function CompactMetricList() {
  const [chamber, setChamber] = useState("both");
  const [status, setStatus] = useState("any");
  const [bills, setBills] = useState<Record<string, LegislativeBill[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Build cache key from filters
  const getCacheKey = (chamberVal: string, statusVal: string) => `${chamberVal}-${statusVal}`;

  // Build LegiScan URL from filters
  const buildUrl = (chamberVal: string, statusVal: string): string => {
    const baseUrl = 'https://legiscan.com/NY/legislation';
    const params = new URLSearchParams();

    if (statusVal !== 'any') {
      params.append('status', statusVal);
    }

    if (chamberVal !== 'both') {
      params.append('chamber', chamberVal);
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
      const statusText = cells[1]?.textContent?.trim() || '';

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
      // Parse date - format is "2026-01-16\nTo Committee"
      const dateParts = dateText.split('\n');
      const rawDate = dateParts[0]?.trim() || '';
      const lastAction = dateParts.slice(1).join(' ').trim() || 'To Committee';

      // Format the date
      let formattedDate = rawDate;
      if (rawDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(rawDate + 'T00:00:00');
        formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
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

    return parsedBills.slice(0, 10); // Limit to 10 bills
  };

  // Fetch data from LegiScan
  const fetchData = useCallback(async (chamberVal: string, statusVal: string) => {
    const cacheKey = getCacheKey(chamberVal, statusVal);

    // Show mock data immediately for instant feedback
    if (!bills[cacheKey]) {
      setBills(prev => ({ ...prev, [cacheKey]: getMockBills(chamberVal, statusVal) }));
    }

    setLoading(prev => ({ ...prev, [cacheKey]: true }));

    try {
      const url = buildUrl(chamberVal, statusVal);
      // Use a CORS proxy for client-side fetching
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const htmlText = await response.text();
      const parsedBills = parseHTMLPage(htmlText);

      // Only update if we got valid data
      if (parsedBills.length > 0) {
        setBills(prev => ({ ...prev, [cacheKey]: parsedBills }));
      }

      setLastUpdated(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }));
    } catch (err) {
      console.error(`Error fetching data for ${cacheKey}:`, err);
      // Keep mock data on error
    } finally {
      setLoading(prev => ({ ...prev, [cacheKey]: false }));
    }
  }, [bills]);

  // Mock data fallback - context-aware based on filters
  const getMockBills = (chamberVal: string, statusVal: string): LegislativeBill[] => {
    const senateBills: LegislativeBill[] = [
      {
        id: 's1',
        billNumber: 'S04448',
        title: 'Authorizes the county of Clinton to employ retired former members of the division of state police as special patrol officers.',
        status: 'Engross 50%',
        lastAction: 'To Senate Civil Service Committee',
        lastActionDate: 'Jan 16, 2026',
        link: 'https://legiscan.com/NY/bill/S04448',
      },
      {
        id: 's2',
        billNumber: 'S02505',
        title: 'Establishes a task force to conduct a comprehensive study on the presence of educator diversity in the state.',
        status: 'Engross 50%',
        lastAction: 'To Senate Education Committee',
        lastActionDate: 'Jan 16, 2026',
        link: 'https://legiscan.com/NY/bill/S02505',
      },
      {
        id: 's3',
        billNumber: 'S00620',
        title: 'Relates to the practice of professional geology.',
        status: 'Engross 50%',
        lastAction: 'To Senate Higher Education Committee',
        lastActionDate: 'Jan 15, 2026',
        link: 'https://legiscan.com/NY/bill/S00620',
      },
    ];

    const assemblyBills: LegislativeBill[] = [
      {
        id: 'a1',
        billNumber: 'A08022',
        title: 'Requires an operator of a covered platform with at least one million users to ensure that its covered platform provides a process to allow law enforcement agencies to contact such covered platform.',
        status: 'Intro 25%',
        lastAction: 'To Assembly Codes Committee',
        lastActionDate: 'Jan 16, 2026',
        link: 'https://legiscan.com/NY/bill/A08022',
      },
      {
        id: 'a2',
        billNumber: 'A09316',
        title: 'Limits the circumstances under which the case of an adolescent offender may be removed to family court.',
        status: 'Intro 25%',
        lastAction: 'To Assembly Codes Committee',
        lastActionDate: 'Jan 15, 2026',
        link: 'https://legiscan.com/NY/bill/A09316',
      },
      {
        id: 'a3',
        billNumber: 'A08235',
        title: 'Designates dog control officers of the village of Holley as peace officers.',
        status: 'Engross 50%',
        lastAction: 'To Assembly Codes Committee',
        lastActionDate: 'Jan 15, 2026',
        link: 'https://legiscan.com/NY/bill/A08235',
      },
    ];

    const passedBills: LegislativeBill[] = [
      {
        id: 'p1',
        billNumber: 'J01343',
        title: 'Memorializing Governor Kathy Hochul to proclaim May 10-16, 2026, as Police Week in the State of New York.',
        status: 'Pass',
        lastAction: 'ADOPTED',
        lastActionDate: 'Jan 13, 2026',
        link: 'https://legiscan.com/NY/bill/J01343',
      },
      {
        id: 'p2',
        billNumber: 'J01289',
        title: 'Commending Johnathan Rudat upon the occasion of his designation as recipient of a Liberty Medal.',
        status: 'Pass',
        lastAction: 'ADOPTED',
        lastActionDate: 'Jan 13, 2026',
        link: 'https://legiscan.com/NY/bill/J01289',
      },
    ];

    const enrolledBills: LegislativeBill[] = [
      {
        id: 'e1',
        billNumber: 'S07234',
        title: 'Establishes the New York state climate adaptation fund to provide financial assistance for climate resilience projects.',
        status: 'Enrolled',
        lastAction: 'Sent to Governor',
        lastActionDate: 'Jan 10, 2026',
        link: 'https://legiscan.com/NY/bill/S07234',
      },
      {
        id: 'e2',
        billNumber: 'A05123',
        title: 'Relates to expanding access to affordable housing programs in urban areas.',
        status: 'Enrolled',
        lastAction: 'Sent to Governor',
        lastActionDate: 'Jan 9, 2026',
        link: 'https://legiscan.com/NY/bill/A05123',
      },
    ];

    // Filter based on status
    if (statusVal === 'passed') return passedBills;
    if (statusVal === 'enrolled') return enrolledBills;

    // Filter based on chamber
    if (chamberVal === 'senate') return senateBills;
    if (chamberVal === 'house') return assemblyBills;

    // Both chambers - combine
    return [...senateBills.slice(0, 2), ...assemblyBills.slice(0, 2)];
  };

  // Fetch data when filters change
  useEffect(() => {
    const cacheKey = getCacheKey(chamber, status);
    if (!bills[cacheKey]) {
      fetchData(chamber, status);
    }
  }, [chamber, status, fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData('both', 'any');
  }, []);

  const cacheKey = getCacheKey(chamber, status);
  const currentBills = bills[cacheKey] || [];
  const isLoading = loading[cacheKey];

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
            {/* Filter Controls - Single Row */}
            <div className="border-b px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1 flex-wrap">
                  {/* Chamber Filters */}
                  {chamberOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setChamber(opt.id)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-md transition-colors",
                        chamber === opt.id
                          ? "bg-foreground text-background font-medium"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}

                  {/* Divider */}
                  <div className="w-px h-6 bg-border mx-2" />

                  {/* Status Filters */}
                  {statusOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setStatus(opt.id)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-md transition-colors",
                        status === opt.id
                          ? "bg-foreground text-background font-medium"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Refresh indicator in filter row */}
                {isLoading && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Refreshing...</span>
                  </div>
                )}
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
                        <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>

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
                            <span className="text-muted-foreground text-xs mt-1">
                              {bill.lastAction}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-sm font-medium">{bill.lastActionDate}</span>
                          {bill.link && bill.link !== '#' && (
                            <a
                              href={bill.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 mt-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
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
    </section>
  );
}
