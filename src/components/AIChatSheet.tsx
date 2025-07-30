import React from "react";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import UnifiedChatSheet from "./features/chat/UnifiedChatSheet";

type Bill = Tables<"Bills">;
type Member = {
  people_id: number;
  name: string;
  party?: string;
  district?: string;
  chamber?: string;
};
type Committee = {
  committee_id: number;
  name: string;
  chamber: string;
  description?: string;
};

interface AIChatSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  bill?: Bill | null;
  member?: Member | null;
  committee?: Committee | null;
}

export const AIChatSheet = ({ bill, member, committee }: AIChatSheetProps) => {
  // Determine the entity and type for the chat session
  if (bill) {
    return (
      <UnifiedChatSheet
        chatType="bill"
        relatedId={bill.bill_id.toString()}
        title={bill.title || `Bill ${bill.bill_number}`}
        subtitle="AI Bill Analysis"
      >
        <Button size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Chat
        </Button>
      </UnifiedChatSheet>
    );
  }

  if (member) {
    return (
      <UnifiedChatSheet
        chatType="member"
        relatedId={member.people_id.toString()}
        title={member.name}
        subtitle="Legislator Chat"
      >
        <Button size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Chat
        </Button>
      </UnifiedChatSheet>
    );
  }

  if (committee) {
    return (
      <UnifiedChatSheet
        chatType="committee"
        relatedId={committee.committee_id.toString()}
        title={committee.name}
        subtitle="Committee Chat"
      >
        <Button size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Chat
        </Button>
      </UnifiedChatSheet>
    );
  }

  return null;
};