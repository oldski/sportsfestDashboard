import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { UserIcon, UsersIcon, UserPlusIcon } from 'lucide-react';
import { getUserStats } from '~/actions/admin/get-user-stats';

export default async function UsersDataPage(): Promise<React.JSX.Element> {
  const stats = await getUserStats();

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
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Active (7d)</p>
            <p className="text-2xl font-bold text-green-600">{stats.activeThisWeek}</p>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <UserPlusIcon className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground">New This Month</p>
            <p className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}