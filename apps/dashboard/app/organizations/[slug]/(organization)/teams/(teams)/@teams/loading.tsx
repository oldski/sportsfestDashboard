import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function TeamsLoading(): React.JSX.Element {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                <Skeleton className="h-6 w-24" />
              </CardTitle>
              <Skeleton className="h-5 w-12" />
            </div>
            <CardDescription>
              <Skeleton className="h-4 w-20" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-2 w-full rounded-full" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}