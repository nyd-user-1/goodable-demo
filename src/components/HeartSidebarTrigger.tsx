import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export const HeartSidebarTrigger = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="h-9 w-9 p-0"
      aria-label="Toggle Sidebar"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
};