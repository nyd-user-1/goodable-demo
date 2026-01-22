import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BillDetail } from "@/components/BillDetail";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillDetailPage() {
  const { billNumber } = useParams<{ billNumber: string }>();
  const navigate = useNavigate();

  const { data: bill, isLoading, error } = useQuery({
    queryKey: ['bill', billNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Bills')
        .select('*')
        .eq('bill_number', billNumber)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!billNumber,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Bill not found</p>
      </div>
    );
  }

  return <BillDetail bill={bill} onBack={() => navigate('/bills')} />;
}
