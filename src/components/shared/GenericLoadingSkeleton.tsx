import { Skeleton } from "@/components/ui/skeleton";

interface GenericLoadingSkeletonProps {
  count?: number;
  className?: string;
  showAvatar?: boolean;
  showActions?: boolean;
}

export function GenericLoadingSkeleton({ 
  count = 3, 
  className = "",
  showAvatar = false,
  showActions = false
}: GenericLoadingSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border rounded-lg p-6">
          <div className="flex items-start space-x-4">
            {showAvatar && (
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            )}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <div className="flex items-center space-x-4 mt-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            {showActions && (
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}