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
  const [currentPage, setCurrentPage] = useState(1);
  const BILLS_PER_PAGE = 50;

  useEffect(() => {
    fetchAllBillsOptimized();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sponsorFilter, committeeFilter, dateRangeFilter]);

  const fetchAllBillsOptimized = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Fetch all bills in ONE query
      const { data: billsData, error: billsError } = await supabase
        .from("Bills")
        .select("*")
        .order("last_action_date", {
          ascending: false,
          nullsFirst: false
        })
        .limit(200);

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

  // Instant filtering using useMemo (Committees pattern)
  const filteredBills = useMemo(() => {
    let filtered = bills;

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(bill => {
        const titleMatch = bill.title?.toLowerCase().includes(term);
        const numberMatch = bill.bill_number?.toLowerCase().includes(term);
        const descriptionMatch = bill.description?.toLowerCase().includes(term);
        const summaryMatch = bill.summary?.toLowerCase().includes(term);
        const statusMatch = bill.status?.toLowerCase().includes(term);
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

    return filtered;
  }, [bills, searchTerm, sponsorFilter, committeeFilter, dateRangeFilter]);

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
    fetchBills,
    loadMoreBills,
    hasNextPage: hasMorePages,
    totalBills: filteredBills.length,
    currentPageBills: paginatedBills.length,
    currentPage,
  };
};
