import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface BlogErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const BlogErrorState = ({ error, onRetry }: BlogErrorStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 rounded-lg bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2 text-destructive">
        Error Loading Blog
      </h3>
      
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        {error}
      </p>
      
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};