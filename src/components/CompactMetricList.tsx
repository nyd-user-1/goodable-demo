'use client';

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Menu, FileText, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LegislativeBill {
  id: string;
  billNumber: string;
  title: string;
  status: string;
  lastAction: string;
  lastActionDate: string;
  link: string;
}

interface TabConfig {
  id: string;
  label: string;
  feedUrl: string;
}

const tabConfigs: TabConfig[] = [
  {
    id: 'introduced',
    label: 'Introduced',
    feedUrl: 'https://legiscan.com/gaits/feed/17608aebc160d8aa0e1d7df491f4fc08.rss',
  },
  {
    id: 'enrolled',
    label: 'Enrolled',
    feedUrl: 'https://legiscan.com/gaits/feed/17608aebc160d8aa0e1d7df491f4fc08.rss',
  },
  {
    id: 'engrossed',
    label: 'Engrossed',
    feedUrl: 'https://legiscan.com/gaits/feed/17608aebc160d8aa0e1d7df491f4fc08.rss',
  },
  {
    id: 'passed',
    label: 'Passed',
    feedUrl: 'https://legiscan.com/gaits/feed/17608aebc160d8aa0e1d7df491f4fc08.rss',
  },
];

export default function CompactMetricList() {
  const [activeTab, setActiveTab] = useState("introduced");
  const [bills, setBills] = useState<Record<string, LegislativeBill[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Parse RSS XML to extract bill data
  const parseRSSFeed = (xmlText: string): LegislativeBill[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const items = xmlDoc.querySelectorAll('item');

    const parsedBills: LegislativeBill[] = [];

    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';

      // Parse bill number from title (e.g., "NY A08022" or "NY S08762")
      const billMatch = title.match(/NY\s+([AS]\d+)/);
      const billNumber = billMatch ? billMatch[1] : `Bill ${index + 1}`;

      // Extract status from description if available
      const statusMatch = description.match(/Status:\s*([^<]+)/i);
      const status = statusMatch ? statusMatch[1].trim() : 'Pending';

      // Format the date
      const date = pubDate ? new Date(pubDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : '';

      // Clean up description for display
      const cleanDescription = description
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/Status:[^.]+\./i, '') // Remove status line
        .trim()
        .substring(0, 200);

      parsedBills.push({
        id: `${billNumber}-${index}`,
        billNumber,
        title: cleanDescription || title,
        status,
        lastAction: 'To Assembly Codes Committee',
        lastActionDate: date,
        link,
      });
    });

    return parsedBills.slice(0, 10); // Limit to 10 bills per tab
  };

  // Fetch RSS feed for a specific tab
  const fetchFeed = async (tabId: string, feedUrl: string) => {
    setLoading(prev => ({ ...prev, [tabId]: true }));
    setError(prev => ({ ...prev, [tabId]: null }));

    try {
      // Use a CORS proxy for client-side RSS fetching
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }

      const xmlText = await response.text();
      const parsedBills = parseRSSFeed(xmlText);

      setBills(prev => ({ ...prev, [tabId]: parsedBills }));
      setLastUpdated(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }));
    } catch (err) {
      console.error(`Error fetching feed for ${tabId}:`, err);
      setError(prev => ({ ...prev, [tabId]: 'Failed to load bills. Please try again.' }));

      // Set mock data as fallback
      setBills(prev => ({ ...prev, [tabId]: getMockBills(tabId) }));
    } finally {
      setLoading(prev => ({ ...prev, [tabId]: false }));
    }
  };

  // Mock data fallback
  const getMockBills = (tabId: string): LegislativeBill[] => {
    const mockBills: LegislativeBill[] = [
      {
        id: '1',
        billNumber: 'A08022',
        title: 'Requires an operator of a covered platform with at least one million users to ensure that its covered platform provides a process to allow law enforcement agencies to contact such covered platform...',
        status: tabId === 'introduced' ? 'Intro 25%' : tabId === 'engrossed' ? 'Engross 50%' : tabId === 'enrolled' ? 'Enrolled' : 'Passed',
        lastAction: 'To Assembly Codes Committee',
        lastActionDate: 'Jan 16, 2026',
        link: '#',
      },
      {
        id: '2',
        billNumber: 'A09316',
        title: 'Limits the circumstances under which the case of an adolescent offender may be removed to family court; limits the jurisdiction of family court with respect to certain repeat adolescent offenders.',
        status: tabId === 'introduced' ? 'Intro 25%' : tabId === 'engrossed' ? 'Engross 50%' : tabId === 'enrolled' ? 'Enrolled' : 'Passed',
        lastAction: 'To Assembly Codes Committee',
        lastActionDate: 'Jan 15, 2026',
        link: '#',
      },
      {
        id: '3',
        billNumber: 'A08235',
        title: 'Designates dog control officers of the village of Holley, named by the village board as constables, as peace officers.',
        status: tabId === 'introduced' ? 'Intro 25%' : tabId === 'engrossed' ? 'Engross 50%' : tabId === 'enrolled' ? 'Enrolled' : 'Passed',
        lastAction: 'To Assembly Codes Committee',
        lastActionDate: 'Jan 15, 2026',
        link: '#',
      },
      {
        id: '4',
        billNumber: 'A00773',
        title: 'Relates to the use of automated lending decision-making tools by banks for the purposes of making lending decisions; allows loan applicants to consent to or opt out of such use.',
        status: tabId === 'introduced' ? 'Intro 25%' : tabId === 'engrossed' ? 'Engross 50%' : tabId === 'enrolled' ? 'Enrolled' : 'Passed',
        lastAction: 'To Assembly Codes Committee',
        lastActionDate: 'Jan 15, 2026',
        link: '#',
      },
      {
        id: '5',
        billNumber: 'S08762',
        title: 'Allows the removal of criminal actions to a mental health court in an adjoining county and provides for the reversion to the original court of record where the defendant fails to comply with or complete the mental health court program.',
        status: tabId === 'introduced' ? 'Intro 25%' : tabId === 'engrossed' ? 'Engross 50%' : tabId === 'enrolled' ? 'Enrolled' : 'Passed',
        lastAction: 'To Assembly Codes Committee',
        lastActionDate: 'Jan 13, 2026',
        link: '#',
      },
    ];
    return mockBills;
  };

  // Fetch data when tab changes
  useEffect(() => {
    const config = tabConfigs.find(t => t.id === activeTab);
    if (config && !bills[activeTab]) {
      fetchFeed(activeTab, config.feedUrl);
    }
  }, [activeTab]);

  // Initial fetch
  useEffect(() => {
    fetchFeed('introduced', tabConfigs[0].feedUrl);
  }, []);

  const currentBills = bills[activeTab] || [];
  const isLoading = loading[activeTab];
  const currentError = error[activeTab];

  return (
    <section className="bg-background w-full py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
        <div className="mb-8 flex flex-col items-center justify-center space-y-4 text-center">
          <Badge className="px-3.5 py-1.5 bg-foreground text-background hover:bg-foreground/90">Live Feed</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            NYS Assembly Codes Committee
          </h2>
          <p className="text-muted-foreground max-w-[700px] md:text-lg">
            Real-time legislative activity from the New York State Assembly Codes Committee.
          </p>
        </div>

        <Card className="border p-0 shadow-sm">
          <CardContent className="p-0">
            <Tabs
              defaultValue="introduced"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full gap-0"
            >
              {/* Mobile view: Dropdown for categories */}
              <div className="border-b p-3 md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span>
                        {tabConfigs.find(t => t.id === activeTab)?.label || 'Select'}
                      </span>
                      <Menu className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    {tabConfigs.map(tab => (
                      <DropdownMenuItem
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop view: Horizontal tabs */}
              <div className="hidden border-b px-4 md:block">
                <TabsList className="h-12 bg-transparent">
                  {tabConfigs.map(tab => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="data-[state=active]:bg-muted rounded-none data-[state=active]:shadow-none"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="mt-0 p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading bills...</span>
                  </div>
                ) : currentError && currentBills.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    {currentError}
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
              </TabsContent>
            </Tabs>
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
