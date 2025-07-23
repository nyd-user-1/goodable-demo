export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  excerpt: string;
}

export type EntityType = 'bill' | 'member' | 'committee' | 'problem' | null;