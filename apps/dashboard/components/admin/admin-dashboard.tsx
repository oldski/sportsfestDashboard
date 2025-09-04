import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';

import { AdminOverviewCards } from './admin-overview-cards';
import { CompanyManagementCard } from './company-management-card';
import { EventAnalyticsCard } from './event-analytics-card';
import { UserAdministrationCard } from './user-administration-card';
import { AlertsAndNotifications } from './alerts-and-notifications';
import { CompanyPerformanceComparison } from './company-performance-comparison';
import { SystemHealthCard } from './system-health-card';

export function AdminDashboard(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">SportsFest Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics and management tools for SportsFest organizers
        </p>
      </div>

      <AdminOverviewCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <EventAnalyticsCard />
        </div>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              System health and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <SystemHealthCard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
