// Lobbying types matching Supabase tables

// "Lobbying Spend" table - Client spending data
export interface LobbyingSpend {
  id: number;
  "Contractual Client": string | null;
  Compensation: string | null;
  "Expenses less than $75": string | null;
  "Salaries of non-lobbying employees": string | null;
  "Itemized Expenses": string | null;
  "Total Expenses": string | null;
  "Compensation + Expenses": string | null;
}

// "Lobbyist Compensation" table - Lobbyist earnings data
export interface LobbyistCompensation {
  id: number;
  "Principal Lobbyist": string | null;
  Compensation: string | null;
  "Reimbursed Expenses": string | null;
  "Grand Total of Compensation and Reimbursed Expenses": string | null;
}

// Union type for detail pages
export type LobbyingRecord =
  | { type: 'spend'; data: LobbyingSpend }
  | { type: 'compensation'; data: LobbyistCompensation };
