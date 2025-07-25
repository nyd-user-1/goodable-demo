import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useDebounce } from "./useDebounce";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

interface BillFilters {
  search: string;
  sponsor: string;
  committee: string;
  dateRange: string;
}

export const useBillsData = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sponsorFilter, setSponsorFilter] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  // Debounce search to avoid excessive API calls - reduced delay for faster response
  const debouncedSearchTerm = useDebounce(searchTerm, 150);
  
  const BILLS_PER_PAGE = 50;

  const fetchBills = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Start with basic bills query - get count for pagination
      let countQuery = supabase
        .from("Bills")
        .select("*", { count: 'exact', head: true });
      
      // Start with basic bills query for data
      let query = supabase
        .from("Bills")
        .select("*");

      // Apply search filter - search immediately for any non-empty term
      if (debouncedSearchTerm && debouncedSearchTerm.trim().length > 0) {
        const trimmedTerm = debouncedSearchTerm.trim();
        // Enhanced search including summary and status fields for better coverage
        const searchFilter = `title.ilike.%${trimmedTerm}%,bill_number.ilike.%${trimmedTerm}%,description.ilike.%${trimmedTerm}%,summary.ilike.%${trimmedTerm}%,status.ilike.%${trimmedTerm}%`;
        query = query.or(searchFilter);
        countQuery = countQuery.or(searchFilter);
      }

      // Apply sponsor filter
      if (sponsorFilter) {
        // First find people with matching names
        const { data: people } = await supabase
          .from("People")
          .select("people_id")
          .eq("name", sponsorFilter);
        
        if (people && people.length > 0) {
          // Then find bills where these people are PRIMARY sponsors (position = 1)
          const peopleIds = people.map(p => p.people_id);
          const { data: sponsorBills } = await supabase
            .from("Sponsors")
            .select("bill_id")
            .in("people_id", peopleIds)
            .eq("position", 1);
          
          if (sponsorBills && sponsorBills.length > 0) {
            const billIds = sponsorBills.map(sb => sb.bill_id);
            query = query.in("bill_id", billIds);
            countQuery = countQuery.in("bill_id", billIds);
          } else {
            // No bills found for this sponsor, return empty result
            setBills([]);
            setTotalCount(0);
            setHasNextPage(false);
            return;
          }
        } else {
          // No people found with this name, return empty result
          setBills([]);
          setTotalCount(0);
          setHasNextPage(false);
          return;
        }
      }

      // Apply committee filter
      if (committeeFilter) {
        query = query.eq("committee", committeeFilter);
        countQuery = countQuery.eq("committee", committeeFilter);
      }

      // Apply date filter
      if (dateRangeFilter) {
        const daysAgo = parseInt(dateRangeFilter);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        const dateFilter = cutoffDate.toISOString().split('T')[0];
        query = query.gte("last_action_date", dateFilter);
        countQuery = countQuery.gte("last_action_date", dateFilter);
      }

      // Get total count first
      const { count: totalCountResult } = await countQuery;
      setTotalCount(totalCountResult || 0);

      // Order by last action date, most recent first
      query = query.order("last_action_date", {
        ascending: false,
        nullsFirst: false
      });

      // Apply pagination
      const from = loadMore ? bills.length : (currentPage - 1) * BILLS_PER_PAGE;
      const to = from + BILLS_PER_PAGE - 1;
      query = query.range(from, to);
      
      const { data: billsData, error } = await query;
      
      if (error) {
        throw error;
      }

      // Fetch sponsor information for each bill
      const billsWithSponsors = await Promise.all(
        (billsData || []).map(async (bill) => {
          // Fetch sponsors for this bill
          const { data: sponsorsData } = await supabase
            .from("Sponsors")
            .select("people_id, position")
            .eq("bill_id", bill.bill_id)
            .order("position", { ascending: true });

          // If we have sponsors, fetch their details
          let sponsors: Array<{ name: string | null; party: string | null; chamber: string | null; }> = [];
          
          if (sponsorsData && sponsorsData.length > 0) {
            const peopleIds = sponsorsData.map(s => s.people_id).filter(Boolean);
            if (peopleIds.length > 0) {
              const { data: peopleData } = await supabase
                .from("People")
                .select("people_id, name, party, chamber")
                .in("people_id", peopleIds);
              
              sponsors = sponsorsData.map(sponsor => {
                const person = peopleData?.find(p => p.people_id === sponsor.people_id);
                return {
                  name: person?.name || null,
                  party: person?.party || null,
                  chamber: person?.chamber || null
                };
              }).filter(s => s.name) || [];
            }
          }

          return {
            ...bill,
            sponsors
          };
        })
      );
      
      if (loadMore) {
        setBills(prevBills => [...prevBills, ...billsWithSponsors]);
      } else {
        setBills(billsWithSponsors);
      }
      
      // Check if there are more pages
      const totalFetched = loadMore ? bills.length + billsWithSponsors.length : billsWithSponsors.length;
      setHasNextPage(totalFetched < (totalCountResult || 0));
    } catch (err) {
      setError("Failed to load bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchBills();
  }, [debouncedSearchTerm, sponsorFilter, committeeFilter, dateRangeFilter]);

  const loadMoreBills = () => {
    if (hasNextPage && !loading) {
      setCurrentPage(prev => prev + 1);
      fetchBills(true);
    }
  };

  // No need for client-side filtering since we're doing it server-side now
  const filteredBills = bills;

  return {
    bills: filteredBills,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sponsorFilter,
    setSponsorFilter,
    committeeFilter,
    setCommitteeFilter,
    dateRangeFilter,
    setDateRangeFilter,
    fetchBills,
    loadMoreBills,
    hasNextPage,
    totalBills: totalCount,
    currentPageBills: bills.length,
    currentPage,
  };
};