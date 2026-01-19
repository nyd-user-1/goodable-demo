import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contract, ContractRow, transformContract } from '@/types/contracts';

export function useContractsSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('');

  // Fetch all contracts once and filter client-side for speed
  const { data: allContracts, isLoading, error } = useQuery({
    queryKey: ['contracts-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Contracts')
        .select('*');

      if (error) throw error;

      // Transform and sort by amount descending
      const contracts = (data as ContractRow[])
        .map(transformContract)
        .sort((a, b) => (b.currentContractAmount || 0) - (a.currentContractAmount || 0));

      return contracts;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Extract unique departments
  const departments = useMemo(() => {
    if (!allContracts) return [];
    const depts = [...new Set(allContracts.map(c => c.departmentFacility).filter(Boolean))];
    return depts.sort() as string[];
  }, [allContracts]);

  // Extract unique contract types
  const contractTypes = useMemo(() => {
    if (!allContracts) return [];
    const types = [...new Set(allContracts.map(c => c.contractType).filter(Boolean))];
    return types.sort() as string[];
  }, [allContracts]);

  // Client-side filtering - super fast
  const filteredContracts = useMemo(() => {
    if (!allContracts) return [];

    let results = allContracts;

    // Filter by search term
    if (searchTerm && searchTerm.length >= 1) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        (c) =>
          c.vendorName?.toLowerCase().includes(searchLower) ||
          c.contractDescription?.toLowerCase().includes(searchLower) ||
          c.contractNumber?.toLowerCase().includes(searchLower) ||
          c.departmentFacility?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by department
    if (departmentFilter) {
      results = results.filter(c => c.departmentFacility === departmentFilter);
    }

    // Filter by contract type
    if (contractTypeFilter) {
      results = results.filter(c => c.contractType === contractTypeFilter);
    }

    return results;
  }, [allContracts, searchTerm, departmentFilter, contractTypeFilter]);

  return {
    contracts: filteredContracts,
    allContracts: allContracts || [],
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
  };
}

// Helper to format currency
export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to format date strings
export function formatContractDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
