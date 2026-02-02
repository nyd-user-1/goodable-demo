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
  const [primarySponsorFilter, setPrimarySponsorFilter] = useState(""); // NEW: Primary sponsor filter
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // NEW: Status filter
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeepSearch, setIsDeepSearch] = useState(false); // NEW: Track if deep search is active
  const [totalBillsInDb, setTotalBillsInDb] = useState(0); // NEW: Total count in database
  const [serverOffset, setServerOffset] = useState(0);
  const [hasMoreServerData, setHasMoreServerData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const BILLS_PER_PAGE = 50;
  const SERVER_PAGE_SIZE = 100;

  useEffect(() => {
    fetchAllBillsOptimized();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sponsorFilter, primarySponsorFilter, committeeFilter, dateRangeFilter, statusFilter]);

  // NEW: Trigger deep search when user types 3+ characters
  useEffect(() => {
    if (searchTerm.length >= 3) {
      performDeepSearch(searchTerm);
    } else if (searchTerm.length === 0 && !sponsorFilter && !primarySponsorFilter && !committeeFilter) {
      // If search cleared and no other filters active, reload initial bills
      setIsDeepSearch(false);
      fetchAllBillsOptimized();
    } else if (!sponsorFilter && !primarySponsorFilter && !committeeFilter) {
      // Only reset deep search flag if no other filters are active
      setIsDeepSearch(false);
    }
  }, [searchTerm]);

  // NEW: Trigger server-side query when sponsor filter is applied
  useEffect(() => {
    if (sponsorFilter) {
      performSponsorFilter(sponsorFilter);
    } else if (!searchTerm || searchTerm.length < 3) {
      // If sponsor filter cleared and no deep search, reload initial bills
      if (!committeeFilter && !primarySponsorFilter) {
        fetchAllBillsOptimized();
      }
    }
  }, [sponsorFilter]);

  // NEW: Trigger server-side query when primary sponsor filter is applied
  useEffect(() => {
    if (primarySponsorFilter) {
      performPrimarySponsorFilter(primarySponsorFilter);
    } else if (!searchTerm || searchTerm.length < 3) {
      // If primary sponsor filter cleared and no deep search, reload initial bills
      if (!committeeFilter && !sponsorFilter) {
        fetchAllBillsOptimized();
      }
    }
  }, [primarySponsorFilter]);

  // NEW: Trigger server-side query when committee filter is applied
  useEffect(() => {
    if (committeeFilter) {
      performCommitteeFilter(committeeFilter);
    } else if (!searchTerm || searchTerm.length < 3) {
      // If committee filter cleared and no deep search, reload initial bills
      if (!sponsorFilter && !primarySponsorFilter) {
        fetchAllBillsOptimized();
      }
    }
  }, [committeeFilter]);

  const fetchAllBillsOptimized = async () => {
    try {
      setLoading(true);
      setError(null);

      // NEW: Get total count first
      const { count } = await supabase
        .from("Bills")
        .select("*", { count: 'exact', head: true });

      setTotalBillsInDb(count || 0);

      // Step 1: Fetch initial batch of recent bills
      const { data: billsData, error: billsError } = await supabase
        .from("Bills")
        .select("*")
        .order("last_action_date", {
          ascending: false,
          nullsFirst: false
        })
        .limit(SERVER_PAGE_SIZE);

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
      setServerOffset(SERVER_PAGE_SIZE);
      setHasMoreServerData((billsData?.length || 0) === SERVER_PAGE_SIZE);
    } catch (err) {
      setError("Failed to load bills. Please try again.");
      console.error("Bills fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load next batch of bills from server (for lazy loading)
  const loadMoreBillsFromServer = async () => {
    if (loadingMore || !hasMoreServerData || isDeepSearch) return;
    setLoadingMore(true);
    try {
      const { data: billsData, error: billsError } = await supabase
        .from("Bills")
        .select("*")
        .order("last_action_date", { ascending: false, nullsFirst: false })
        .range(serverOffset, serverOffset + SERVER_PAGE_SIZE - 1);

      if (billsError) throw billsError;
      if (!billsData || billsData.length === 0) {
        setHasMoreServerData(false);
        return;
      }

      const billIds = billsData.map(b => b.bill_id);
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

      const newBills = billsData.map(bill => ({
        ...bill,
        sponsors: sponsorsByBill.get(bill.bill_id) || []
      }));

      setBills(prev => [...prev, ...newBills]);
      setServerOffset(prev => prev + SERVER_PAGE_SIZE);
      setHasMoreServerData(billsData.length === SERVER_PAGE_SIZE);
    } catch (err) {
      console.error("Load more bills error:", err);
    } finally {
      setLoadingMore(false);
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

  // NEW: Sponsor filter - queries ALL bills sponsored by selected person (any position)
  const performSponsorFilter = async (sponsorName: string) => {
    try {
      setIsDeepSearch(true); // Use deep search state to indicate server-side filtering

      // Step 1: Find the person_id for this sponsor
      const { data: personData } = await supabase
        .from("People")
        .select("people_id")
        .eq("name", sponsorName)
        .single();

      if (!personData) {
        setBills([]);
        return;
      }

      // Step 2: Find all bills sponsored by this person
      const { data: sponsorshipData } = await supabase
        .from("Sponsors")
        .select("bill_id")
        .eq("people_id", personData.people_id);

      const billIds = sponsorshipData?.map(s => s.bill_id) || [];

      if (billIds.length === 0) {
        setBills([]);
        return;
      }

      // Step 3: Fetch those bills
      const { data: billsData } = await supabase
        .from("Bills")
        .select("*")
        .in("bill_id", billIds)
        .order("last_action_date", { ascending: false });

      // Step 4: Fetch sponsors for all these bills
      const { data: allSponsorsData } = await supabase
        .from("Sponsors")
        .select("bill_id, people_id, position")
        .in("bill_id", billIds)
        .order("position", { ascending: true });

      const peopleIds = [...new Set(allSponsorsData?.map(s => s.people_id).filter(Boolean) || [])];
      const { data: peopleData } = await supabase
        .from("People")
        .select("people_id, name, party, chamber")
        .in("people_id", peopleIds);

      const peopleMap = new Map(peopleData?.map(p => [p.people_id, p]) || []);
      const sponsorsByBill = new Map<number, Array<{ name: string | null; party: string | null; chamber: string | null }>>();

      allSponsorsData?.forEach(sponsor => {
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

      const billsWithSponsors = billsData?.map(bill => ({
        ...bill,
        sponsors: sponsorsByBill.get(bill.bill_id) || []
      })) || [];

      setBills(billsWithSponsors);
    } catch (err) {
      console.error("Sponsor filter error:", err);
      setIsDeepSearch(false);
    }
  };

  // NEW: Primary Sponsor filter - queries ALL bills where person is PRIMARY sponsor (position 1)
  const performPrimarySponsorFilter = async (sponsorName: string) => {
    try {
      setIsDeepSearch(true); // Use deep search state to indicate server-side filtering

      // Step 1: Find the person_id for this sponsor
      const { data: personData } = await supabase
        .from("People")
        .select("people_id")
        .eq("name", sponsorName)
        .single();

      if (!personData) {
        setBills([]);
        return;
      }

      // Step 2: Find all bills where this person is PRIMARY sponsor (position 1)
      const { data: sponsorshipData } = await supabase
        .from("Sponsors")
        .select("bill_id")
        .eq("people_id", personData.people_id)
        .eq("position", 1); // ONLY PRIMARY SPONSORS

      const billIds = sponsorshipData?.map(s => s.bill_id) || [];

      if (billIds.length === 0) {
        setBills([]);
        return;
      }

      // Step 3: Fetch those bills
      const { data: billsData } = await supabase
        .from("Bills")
        .select("*")
        .in("bill_id", billIds)
        .order("last_action_date", { ascending: false });

      // Step 4: Fetch sponsors for all these bills
      const { data: allSponsorsData } = await supabase
        .from("Sponsors")
        .select("bill_id, people_id, position")
        .in("bill_id", billIds)
        .order("position", { ascending: true });

      const peopleIds = [...new Set(allSponsorsData?.map(s => s.people_id).filter(Boolean) || [])];
      const { data: peopleData } = await supabase
        .from("People")
        .select("people_id, name, party, chamber")
        .in("people_id", peopleIds);

      const peopleMap = new Map(peopleData?.map(p => [p.people_id, p]) || []);
      const sponsorsByBill = new Map<number, Array<{ name: string | null; party: string | null; chamber: string | null }>>();

      allSponsorsData?.forEach(sponsor => {
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

      const billsWithSponsors = billsData?.map(bill => ({
        ...bill,
        sponsors: sponsorsByBill.get(bill.bill_id) || []
      })) || [];

      setBills(billsWithSponsors);
    } catch (err) {
      console.error("Primary sponsor filter error:", err);
      setIsDeepSearch(false);
    }
  };

  // NEW: Committee filter - queries ALL bills assigned to selected committee
  const performCommitteeFilter = async (committeeValue: string) => {
    try {
      setIsDeepSearch(true); // Use deep search state to indicate server-side filtering

      // Parse committee name from value format "Committee Name (Chamber)"
      const committeeName = committeeValue.replace(/\s*\([^)]*\)\s*$/, '').trim();

      // Query bills by committee using case-insensitive partial match
      const { data: billsData } = await supabase
        .from("Bills")
        .select("*")
        .ilike("committee", `%${committeeName}%`)
        .order("last_action_date", { ascending: false });

      if (!billsData || billsData.length === 0) {
        setBills([]);
        return;
      }

      const billIds = billsData.map(b => b.bill_id);

      // Fetch sponsors for these bills
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

      const billsWithSponsors = billsData.map(bill => ({
        ...bill,
        sponsors: sponsorsByBill.get(bill.bill_id) || []
      }));

      setBills(billsWithSponsors);
    } catch (err) {
      console.error("Committee filter error:", err);
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

    // NOTE: Sponsor and committee filters are now handled server-side via performSponsorFilter/performCommitteeFilter
    // So we DON'T need to filter them here - they're already filtered when isDeepSearch is true

    // NEW: Apply status filter (always client-side)
    if (statusFilter) {
      filtered = filtered.filter(bill => bill.status_desc === statusFilter);
    }

    // Apply date filter (always client-side)
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
  }, [bills, searchTerm, dateRangeFilter, statusFilter, isDeepSearch]);

  // Paginate the filtered results
  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * BILLS_PER_PAGE;
    const endIndex = startIndex + BILLS_PER_PAGE;
    return filteredBills.slice(startIndex, endIndex);
  }, [filteredBills, currentPage]);

  const loadMoreBills = () => {
    const nextPage = currentPage + 1;
    const nextEndIndex = nextPage * BILLS_PER_PAGE;
    // Auto-fetch from server when approaching the end of loaded data
    if (nextEndIndex >= bills.length - BILLS_PER_PAGE && hasMoreServerData && !loadingMore && !isDeepSearch) {
      loadMoreBillsFromServer();
    }
    setCurrentPage(nextPage);
  };

  const fetchBills = () => {
    fetchAllBillsOptimized();
  };

  const hasMorePages = currentPage * BILLS_PER_PAGE < filteredBills.length || (hasMoreServerData && !isDeepSearch);

  return {
    bills: paginatedBills,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sponsorFilter,
    setSponsorFilter,
    primarySponsorFilter, // NEW: Primary sponsor filter
    setPrimarySponsorFilter, // NEW: Primary sponsor filter setter
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
    loadingMore,
    loadMoreBillsFromServer,
    hasMoreServerData,
  };
};
