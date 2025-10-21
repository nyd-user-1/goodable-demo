/**
 * PageHeader Component
 * Header with mobile menu trigger and Model Selector
 */

import { useModel } from "@/contexts/ModelContext";
import { ModelSelector, type ModelType } from "@/components/ModelSelector";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export function PageHeader() {
  const { selectedModel, setSelectedModel } = useModel();

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 md:justify-end md:px-4 md:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Mobile hamburger menu - only visible on mobile */}
      <SidebarTrigger className="md:hidden h-10 w-10">
        <Menu className="h-6 w-6" />
      </SidebarTrigger>

      {/* Model Selector - always visible */}
      <ModelSelector
        selectedModel={selectedModel as ModelType}
        onModelChange={(model) => setSelectedModel(model)}
      />
    </div>
  );
}
