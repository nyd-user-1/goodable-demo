// Contract type based on Supabase Contracts table
// Note: Column names have spaces/special chars in DB, mapped to camelCase here

export interface Contract {
  id: number;
  vendorName: string | null;
  departmentFacility: string | null;
  contractNumber: string | null;
  currentContractAmount: number | null;
  spendingToDate: string | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  contractDescription: string | null;
  contractType: string | null;
  originalContractApprovedDate: string | null;
}

// Raw database row type (matches actual column names)
export interface ContractRow {
  ID: number;
  "VENDOR NAME": string | null;
  "DEPARTMENT/FACILITY": string | null;
  "CONTRACT NUMBER": string | null;
  "CURRENT CONTRACT AMOUNT": number | null;
  "SPENDING TO DATE": string | null;
  "CONTRACT START DATE": string | null;
  "CONTRACT END DATE": string | null;
  "CONTRACT DESCRIPTION": string | null;
  "CONTRACT TYPE": string | null;
  "ORIGINAL CONTRACT APPROVED/FILED DATE": string | null;
}

// Transform raw DB row to clean Contract type
export function transformContract(row: ContractRow): Contract {
  return {
    id: row.ID,
    vendorName: row["VENDOR NAME"],
    departmentFacility: row["DEPARTMENT/FACILITY"],
    contractNumber: row["CONTRACT NUMBER"],
    currentContractAmount: row["CURRENT CONTRACT AMOUNT"],
    spendingToDate: row["SPENDING TO DATE"],
    contractStartDate: row["CONTRACT START DATE"],
    contractEndDate: row["CONTRACT END DATE"],
    contractDescription: row["CONTRACT DESCRIPTION"],
    contractType: row["CONTRACT TYPE"],
    originalContractApprovedDate: row["ORIGINAL CONTRACT APPROVED/FILED DATE"],
  };
}
