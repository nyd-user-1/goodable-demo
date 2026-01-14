import { useEffect, useState, useCallback } from "react";
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

// Constants for chat tracking
const CHAT_COUNT_KEY = 'betaAccessChatCount';
const MODAL_SHOWN_KEY = 'betaAccessModalShown';
const TRIGGER_COUNT = 2;

// Utility function to increment chat count - export for use in chat components
export const incrementChatCount = (): number => {
  const currentCount = parseInt(sessionStorage.getItem(CHAT_COUNT_KEY) || '0', 10);
  const newCount = currentCount + 1;
  sessionStorage.setItem(CHAT_COUNT_KEY, newCount.toString());
  console.log('[BetaAccessModal] Chat count incremented to:', newCount);
  // Dispatch custom event so modal can listen for changes
  window.dispatchEvent(new CustomEvent('chatCountUpdated', { detail: newCount }));
  return newCount;
};

// Utility to get current chat count
export const getChatCount = (): number => {
  return parseInt(sessionStorage.getItem(CHAT_COUNT_KEY) || '0', 10);
};

interface BetaAccessModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BetaAccessModal({ open, onOpenChange }: BetaAccessModalProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const checkAndShowModal = useCallback((count: number) => {
    const hasShownModal = sessionStorage.getItem(MODAL_SHOWN_KEY);
    console.log('[BetaAccessModal] checkAndShowModal called:', { count, hasShownModal, isAdmin, TRIGGER_COUNT });

    if (!hasShownModal && !isAdmin && count >= TRIGGER_COUNT) {
      console.log('[BetaAccessModal] Showing modal!');
      setIsOpen(true);
      sessionStorage.setItem(MODAL_SHOWN_KEY, 'true');
    }
  }, [isAdmin]);

  useEffect(() => {
    console.log('[BetaAccessModal] Component mounted, setting up event listener');
    // Check initial count on mount (in case user already sent messages)
    const initialCount = getChatCount();
    checkAndShowModal(initialCount);

    // Listen for chat count updates
    const handleChatCountUpdate = (event: CustomEvent<number>) => {
      console.log('[BetaAccessModal] Received chatCountUpdated event:', event.detail);
      checkAndShowModal(event.detail);
    };

    window.addEventListener('chatCountUpdated', handleChatCountUpdate as EventListener);

    return () => {
      console.log('[BetaAccessModal] Component unmounting, removing event listener');
      window.removeEventListener('chatCountUpdated', handleChatCountUpdate as EventListener);
    };
  }, [checkAndShowModal]);

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