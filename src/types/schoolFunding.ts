// SchoolFunding type matching Supabase school_funding table (raw data)
export interface SchoolFunding {
  id: number;
  enacted_budget: string | null;
  "BEDS Code": string | null;
  "County": string | null;
  "District": string | null;
  aid_category: string | null;
  base_year: string | null;
  school_year: string | null;
  "Change": string | null;
  percent_change: string | null;
}

// SchoolFundingTotals type matching school_funding_totals table (aggregated)
export interface SchoolFundingTotals {
  id: number;
  enacted_budget: string;
  district: string;
  county: string | null;
  total_base_year: number;
  total_school_year: number;
  total_change: number;
  percent_change: number;
  category_count: number;
}
