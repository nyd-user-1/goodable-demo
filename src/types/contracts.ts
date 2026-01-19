// Contract type matching Supabase Contracts table (snake_case columns)
export interface Contract {
  id: number;
  vendor_name: string | null;
  department_facility: string | null;
  contract_number: string | null;
  current_contract_amount: number | null;
  spending_to_date: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  contract_description: string | null;
  contract_type: string | null;
  original_contract_approved_file_date: string | null;
}
