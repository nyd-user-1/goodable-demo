import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contract } from '@/types/contracts';

const PAGE_SIZE = 100;

export function useContractsSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('');
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Build filter query helper
  const applyFilters = (query: any) => {
    if (searchTerm && searchTerm.length >= 2) {
      query = query.or(
        `vendor_name.ilike.%${searchTerm}%,contract_description.ilike.%${searchTerm}%,contract_number.ilike.%${searchTerm}%,department_facility.ilike.%${searchTerm}%`
      );
    }
    if (departmentFilter) {
      query = query.eq('department_facility', departmentFilter);
    }
    if (contractTypeFilter) {
      query = query.eq('contract_type', contractTypeFilter);
    }
    return query;
  };

  // Fetch initial page of contracts
  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts', searchTerm, departmentFilter, contractTypeFilter],
    queryFn: async () => {
      let query = supabase
        .from('Contracts')
        .select('*', { count: 'exact' });

      query = applyFilters(query);

      query = query
        .order('current_contract_amount', { ascending: false, nullsFirst: false })
        .limit(PAGE_SIZE);

      const { data, error, count } = await query;

      if (error) throw error;

      return { contracts: data as Contract[], totalCount: count || 0 };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Reset accumulated data when initial query changes (filters changed)
  useEffect(() => {
    if (data) {
      setAllContracts(data.contracts);
      setOffset(PAGE_SIZE);
      setHasMore(data.contracts.length === PAGE_SIZE);
    }
  }, [data]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      let query = supabase.from('Contracts').select('*');
      query = applyFilters(query);
      query = query
        .order('current_contract_amount', { ascending: false, nullsFirst: false })
        .range(offset, offset + PAGE_SIZE - 1);

      const { data: moreData, error: err } = await query;
      if (err) throw err;
      const rows = (moreData as Contract[]) || [];
      setAllContracts(prev => [...prev, ...rows]);
      setOffset(prev => prev + PAGE_SIZE);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      console.error("Load more contracts error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const contracts = allContracts;
  const totalCount = data?.totalCount || 0;

  // Get filter options (departments and types) from a separate query
  const { data: filterOptions } = useQuery({
    queryKey: ['contracts-filter-options'],
    queryFn: async () => {
      // Get unique departments
      const { data: deptData } = await supabase
        .from('Contracts')
        .select('department_facility')
        .not('department_facility', 'is', null);

      // Get unique contract types
      const { data: typeData } = await supabase
        .from('Contracts')
        .select('contract_type')
        .not('contract_type', 'is', null);

      const departments = [...new Set(deptData?.map(d => d.department_facility))].filter(Boolean).sort() as string[];
      const contractTypes = [...new Set(typeData?.map(t => t.contract_type))].filter(Boolean).sort() as string[];

      return { departments, contractTypes };
    },
    staleTime: 30 * 60 * 1000, // Cache filter options for 30 minutes
  });

  return {
    contracts,
    totalCount,
    isLoading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    departments: filterOptions?.departments || [],
    contractTypes: filterOptions?.contractTypes || [],
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
