import { Skeleton } from "@/components/ui/skeleton";

export const MembersLoadingSkeleton = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <section className="section-container bg-card rounded-xl shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="flex-shrink-0">
              <Skeleton className="h-16 w-32 rounded-lg" />
            </div>
          </div>
        </section>

        {/* Search Filters Skeleton */}
        <section className="section-container bg-card rounded-xl shadow-sm border p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </section>

        {/* Grid Skeleton */}
        <section className="grid-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="card bg-card rounded-xl shadow-sm border overflow-hidden"
            >
              <div className="card-header px-6 py-4 border-b">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <div className="card-body p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};