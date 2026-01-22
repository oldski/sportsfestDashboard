import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { MegaphoneIcon } from 'lucide-react';
import { ReferralSourceChart } from '~/components/admin/charts/referral-source-chart';
import { getReferralSourceAnalytics } from '~/actions/admin/get-referral-source-analytics';

export default async function ReferralSourceAnalyticsPage(): Promise<React.JSX.Element> {
  const { data, totalResponses, eventYearName } = await getReferralSourceAnalytics();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <MegaphoneIcon className="mr-2 h-4 w-4" />
            How Did You Hear About Us?
          </CardTitle>
          <CardDescription>
            Referral source breakdown from user signups{eventYearName ? ` (${eventYearName})` : ''}
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{totalResponses.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Responses</p>
        </div>
      </CardHeader>
      <CardContent>
        <ReferralSourceChart data={data} />
      </CardContent>
    </Card>
  );
}