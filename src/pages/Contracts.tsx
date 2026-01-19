import { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, FileText, Filter } from 'lucide-react';
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
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    contracts,
    totalCount,
    isLoading,
    error,
    departments,
    contractTypes,
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    contractTypeFilter,
    setContractTypeFilter,
  } = useContractsSearch();

  // Focus search on mount and keyboard shortcut
  useEffect(() => {
    searchInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT') {
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

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setContractTypeFilter('');
  };

  const hasActiveFilters = searchTerm || departmentFilter || contractTypeFilter;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Title and stats */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">Contracts</h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading
                    ? 'Loading...'
                    : `Showing ${contracts.length.toLocaleString()} of ${totalCount.toLocaleString()} contracts`
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
                placeholder="Search vendors, departments, contracts... (press / to focus)"
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
              <Select value={departmentFilter || "all"} onValueChange={(v) => setDepartmentFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[220px]">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={contractTypeFilter || "all"} onValueChange={(v) => setContractTypeFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {contractTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading contracts: {String(error)}</p>
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
                <h2 className="text-lg font-semibold">{selectedContract.vendor_name}</h2>
                <p className="text-sm text-muted-foreground">{selectedContract.contract_number}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedContract(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">{selectedContract.department_facility || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contract Amount</p>
                <p className="font-medium">{formatCurrency(selectedContract.current_contract_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Spending to Date</p>
                <p className="font-medium">{selectedContract.spending_to_date || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contract Type</p>
                <p className="font-medium">{selectedContract.contract_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatContractDate(selectedContract.contract_start_date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">End Date</p>
                <p className="font-medium">{formatContractDate(selectedContract.contract_end_date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Approved Date</p>
                <p className="font-medium">{formatContractDate(selectedContract.original_contract_approved_file_date)}</p>
              </div>
            </div>
            {selectedContract.contract_description && (
              <div className="mt-4">
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm mt-1">{selectedContract.contract_description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Contract row component
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
        "w-full text-left p-6 rounded-2xl transition-all duration-200",
        "bg-muted/30 hover:bg-muted/50",
        isSelected && "bg-muted/60"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{contract.vendor_name || 'Unknown Vendor'}</h3>
            {contract.contract_type && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {contract.contract_type}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {contract.department_facility || 'No department'}
          </p>
          {contract.contract_description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {contract.contract_description}
            </p>
          )}
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          <p className="font-semibold">
            {formatCurrency(contract.current_contract_amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {contract.contract_number}
          </p>
          <p className="text-xs text-muted-foreground">
            Start: {formatContractDate(contract.contract_start_date)}
          </p>
          <p className="text-xs text-muted-foreground">
            End: {formatContractDate(contract.contract_end_date)}
          </p>
        </div>
      </div>
    </button>
  );
}

export default Contracts;
