
import { Button } from "@/components/ui/button";
import { ContextBuilder } from "@/utils/contextBuilder";
import { EntityType } from "@/hooks/chat/types";
import { MorphingHeartLoader } from "@/components/ui/MorphingHeartLoader";

type Entity = any;

interface SuggestedPromptsProps {
  entity: Entity;
  entityType: EntityType;
  onPromptClick: (prompt: string) => void;
  isLoading: boolean;
  showPrompts: boolean;
  hasMessages: boolean;
}

export const SuggestedPrompts = ({ 
  entity, 
  entityType, 
  onPromptClick, 
  isLoading, 
  showPrompts,
  hasMessages
}: SuggestedPromptsProps) => {
  // Don't show prompts if there are already messages or if showPrompts is false
  if (!showPrompts || hasMessages) return null;

  const prompts = ContextBuilder.generateDynamicPrompts(entity, entityType);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Suggested prompts:</h4>
      {isLoading ? null : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {prompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-3 px-4 text-left whitespace-normal min-w-[160px] max-w-[180px] flex-shrink-0 leading-tight text-sm"
              onClick={() => onPromptClick(prompt)}
              disabled={isLoading}
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
