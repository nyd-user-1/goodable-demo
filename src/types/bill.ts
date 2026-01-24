// Bill type matching Supabase Bills table (snake_case columns)
export interface Bill {
  bill_id: number;
  bill_number: string | null;
  title: string | null;
  description: string | null;
  status: number | null;
  status_desc: string | null;
  status_date: string | null;
  committee: string | null;
  committee_id: string | null;
  last_action: string | null;
  last_action_date: string | null;
  session_id: number | null;
  state_link: string | null;
  url: string | null;
  sponsor_name?: string | null;
}
