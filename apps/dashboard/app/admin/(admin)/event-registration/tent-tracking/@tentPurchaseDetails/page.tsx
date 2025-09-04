import * as React from 'react';

import { getTentTrackingSimple } from '~/actions/admin/get-tent-tracking-simple';
import { TentTrackingDataTable } from '~/components/admin/event-registration/tent-tracking-data-table';

export default async function TentPurchaseDetailsPage(): Promise<React.JSX.Element> {
  const tentTrackingData = await getTentTrackingSimple();

  return <TentTrackingDataTable data={tentTrackingData} />;
}
