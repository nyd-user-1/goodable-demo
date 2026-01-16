/**
 * PageHeader Component
 * Header with mobile menu trigger
 */

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

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
      </div>
    </>
  );
}
