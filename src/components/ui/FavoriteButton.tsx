import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FavoriteButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isFavorited?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "outline" | "ghost" | "default";
  showTooltip?: boolean;
  showConfetti?: boolean;
  className?: string;
}

export const FavoriteButton = ({
  onClick,
  isFavorited = false,
  size = "sm",
  variant = "outline",
  showTooltip = true,
  showConfetti = true,
  className = "",
}: FavoriteButtonProps) => {
  const [heartClicked, setHeartClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartClicked(true);
    setTimeout(() => setHeartClicked(false), 300);

    // Add subtle confetti for favorites (only if being favorited, not unfavorited)
    if (showConfetti && !isFavorited) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 3,
        angle: 90,
        spread: 30,
        origin: { x, y },
        colors: ['#ef4444', '#f87171'],
        gravity: 0.8,
        scalar: 0.8,
        drift: 0
      });
    }

    onClick(e);
  };

  const button = (
    <Button
      variant={variant}
      size={size}
      className={`px-3 transition-transform duration-200 group hover:bg-transparent ${heartClicked ? 'scale-110' : 'hover:scale-105'} ${className}`}
      onClick={handleClick}
    >
      <Heart
        className={`h-4 w-4 transition-colors duration-200 ${
          isFavorited
            ? 'fill-red-500 text-red-500'
            : 'text-muted-foreground group-hover:fill-red-500 group-hover:text-red-500'
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
          <p>{isFavorited ? "Remove from Favorites" : "Add to Favorites"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
