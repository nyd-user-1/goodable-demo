import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, CircuitBoard } from "lucide-react";

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
  const getCurrentModelInfo = () => {
    for (const provider of Object.values(models)) {
      const model = provider.models.find(m => m.id === selectedModel);
      if (model) return model;
    }
    return models.openai.models[1]; // gpt-4o-mini as default
  };

  const currentModel = getCurrentModelInfo();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="small-button relative h-9 w-9">
          <CircuitBoard className="h-4 w-4" />
          <span className="sr-only">Select AI Model</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {Object.entries(models).map(([providerId, provider], providerIndex) => (
          <div key={providerId}>
            {providerIndex > 0 && <DropdownMenuSeparator />}
            {provider.models.map((model) => {
              const Icon = provider.icon;
              return (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onModelChange(model.id)}
                  className={`cursor-pointer ${selectedModel === model.id ? 'bg-accent' : ''}`}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 bg-muted/50 rounded-full flex items-center justify-center">
                        <Icon className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{model.name}</p>
                        {selectedModel === model.id && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};