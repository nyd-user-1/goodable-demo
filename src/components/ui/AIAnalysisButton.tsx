import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AIAnalysisButtonProps {
  onClick: (e: React.MouseEvent) => void;
  hasAIChat?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "outline" | "ghost" | "default";
  showTooltip?: boolean;
  className?: string;
}

export const AIAnalysisButton = ({
  onClick,
  hasAIChat = false,
  size = "sm",
  variant = "outline",
  showTooltip = true,
  className = "",
}: AIAnalysisButtonProps) => {
  const [sparkleClicked, setSparkleClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSparkleClicked(true);
    setTimeout(() => setSparkleClicked(false), 500);
    onClick(e);
  };

  const button = (
    <Button
      variant={variant}
      size={size}
      className={`px-3 transition-all duration-300 group hover:bg-transparent ${
        sparkleClicked
          ? 'scale-110 animate-pulse'
          : 'hover:scale-105'
      } ${className}`}
      onClick={handleClick}
    >
      <Sparkles
        className={`h-4 w-4 transition-colors duration-200 ${
          hasAIChat
            ? 'fill-yellow-500 text-yellow-500'
            : 'text-muted-foreground group-hover:fill-yellow-500 group-hover:text-yellow-500'
        }`}
      />
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
          <p>AI Analysis</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
