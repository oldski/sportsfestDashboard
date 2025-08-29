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

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
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
        </TabsContent>


        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>
                Manage events, years, and global event settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-xl font-semibold mb-2">Event Management Coming Soon</div>
                <p className="text-muted-foreground">
                  Create and manage SportsFest events, years, and scheduling
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <CompanyPerformanceComparison />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsAndNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
}