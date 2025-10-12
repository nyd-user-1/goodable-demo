import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BillDetail } from "@/components/BillDetail";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useBillsData } from "@/hooks/useBillsData";
import { 
  BillsHeader, 
  BillsSearchFilters, 
  BillsGrid, 
  BillsLoadingSkeleton, 
  BillsErrorState, 
  BillsEmptyState 
} from "@/components/features/bills";

type Bill = Tables<"Bills">;

const Bills = () => {
  const [searchParams] = useSearchParams();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [committees, setCommittees] = useState<Array<{ name: string; chamber: string }>>([]);
  const [sponsors, setSponsors] = useState<Array<{ name: string; chamber: string; party: string }>>([]);
  
  const {
    bills,
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
    hasNextPage,
    totalBills,
    currentPageBills,
    isDeepSearch, // NEW
    totalBillsInDb, // NEW
  } = useBillsData();

  // Handle URL parameter for selected bill
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && bills && bills.length > 0) {
      const bill = bills.find(b => b.bill_id.toString() === selectedId);
      if (bill) {
        setSelectedBill(bill);
      }
    }
  }, [searchParams, bills]);

  useEffect(() => {
    fetchCommittees();
    fetchSponsors();
  }, []);

  const fetchCommittees = async () => {
    try {
      const { data } = await supabase
        .from("Committees")
        .select("committee_name, chamber")
        .not("committee_name", "is", null)
        .order("committee_name");

      if (data) {
        const committees = data.map(item => ({
          name: item.committee_name || "",
          chamber: item.chamber || ""
        })).filter(c => c.name);
        setCommittees(committees);
      }
    } catch (error) {
    }
  };

  const fetchSponsors = async () => {
    try {
      const { data } = await supabase
        .from("People")
        .select("name, chamber, party")
        .not("name", "is", null)
        .order("name");

      if (data) {
        const sponsors = data.map(item => ({
          name: item.name || "",
          chamber: item.chamber || "",
          party: item.party || ""
        })).filter(s => s.name);
        setSponsors(sponsors);
      }
    } catch (error) {
    }
  };

  const handleBillSelect = (bill: Bill) => {
    setSelectedBill(bill);
  };

  const handleBackToBills = () => {
    setSelectedBill(null);
  };

  const handleFiltersChange = (newFilters: {
    search: string;
    sponsor: string;
    primarySponsor?: string; // NEW: Primary sponsor filter
    committee: string;
    status?: string; // NEW
    dateRange?: string; // NEW
  }) => {
    setSearchTerm(newFilters.search);
    setSponsorFilter(newFilters.sponsor);
    if (newFilters.primarySponsor !== undefined) setPrimarySponsorFilter(newFilters.primarySponsor); // NEW
    setCommitteeFilter(newFilters.committee);
    if (newFilters.status !== undefined) setStatusFilter(newFilters.status); // NEW
    if (newFilters.dateRange !== undefined) setDateRangeFilter(newFilters.dateRange); // NEW
  };

  if (selectedBill) {
    return (
      <BillDetail bill={selectedBill} onBack={handleBackToBills} />
    );
  }

  if (loading) {
    return <BillsLoadingSkeleton />;
  }

  if (error) {
    return <BillsErrorState error={error} onRetry={fetchBills} />;
  }

  const hasFilters = searchTerm !== "" || sponsorFilter !== "" || primarySponsorFilter !== "" || committeeFilter !== "" || dateRangeFilter !== "" || statusFilter !== "";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <BillsHeader
          billsCount={isDeepSearch ? `${totalBills} of ${totalBillsInDb.toLocaleString()}` : `${totalBills} of 1,000 loaded`}
        />

        <BillsSearchFilters
          filters={{
            search: searchTerm,
            sponsor: sponsorFilter,
            primarySponsor: primarySponsorFilter, // NEW: Primary sponsor filter
            committee: committeeFilter,
            status: statusFilter, // NEW
            dateRange: dateRangeFilter, // NEW
          }}
          onFiltersChange={handleFiltersChange}
          committees={committees}
          sponsors={sponsors}
          isDeepSearch={isDeepSearch} // NEW
          totalBillsInDb={totalBillsInDb} // NEW
          totalFiltered={totalBills} // NEW
        />

        {bills.length === 0 ? (
          <BillsEmptyState hasFilters={hasFilters} />
        ) : (
          <div className="space-y-6">
            <BillsGrid bills={bills} onBillSelect={handleBillSelect} />
            
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {currentPageBills} of {totalBills.toLocaleString()} bills
              </div>
              
              {hasNextPage && (
                <button
                  onClick={loadMoreBills}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Loading..." : "Load More Bills"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bills;