import * as React from 'react';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';

import { getOrganizationDashboardStats } from '~/data/organization/get-organization-dashboard-stats';

export default async function WelcomeMessagePage(): Promise<React.JSX.Element> {
  const stats = await getOrganizationDashboardStats();

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <h1 className="text-xl font-semibold">Welcome to {stats.currentEventYear.name}</h1>
      </CardHeader>
      <CardContent className="space-y-2 text-sm leading-relaxed">
        <p>
          Get ready to rally your coworkers and build the ultimate team-building experience. From your dashboard, you
          can:
        </p>
        <ul className="list-none">
          <li><strong>Secure Your Spot:</strong> Purchase team entries and reserve tents for your group.</li>
          <li><strong>Promote Your Team:</strong> Access a library of free marketing assets to drum up excitement.</li>
          <li><strong>Grow Your Roster:</strong> A custom recruitment link is provided to share with colleagues and watch your team fill up
            in real time.</li>
        </ul>
        <p className="text-md font-semibold mt-2">Jump in and start assembling your winning team!</p>
      </CardContent>
    </Card>
  );
}