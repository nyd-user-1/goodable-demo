import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contract } from '@/types/contracts';

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
        .select('*')
        .order('current_contract_amount', { ascending: false, nullsFirst: false });

      if (error) throw error;

      return data as Contract[];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Extract unique departments
  const departments = useMemo(() => {
    if (!allContracts) return [];
    const depts = [...new Set(allContracts.map(c => c.department_facility).filter(Boolean))];
    return depts.sort() as string[];
  }, [allContracts]);

  // Extract unique contract types
  const contractTypes = useMemo(() => {
    if (!allContracts) return [];
    const types = [...new Set(allContracts.map(c => c.contract_type).filter(Boolean))];
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
          c.vendor_name?.toLowerCase().includes(searchLower) ||
          c.contract_description?.toLowerCase().includes(searchLower) ||
          c.contract_number?.toLowerCase().includes(searchLower) ||
          c.department_facility?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by department
    if (departmentFilter) {
      results = results.filter(c => c.department_facility === departmentFilter);
    }

    // Filter by contract type
    if (contractTypeFilter) {
      results = results.filter(c => c.contract_type === contractTypeFilter);
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
