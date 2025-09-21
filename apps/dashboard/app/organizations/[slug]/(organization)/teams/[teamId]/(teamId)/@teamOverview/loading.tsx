import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function TeamOverviewLoading(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16" />
            <div className="text-right space-y-1">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-48" />
        </div>
      </CardContent>
    </Card>
  );
}