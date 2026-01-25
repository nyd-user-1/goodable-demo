import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useModel } from "@/contexts/ModelContext";

// Custom icon components for each provider
const OpenAIIcon = ({ className }: { className?: string }) => (
  <img
    src="/OAI LOGO.png"
    alt="OpenAI"
    className={`object-contain ${className}`}
    style={{ maxWidth: '16px', maxHeight: '16px', width: 'auto', height: 'auto' }}
  />
);

const ClaudeIcon = ({ className }: { className?: string }) => (
  <img
    src="/claude-ai-icon-65aa.png"
    alt="Claude"
    className={`object-contain ${className}`}
    style={{ maxWidth: '16px', maxHeight: '16px', width: 'auto', height: 'auto' }}
  />
);

const PerplexityIcon = ({ className }: { className?: string }) => (
  <img
    src="/PPLX LOGO.png"
    alt="Perplexity"
    className={`object-contain ${className}`}
    style={{ maxWidth: '16px', maxHeight: '16px', width: 'auto', height: 'auto' }}
  />
);

type ModelProvider = "openai" | "anthropic" | "perplexity";
type ModelType = "gpt-4o-mini" | "gpt-4o" | "claude-3-5-sonnet-20241022" | "claude-3-5-haiku-20241022" | "llama-3.1-sonar-small-128k-online" | "llama-3.1-sonar-large-128k-online";

const models: Record<ModelProvider, { name: string; icon: React.ComponentType<{ className?: string }>; models: { id: ModelType; name: string }[] }> = {
  openai: {
    name: "OpenAI",
    icon: OpenAIIcon,
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    ]
  },
  anthropic: {
    name: "Anthropic",
    icon: ClaudeIcon,
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
    ]
  },
  perplexity: {
    name: "Perplexity",
    icon: PerplexityIcon,
    models: [
      { id: "llama-3.1-sonar-large-128k-online", name: "Sonar Large" },
      { id: "llama-3.1-sonar-small-128k-online", name: "Sonar Small" },
    ]
  }
};

export function SidebarHeader() {
  const { selectedModel, setSelectedModel } = useModel();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="w-8 h-8 bg-card border rounded-lg flex items-center justify-center">
                <span className="text-lg">❤️</span>
              </div>
              <span className="text-sm font-semibold truncate">NYSgpt</span>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuLabel>Models</DropdownMenuLabel>
            {Object.entries(models).map(([providerId, provider]) => (
              <div key={providerId}>
                {provider.models.map((model) => {
                  const Icon = provider.icon;
                  return (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => setSelectedModel(model.id as any)}
                      className={selectedModel === model.id ? 'bg-accent' : ''}
                    >
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{model.name}</span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
