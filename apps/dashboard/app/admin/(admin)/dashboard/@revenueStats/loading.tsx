import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function RevenueStatsLoading(): React.JSX.Element {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <div className="flex-1 mb-4">
          <Skeleton className="h-[150px] w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
