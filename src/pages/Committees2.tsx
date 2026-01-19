import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Building2, Users, Filter, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCommitteesSearch } from '@/hooks/useCommitteesSearch';
import { Committee } from '@/types/committee';

const Committees2 = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    committees,
    totalCount,
    isLoading,
    error,
    chambers,
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
  } = useCommitteesSearch();

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

  // Generate a prompt for a committee
  const generatePrompt = (committee: Committee): string => {
    const chamberPrefix = committee.chamber === 'Senate' ? 'Senate ' : committee.chamber === 'Assembly' ? 'Assembly ' : '';
    const name = `${chamberPrefix}${committee.committee_name || 'Committee'}`;
    const chair = committee.chair_name ? ` chaired by ${committee.chair_name}` : '';

    return `Tell me about the ${name}${chair}. What legislation does this committee handle and what should I know about it?`;
  };

  const handleCommitteeClick = (committee: Committee) => {
    const prompt = generatePrompt(committee);
    navigate(`/new-chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setChamberFilter('');
  };

  const hasActiveFilters = searchTerm || chamberFilter;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Title and stats */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">Committees</h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading
                    ? 'Loading...'
                    : `Showing ${committees.length.toLocaleString()} of ${totalCount.toLocaleString()} committees`
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
                placeholder="Search committees, chairs, descriptions... (press / to focus)"
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
              <Select value={chamberFilter || "all"} onValueChange={(v) => setChamberFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[180px]">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Chambers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chambers</SelectItem>
                  {chambers.map((chamber) => (
                    <SelectItem key={chamber} value={chamber}>
                      {chamber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results - Masonry Grid */}
      <div className="container mx-auto px-4 py-6">
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading committees: {String(error)}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted/30 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : committees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No committees found matching your criteria.</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {committees.map((committee) => (
              <CommitteeCard
                key={committee.committee_id}
                committee={committee}
                onClick={() => handleCommitteeClick(committee)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Committee card component - masonry style matching case studies
interface CommitteeCardProps {
  committee: Committee;
  onClick: () => void;
}

function CommitteeCard({ committee, onClick }: CommitteeCardProps) {
  const chamber = committee.chamber;
  const chair = committee.chair_name;

  // Build committee name with chamber prefix
  const chamberPrefix = chamber === 'Senate' ? 'Senate ' : chamber === 'Assembly' ? 'Assembly ' : '';
  const fullCommitteeName = `${chamberPrefix}${committee.committee_name || 'Unknown Committee'}`;

  // Build the prompt preview text
  let promptText = `Tell me about this committee`;
  if (chair) {
    promptText += ` chaired by ${chair}`;
  }
  promptText += '.';

  return (
    <div
      onClick={onClick}
      className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200"
    >
      <h3 className="font-semibold text-base mb-3">
        {fullCommitteeName}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {promptText}
      </p>

      {/* Details and arrow - render on hover */}
      <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
        {/* Committee details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
          {committee.chamber && (
            <div>
              <span className="text-muted-foreground">Chamber</span>
              <p className="font-medium">{committee.chamber}</p>
            </div>
          )}
          {committee.chair_name && (
            <div>
              <span className="text-muted-foreground">Chair</span>
              <p className="font-medium truncate">{committee.chair_name}</p>
            </div>
          )}
          {committee.member_count && (
            <div>
              <span className="text-muted-foreground">Members</span>
              <p className="font-medium">{committee.member_count}</p>
            </div>
          )}
          {committee.meeting_schedule && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Meeting Schedule</span>
              <p className="font-medium">{committee.meeting_schedule}</p>
            </div>
          )}
          {committee.next_meeting && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Next Meeting</span>
              <p className="font-medium">{committee.next_meeting}</p>
            </div>
          )}
        </div>

        {/* Arrow button */}
        <div className="flex justify-end">
          <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center">
            <ArrowUp className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Committees2;
