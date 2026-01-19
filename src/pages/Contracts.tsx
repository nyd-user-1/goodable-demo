import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, Building2, FileText, DollarSign, Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContractsSearch, formatCurrency, formatContractDate } from '@/hooks/useContractsSearch';
import { Contract } from '@/types/contracts';
import { cn } from '@/lib/utils';

const Contracts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search for server queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    contracts,
    isLoading,
    error,
    departments,
    contractTypes,
    localSearch,
    setLocalSearch,
  } = useContractsSearch({
    searchTerm: debouncedSearch,
    departmentFilter,
    contractTypeFilter,
    limit: 500,
  });

  // Focus search on mount and keyboard shortcut
  useEffect(() => {
    searchInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedContract(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearch('');
    setDepartmentFilter('');
    setContractTypeFilter('');
    setLocalSearch('');
  }, [setLocalSearch]);

  const hasActiveFilters = searchTerm || departmentFilter || contractTypeFilter;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Title and stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Contracts</h1>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? 'Searching...' : `${contracts.length.toLocaleString()} contracts`}
                  </p>
                </div>
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
                placeholder="Search vendors, departments, contract numbers... (press / to focus)"
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
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[220px]">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={contractTypeFilter} onValueChange={setContractTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {contractTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quick filter for instant local search */}
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Quick filter loaded results..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading contracts. Please try again.</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No contracts found matching your criteria.</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {contracts.map((contract) => (
              <ContractRow
                key={contract.id}
                contract={contract}
                isSelected={selectedContract?.id === contract.id}
                onClick={() => setSelectedContract(
                  selectedContract?.id === contract.id ? null : contract
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Contract Detail Panel */}
      {selectedContract && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 max-h-[40vh] overflow-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">{selectedContract.vendorName}</h2>
                <p className="text-sm text-muted-foreground">{selectedContract.contractNumber}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedContract(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">{selectedContract.departmentFacility || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contract Amount</p>
                <p className="font-medium text-primary">{formatCurrency(selectedContract.currentContractAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Spending to Date</p>
                <p className="font-medium">{selectedContract.spendingToDate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contract Type</p>
                <p className="font-medium">{selectedContract.contractType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatContractDate(selectedContract.contractStartDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">End Date</p>
                <p className="font-medium">{formatContractDate(selectedContract.contractEndDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Approved Date</p>
                <p className="font-medium">{formatContractDate(selectedContract.originalContractApprovedDate)}</p>
              </div>
            </div>
            {selectedContract.contractDescription && (
              <div className="mt-4">
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm mt-1">{selectedContract.contractDescription}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Contract row component for performance
interface ContractRowProps {
  contract: Contract;
  isSelected: boolean;
  onClick: () => void;
}

function ContractRow({ contract, isSelected, onClick }: ContractRowProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-colors",
        "hover:bg-muted/50",
        isSelected ? "bg-muted border-primary" : "bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">{contract.vendorName || 'Unknown Vendor'}</h3>
            {contract.contractType && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {contract.contractType}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {contract.departmentFacility || 'No department'}
          </p>
          {contract.contractDescription && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {contract.contractDescription}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-primary">
            {formatCurrency(contract.currentContractAmount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {contract.contractNumber}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Calendar className="h-3 w-3" />
            {formatContractDate(contract.contractStartDate)}
          </div>
        </div>
      </div>
    </button>
  );
}

export default Contracts;
