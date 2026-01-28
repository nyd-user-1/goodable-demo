export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: PerplexityCitation[];
  reasoning?: string;
  model?: string;
  isStreaming?: boolean;
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  excerpt: string;
}

export interface PerplexityCitation {
  id: string;
  index: number;
  url: string;
  title?: string;
  snippet?: string;
  publishedDate?: string;
  author?: string;
  favicon?: string;
}

export type EntityType = 'bill' | 'member' | 'committee' | 'problem' | null;