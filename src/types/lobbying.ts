// Lobbying types matching Supabase tables

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
  compensation: string | null;
  expenses_less_than_75: string | null;
  salaries_no_lobbying_employees: string | null;
  itemized_expenses: string | null;
  total_expenses: string | null;
  compensation_and_expenses: string | null;
}

// lobbyist_compensation table - Lobbyist earnings data
export interface LobbyistCompensation {
  id: number;
  principal_lobbyist: string | null;
  compensation: string | null;
  reimbursed_expenses: string | null;
  grand_total_compensation_expenses: string | null;
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
  compensation: string | null;
  reimbursed_expenses: string | null;
  grand_total_compensation_expenses: string | null;
  client_count: number;
  total_compensation: number | null;
  total_expenses: number | null;
}

// Union type for detail pages
export type LobbyingRecord =
  | { type: 'spend'; data: LobbyingSpend }
  | { type: 'compensation'; data: LobbyistCompensation };
