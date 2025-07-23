import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { SearchResult } from "@/types/search";
import { fetchAllSearchContent } from "@/utils/searchDataFetcher";
import { filterSearchResults } from "@/utils/searchHelpers";

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allContent, setAllContent] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  // Fetch all user content on mount
  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      setIsLoading(true);
      const results = await fetchAllSearchContent();
      setAllContent(results);
    } catch (error) {
      toast({
        title: "Error fetching content",
        description: "Failed to load your content for search.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter content based on search term
  const filteredResults = useMemo(() => {
    return filterSearchResults(allContent, searchTerm);
  }, [searchTerm, allContent]);

  useEffect(() => {
    setSearchResults(filteredResults);
  }, [filteredResults]);

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    clearSearch,
    refreshContent: fetchAllContent
  };
};

export type { SearchResult };