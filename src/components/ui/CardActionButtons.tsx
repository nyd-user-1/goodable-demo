
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, FileText } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CardActionButtonsProps {
  onFavorite?: (e: React.MouseEvent) => void;
  onAIAnalysis?: (e: React.MouseEvent) => void;
  onPDFView?: (e: React.MouseEvent) => void;
  isFavorited?: boolean;
  hasAIChat?: boolean;
  showFavorite?: boolean;
  showAIAnalysis?: boolean;
  size?: "sm" | "default";
  variant?: "outline" | "ghost";
  billNumber?: string;
  showPDF?: boolean;
}

export const CardActionButtons = ({
  onFavorite,
  onAIAnalysis,
  onPDFView,
  isFavorited = false,
  hasAIChat = false,
  showFavorite = true,
  showAIAnalysis = true,
  size = "sm",
  variant = "outline",
  billNumber,
  showPDF = true
}: CardActionButtonsProps) => {
  const [heartClicked, setHeartClicked] = useState(false);
  const [sparkleClicked, setSparkleClicked] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    setHeartClicked(true);
    setTimeout(() => setHeartClicked(false), 300);

    // Add subtle confetti for favorites (only if being favorited, not unfavorited)
    if (!isFavorited) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      // Very subtle, professional confetti
      confetti({
        particleCount: 3,
        angle: 90,
        spread: 30,
        origin: { x, y },
        colors: ['#ef4444', '#f87171'], // Red heart colors
        gravity: 0.8,
        scalar: 0.8,
        drift: 0
      });
    }

    onFavorite?.(e);
  };

  const handleAIAnalysisClick = (e: React.MouseEvent) => {
    setSparkleClicked(true);
    setTimeout(() => setSparkleClicked(false), 500);
    onAIAnalysis?.(e);
  };

  const handlePDFClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPDFView?.(e);
  };

  if (!showFavorite && !showAIAnalysis && !showPDF) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-shrink-0">
        {showPDF && billNumber && onPDFView && (
          <Button
            variant={variant}
            size={size}
            className="px-3 transition-transform duration-200 group hover:bg-transparent hover:scale-105"
            onClick={handlePDFClick}
            title="View PDF"
          >
            <FileText className="h-4 w-4 text-foreground group-hover:text-primary" />
          </Button>
        )}
        {showFavorite && onFavorite && (
        <Button
          variant={variant}
          size={size}
          className={`px-3 transition-transform duration-200 group hover:bg-transparent ${heartClicked ? 'scale-110' : 'hover:scale-105'}`}
          onClick={handleFavoriteClick}
          title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart
            className={`h-4 w-4 transition-colors duration-200 ${
              isFavorited
                ? 'fill-red-500 text-red-500'
                : 'text-muted-foreground group-hover:fill-red-500 group-hover:text-red-500'
            }`}
          />
        </Button>
      )}
      {showAIAnalysis && onAIAnalysis && (
        <Button
          variant={variant}
          size={size}
          className={`px-3 transition-all duration-300 group hover:bg-transparent ${
            sparkleClicked
              ? 'scale-110 animate-pulse'
              : 'hover:scale-105'
          }`}
          onClick={handleAIAnalysisClick}
          title="AI Analysis"
        >
          <Sparkles
            className={`h-4 w-4 transition-colors duration-200 ${
              hasAIChat
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-muted-foreground group-hover:fill-yellow-500 group-hover:text-yellow-500'
            }`}
          />
        </Button>
      )}
      </div>
    </TooltipProvider>
  );
};
