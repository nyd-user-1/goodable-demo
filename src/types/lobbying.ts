// Lobbying types matching Supabase tables

// Monetary fields can be numeric (after DB migration) or string (legacy)
type MonetaryField = string | number | null;

// lobbyists master table - Normalized lobbyist data
export interface Lobbyist {
  id: number;
  name: string;
  normalized_name: string;
  type_of_lobbyist: string | null;
  created_at: string;
}

// lobbying_spend table - Client spending data
export interface LobbyingSpend {
  id: number;
  contractual_client: string | null;
  compensation: MonetaryField;
  expenses_less_than_75: MonetaryField;
  salaries_no_lobbying_employees: MonetaryField;
  itemized_expenses: MonetaryField;
  total_expenses: MonetaryField;
  compensation_and_expenses: MonetaryField;
}

// lobbyist_compensation table - Lobbyist earnings data
export interface LobbyistCompensation {
  id: number;
  principal_lobbyist: string | null;
  compensation: MonetaryField;
  reimbursed_expenses: MonetaryField;
  grand_total_compensation_expenses: MonetaryField;
  lobbyist_id: number | null;
  normalized_lobbyist: string | null;
}

// lobbyists_clients table - Client relationships for each lobbyist
export interface LobbyistClient {
  id: number;
  principal_lobbyist: string | null;
  contractual_client: string | null;
  start_date: string | null;
  lobbyist_id: number | null;
  normalized_lobbyist: string | null;
}

// lobbyist_full_profile view - Comprehensive lobbyist data
export interface LobbyistFullProfile {
  lobbyist_id: number;
  lobbyist_name: string;
  normalized_name: string;
  type_of_lobbyist: string | null;
  compensation: MonetaryField;
  reimbursed_expenses: MonetaryField;
  grand_total_compensation_expenses: MonetaryField;
  client_count: number;
  total_compensation: number | null;
  total_expenses: number | null;
}

// Union type for detail pages
export type LobbyingRecord =
  | { type: 'spend'; data: LobbyingSpend }
  | { type: 'compensation'; data: LobbyistCompensation };
