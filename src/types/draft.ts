export interface LegislativeDraft {
  id: string;
  title: string;
  draft_content: string;
  type?: string | null;
  status: string;
  is_public: boolean | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  legislative_idea_id?: string | null;
  co_author_count?: number | null;
  analysis?: any;
  votes?: any;
}

export interface CoAuthor {
  id: string;
  user_id: string;
  legislative_draft_id: string;
  role: string;
  status: string;
  invited_by: string;
  invited_at: string;
  accepted_at?: string | null;
  created_at: string;
  updated_at: string;
  legislative_drafts?: any;
  profiles?: any;
}

export interface DraftFilters {
  status?: string;
  type?: string;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface DraftStats {
  totalDrafts: number;
  publishedDrafts: number;
  collaborativeDrafts: number;
  recentActivity: number;
}