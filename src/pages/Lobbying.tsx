import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, HandCoins, ArrowUp, PanelLeft, Command, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NoteViewSidebar } from '@/components/NoteViewSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useLobbyingSearch, LobbyingTab, formatLobbyingCurrency } from '@/hooks/useLobbyingSearch';
import { LobbyingSpend, LobbyistCompensation, LobbyistClient } from '@/types/lobbying';

const Lobbying = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);

  // Enable sidebar transitions after mount to prevent flash
  useEffect(() => {
    const timer = setTimeout(() => setSidebarMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const {
    spendRecords,
    compensationRecords,
    clientsByLobbyist,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
  } = useLobbyingSearch();

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

  const handleSpendClick = (record: LobbyingSpend) => {
    navigate(`/lobbying/spend-${record.id}`);
  };

  const handleCompensationClick = (record: LobbyistCompensation) => {
    navigate(`/lobbying/comp-${record.id}`);
  };

  const handleSpendChatClick = (record: LobbyingSpend) => {
    const client = record.contractual_client || 'this client';
    const compensation = record.compensation || 'N/A';
    const totalExpenses = record.total_expenses || 'N/A';

    const initialPrompt = `Tell me about lobbying spending by ${client}. They paid ${compensation} in compensation with ${totalExpenses} in total expenses.`;
    navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
  };

  const handleCompensationChatClick = (record: LobbyistCompensation) => {
    const lobbyist = record.principal_lobbyist || 'this lobbyist';
    const compensation = record.compensation || 'N/A';
    const expenses = record.reimbursed_expenses || 'N/A';

    const initialPrompt = `Tell me about ${lobbyist}. They received ${compensation} in compensation plus ${expenses} in reimbursed expenses.`;
    navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
  };

  const hasActiveFilters = !!searchTerm;

  const openCommandPalette = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  const records = activeTab === 'spend' ? spendRecords : compensationRecords;

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Left Sidebar - slides in from off-screen */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 bg-background border-r z-50",
          sidebarMounted && "transition-transform duration-300 ease-in-out",
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NoteViewSidebar onClose={() => setLeftSidebarOpen(false)} />
      </div>

      {/* Backdrop overlay when sidebar is open */}
      {leftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

      {/* Main Container with padding */}
      <div className="h-full p-2 bg-muted/30">
        {/* Inner container with rounded corners and border */}
        <div className="w-full h-full rounded-2xl border bg-background overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-background">
            <div className="px-4 py-4">
              <div className="flex flex-col gap-4">
                {/* Title row with sidebar toggle and command button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                      className={cn("flex-shrink-0", leftSidebarOpen && "bg-muted")}
                    >
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl font-semibold">Lobbying</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear filters
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={openCommandPalette}
                      className="flex-shrink-0"
                    >
                      <Command className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder={activeTab === 'spend'
                      ? "Search clients... (press / to focus)"
                      : "Search lobbyists... (press / to focus)"
                    }
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

                {/* Tab filters - styled like Contracts filter buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm transition-colors",
                      activeTab === 'spend'
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setActiveTab('spend')}
                  >
                    Spending
                  </button>
                  <button
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm transition-colors",
                      activeTab === 'compensation'
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setActiveTab('compensation')}
                  >
                    Earnings
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results - Masonry Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {error ? (
              <div className="text-center py-12">
                <p className="text-destructive">Error loading lobbying data: {String(error)}</p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-32 bg-muted/30 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12">
                <HandCoins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No lobbying records found matching your criteria.</p>
                {hasActiveFilters && (
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                )}
              </div>
            ) : activeTab === 'spend' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spendRecords.map((record) => (
                  <SpendCard
                    key={record.id}
                    record={record}
                    onClick={() => handleSpendClick(record)}
                    onChatClick={() => handleSpendChatClick(record)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {compensationRecords.map((record) => {
                  const lobbyistName = record.principal_lobbyist?.toUpperCase() || '';
                  const clients = clientsByLobbyist.get(lobbyistName) || [];
                  return (
                    <CompensationCard
                      key={record.id}
                      record={record}
                      clients={clients}
                      onClick={() => handleCompensationClick(record)}
                      onChatClick={() => handleCompensationChatClick(record)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Spend Card Component
interface SpendCardProps {
  record: LobbyingSpend;
  onClick: () => void;
  onChatClick: () => void;
}

function SpendCard({ record, onClick, onChatClick }: SpendCardProps) {
  const client = record.contractual_client || 'Unknown Client';
  const compensation = formatLobbyingCurrency(record.compensation);
  const totalExpenses = formatLobbyingCurrency(record.total_expenses);

  const promptText = `Tell me about lobbying spending by ${client} with ${compensation} in compensation.`;

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChatClick();
  };

  return (
    <div
      onClick={onClick}
      className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200"
    >
      <h3 className="font-semibold text-base mb-3">{client}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{promptText}</p>

      {/* Details and arrow - render on hover */}
      <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
          {record.compensation && (
            <div>
              <span className="text-muted-foreground">Compensation</span>
              <p className="font-medium">{record.compensation}</p>
            </div>
          )}
          {record.total_expenses && (
            <div>
              <span className="text-muted-foreground">Total Expenses</span>
              <p className="font-medium">{record.total_expenses}</p>
            </div>
          )}
          {record.expenses_less_than_75 && (
            <div>
              <span className="text-muted-foreground">Expenses &lt;$75</span>
              <p className="font-medium">{record.expenses_less_than_75}</p>
            </div>
          )}
          {record.itemized_expenses && (
            <div>
              <span className="text-muted-foreground">Itemized Expenses</span>
              <p className="font-medium">{record.itemized_expenses}</p>
            </div>
          )}
          {record.compensation_and_expenses && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Total (Comp + Expenses)</span>
              <p className="font-medium text-green-600 dark:text-green-400">{record.compensation_and_expenses}</p>
            </div>
          )}
        </div>

        {/* Arrow button - initiates chat */}
        <div className="flex justify-end">
          <button
            onClick={handleChatClick}
            className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-foreground/80 transition-colors"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Compensation Card Component
interface CompensationCardProps {
  record: LobbyistCompensation;
  clients: LobbyistClient[];
  onClick: () => void;
  onChatClick: () => void;
}

function CompensationCard({ record, clients, onClick, onChatClick }: CompensationCardProps) {
  const lobbyist = record.principal_lobbyist || 'Unknown Lobbyist';
  const compensation = formatLobbyingCurrency(record.compensation);
  const expenses = formatLobbyingCurrency(record.reimbursed_expenses);

  const promptText = `Tell me about ${lobbyist} with ${compensation} in compensation.`;

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChatClick();
  };

  const handleClientsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Get preview clients (first 3)
  const previewClients = clients.slice(0, 3);
  const hasMoreClients = clients.length > 3;

  return (
    <div
      onClick={onClick}
      className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200"
    >
      <h3 className="font-semibold text-base mb-3">{lobbyist}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{promptText}</p>

      {/* Details and arrow - render on hover */}
      <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
          {record.compensation && (
            <div>
              <span className="text-muted-foreground">Compensation</span>
              <p className="font-medium">{record.compensation}</p>
            </div>
          )}
          {record.reimbursed_expenses && (
            <div>
              <span className="text-muted-foreground">Reimbursed Expenses</span>
              <p className="font-medium">{record.reimbursed_expenses}</p>
            </div>
          )}
          {record.grand_total_compensation_expenses && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Grand Total</span>
              <p className="font-medium text-green-600 dark:text-green-400">
                {record.grand_total_compensation_expenses}
              </p>
            </div>
          )}
        </div>

        {/* Buttons row */}
        <div className="flex items-center justify-between">
          {/* Clients button with hover card */}
          {clients.length > 0 && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  onClick={handleClientsClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <Users className="h-3.5 w-3.5" />
                  {clients.length} Client{clients.length !== 1 ? 's' : ''}
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80" align="start">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Clients</h4>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2 font-medium text-muted-foreground">Client</th>
                        <th className="text-left pb-2 font-medium text-muted-foreground">Start Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewClients.map((client, idx) => (
                        <tr key={client.id || idx} className="border-b last:border-0">
                          <td className="py-2 pr-2">{client.contractual_client || 'Unknown'}</td>
                          <td className="py-2">{client.start_date || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {hasMoreClients && (
                    <button
                      onClick={onClick}
                      className="text-xs text-primary hover:underline"
                    >
                      View all {clients.length} clients →
                    </button>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          )}

          {/* Arrow button - initiates chat */}
          <button
            onClick={handleChatClick}
            className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-foreground/80 transition-colors ml-auto"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Lobbying;
