import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ViewPDFButtonProps {
  onClick: (e: React.MouseEvent) => void;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "outline" | "ghost" | "default";
  showTooltip?: boolean;
  className?: string;
}

export const ViewPDFButton = ({
  onClick,
  size = "sm",
  variant = "outline",
  showTooltip = true,
  className = "",
}: ViewPDFButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e);
  };

  const button = (
    <Button
      variant={variant}
      size={size}
      className={`px-3 transition-transform duration-200 group hover:bg-transparent hover:scale-105 ${className}`}
      onClick={handleClick}
    >
      <FileText className="h-4 w-4 text-foreground group-hover:text-primary" />
    </Button>
  );

  if (!showTooltip) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p>View PDF</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
