import * as React from 'react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';

export default async function TentTrackingPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tents Purchased</span>
          <span className="font-medium">{stats.tentQuotaMet}/{stats.totalTentPurchases}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Organizations at Limit</span>
          <span className="font-medium">{stats.tentQuotaMet}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Available Tents</span>
          <span className="font-medium text-green-600">{stats.availableTents}</span>
        </div>
      </div>
    </>
  );
}
