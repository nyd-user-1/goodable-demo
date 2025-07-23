export interface SearchResult {
  id: string;
  title: string;
  type: 'problem' | 'idea' | 'draft' | 'media' | 'bill' | 'member' | 'committee';
  content: string;
  created_at: string;
  url: string;
}