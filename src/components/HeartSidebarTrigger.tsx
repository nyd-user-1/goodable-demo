import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export const HeartSidebarTrigger = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="p-0 h-auto hover:bg-transparent"
      aria-label="Toggle Sidebar"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-card border rounded-lg flex items-center justify-center hover:shadow-md transition-shadow duration-200">
          <span className="text-lg">❤️</span>
        </div>
      </div>
    </Button>
  );
};