import { Button } from "@/components/ui/button";

interface BillsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const BillsErrorState = ({ error, onRetry }: BillsErrorStateProps) => {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </div>
  );
};