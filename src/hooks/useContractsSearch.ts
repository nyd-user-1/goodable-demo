import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contract, ContractRow, transformContract } from '@/types/contracts';

interface UseContractsSearchOptions {
  searchTerm?: string;
  departmentFilter?: string;
  contractTypeFilter?: string;
  limit?: number;
}

export function useContractsSearch({
  searchTerm = '',
  departmentFilter = '',
  contractTypeFilter = '',
  limit = 100,
}: UseContractsSearchOptions = {}) {
  const [localSearch, setLocalSearch] = useState('');

  // Fetch contracts with server-side filtering when search term is provided
  const { data: contracts, isLoading, error } = useQuery({
    queryKey: ['contracts', searchTerm, departmentFilter, contractTypeFilter, limit],
    queryFn: async () => {
      let query = supabase
        .from('Contracts')
        .select('*')
        .limit(limit);

      // Server-side text search on vendor name and description
      if (searchTerm && searchTerm.length >= 2) {
        query = query.or(
          `VENDOR NAME.ilike.%${searchTerm}%,CONTRACT DESCRIPTION.ilike.%${searchTerm}%,CONTRACT NUMBER.ilike.%${searchTerm}%,DEPARTMENT/FACILITY.ilike.%${searchTerm}%`
        );
      }

      // Filter by department
      if (departmentFilter) {
        query = query.ilike('DEPARTMENT/FACILITY', `%${departmentFilter}%`);
      }

      // Filter by contract type
      if (contractTypeFilter) {
        query = query.eq('CONTRACT TYPE', contractTypeFilter);
      }

      // Order by contract amount descending (largest first)
      query = query.order('CURRENT CONTRACT AMOUNT', { ascending: false, nullsFirst: false });

      const { data, error } = await query;

      if (error) throw error;

      return (data as ContractRow[]).map(transformContract);
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Get unique departments for filter dropdown
  const { data: departments } = useQuery({
    queryKey: ['contracts-departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Contracts')
        .select('"DEPARTMENT/FACILITY"')
        .not('DEPARTMENT/FACILITY', 'is', null);

      if (error) throw error;

      const uniqueDepts = [...new Set(data.map((d: Record<string, string>) => d['DEPARTMENT/FACILITY']))];
      return uniqueDepts.filter(Boolean).sort() as string[];
    },
    staleTime: 30 * 60 * 1000, // Cache departments for 30 minutes
  });

  // Get unique contract types for filter dropdown
  const { data: contractTypes } = useQuery({
    queryKey: ['contracts-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Contracts')
        .select('"CONTRACT TYPE"')
        .not('CONTRACT TYPE', 'is', null);

      if (error) throw error;

      const uniqueTypes = [...new Set(data.map((d: Record<string, string>) => d['CONTRACT TYPE']))];
      return uniqueTypes.filter(Boolean).sort() as string[];
    },
    staleTime: 30 * 60 * 1000,
  });

  // Client-side filtering for instant search within loaded results
  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    if (!localSearch) return contracts;

    const searchLower = localSearch.toLowerCase();
    return contracts.filter(
      (c) =>
        c.vendorName?.toLowerCase().includes(searchLower) ||
        c.contractDescription?.toLowerCase().includes(searchLower) ||
        c.contractNumber?.toLowerCase().includes(searchLower) ||
        c.departmentFacility?.toLowerCase().includes(searchLower)
    );
  }, [contracts, localSearch]);

  return {
    contracts: filteredContracts,
    allContracts: contracts || [],
    isLoading,
    error,
    departments: departments || [],
    contractTypes: contractTypes || [],
    localSearch,
    setLocalSearch,
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
