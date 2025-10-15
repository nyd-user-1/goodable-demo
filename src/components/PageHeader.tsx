/**
 * PageHeader Component
 * Top-right header with Model Selector and Theme Toggle
 */

import { useState, useEffect } from "react";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { useModel } from "@/contexts/ModelContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChatGPTIcon, ClaudeIcon, PerplexityIcon } from "@/components/icons/ModelIcons";

const modelOptions = [
  { id: "gpt-4o", name: "GPT-4o", description: "Most capable model", IconComponent: ChatGPTIcon },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable", IconComponent: ChatGPTIcon },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Most intelligent model", IconComponent: ClaudeIcon },
  { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Fast and versatile", IconComponent: ClaudeIcon },
  { id: "sonar-pro", name: "Sonar Large", description: "Large model with web access", IconComponent: PerplexityIcon },
  { id: "sonar", name: "Sonar Small", description: "Efficient with web access", IconComponent: PerplexityIcon },
];

export function PageHeader() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { selectedModel, setSelectedModel } = useModel();

  useEffect(() => {
    const root = window.document.documentElement;
    const initialTheme = root.classList.contains('dark') ? 'dark' : 'light';
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    root.classList.toggle('dark');
    const newTheme = root.classList.contains('dark') ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const selectedModelOption = modelOptions.find(m => m.id === selectedModel) || modelOptions[0];
  const SelectedIcon = selectedModelOption.IconComponent;

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-3">
      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="h-10 w-10 rounded-xl bg-background border"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      {/* Model Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl bg-background border font-normal min-w-[180px] justify-between"
          >
            <div className="flex items-center gap-2.5">
              <SelectedIcon className="h-5 w-5" />
              <span className="text-sm font-medium">{selectedModelOption.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[320px] p-2">
          {modelOptions.map((model) => {
            const Icon = model.IconComponent;
            return (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={cn(
                  "cursor-pointer flex items-start gap-3 py-3 px-3 rounded-lg",
                  selectedModel === model.id && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 mt-0.5 flex-shrink-0",
                  selectedModel === model.id ? "text-primary-foreground" : "text-foreground"
                )} />
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="font-medium text-sm leading-tight">{model.name}</span>
                  <span className={cn(
                    "text-xs leading-tight",
                    selectedModel === model.id ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {model.description}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
