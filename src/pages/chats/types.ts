import { Tables } from "@/integrations/supabase/types";

export type ChatSession = Tables<"chat_sessions">;

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}