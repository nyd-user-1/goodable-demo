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
import { useAuth } from "@/contexts/AuthContext";

interface BetaAccessModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BetaAccessModal({ open, onOpenChange }: BetaAccessModalProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if modal has been shown in this session or if user is admin
    const hasShownModal = sessionStorage.getItem('betaAccessModalShown');
    
    if (!hasShownModal && !isAdmin) {
      // Show modal after a short delay to ensure smooth page load
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('betaAccessModalShown', 'true');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

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
            <div className="w-16 h-16 bg-card border-2 rounded-xl flex items-center justify-center">
              <span className="text-3xl">❤️</span>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Goodable.dev
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-2">
            <p className="text-base">
              Now in Beta testing.
            </p>
            <p className="text-sm text-muted-foreground">
              Join our waitlist to be among the first to experience modern legislative 
              analysis and collaborative public policy development.
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
            className="w-full border border-border"
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