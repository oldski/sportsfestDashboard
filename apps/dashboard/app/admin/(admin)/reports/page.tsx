import * as React from 'react';

import { EventAnalyticsCard } from '~/components/admin/event-analytics-card';
import { CompanyPerformanceComparison } from '~/components/admin/company-performance-comparison';

export default function AdminReportsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive reporting and analytics across all SportsFest data
        </p>
      </div>
      
      <div className="grid gap-6">
        <EventAnalyticsCard />
        <CompanyPerformanceComparison />
      </div>
    </div>
  );
}