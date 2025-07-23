import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

interface MemberBill extends Bill {
  sponsor_position?: number;
}

export const useMemberBills = (memberId: number) => {
  const [bills, setBills] = useState<MemberBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (memberId) {
      fetchMemberBills();
    }
  }, [memberId]);

  const fetchMemberBills = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get the bill IDs where the member is the primary sponsor
      const { data: sponsorData, error: sponsorError } = await supabase
        .from("Sponsors")
        .select("bill_id, position")
        .eq("people_id", memberId)
        .eq("position", 1); // Primary sponsor only

      if (sponsorError) throw sponsorError;

      if (!sponsorData || sponsorData.length === 0) {
        setBills([]);
        return;
      }

      // Get the bill IDs
      const billIds = sponsorData.map(sponsor => sponsor.bill_id);

      // Then fetch the bills using those IDs
      const { data: billsData, error: billsError } = await supabase
        .from("Bills")
        .select("*")
        .in("bill_id", billIds)
        .order("bill_number", { ascending: true });

      if (billsError) throw billsError;

      // Transform the data to the expected format
      const memberBills = billsData?.map(bill => ({
        ...bill,
        sponsor_position: 1 // We know it's position 1 since we filtered for it
      })) || [];

      setBills(memberBills);
    } catch (err) {
      setError("Failed to load member bills. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load member bills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    bills,
    loading,
    error,
    refetch: fetchMemberBills,
  };
};