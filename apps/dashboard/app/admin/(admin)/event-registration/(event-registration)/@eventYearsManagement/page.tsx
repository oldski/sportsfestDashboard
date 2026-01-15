import * as React from 'react';
import { AlertCircle, CheckCircleIcon, XCircleIcon } from 'lucide-react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';

export default async function EventYearsManagementPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  // Handle event years data fetch failure
  if (stats.errors.eventYears || stats.currentEventYear === null) {
    return (
      <>
        <div className="flex items-center gap-2 py-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">
            {stats.errors.eventYears || 'Event year data unavailable'}
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Current Event Year</span>
          <span className="font-medium">{stats.currentEventYear}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total Events</span>
          <span className="font-medium">{stats.totalEventYears ?? 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Active Registrations</span>
          {stats.hasActiveRegistrations ? (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
    </>
  );
}
