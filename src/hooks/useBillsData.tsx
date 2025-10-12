import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

export const useBillsData = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sponsorFilter, setSponsorFilter] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // NEW: Status filter
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeepSearch, setIsDeepSearch] = useState(false); // NEW: Track if deep search is active
  const [totalBillsInDb, setTotalBillsInDb] = useState(0); // NEW: Total count in database
  const BILLS_PER_PAGE = 50;

  useEffect(() => {
    fetchAllBillsOptimized();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sponsorFilter, committeeFilter, dateRangeFilter, statusFilter]);

  // NEW: Trigger deep search when user types 3+ characters
  useEffect(() => {
    if (searchTerm.length >= 3) {
      performDeepSearch(searchTerm);
    } else {
      setIsDeepSearch(false);
    }
  }, [searchTerm]);

  const fetchAllBillsOptimized = async () => {
    try {
      setLoading(true);
      setError(null);

      // NEW: Get total count first
      const { count } = await supabase
        .from("Bills")
        .select("*", { count: 'exact', head: true });

      setTotalBillsInDb(count || 0);

      // Step 1: Fetch 1000 most recent bills (increased from 200)
      const { data: billsData, error: billsError } = await supabase
        .from("Bills")
        .select("*")
        .order("last_action_date", {
          ascending: false,
          nullsFirst: false
        })
        .limit(1000); // INCREASED from 200 to 1000

      if (billsError) throw billsError;

      // Step 2: Fetch ALL sponsors for ALL bills in ONE query
      const billIds = billsData.map(b => b.bill_id);
      const { data: sponsorsData } = await supabase
        .from("Sponsors")
        .select("bill_id, people_id, position")
        .in("bill_id", billIds)
        .order("position", { ascending: true });

      // Step 3: Fetch ALL people referenced by sponsors in ONE query
      const peopleIds = [...new Set(sponsorsData?.map(s => s.people_id).filter(Boolean) || [])];
      const { data: peopleData } = await supabase
        .from("People")
        .select("people_id, name, party, chamber")
        .in("people_id", peopleIds);

      // Step 4: Join data in memory (instant, no DB lag)
      const peopleMap = new Map(peopleData?.map(p => [p.people_id, p]) || []);
      const sponsorsByBill = new Map<number, Array<{ name: string | null; party: string | null; chamber: string | null }>>();

      sponsorsData?.forEach(sponsor => {
        if (!sponsorsByBill.has(sponsor.bill_id)) {
          sponsorsByBill.set(sponsor.bill_id, []);
        }
        const person = peopleMap.get(sponsor.people_id);
        if (person) {
          sponsorsByBill.get(sponsor.bill_id)!.push({
            name: person.name,
            party: person.party,
            chamber: person.chamber
          });
        }
      });

      // Step 5: Attach sponsors to bills
      const billsWithSponsors = billsData.map(bill => ({
        ...bill,
        sponsors: sponsorsByBill.get(bill.bill_id) || []
      }));

      setBills(billsWithSponsors);
    } catch (err) {
      setError("Failed to load bills. Please try again.");
      console.error("Bills fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Deep search function - searches ALL 18K+ bills in database
  const performDeepSearch = async (term: string) => {
    if (term.length < 3) return;

    try {
      setIsDeepSearch(true);

      const searchPattern = `%${term}%`;

      // Server-side search across all bills
      const { data: searchResults, error: searchError } = await supabase
        .from("Bills")
        .select("*")
        .or(`title.ilike.${searchPattern},bill_number.ilike.${searchPattern},description.ilike.${searchPattern},status_desc.ilike.${searchPattern}`)
        .order("last_action_date", { ascending: false })
        .limit(500); // Return top 500 most relevant results

      if (searchError) throw searchError;

      // Fetch sponsors for search results
      const billIds = searchResults?.map(b => b.bill_id) || [];
      if (billIds.length > 0) {
        const { data: sponsorsData } = await supabase
          .from("Sponsors")
          .select("bill_id, people_id, position")
          .in("bill_id", billIds)
          .order("position", { ascending: true });

        const peopleIds = [...new Set(sponsorsData?.map(s => s.people_id).filter(Boolean) || [])];
        const { data: peopleData } = await supabase
          .from("People")
          .select("people_id, name, party, chamber")
          .in("people_id", peopleIds);

        const peopleMap = new Map(peopleData?.map(p => [p.people_id, p]) || []);
        const sponsorsByBill = new Map<number, Array<{ name: string | null; party: string | null; chamber: string | null }>>();

        sponsorsData?.forEach(sponsor => {
          if (!sponsorsByBill.has(sponsor.bill_id)) {
            sponsorsByBill.set(sponsor.bill_id, []);
          }
          const person = peopleMap.get(sponsor.people_id);
          if (person) {
            sponsorsByBill.get(sponsor.bill_id)!.push({
              name: person.name,
              party: person.party,
              chamber: person.chamber
            });
          }
        });

        const billsWithSponsors = searchResults.map(bill => ({
          ...bill,
          sponsors: sponsorsByBill.get(bill.bill_id) || []
        }));

        setBills(billsWithSponsors);
      } else {
        setBills([]);
      }
    } catch (err) {
      console.error("Deep search error:", err);
      // Fall back to regular filtering if deep search fails
      setIsDeepSearch(false);
    }
  };

  // Instant filtering using useMemo (Committees pattern)
  const filteredBills = useMemo(() => {
    let filtered = bills;

    // Apply search filter (only if NOT in deep search mode - deep search already filtered)
    if (searchTerm && searchTerm.trim() && !isDeepSearch) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(bill => {
        // Safe string matching - convert everything to string first
        const titleMatch = String(bill.title || '').toLowerCase().includes(term);
        const numberMatch = String(bill.bill_number || '').toLowerCase().includes(term);
        const descriptionMatch = String(bill.description || '').toLowerCase().includes(term);
        const summaryMatch = String(bill.summary || '').toLowerCase().includes(term);
        const statusMatch = String(bill.status || '').toLowerCase().includes(term);
        const statusDescMatch = String(bill.status_desc || '').toLowerCase().includes(term);
        const sponsorMatch = bill.sponsors?.some(sponsor =>
          String(sponsor.name || '').toLowerCase().includes(term)
        ) || false;

        return titleMatch || numberMatch || descriptionMatch || summaryMatch || statusMatch || statusDescMatch || sponsorMatch;
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

    // NEW: Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(bill => bill.status_desc === statusFilter);
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

    return filtered;
  }, [bills, searchTerm, sponsorFilter, committeeFilter, dateRangeFilter, statusFilter, isDeepSearch]);

  // Paginate the filtered results
  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * BILLS_PER_PAGE;
    const endIndex = startIndex + BILLS_PER_PAGE;
    return filteredBills.slice(startIndex, endIndex);
  }, [filteredBills, currentPage]);

  const loadMoreBills = () => {
    setCurrentPage(prev => prev + 1);
  };

  const fetchBills = () => {
    fetchAllBillsOptimized();
  };

  const hasMorePages = currentPage * BILLS_PER_PAGE < filteredBills.length;

  return {
    bills: paginatedBills,
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
    statusFilter, // NEW
    setStatusFilter, // NEW
    fetchBills,
    loadMoreBills,
    hasNextPage: hasMorePages,
    totalBills: filteredBills.length,
    currentPageBills: paginatedBills.length,
    currentPage,
    isDeepSearch, // NEW: Expose deep search state
    totalBillsInDb, // NEW: Expose total count
  };
};
