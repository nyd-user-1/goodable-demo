import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from "@/components/ui/menubar";

// Custom icon components for each provider
const OpenAIIcon = ({ className }: { className?: string }) => (
  <img 
    src="/OAI LOGO.png" 
    alt="OpenAI"
    className={`object-contain ${className}`}
    style={{ maxWidth: '12px', maxHeight: '12px', width: 'auto', height: 'auto' }}
  />
);

const ClaudeIcon = ({ className }: { className?: string }) => (
  <img 
    src="/claude-ai-icon-65aa.png" 
    alt="Claude"
    className={`object-contain ${className}`}
    style={{ maxWidth: '12px', maxHeight: '12px', width: 'auto', height: 'auto' }}
  />
);

const PerplexityIcon = ({ className }: { className?: string }) => (
  <img 
    src="/PPLX LOGO.png" 
    alt="Perplexity"
    className={`object-contain ${className}`}
    style={{ maxWidth: '12px', maxHeight: '12px', width: 'auto', height: 'auto' }}
  />
);

export type ModelProvider = "openai" | "anthropic" | "perplexity";
export type ModelType = "gpt-4o-mini" | "gpt-4o" | "claude-3-5-sonnet-20241022" | "claude-3-5-haiku-20241022" | "sonar" | "sonar-pro";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const models: Record<ModelProvider, { name: string; icon: React.ComponentType<{ className?: string }>; color: string; models: { id: ModelType; name: string; description: string }[] }> = {
  openai: {
    name: "OpenAI",
    icon: OpenAIIcon,
    color: "text-green-600",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "Most capable model" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and efficient" },
    ]
  },
  anthropic: {
    name: "Anthropic",
    icon: ClaudeIcon,
    color: "text-orange-600",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Most intelligent model" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Fast and versatile" },
    ]
  },
  perplexity: {
    name: "Perplexity",
    icon: PerplexityIcon,
    color: "text-blue-600",
    models: [
      { id: "sonar-pro", name: "Sonar Large", description: "Large model with web access" },
      { id: "sonar", name: "Sonar Small", description: "Efficient with web access" },
    ]
  }
};

export const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  return (
    <Menubar>
      {Object.entries(models).map(([providerId, provider]) => {
        const Icon = provider.icon;
        return (
          <MenubarMenu key={providerId}>
            <MenubarTrigger className="cursor-pointer">
              <Icon className="h-4 w-4" />
            </MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value={selectedModel} onValueChange={onModelChange}>
                {provider.models.map((model) => (
                  <MenubarRadioItem
                    key={model.id}
                    value={model.id}
                    className="cursor-pointer"
                  >
                    {model.name}
                  </MenubarRadioItem>
                ))}
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        );
      })}
    </Menubar>
  );
};