/**
 * PageHeader Component
 * Header with mobile menu trigger and model selector on chat pages
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { EngineSelection } from "@/components/EngineSelection";

// Routes where the model selector should show (chat pages)
const CHAT_ROUTES = ["/new-chat", "/c"];

export function PageHeader() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Show model selector on chat pages
  const showModelSelector = CHAT_ROUTES.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

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
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-10 w-10">
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
          {showModelSelector && <EngineSelection />}
        </div>
      </div>
    </>
  );
}
