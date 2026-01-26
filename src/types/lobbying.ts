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

// lobbyist_compensation table - Lobbyist earnings data
export interface LobbyistCompensation {
  id: number;
  principal_lobbyist: string | null;
  compensation: string | null;
  reimbursed_expenses: string | null;
  grand_total_compensation_expenses: string | null;
}

// Union type for detail pages
export type LobbyingRecord =
  | { type: 'spend'; data: LobbyingSpend }
  | { type: 'compensation'; data: LobbyistCompensation };
