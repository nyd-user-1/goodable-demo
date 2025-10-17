"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type ModelProvider = "openai" | "anthropic" | "perplexity";
export type ModelType = "gpt-4o-mini" | "gpt-4o" | "claude-3-5-sonnet-20241022" | "claude-3-5-haiku-20241022" | "sonar" | "sonar-pro";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const models = [
  {
    value: "gpt-4o",
    label: "GPT-4o",
  },
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
  },
  {
    value: "claude-3-5-sonnet-20241022",
    label: "Claude 3.5 Sonnet",
  },
  {
    value: "claude-3-5-haiku-20241022",
    label: "Claude 3.5 Haiku",
  },
  {
    value: "sonar-pro",
    label: "Sonar Large",
  },
  {
    value: "sonar",
    label: "Sonar Small",
  },
] as const;

export const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedModel
            ? models.find((model) => model.value === selectedModel)?.label
            : "Select model..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={(currentValue) => {
                    onModelChange(currentValue as ModelType)
                    setOpen(false)
                  }}
                  className="data-[selected='true']:bg-[hsl(0_0%_63.9%)] data-[selected=true]:bg-[hsl(0_0%_63.9%)] data-[selected='true']:text-white data-[selected=true]:text-white dark:data-[selected='true']:bg-[hsl(0_0%_20%)] dark:data-[selected=true]:bg-[hsl(0_0%_20%)]"
                >
                  {model.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedModel === model.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
