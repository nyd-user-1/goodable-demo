import { useState, useEffect, useMemo } from "react";
import { useChatSessions } from "@/pages/chats/hooks/useChatSessions";
import { useProblemChats } from "@/hooks/useProblemChats";

export interface SearchableChat {
  id: string;
  title: string;
  type: "problem" | "bill" | "member" | "committee" | "other";
  url: string;
  created_at: string;
  preview?: string;
}

export const useSearchChats = () => {
  const { chatSessions, loading: sessionsLoading } = useChatSessions();
  const { problemChats, loading: problemLoading } = useProblemChats();
  const [searchQuery, setSearchQuery] = useState("");

  const allChats = useMemo<SearchableChat[]>(() => {
    const chats: SearchableChat[] = [];

    // Add problem chats
    problemChats.forEach(chat => {
      chats.push({
        id: chat.id,
        title: chat.title,
        type: "problem",
        url: `/problems/${chat.problem_number}`,
        created_at: chat.created_at,
        preview: chat.problem_statement?.substring(0, 100),
      });
    });

    // Add chat sessions and categorize them
    chatSessions.forEach(session => {
      let type: SearchableChat["type"] = "other";
      let url = `/chats`;

      if (session.bill_id || session.title.toLowerCase().includes('bill')) {
        type = "bill";
        url = session.bill_id ? `/bills/${session.bill_id}` : "/chats";
      } else if (session.member_id || session.title.toLowerCase().includes('member')) {
        type = "member";
        url = session.member_id ? `/members/${session.member_id}` : "/chats";
      } else if (session.committee_id || session.title.toLowerCase().includes('committee')) {
        type = "committee";
        url = session.committee_id ? `/committees/${session.committee_id}` : "/chats";
      }

      // Extract preview from messages if available
      let preview = "";
      if (session.messages && Array.isArray(session.messages) && session.messages.length > 0) {
        const firstUserMessage = session.messages.find((m: any) => m.role === "user");
        if (firstUserMessage?.content) {
          preview = firstUserMessage.content.substring(0, 100);
        }
      }

      chats.push({
        id: session.id,
        title: session.title,
        type,
        url,
        created_at: session.created_at || "",
        preview,
      });
    });

    // Sort by created_at descending
    return chats.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [chatSessions, problemChats]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return allChats;
    }

    const query = searchQuery.toLowerCase();
    return allChats.filter(chat =>
      chat.title.toLowerCase().includes(query) ||
      chat.type.toLowerCase().includes(query) ||
      chat.preview?.toLowerCase().includes(query)
    );
  }, [allChats, searchQuery]);

  const loading = sessionsLoading || problemLoading;

  return {
    allChats,
    filteredChats,
    searchQuery,
    setSearchQuery,
    loading,
  };
};
