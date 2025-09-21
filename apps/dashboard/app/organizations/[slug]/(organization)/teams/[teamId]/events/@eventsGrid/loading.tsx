import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function EventsGridLoading(): React.JSX.Element {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>

            {/* Progress Bar Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Gender Breakdown Skeleton */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>

            {/* Current Players Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-1 max-h-24">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button Skeleton */}
            <div className="pt-4 border-t">
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}