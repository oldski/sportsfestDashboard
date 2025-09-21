import { Card, CardContent } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function TeamStatusLoading(): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Navigation Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Status Alert Skeleton */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-2 w-2 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}