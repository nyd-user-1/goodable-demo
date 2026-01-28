import { Tables } from "@/integrations/supabase/types";
import { PerplexityCitation } from "@/hooks/chat/types";

export type ChatSession = Tables<"chat_sessions">;

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: PerplexityCitation[];
  reasoning?: string;
  model?: string;
  isStreaming?: boolean;
}