import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NYSSearchParams {
  searchType: 'bills' | 'members' | 'laws' | 'agendas' | 'calendars';
  query: string;
  sessionYear?: number;
  limit?: number;
}

interface NYSSearchResult {
  success: boolean;
  result?: {
    items: any[];
    total: number;
  };
  error?: string;
}

export const useNYSLegislation = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const searchNYS = async (params: NYSSearchParams): Promise<NYSSearchResult | null> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('nys-legislation-search', {
        body: params
      });

      if (error) {
        toast({
          title: "Search Error",
          description: "Failed to search NYS legislation data",
          variant: "destructive",
        });
        return null;
      }

      if (data?.success && data?.result?.items) {
        setResults(data.result.items);
        return data;
      } else {
        setResults([]);
        return { success: false, error: 'No results found' };
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search NYS legislation data",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchBills = (query: string, sessionYear?: number, limit = 20) => {
    return searchNYS({ searchType: 'bills', query, sessionYear, limit });
  };

  const searchMembers = (query: string, limit = 20) => {
    return searchNYS({ searchType: 'members', query, limit });
  };

  const searchLaws = (query: string, limit = 20) => {
    return searchNYS({ searchType: 'laws', query, limit });
  };

  const searchAgendas = (query: string, limit = 20) => {
    return searchNYS({ searchType: 'agendas', query, limit });
  };

  const searchCalendars = (query: string, limit = 20) => {
    return searchNYS({ searchType: 'calendars', query, limit });
  };

  return {
    loading,
    results,
    searchNYS,
    searchBills,
    searchMembers,
    searchLaws,
    searchAgendas,
    searchCalendars,
  };
};