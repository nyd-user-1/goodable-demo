// Member type matching Supabase People table (snake_case columns)
export interface Member {
  people_id: number;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  suffix: string | null;
  nickname: string | null;
  party: string | null;
  chamber: string | null;
  district: string | null;
  role: string | null;
  bio_short: string | null;
  bio_long: string | null;
  photo_url: string | null;
  email: string | null;
  phone_capitol: string | null;
  phone_district: string | null;
  address: string | null;
  nys_bio_url: string | null;
  archived: boolean | null;
}
