import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ProblemChat } from "@/hooks/useProblemChats";

interface ProblemConversationViewProps {
  problemChat: ProblemChat;
  onCopy: (text: string) => void;
}

export const ProblemConversationView = ({ problemChat, onCopy }: ProblemConversationViewProps) => {
  return (
    <ScrollArea className="h-[300px] sm:h-[400px] w-full rounded-md border p-2 sm:p-4">
      <div className="space-y-4">
        {/* Problem Statement */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Original Problem:</h4>
          <div className="text-sm bg-muted/50 p-2 sm:p-3 rounded-md leading-relaxed break-words overflow-hidden">
            {problemChat.problem_statement}
          </div>
        </div>

        {/* Current State/Response */}
        {problemChat.current_state && 
         problemChat.current_state !== 'draft' && 
         problemChat.current_state !== 'generating' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">AI Analysis:</h4>
            <div className="text-sm bg-primary/5 p-2 sm:p-3 rounded-md leading-relaxed break-words overflow-hidden">
              {problemChat.current_state}
            </div>
          </div>
        )}

        {problemChat.current_state === 'generating' && (
          <div className="text-sm text-muted-foreground italic flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            Generating AI analysis...
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-1 sm:gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy(problemChat.problem_statement)}
            className="h-6 sm:h-7 px-2 sm:px-3 text-xs"
          >
            Copy Problem
          </Button>
          {problemChat.current_state && 
           problemChat.current_state !== 'draft' && 
           problemChat.current_state !== 'generating' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(problemChat.current_state)}
              className="h-6 sm:h-7 px-2 sm:px-3 text-xs"
            >
              Copy Response
            </Button>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Problem #{problemChat.problem_number}</span>
        </div>
      </div>
    </ScrollArea>
  );
};