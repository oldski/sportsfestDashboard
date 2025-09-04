import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { UserIcon } from 'lucide-react';

export default function UsersDataPage(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <UserIcon className="mr-2 h-4 w-4" />
          User Analytics
        </CardTitle>
        <CardDescription>
          User engagement and activity metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">1,284</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Active This Week</p>
              <p className="text-2xl font-bold text-green-600">892</p>
            </div>
          </div>
          <div className="h-40 flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
            <p className="text-xs text-muted-foreground">User Activity Chart</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}