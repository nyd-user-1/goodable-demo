import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, Upload, Brain, ChevronDown, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentUploadModal } from './DocumentUploadModal';
import { 
  getDomainFilter, 
  getSourceCredibilityBadge, 
  validateSourceMix, 
  filterUrlsByDomain,
  LEGISLATIVE_SOURCES,
  POLICY_RESEARCH_SOURCES
} from '@/config/domainFilters';

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
  allowedDomains?: string[];
  credibilityTier?: number;
  category?: string;
  requiresMultiSource?: boolean;
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
  const [activeTab, setActiveTab] = useState<'bills' | 'sources'>('sources');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [sources, setSources] = useState<SourceOption[]>([
    { 
      id: 'nys-bills', 
      label: 'NYS Bills & Resolutions', 
      enabled: true, 
      count: 4,
      allowedDomains: ['goodable.dev', 'nysenate.gov', 'assembly.state.ny.us'],
      credibilityTier: 1,
      category: 'Legislative',
      requiresMultiSource: true
    },
    { 
      id: 'federal-legislation', 
      label: 'Federal Legislation', 
      enabled: true,
      allowedDomains: ['congress.gov', 'senate.gov', 'house.gov', 'govtrack.us'],
      credibilityTier: 1,
      category: 'Legislative'
    },
    { 
      id: 'policy-research', 
      label: 'Policy Research & Analysis', 
      enabled: true,
      allowedDomains: POLICY_RESEARCH_SOURCES.map(s => s.domain),
      credibilityTier: 1,
      category: 'Research'
    },
    { 
      id: 'committee-reports', 
      label: 'Committee Reports & Transcripts', 
      enabled: true,
      allowedDomains: getDomainFilter(),
      credibilityTier: 1,
      category: 'Legislative'
    }
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
    <div className={`relative w-full ${className}`} style={{ zIndex: 40 }}>
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
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadModalOpen(true)}
                    className="h-8 px-3 border border-border hover:bg-accent hover:text-accent-foreground"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                  
                  {hasContent && (
                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      className="h-8 px-3"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Think
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Button section */}
            <div className="px-6 pb-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={activeTab === "bills" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("bills")}
                  className="flex items-center gap-2"
                >
                  📄 Bills
                </Button>
                <Button
                  type="button"
                  variant={activeTab === "sources" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("sources")}
                  className="flex items-center gap-2 relative"
                >
                  📊 Sources
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {enabledSourcesCount}
                  </Badge>
                  <Shield className="w-3 h-3 text-green-600 ml-1" title="Credible sources only" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSourcesOpen(!sourcesOpen);
                    }}
                    className="h-auto p-0 ml-1"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${sourcesOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Sources dropdown - positioned relative to Sources tab */}
        {sourcesOpen && activeTab === 'sources' && (
          <div className="absolute left-64 top-full mt-2 w-96 bg-card border border-border rounded-lg shadow-xl z-50 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Select Sources</h4>
              </div>
              {sources.map((source) => (
                <div key={source.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={source.id}
                        checked={source.enabled}
                        onChange={() => handleSourceToggle(source.id)}
                        className="h-4 w-4 rounded border-border"
                      />
                      <div className="flex flex-col">
                        <label htmlFor={source.id} className="text-sm text-foreground cursor-pointer font-medium">
                          {source.label}
                        </label>
                        <div className="mt-1">
                          <span className="text-xs text-muted-foreground">
                            {source.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2 mt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  All sources are pre-filtered for credibility. Goodable data requires external validation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search suggestions dropdown */}
        {isOpen && !sourcesOpen && (
          <div className="absolute left-0 right-0 top-full bg-card border border-primary/50 border-t-0 rounded-b-2xl shadow-xl z-50 max-h-[360px] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {value.trim() ? 'Search Results' : activeTab === 'bills' ? 'Recent Bills' : 'Legislative Intelligence'}
                </h4>
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified Sources
                </Badge>
              </div>
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