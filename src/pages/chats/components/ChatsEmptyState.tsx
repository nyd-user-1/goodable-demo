import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export const ChatsEmptyState = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No chat sessions yet</h3>
        <p className="text-muted-foreground text-center">
          Start a conversation with AI on the Bills page to create your first chat session
        </p>
      </CardContent>
    </Card>
  );
};