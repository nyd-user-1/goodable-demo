import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Bot, Zap, Search } from "lucide-react";

export type ModelProvider = "openai";
export type ModelType = "gpt-4o-mini" | "gpt-4o";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const models: Record<ModelProvider, { name: string; models: { id: ModelType; name: string; description: string }[] }> = {
  openai: {
    name: "OpenAI",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "Most capable model" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and efficient" },
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
        <Button variant="outline" className="min-w-[200px] justify-between">
          <span className="truncate">{currentModel.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {Object.entries(models).map(([providerId, provider]) => (
          <div key={providerId}>
            {provider.models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={`cursor-pointer ${selectedModel === model.id ? 'bg-accent' : ''}`}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-green-600" />
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
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};