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
    value: "gpt-4-turbo" as ModelType,
    label: "GPT-4 Turbo",
    description: "High capability, large context",
    logo: "/chatgpt-icon.svg",
  },
  {
    value: "claude-sonnet-4-5-20250929" as ModelType,
    label: "Claude Sonnet 4.5",
    description: "Smart & balanced",
    logo: "/claude-ai-icon.svg",
  },
  {
    value: "claude-haiku-4-5-20251001" as ModelType,
    label: "Claude Haiku 4.5",
    description: "Fast & efficient",
    logo: "/claude-ai-icon.svg",
  },
  {
    value: "claude-opus-4-5-20251101" as ModelType,
    label: "Claude Opus 4.5",
    description: "Maximum intelligence",
    logo: "/claude-ai-icon.svg",
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
