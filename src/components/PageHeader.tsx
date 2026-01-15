/**
 * PageHeader Component
 * Header with mobile menu trigger and Model Selector
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useModel } from "@/contexts/ModelContext";
import { ModelSelector, type ModelType } from "@/components/ModelSelector";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

// Routes where the model selector should be hidden
const HIDDEN_ROUTES = ["/plans", "/dashboard"];

export function PageHeader() {
  const location = useLocation();
  const { selectedModel, setSelectedModel } = useModel();
  const [isScrolled, setIsScrolled] = useState(false);

  // Hide model selector on certain routes
  const hideModelSelector = HIDDEN_ROUTES.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Mobile Header - with scroll-triggered border */}
      <div className={cn(
        "md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-background transition-all duration-200",
        isScrolled && "border-b border-border"
      )}>
        <SidebarTrigger className="h-10 w-10">
          <Menu className="h-6 w-6" />
        </SidebarTrigger>

        {!hideModelSelector && (
          <ModelSelector
            selectedModel={selectedModel as ModelType}
            onModelChange={(model) => setSelectedModel(model)}
          />
        )}
      </div>

      {/* Desktop Header - original style, top-right only */}
      {!hideModelSelector && (
        <div className="hidden md:block fixed top-4 right-4 z-40">
          <ModelSelector
            selectedModel={selectedModel as ModelType}
            onModelChange={(model) => setSelectedModel(model)}
          />
        </div>
      )}
    </>
  );
}
