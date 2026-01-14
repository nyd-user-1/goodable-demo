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
const TRIGGER_COUNT = 2;

// Module-level state (resets on page refresh)
let chatCount = 0;
let modalShown = false;
let chatBlocked = false;

// Utility function to increment chat count - export for use in chat components
export const incrementChatCount = (): number => {
  chatCount += 1;
  console.log('[BetaAccessModal] Chat count incremented to:', chatCount);
  // Dispatch custom event so modal can listen for changes
  window.dispatchEvent(new CustomEvent('chatCountUpdated', { detail: chatCount }));
  return chatCount;
};

// Utility to get current chat count
export const getChatCount = (): number => {
  return chatCount;
};

// Check if chat input should be blocked (modal is active)
export const isChatBlocked = (): boolean => {
  return chatBlocked;
};

// Set chat blocked state
export const setChatBlocked = (blocked: boolean): void => {
  chatBlocked = blocked;
};

// Check if modal has been shown
export const hasModalBeenShown = (): boolean => {
  return modalShown;
};

// Mark modal as shown
export const setModalShown = (shown: boolean): void => {
  modalShown = shown;
};

// Trigger the modal to reopen (for when user tries to chat while blocked)
export const triggerModalReopen = (): void => {
  window.dispatchEvent(new CustomEvent('betaModalReopen'));
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
    console.log('[BetaAccessModal] checkAndShowModal called:', { count, modalShown: hasModalBeenShown(), isAdmin, TRIGGER_COUNT });

    if (!hasModalBeenShown() && !isAdmin && count >= TRIGGER_COUNT) {
      console.log('[BetaAccessModal] Showing modal!');
      setIsOpen(true);
      setModalShown(true);
      setChatBlocked(true);
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

    // Listen for modal reopen requests (when user tries to chat while blocked)
    const handleModalReopen = () => {
      console.log('[BetaAccessModal] Received reopen request');
      setIsOpen(true);
    };

    window.addEventListener('chatCountUpdated', handleChatCountUpdate as EventListener);
    window.addEventListener('betaModalReopen', handleModalReopen);

    return () => {
      console.log('[BetaAccessModal] Component unmounting, removing event listener');
      window.removeEventListener('chatCountUpdated', handleChatCountUpdate as EventListener);
      window.removeEventListener('betaModalReopen', handleModalReopen);
    };
  }, [checkAndShowModal]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleJoinMovement = () => {
    handleOpenChange(false);
    navigate("/auth-2");
  };

  const handleExploreVision = () => {
    handleOpenChange(false);
    navigate("/marketing");
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
            onClick={handleJoinMovement}
            size="lg"
            className="w-full"
          >
            Join the movement.
          </Button>

          <Button
            onClick={handleExploreVision}
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