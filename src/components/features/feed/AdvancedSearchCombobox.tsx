import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, Upload, Brain, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentUploadModal } from './DocumentUploadModal';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'bill' | 'member' | 'committee' | 'policy';
  metadata?: {
    billNumber?: string;
    sponsor?: string;
    status?: string;
  };
}

interface SourceOption {
  id: string;
  label: string;
  enabled: boolean;
  count?: number;
}

interface AdvancedSearchComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
}

export const AdvancedSearchCombobox: React.FC<AdvancedSearchComboboxProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything about legislation, policies, or lawmakers...",
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bills' | 'tickets' | 'sources'>('sources');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [sources, setSources] = useState<SourceOption[]>([
    { id: 'nys-bills', label: 'NYS Bills & Resolutions', enabled: true, count: 4 },
    { id: 'federal-legislation', label: 'Federal Legislation', enabled: true },
    { id: 'committee-reports', label: 'Committee Reports & Transcripts', enabled: true },
    { id: 'legislative-news', label: 'Legislative News & Updates', enabled: true }
  ]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const comboboxId = useRef(`search-combobox-${Math.random().toString(36).substr(2, 9)}`);
  const listboxId = useRef(`search-listbox-${Math.random().toString(36).substr(2, 9)}`);

  const hasContent = value.trim().length > 0;
  const enabledSourcesCount = sources.filter(s => s.enabled).length;

  // Fetch search suggestions based on active tab
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      // Show trending/recent items when no query
      await fetchTrendingSuggestions();
      return;
    }

    setLoading(true);
    try {
      let data = [];
      
      switch (activeTab) {
        case 'bills':
          const { data: billsData } = await supabase
            .from('Bills')
            .select('bill_id, bill_number, title, sponsor')
            .ilike('title', `%${query}%`)
            .limit(10);
          
          data = (billsData || []).map((bill, index) => ({
            id: `bill-${bill.bill_id}`,
            text: bill.title,
            type: 'bill' as const,
            metadata: {
              billNumber: bill.bill_number,
              sponsor: bill.sponsor
            }
          }));
          break;
          
        case 'tickets':
          // Mock ticket suggestions for now
          data = [
            { id: 'ticket-1', text: 'Healthcare reform implementation timeline', type: 'policy' },
            { id: 'ticket-2', text: 'Education funding allocation analysis', type: 'policy' },
            { id: 'ticket-3', text: 'Infrastructure spending priorities', type: 'policy' }
          ].filter(item => item.text.toLowerCase().includes(query.toLowerCase()));
          break;
          
        case 'sources':
          // Multi-source search across enabled sources
          const promises = [];
          
          if (sources.find(s => s.id === 'nys-bills')?.enabled) {
            promises.push(
              supabase
                .from('Bills')
                .select('bill_id, bill_number, title, sponsor')
                .or(`title.ilike.%${query}%, bill_number.ilike.%${query}%`)
                .limit(5)
            );
          }
          
          if (sources.find(s => s.id === 'committee-reports')?.enabled) {
            promises.push(
              supabase
                .from('Committees')
                .select('committee_id, name, description')
                .ilike('name', `%${query}%`)
                .limit(3)
            );
          }
          
          const results = await Promise.all(promises);
          
          data = [
            ...(results[0]?.data || []).map((bill: any) => ({
              id: `bill-${bill.bill_id}`,
              text: bill.title,
              type: 'bill' as const,
              metadata: { billNumber: bill.bill_number, sponsor: bill.sponsor }
            })),
            ...(results[1]?.data || []).map((committee: any) => ({
              id: `committee-${committee.committee_id}`,
              text: committee.name,
              type: 'committee' as const,
              metadata: { description: committee.description }
            }))
          ];
          break;
      }
      
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, sources]);

  const fetchTrendingSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      // Get recent bills and popular searches
      const { data: recentBills } = await supabase
        .from('Bills')
        .select('bill_id, bill_number, title, sponsor')
        .order('last_action_date', { ascending: false })
        .limit(8);
      
      const trendingQueries = [
        'Healthcare reform impact analysis',
        'Education funding allocation review',
        'Infrastructure spending priorities',
        'Climate change legislation status',
        'Criminal justice reform updates'
      ];
      
      const suggestions = [
        ...(recentBills || []).map((bill, index) => ({
          id: `recent-bill-${bill.bill_id}`,
          text: bill.title,
          type: 'bill' as const,
          metadata: {
            billNumber: bill.bill_number,
            sponsor: bill.sponsor
          }
        })),
        ...trendingQueries.map((query, index) => ({
          id: `trending-${index}`,
          text: query,
          type: 'policy' as const
        }))
      ];
      
      setSuggestions(suggestions.slice(0, 12));
    } catch (error) {
      console.error('Error fetching trending suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [value, isOpen, fetchSuggestions]);

  const handleInputFocus = () => {
    setIsOpen(true);
    setSelectedIndex(-1);
    if (suggestions.length === 0) {
      fetchTrendingSuggestions();
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as Node;
    if (listboxRef.current?.contains(relatedTarget)) {
      return;
    }
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
      setSourcesOpen(false);
    }, 150);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const newValue = suggestion.metadata?.billNumber 
      ? `${suggestion.metadata.billNumber}: ${suggestion.text}`
      : suggestion.text;
    onChange(newValue);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSourceToggle = (sourceId: string) => {
    setSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, enabled: !source.enabled }
        : source
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        setSourcesOpen(false);
        inputRef.current?.focus();
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < suggestions.length - 1 ? prev + 1 : 0;
          setTimeout(() => {
            const selectedElement = document.getElementById(`${listboxId.current}-option-${newIndex}`);
            selectedElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 0);
          return newIndex;
        });
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : suggestions.length - 1;
          setTimeout(() => {
            const selectedElement = document.getElementById(`${listboxId.current}-option-${newIndex}`);
            selectedElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 0);
          return newIndex;
        });
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (hasContent) {
          onSubmit();
        }
        break;
      
      case 'Tab':
        setIsOpen(false);
        setSelectedIndex(-1);
        setSourcesOpen(false);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasContent) {
      // Close any open dropdowns
      setIsOpen(false);
      setSourcesOpen(false);
      setSelectedIndex(-1);
      onSubmit();
    }
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`} style={{ zIndex: 1000 }}>
      <div className="advanced-search-wrapper relative">
        <form onSubmit={handleSubmit}>
          {/* Main search container - Fintool replica */}
          <div 
            className={`relative bg-card border transition-all duration-300 shadow-lg ${
              isOpen 
                ? 'rounded-t-2xl border-b-0 border-primary/50' 
                : 'rounded-2xl border-border'
            } focus-within:border-primary/50`}
          >
            {/* Search input section */}
            <div className="p-6">
              <div className="relative">
                <Input
                  ref={inputRef}
                  id={comboboxId.current}
                  type="text"
                  value={value}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="h-14 pr-24 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground text-foreground text-lg font-medium"
                  role="combobox"
                  aria-expanded={isOpen}
                  aria-autocomplete="list"
                  aria-controls={isOpen ? listboxId.current : undefined}
                  aria-activedescendant={
                    selectedIndex >= 0 ? `${listboxId.current}-option-${selectedIndex}` : undefined
                  }
                />
                
                {/* Action buttons */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadModalOpen(true)}
                    className="h-8 px-3 text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                  
                  {hasContent && (
                    <Button
                      type="submit"
                      className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Think
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs section */}
            <div className="px-6 pb-4">
              <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50">
                  <TabsTrigger value="bills" className="flex items-center gap-2">
                    📄 Bills
                  </TabsTrigger>
                  <TabsTrigger value="tickets" className="flex items-center gap-2">
                    + Tickets
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sources" 
                    className="flex items-center gap-2 relative"
                    onClick={() => setSourcesOpen(!sourcesOpen)}
                  >
                    📊 Sources
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {enabledSourcesCount}
                    </Badge>
                    <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${sourcesOpen ? 'rotate-180' : ''}`} />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </form>

        {/* Sources dropdown */}
        {sourcesOpen && activeTab === 'sources' && (
          <div className="absolute left-0 right-0 top-full bg-card border border-primary/50 border-t-0 rounded-b-2xl shadow-xl z-[9998] p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Select Sources</h4>
              {sources.map((source) => (
                <div key={source.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={source.id}
                      checked={source.enabled}
                      onChange={() => handleSourceToggle(source.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <label htmlFor={source.id} className="text-sm text-foreground cursor-pointer">
                      {source.label}
                    </label>
                  </div>
                  {source.count && (
                    <Badge variant="outline" className="text-xs">
                      {source.count}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search suggestions dropdown */}
        {isOpen && !sourcesOpen && (
          <div className="absolute left-0 right-0 top-full bg-card border border-primary/50 border-t-0 rounded-b-2xl shadow-xl z-[9999] max-h-[360px] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-3 border-b border-border">
              <h4 className="text-sm font-medium text-muted-foreground">
                {value.trim() ? 'Search Results' : activeTab === 'bills' ? 'Recent Bills' : 
                 activeTab === 'tickets' ? 'Policy Research' : 'Legislative Intelligence'}
              </h4>
            </div>
            
            {loading ? (
              <div className="px-6 py-8">
                <span className="text-sm text-muted-foreground">
                  Searching legislative data...
                </span>
              </div>
            ) : suggestions.length > 0 ? (
              <ul
                ref={listboxRef}
                id={listboxId.current}
                role="listbox"
                aria-label="Search suggestions"
                className="py-2"
              >
                {suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.id}
                    id={`${listboxId.current}-option-${index}`}
                    role="option"
                    aria-selected={selectedIndex === index}
                    className={`px-6 py-3 cursor-pointer transition-colors ${
                      selectedIndex === index
                        ? 'bg-primary/10 text-foreground'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground line-clamp-2">
                          {suggestion.text}
                        </div>
                        {suggestion.metadata && (
                          <div className="flex items-center gap-2 mt-1">
                            {suggestion.metadata.billNumber && (
                              <Badge variant="outline" className="text-xs">
                                {suggestion.metadata.billNumber}
                              </Badge>
                            )}
                            {suggestion.metadata.sponsor && (
                              <span className="text-xs text-muted-foreground">
                                Sponsor: {suggestion.metadata.sponsor}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-2 text-xs capitalize">
                        {suggestion.type}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8">
                <span className="text-sm text-muted-foreground">
                  No results found. Try different search terms.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Document Upload Modal */}
        <DocumentUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
        />
      </div>
    </div>
  );
};