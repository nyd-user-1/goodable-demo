import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SignupPromptModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignupPromptModal({ open, onClose }: SignupPromptModalProps) {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    onClose();
    navigate("/auth-2");
  };

  const handleContinueBrowsing = () => {
    onClose();
  };

  const handleSignIn = () => {
    onClose();
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-card border-2 rounded-xl flex items-center justify-center">
              <span className="text-3xl">❤️</span>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Ready to make an impact?
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-2">
            <p className="text-base">
              Create a free account to save your progress, track bills, and take action on legislation that matters to you.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleCreateAccount}
            size="lg"
            className="w-full"
          >
            Create Free Account
          </Button>

          <Button
            onClick={handleContinueBrowsing}
            variant="ghost"
            size="lg"
            className="w-full border border-border"
          >
            Continue Browsing
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-2">
          Already have an account?{" "}
          <button
            onClick={handleSignIn}
            className="underline hover:text-primary transition-colors"
          >
            Log in
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
