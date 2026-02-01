"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { useModel, ModelType } from "@/contexts/ModelContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const models = [
  {
    value: "gpt-4o" as ModelType,
    label: "GPT-4o",
    description: "Most capable GPT model",
    logo: "/chatgpt-icon.svg",
  },
  {
    value: "gpt-4o-mini" as ModelType,
    label: "GPT-4o Mini",
    description: "Fast and efficient",
    logo: "/chatgpt-icon.svg",
  },
  {
    value: "claude-3-5-sonnet-20241022" as ModelType,
    label: "Claude 3.5 Sonnet",
    description: "Balanced performance",
    logo: "/claude-ai-icon.svg",
  },
  {
    value: "claude-3-5-haiku-20241022" as ModelType,
    label: "Claude 3.5 Haiku",
    description: "Quick responses",
    logo: "/claude-ai-icon.svg",
  },
  {
    value: "sonar-pro" as ModelType,
    label: "Sonar Large",
    description: "Web-connected AI",
    logo: "/perplexity-ai-icon.svg",
  },
  {
    value: "sonar" as ModelType,
    label: "Sonar Small",
    description: "Fast web search",
    logo: "/perplexity-ai-icon.svg",
  },
]

export const EngineSelection = () => {
  const { selectedModel, setSelectedModel } = useModel()
  const [open, setOpen] = React.useState(false)

  const currentModel = models.find((m) => m.value === selectedModel)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-left transition-colors hover:bg-muted focus:outline-none focus-visible:outline-none"
        >
          {currentModel && (
            <img src={currentModel.logo} alt="" className="h-5 w-5 rounded-sm" />
          )}
          <span className="text-lg font-semibold text-foreground">
            {currentModel?.label || "Select model"}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[240px] p-2"
        sideOffset={8}
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.value}
            onClick={() => {
              setSelectedModel(model.value)
              setOpen(false)
            }}
            className="flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer hover:bg-muted focus:bg-muted hover:text-foreground focus:text-foreground"
          >
            <div className="flex items-center gap-2.5">
              <img src={model.logo} alt="" className="h-5 w-5 rounded-sm flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium">{model.label}</span>
                <span className="text-xs text-muted-foreground">
                  {model.description}
                </span>
              </div>
            </div>
            {selectedModel === model.value && (
              <Check className="h-4 w-4 text-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
