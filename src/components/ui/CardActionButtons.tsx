
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CardActionButtonsProps {
  onFavorite?: (e: React.MouseEvent) => void;
  onAIAnalysis?: (e: React.MouseEvent) => void;
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
  const [pdfAvailable, setPdfAvailable] = useState<boolean | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");

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

  // Generate PDF URL from bill number
  const generatePDFUrl = (billNumber: string, year: string = '2025') => {
    // Clean and format bill number (e.g., "S.6909" -> "s6909", "A.32" -> "a32")
    const cleanBillNumber = billNumber.toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    
    return `https://legislation.nysenate.gov/pdf/bills/${year}/${cleanBillNumber}`;
  };

  // Check PDF availability when bill number changes
  useEffect(() => {
    const checkPdfAvailability = async () => {
      if (!billNumber || !showPDF) {
        setPdfAvailable(null);
        return;
      }

      const url = generatePDFUrl(billNumber);
      setPdfUrl(url);

      try {
        const { data, error } = await supabase.functions.invoke('check-pdf', {
          body: { url }
        });

        if (error || !data) {
          setPdfAvailable(false);
        } else {
          setPdfAvailable(data.available);
        }
      } catch (error) {
        console.error('Error checking PDF availability:', error);
        setPdfAvailable(false);
      }
    };

    checkPdfAvailability();
  }, [billNumber, showPDF]);

  if (!showFavorite && !showAIAnalysis && !showPDF) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-shrink-0">
        {showPDF && billNumber && (
          <Tooltip>
            <TooltipTrigger asChild>
              {pdfAvailable === null ? (
                // Loading state
                <Button
                  variant={variant}
                  size={size}
                  className="px-3"
                  disabled
                >
                  <FileText className="h-4 w-4 text-muted-foreground animate-pulse" />
                </Button>
              ) : pdfAvailable ? (
                // PDF available - active link
                <Button
                  variant={variant}
                  size={size}
                  className="px-3 hover:scale-105 transition-transform duration-200"
                  asChild
                >
                  <a 
                    href={pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </a>
                </Button>
              ) : (
                // PDF not available - greyed out
                <Button
                  variant={variant}
                  size={size}
                  className="px-3 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>{pdfAvailable === null ? "Checking PDF availability..." : pdfAvailable ? "View official PDF" : "PDF not available for this bill"}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {showFavorite && onFavorite && (
        <Button
          variant={variant}
          size={size}
          className={`px-3 transition-transform duration-200 ${heartClicked ? 'scale-110' : 'hover:scale-105'}`}
          onClick={handleFavoriteClick}
          title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart 
            className={`h-4 w-4 transition-colors duration-200 ${
              isFavorited 
                ? 'fill-destructive text-destructive' 
                : 'text-muted-foreground hover:text-destructive'
            }`} 
          />
        </Button>
      )}
      {showAIAnalysis && onAIAnalysis && (
        <Button
          variant={variant}
          size={size}
          className={`px-3 transition-all duration-300 ${
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
                : 'text-muted-foreground hover:text-yellow-500'
            }`} 
          />
        </Button>
      )}
      </div>
    </TooltipProvider>
  );
};
