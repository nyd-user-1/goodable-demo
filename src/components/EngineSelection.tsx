"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { useModel } from "@/contexts/ModelContext"
import { ModelType } from "@/components/ModelSelector"
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
  },
  {
    value: "gpt-4o-mini" as ModelType,
    label: "GPT-4o Mini",
    description: "Fast and efficient",
  },
  {
    value: "claude-3-5-sonnet-20241022" as ModelType,
    label: "Claude 3.5 Sonnet",
    description: "Balanced performance",
  },
  {
    value: "claude-3-5-haiku-20241022" as ModelType,
    label: "Claude 3.5 Haiku",
    description: "Quick responses",
  },
  {
    value: "sonar-pro" as ModelType,
    label: "Sonar Large",
    description: "Web-connected AI",
  },
  {
    value: "sonar" as ModelType,
    label: "Sonar Small",
    description: "Fast web search",
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
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-left transition-colors hover:bg-muted focus:outline-none focus-visible:outline-none"
        >
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
            <div className="flex flex-col">
              <span className="font-medium">{model.label}</span>
              <span className="text-xs text-muted-foreground">
                {model.description}
              </span>
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
