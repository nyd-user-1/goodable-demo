import { Tables } from "@/integrations/supabase/types";

export type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

export interface BillsTableProps {
  bills: Bill[];
  onBillSelect?: (bill: Bill) => void;
}