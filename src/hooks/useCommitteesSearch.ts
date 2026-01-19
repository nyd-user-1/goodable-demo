import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Committee } from '@/types/committee';

export function useCommitteesSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [chamberFilter, setChamberFilter] = useState('');

  // Fetch committees - server-side search when there's a search term
  const { data, isLoading, error } = useQuery({
    queryKey: ['committees-search', searchTerm, chamberFilter],
    queryFn: async () => {
      let query = supabase
        .from('Committees')
        .select('*', { count: 'exact' });

      // Server-side search across committee name, chair name, description
      if (searchTerm && searchTerm.length >= 2) {
        query = query.or(
          `committee_name.ilike.%${searchTerm}%,chair_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      // Server-side chamber filter
      if (chamberFilter) {
        query = query.eq('chamber', chamberFilter);
      }

      // Order by committee name and limit results
      query = query
        .order('committee_name', { ascending: true })
        .limit(500);

      const { data, error, count } = await query;

      if (error) throw error;

      return { committees: data as Committee[], totalCount: count || 0 };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  const committees = data?.committees || [];
  const totalCount = data?.totalCount || 0;

  // Get filter options (chambers) from a separate query
  const { data: filterOptions } = useQuery({
    queryKey: ['committees-filter-options'],
    queryFn: async () => {
      // Get unique chambers
      const { data: chamberData } = await supabase
        .from('Committees')
        .select('chamber')
        .not('chamber', 'is', null);

      const chambers = [...new Set(chamberData?.map(c => c.chamber))].filter(Boolean).sort() as string[];

      return { chambers };
    },
    staleTime: 30 * 60 * 1000, // Cache filter options for 30 minutes
  });

  return {
    committees,
    totalCount,
    isLoading,
    error,
    chambers: filterOptions?.chambers || [],
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
  };
}
