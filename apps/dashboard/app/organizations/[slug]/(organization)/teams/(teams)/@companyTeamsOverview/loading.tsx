import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function CompanyTeamsOverviewLoading(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-8 w-16 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}