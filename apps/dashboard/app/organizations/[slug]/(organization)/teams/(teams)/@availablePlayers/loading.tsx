import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function AvailablePlayersLoading(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-9 w-40" />
      </CardContent>
    </Card>
  );
}