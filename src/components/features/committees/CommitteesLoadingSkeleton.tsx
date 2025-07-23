import { Skeleton } from "@/components/ui/skeleton";

export const CommitteesLoadingSkeleton = () => {
  return (
    <div className="page-container min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
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
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
                <div className="card-body p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-6 w-8" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-6 w-8" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};