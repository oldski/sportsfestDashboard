import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function RevenueStatsLoading(): React.JSX.Element {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent className="h-full pb-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="space-y-4">
          <div className="flex space-x-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
