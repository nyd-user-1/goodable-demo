// Budget Appropriations (budget_2027-aprops table)
export interface BudgetAppropriation {
  "Agency Name": string | null;
  "Fund Type": string | null;
  "Fund Name": string | null;
  "Subfund": string | null;
  "Subfund Name": string | null;
  "Program Name": string | null;
  "Appropriation Category": string | null;
  "Appropriations Available 2025-26": string | null;
  "Appropriations Recommended 2026-27": string | null;
  "Reappropriations Recommended 2026-27": string | null;
  "Estimated FTEs 03/31/2026": string | null;
  "Estimated FTEs 03/31/2027": string | null;
}

// Capital Appropriations (budget_2027_capital_aprops table)
export interface BudgetCapital {
  "Agency Name": string | null;
  "Reference Number": string | null;
  "Program Name": string | null;
  "State Purpose": string | null;
  "Fund Name": string | null;
  "Financing Source": string | null;
  "Chapter/Section/Year": string | null;
  "Description": string | null;
  "Reappropriations Recommended 2026-27": string | null;
  "Encumbrance as of 1/16/2026": string | null;
  "Appropriations Recommended 2026-27": string | null;
}

// Spending (budget_2027_spending table) — only recent years included
export interface BudgetSpending {
  "Function": string | null;
  "Agency": string | null;
  "Fund Type": string | null;
  "FP Category": string | null;
  "Fund": string | null;
  "Subfund": string | null;
  "Subfund Name": string | null;
  "2026-27 Estimates": string | null;
  "2025-26 Estimates": string | null;
  "2024-25 Actuals": string | null;
  "2023-24 Actuals": string | null;
  "2022-23 Actuals": string | null;
  [key: string]: string | null;
}
