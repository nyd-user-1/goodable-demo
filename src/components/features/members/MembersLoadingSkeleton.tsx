import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const MembersLoadingSkeleton = () => {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="mb-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        
        <div className="mb-6 space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-64" />
        </div>

        <div className="grid-container">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="card">
              <CardHeader className="card-header">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="card-body">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};