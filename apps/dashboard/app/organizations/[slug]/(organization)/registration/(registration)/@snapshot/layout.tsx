import * as React from 'react';
import {Card, CardHeader, CardTitle, CardContent} from "@workspace/ui/components/card";
import {CalendarIcon} from "lucide-react";
import {Badge} from "@workspace/ui/components/badge";
import { getOrganizationRegistrationStats } from '~/data/organization/get-organization-registration-stats';

export default async function SnapshotLayout({
  children
}: React.PropsWithChildren): Promise<React.JSX.Element> {
  const stats = await getOrganizationRegistrationStats();

  return(
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col lg: flex-row items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-primary">
              {stats.eventYear ? `${stats.eventYear.name} Registration` : 'Event Registration'}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
