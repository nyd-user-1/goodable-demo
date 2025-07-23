import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const BillsLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="card">
          <CardHeader className="card-header">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="card-body">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};