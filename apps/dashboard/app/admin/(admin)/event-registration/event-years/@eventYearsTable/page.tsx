import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';

import { getEventYears } from '~/actions/admin/get-event-years';
import { EventYearsDataTable } from '~/components/admin/event-registration/event-years-data-table';

export default async function EventYearsTablePage(): Promise<React.JSX.Element> {
  const eventYears = await getEventYears();

  return (
    <div className="space-y-6">
      {/* Event Years Table */}
      <Card className="pb-0">
        <CardHeader>
          <CardTitle>All Event Years</CardTitle>
          <CardDescription>
            Manage all SportsFest event years and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <EventYearsDataTable eventYears={eventYears} />
        </CardContent>
      </Card>
    </div>
  );
}
