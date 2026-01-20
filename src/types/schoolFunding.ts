// SchoolFunding type matching Supabase school_funding table (raw data)
export interface SchoolFunding {
  id: number;
  "Event": string | null;
  "BEDS Code": string | null;
  "County": string | null;
  "District": string | null;
  "Aid Category": string | null;
  "Base Year": string | null;
  "School Year": string | null;
  "Change": string | null;
  "% Change": string | null;
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
