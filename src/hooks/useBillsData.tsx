import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

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
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sponsorFilter, setSponsorFilter] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const BILLS_PER_PAGE = 50;
  const INITIAL_LOAD_SIZE = 500; // Load more bills initially for better client-side filtering

  // Initial fetch of bills data
  useEffect(() => {
    fetchAllBills();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sponsorFilter, committeeFilter, dateRangeFilter]);

  // Filter bills whenever filters or page changes
  useEffect(() => {
    filterBills();
  }, [allBills, searchTerm, sponsorFilter, committeeFilter, dateRangeFilter, currentPage]);

  const fetchAllBills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch initial batch of bills
      const { data: billsData, error } = await supabase
        .from("Bills")
        .select("*")
        .order("last_action_date", {
          ascending: false,
          nullsFirst: false
        })
        .limit(INITIAL_LOAD_SIZE);
      
      if (error) {
        throw error;
      }

      // Fetch sponsor information for each bill in batches
      const billsWithSponsors = [];
      const batchSize = 50;
      
      for (let i = 0; i < (billsData || []).length; i += batchSize) {
        const batch = billsData.slice(i, i + batchSize);
        const batchWithSponsors = await Promise.all(
          batch.map(async (bill) => {
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
        billsWithSponsors.push(...batchWithSponsors);
      }
      
      setAllBills(billsWithSponsors);
    } catch (err) {
      setError("Failed to load bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    let filtered = [...allBills];

    // Apply search filter - instant search without debounce
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(bill => {
        const titleMatch = bill.title?.toLowerCase().includes(term);
        const numberMatch = bill.bill_number?.toLowerCase().includes(term);
        const descriptionMatch = bill.description?.toLowerCase().includes(term);
        const summaryMatch = bill.summary?.toLowerCase().includes(term);
        const statusMatch = bill.status?.toLowerCase().includes(term);
        
        // Also search in sponsor names
        const sponsorMatch = bill.sponsors?.some(sponsor => 
          sponsor.name?.toLowerCase().includes(term)
        );
        
        return titleMatch || numberMatch || descriptionMatch || summaryMatch || statusMatch || sponsorMatch;
      });
    }

    // Apply sponsor filter
    if (sponsorFilter) {
      filtered = filtered.filter(bill => 
        bill.sponsors?.some(sponsor => sponsor.name === sponsorFilter)
      );
    }

    // Apply committee filter
    if (committeeFilter) {
      filtered = filtered.filter(bill => bill.committee === committeeFilter);
    }

    // Apply date filter
    if (dateRangeFilter) {
      const daysAgo = parseInt(dateRangeFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      filtered = filtered.filter(bill => {
        if (!bill.last_action_date) return false;
        const billDate = new Date(bill.last_action_date);
        return billDate >= cutoffDate;
      });
    }

    // Store total filtered count
    setTotalFilteredCount(filtered.length);

    // Apply pagination
    const startIndex = (currentPage - 1) * BILLS_PER_PAGE;
    const endIndex = startIndex + BILLS_PER_PAGE;
    const paginatedResults = filtered.slice(startIndex, endIndex);

    setFilteredBills(paginatedResults);
    setHasNextPage(endIndex < filtered.length);
  };

  const loadMoreBills = () => {
    setCurrentPage(prev => prev + 1);
  };

  const fetchBills = () => {
    fetchAllBills();
  };

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
    totalBills: totalFilteredCount || allBills.length,
    currentPageBills: filteredBills.length,
    currentPage,
  };
};