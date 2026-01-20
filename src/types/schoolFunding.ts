// SchoolFunding type matching Supabase school_funding table
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
