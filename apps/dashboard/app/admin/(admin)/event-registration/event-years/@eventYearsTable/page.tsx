import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';

import { getEventYears } from '~/actions/admin/get-event-years';
import { EventYearsDataTable } from '~/components/admin/event-registration/event-years-data-table';

export default async function EventYearsTablePage(): Promise<React.JSX.Element> {
  const eventYears = await getEventYears();

  return (
    <EventYearsDataTable eventYears={eventYears} />
  );
}
