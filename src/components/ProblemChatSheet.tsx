import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import UnifiedChatSheet from "./features/chat/UnifiedChatSheet";

interface ProblemChatSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  userProblem: string;
  problemId?: string;
}

export const ProblemChatSheet = ({ userProblem, problemId }: ProblemChatSheetProps) => {
  const relatedId = problemId || `problem-${Date.now()}`;
  
  return (
    <UnifiedChatSheet
      chatType="problem"
      relatedId={relatedId}
      title={userProblem || "Problem Chat"}
      subtitle="Problem Analysis & Solutions"
    >
      <Button size="sm" className="gap-2">
        <MessageSquare className="h-4 w-4" />
        Chat
      </Button>
    </UnifiedChatSheet>
  );
};