import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Law {
  id: number;
  law_id: string;
  name: string;
  chapter: string;
  law_type: string;
  full_text?: string;
  structure?: any;
  total_sections: number;
  last_updated?: string;
  api_last_modified?: string;
  created_at: string;
  updated_at: string;
}

export interface LawSection {
  id: number;
  law_id: string;
  location_id: string;
  parent_location_id?: string;
  section_number: string;
  title: string;
  content: string;
  level: number;
  sort_order: number;
}

interface LawsFilters {
  search: string;
  chapter: string;
  lawType: string;
}

export const useLawsData = () => {
  const [allLaws, setAllLaws] = useState<Law[]>([]);
  const [filteredLaws, setFilteredLaws] = useState<Law[]>([]);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chapterFilter, setChapterFilter] = useState("");
  const [lawTypeFilter, setLawTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { toast } = useToast();
  
  const LAWS_PER_PAGE = 50;

  // Initial fetch of laws data
  useEffect(() => {
    fetchAllLaws();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, chapterFilter, lawTypeFilter]);

  // Filter laws whenever filters or page changes
  useEffect(() => {
    filterLaws();
  }, [allLaws, searchTerm, chapterFilter, lawTypeFilter, currentPage]);

  const fetchAllLaws = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("ny_laws")
        .select("*")
        .order("name", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setAllLaws(data || []);
    } catch (err: any) {
      console.error("Error fetching laws:", err);
      setError(err.message || "Failed to fetch laws data");
      toast({
        title: "Error",
        description: "Failed to fetch laws data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLaws = () => {
    let filtered = [...allLaws];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(law =>
        law.name.toLowerCase().includes(lowerSearchTerm) ||
        law.law_id.toLowerCase().includes(lowerSearchTerm) ||
        law.chapter.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply chapter filter
    if (chapterFilter) {
      filtered = filtered.filter(law => law.chapter === chapterFilter);
    }

    // Apply law type filter
    if (lawTypeFilter) {
      filtered = filtered.filter(law => law.law_type === lawTypeFilter);
    }

    setTotalFilteredCount(filtered.length);

    // Apply pagination
    const startIndex = (currentPage - 1) * LAWS_PER_PAGE;
    const endIndex = startIndex + LAWS_PER_PAGE;
    const paginatedLaws = filtered.slice(startIndex, endIndex);

    setFilteredLaws(paginatedLaws);
    setHasNextPage(endIndex < filtered.length);
  };

  // Get unique chapters for filter dropdown
  const availableChapters = useMemo(() => {
    const chapters = [...new Set(allLaws.map(law => law.chapter))];
    return chapters.filter(Boolean).sort();
  }, [allLaws]);

  // Get unique law types for filter dropdown
  const availableLawTypes = useMemo(() => {
    const types = [...new Set(allLaws.map(law => law.law_type))];
    return types.filter(Boolean).sort();
  }, [allLaws]);

  // Search using full-text search
  const searchLaws = async (searchQuery: string, limit = 20) => {
    try {
      setLoading(true);
      const { data, error: searchError } = await supabase
        .rpc('search_ny_laws', { 
          search_term: searchQuery, 
          limit_results: limit 
        });

      if (searchError) {
        throw searchError;
      }

      return data || [];
    } catch (err: any) {
      console.error("Error searching laws:", err);
      toast({
        title: "Search Error",
        description: "Failed to search laws. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get law details with sections
  const getLawDetails = async (lawId: string) => {
    try {
      const { data, error: detailsError } = await supabase
        .rpc('get_law_details', { p_law_id: lawId });

      if (detailsError) {
        throw detailsError;
      }

      return data?.[0] || null;
    } catch (err: any) {
      console.error("Error fetching law details:", err);
      toast({
        title: "Error",
        description: "Failed to fetch law details. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Sync functions for admin use
  const syncAllLaws = async () => {
    try {
      setLoading(true);
      const { data, error: syncError } = await supabase.functions.invoke(
        'nys-legislation-search',
        { body: { action: 'sync-laws' } }
      );

      if (syncError) {
        throw syncError;
      }

      toast({
        title: "Sync Started",
        description: "Law synchronization started. This may take several minutes.",
      });

      // Refresh data after sync
      await fetchAllLaws();
      
      return data;
    } catch (err: any) {
      console.error("Error syncing laws:", err);
      toast({
        title: "Sync Error",
        description: "Failed to start law synchronization.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncSingleLaw = async (lawId: string) => {
    try {
      const { data, error: syncError } = await supabase.functions.invoke(
        'nys-legislation-search',
        { body: { action: 'sync-law', lawId } }
      );

      if (syncError) {
        throw syncError;
      }

      toast({
        title: "Law Synced",
        description: `Successfully synced law ${lawId}`,
      });

      // Refresh data after sync
      await fetchAllLaws();
      
      return data;
    } catch (err: any) {
      console.error("Error syncing law:", err);
      toast({
        title: "Sync Error",
        description: `Failed to sync law ${lawId}`,
        variant: "destructive",
      });
      throw err;
    }
  };

  const getSyncProgress = async () => {
    try {
      const { data, error: progressError } = await supabase.functions.invoke(
        'nys-legislation-search',
        { body: { action: 'get-progress' } }
      );

      if (progressError) {
        throw progressError;
      }

      return data;
    } catch (err: any) {
      console.error("Error getting sync progress:", err);
      return null;
    }
  };

  const totalPages = Math.ceil(totalFilteredCount / LAWS_PER_PAGE);

  return {
    // Data
    allLaws,
    filteredLaws,
    totalFilteredCount,
    loading,
    error,
    
    // Filters
    searchTerm,
    setSearchTerm,
    chapterFilter,
    setChapterFilter,
    lawTypeFilter,
    setLawTypeFilter,
    availableChapters,
    availableLawTypes,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    hasNextPage,
    
    // Actions
    searchLaws,
    getLawDetails,
    syncAllLaws,
    syncSingleLaw,
    getSyncProgress,
    refetch: fetchAllLaws,
    
    // Filter helpers
    clearFilters: () => {
      setSearchTerm("");
      setChapterFilter("");
      setLawTypeFilter("");
      setCurrentPage(1);
    },
    
    hasFilters: searchTerm !== "" || chapterFilter !== "" || lawTypeFilter !== ""
  };
};