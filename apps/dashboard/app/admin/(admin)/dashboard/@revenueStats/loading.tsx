import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function RevenueStatsLoading(): React.JSX.Element {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="text-right">
          <Skeleton className="h-8 w-28 mb-1" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  );
}
