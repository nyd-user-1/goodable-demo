import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Building2, Users, ArrowUp } from 'lucide-react';
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
import { useCommitteesSearch } from '@/hooks/useCommitteesSearch';
import { Committee } from '@/types/committee';
import { generateCommitteeSlug } from '@/utils/committeeSlug';

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

  // Generate a prompt for a committee - varies based on available data
  const generatePrompt = (committee: Committee): string => {
    const chamberPrefix = committee.chamber === 'Senate' ? 'Senate ' : committee.chamber === 'Assembly' ? 'Assembly ' : '';
    const name = `${chamberPrefix}${committee.committee_name || 'Committee'}`;
    const chair = committee.chair_name ? ` chaired by ${committee.chair_name}` : '';

    // Use description if available to vary the prompt
    if (committee.description) {
      return `Tell me about the ${name}${chair}. The committee's focus is: "${committee.description}". What current legislation is this committee working on?`;
    }

    return `Tell me about the ${name}${chair}. What legislation does this committee handle and what should I know about it?`;
  };

  // Navigate to committee detail page
  const handleCommitteeClick = (committee: Committee) => {
    const slug = generateCommitteeSlug({
      committee_id: committee.committee_id,
      committee_name: committee.committee_name,
      chamber: committee.chamber,
    } as any);
    navigate(`/committees/${slug}`);
  };

  // Navigate to new chat with prompt
  const handleChatClick = (committee: Committee, e: React.MouseEvent) => {
    e.stopPropagation();
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

      {/* Results - Grid */}
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
                onChatClick={(e) => handleChatClick(committee, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Committee card component
interface CommitteeCardProps {
  committee: Committee;
  onClick: () => void;
  onChatClick: (e: React.MouseEvent) => void;
}

function CommitteeCard({ committee, onClick, onChatClick }: CommitteeCardProps) {
  const chamber = committee.chamber;
  const chair = committee.chair_name;

  // Build committee name with chamber prefix
  const chamberPrefix = chamber === 'Senate' ? 'Senate ' : chamber === 'Assembly' ? 'Assembly ' : '';
  const fullCommitteeName = `${chamberPrefix}${committee.committee_name || 'Unknown Committee'}`;

  // Build varied prompt preview text based on description
  let promptText: string;
  if (committee.description) {
    // Truncate description if too long
    const shortDesc = committee.description.length > 100
      ? committee.description.substring(0, 100) + '...'
      : committee.description;
    promptText = shortDesc;
  } else if (chair) {
    promptText = `Chaired by ${chair}`;
  } else {
    promptText = `${chamber || 'Legislative'} committee`;
  }

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

      {/* Details and buttons - render on hover */}
      <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
        {/* Committee details grid - balanced 2x2 layout */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
          {/* Column 1 */}
          {committee.chamber && (
            <div>
              <span className="text-muted-foreground">Chamber</span>
              <p className="font-medium">{committee.chamber}</p>
            </div>
          )}
          {/* Column 2 */}
          {committee.chair_name && (
            <div>
              <span className="text-muted-foreground">Chair</span>
              <p className="font-medium truncate">{committee.chair_name}</p>
            </div>
          )}
          {/* Column 1 */}
          {committee.member_count && (
            <div>
              <span className="text-muted-foreground">Members</span>
              <p className="font-medium">{committee.member_count}</p>
            </div>
          )}
          {/* Column 2 */}
          {committee.meeting_schedule && (
            <div>
              <span className="text-muted-foreground">Meeting Schedule</span>
              <p className="font-medium">{committee.meeting_schedule}</p>
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

export default Committees2;
