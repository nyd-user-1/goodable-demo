import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface MembersErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const MembersErrorState = ({ error, onRetry }: MembersErrorStateProps) => {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Members</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};