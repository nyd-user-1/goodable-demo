import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ProblemsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ProblemsErrorState = ({ error, onRetry }: ProblemsErrorStateProps) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col items-center justify-center text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to Load Problems</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {error || "There was an issue loading the problems. Please try again."}
        </p>
        <Button onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </div>
  );
};