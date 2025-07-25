import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface BetaAccessModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BetaAccessModal({ open, onOpenChange }: BetaAccessModalProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if modal has been shown in this session
    const hasShownModal = sessionStorage.getItem('betaAccessModalShown');
    
    if (!hasShownModal) {
      // Show modal after a short delay to ensure smooth page load
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('betaAccessModalShown', 'true');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleJoinWaitlist = () => {
    handleOpenChange(false);
    // Scroll to waitlist section smoothly
    const waitlistSection = document.getElementById('waitlist');
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open !== undefined ? open : isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to Goodable Beta
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-2">
            <p className="text-base">
              We're thrilled by your interest in Goodable! 
            </p>
            <p className="text-sm text-muted-foreground">
              We're currently in closed beta, working closely with our early adopters 
              to create the most powerful legislative intelligence platform. Join our 
              waitlist to be among the first to experience the future of policy analysis.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleJoinWaitlist}
            size="lg"
            className="w-full"
          >
            Join the Waitlist
          </Button>
          
          <Button 
            onClick={handleClose}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            Explore Our Vision
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground pt-2">
          Current beta users can{" "}
          <button
            onClick={() => {
              handleOpenChange(false);
              navigate("/auth");
            }}
            className="underline hover:text-primary transition-colors"
          >
            sign in here
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}