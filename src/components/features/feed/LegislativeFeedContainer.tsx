import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Filter, Save } from 'lucide-react';
import { PolicyFeedItem } from './PolicyFeedItem';
import { supabase } from '@/integrations/supabase/client';

interface FeedItem {
  id: string;
  billNumber: string;
  title: string;
  sponsor: string;
  status: string;
  categories: string[];
  summaryPoints: string[];
  lastAction: string;
  timestamp: string;
  type: 'bill' | 'committee' | 'news' | 'analysis';
}

interface FilterOptions {
  bills: string[];
  watchlists: string[];
  documents: string[];
  tags: string[];
}

interface LegislativeFeedContainerProps {
  searchQuery: string;
}

export const LegislativeFeedContainer: React.FC<LegislativeFeedContainerProps> = ({
  searchQuery
}) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    bills: [],
    watchlists: [],
    documents: [],
    tags: []
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Sample categories for legislative content
  const sampleCategories = [
    'Healthcare', 'Education', 'Budget', 'Environment', 'Transportation',
    'Criminal Justice', 'Economic Development', 'Social Services', 'Technology'
  ];

  // Fetch feed data
  useEffect(() => {
    const fetchFeedData = async () => {
      setLoading(true);
      try {
        // Fetch recent bills
        const { data: billsData, error: billsError } = await supabase
          .from('Bills')
          .select('*')
          .order('last_action_date', { ascending: false })
          .limit(20);

        if (billsError) throw billsError;

        // Transform bills data into feed items
        const billFeedItems: FeedItem[] = (billsData || []).map((bill, index) => {
          const randomCategories = sampleCategories
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 1);

          const summaryPoints = [
            `${bill.title} introduces significant changes to current policy frameworks.`,
            `The bill addresses key concerns raised by stakeholders and community groups.`,
            `Implementation timeline extends through ${new Date().getFullYear() + 1} with phased rollout.`,
            `Expected to impact approximately ${Math.floor(Math.random() * 500) + 100}K residents statewide.`
          ].slice(0, Math.floor(Math.random() * 3) + 2);

          const timeAgo = Math.floor(Math.random() * 180) + 15; // 15-195 minutes ago
          const timestamp = timeAgo < 60 
            ? `${timeAgo} minutes ago`
            : `${Math.floor(timeAgo / 60)} hours ago`;

          return {
            id: `bill-${bill.bill_id}`,
            billNumber: bill.bill_number || `A.${1000 + index}`,
            title: bill.title,
            sponsor: bill.sponsor || 'Committee',
            status: bill.status_desc || 'In Committee',
            categories: randomCategories,
            summaryPoints: summaryPoints,
            lastAction: bill.last_action || 'Referred to committee',
            timestamp: timestamp,
            type: 'bill' as const
          };
        });

        // Add some sample committee and analysis items
        const sampleItems: FeedItem[] = [
          {
            id: 'committee-1',
            billNumber: 'S.2847',
            title: 'Senate Health Committee Reviews Mental Health Funding Initiative',
            sponsor: 'Sen. Health Committee',
            status: 'Committee Review',
            categories: ['Healthcare', 'Budget'],
            summaryPoints: [
              'Committee members expressed strong support for increased mental health funding allocation.',
              'Proposed $50M investment would expand community mental health services statewide.',
              'Public hearing scheduled for next week to gather stakeholder input.'
            ],
            lastAction: 'Committee hearing held',
            timestamp: '2 hours ago',
            type: 'committee'
          },
          {
            id: 'analysis-1',
            billNumber: 'A.3456',
            title: 'Policy Analysis: Climate Change Adaptation Strategies Show Promise',
            sponsor: 'Legislative Research Office',
            status: 'Analysis Complete',
            categories: ['Environment', 'Economic Development'],
            summaryPoints: [
              'Independent analysis shows proposed climate adaptation measures could reduce flood damage by 40%.',
              'Economic impact study reveals potential for 2,000 new green jobs over five-year period.',
              'Cross-state collaboration opportunities identified with Connecticut and New Jersey.'
            ],
            lastAction: 'Analysis published',
            timestamp: '4 hours ago',
            type: 'analysis'
          }
        ];

        setFeedItems([...sampleItems, ...billFeedItems.slice(0, 15)]);
      } catch (error) {
        console.error('Error fetching feed data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, [searchQuery]);

  const filterOptions = [
    { id: 'bills', label: 'Bills', count: feedItems.filter(item => item.type === 'bill').length },
    { id: 'watchlists', label: 'Watchlists', count: 3 },
    { id: 'documents', label: 'Documents', count: 12 },
    { id: 'tags', label: 'Tags', count: sampleCategories.length }
  ];

  const handleFilterClick = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleSaveFilters = () => {
    console.log('Saving current filters:', activeFilters);
    // TODO: Implement filter saving
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-muted animate-pulse rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-4 p-6 border rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-6 w-full bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-3 p-4 bg-card border rounded-xl">
        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.map((option) => (
            <Button
              key={option.id}
              variant={activeFilters.includes(option.id) ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterClick(option.id)}
              className="h-8 text-sm"
            >
              {option.label}
              <ChevronDown className="w-3 h-3 ml-1" />
              {option.count > 0 && (
                <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                  {option.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        
        <div className="ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSaveFilters}
            className="text-primary hover:text-primary/80"
          >
            <Save className="w-4 h-4 mr-2" />
            Save filters
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filterId) => {
            const option = filterOptions.find(opt => opt.id === filterId);
            return (
              <Badge 
                key={filterId} 
                variant="secondary" 
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleFilterClick(filterId)}
              >
                {option?.label} ×
              </Badge>
            );
          })}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveFilters([])}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Feed Items */}
      <div className="space-y-4">
        {feedItems.length > 0 ? (
          feedItems.map((item) => (
            <PolicyFeedItem key={item.id} item={item} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to see more results.
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {feedItems.length > 0 && (
        <div className="flex justify-center pt-6">
          <Button variant="outline" size="lg">
            Load more items
          </Button>
        </div>
      )}
    </div>
  );
};