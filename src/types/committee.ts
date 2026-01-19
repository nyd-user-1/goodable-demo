// Committee type matching Supabase Committees table (snake_case columns)
export interface Committee {
  committee_id: number;
  committee_name: string | null;
  chamber: string | null;
  chair_name: string | null;
  chair_email: string | null;
  description: string | null;
  member_count: string | null;
  active_bills_count: string | null;
  meeting_schedule: string | null;
  next_meeting: string | null;
  upcoming_agenda: string | null;
  committee_url: string | null;
  address: string | null;
  committee_members: string | null;
  slug: string | null;
}
