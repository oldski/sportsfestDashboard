import * as React from 'react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';
import {CheckCircleIcon, XCircleIcon} from "lucide-react";

export default async function EventYearsManagementPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Current Event Year</span>
          <span className="font-medium">{stats.currentEventYear}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total Events</span>
          <span className="font-medium">{stats.totalEventYears}</span>
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
