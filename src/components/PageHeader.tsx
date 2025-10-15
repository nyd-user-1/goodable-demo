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

const modelOptions = [
  { id: "gpt-4o", name: "GPT-4o", description: "Most capable model", icon: "🤖" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable", icon: "🤖" },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Most intelligent model", icon: "🧠" },
  { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Fast and versatile", icon: "🧠" },
  { id: "sonar-pro", name: "Sonar Large", description: "Large model with web access", icon: "🔍" },
  { id: "sonar", name: "Sonar Small", description: "Efficient with web access", icon: "🔍" },
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

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9 rounded-lg bg-background border"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>

      {/* Model Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-9 px-3 rounded-lg bg-background border font-normal min-w-[160px] justify-between"
          >
            <div className="flex items-center gap-2">
              <span>{selectedModelOption.icon}</span>
              <span className="text-sm">{selectedModelOption.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[280px]">
          {modelOptions.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={cn(
                "cursor-pointer flex flex-col items-start gap-1 py-3",
                selectedModel === model.id && "bg-accent"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <span>{model.icon}</span>
                <span className="font-medium">{model.name}</span>
              </div>
              <span className="text-xs text-muted-foreground ml-6">{model.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
