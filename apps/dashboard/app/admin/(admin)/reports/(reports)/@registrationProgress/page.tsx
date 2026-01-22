import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { TrendingUpIcon } from 'lucide-react';
import { RegistrationTimelineChart } from '~/components/admin/charts/registration-timeline-chart';
import { getRegistrationProgress } from '~/actions/admin/get-registration-progress';

export default async function RegistrationProgressPage(): Promise<React.JSX.Element> {
  const registrationData = await getRegistrationProgress();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <TrendingUpIcon className="mr-2 h-4 w-4" />
          Company Team Registration Progress
        </CardTitle>
        <CardDescription>
          Daily company team registrations and cumulative progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegistrationTimelineChart data={registrationData} />
      </CardContent>
    </Card>
  );
}