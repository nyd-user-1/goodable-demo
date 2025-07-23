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
    committeeFilter,
    setCommitteeFilter,
    dateRangeFilter,
    setDateRangeFilter,
    fetchBills,
    loadMoreBills,
    hasNextPage,
    totalBills,
    currentPageBills,
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
    committee: string;
  }) => {
    setSearchTerm(newFilters.search);
    setSponsorFilter(newFilters.sponsor);
    setCommitteeFilter(newFilters.committee);
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

  const hasFilters = searchTerm !== "" || sponsorFilter !== "" || committeeFilter !== "" || dateRangeFilter !== "";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <BillsHeader billsCount={totalBills} />
        
        <BillsSearchFilters
          filters={{
            search: searchTerm,
            sponsor: sponsorFilter,
            committee: committeeFilter,
          }}
          onFiltersChange={handleFiltersChange}
          committees={committees}
          sponsors={sponsors}
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