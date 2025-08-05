import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

export const HeartSidebarTrigger = () => {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="h-9 w-9 p-0"
      aria-label={open ? "Close Sidebar" : "Open Sidebar"}
    >
      {open ? (
        <PanelLeftClose className="h-4 w-4" />
      ) : (
        <PanelLeftOpen className="h-4 w-4" />
      )}
    </Button>
  );
};