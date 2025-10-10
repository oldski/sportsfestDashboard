import * as React from 'react';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';

import { getOrganizationDashboardStats } from '~/data/organization/get-organization-dashboard-stats';
import { CalendarCheckIcon, MegaphoneIcon, UsersIcon, ClipboardListIcon } from "lucide-react";

export default async function WelcomeMessagePage(): Promise<React.JSX.Element> {
  const stats = await getOrganizationDashboardStats();

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <h1 className="text-xl font-semibold">Welcome to {stats.currentEventYear.name} {stats.organizationName}!</h1>
      </CardHeader>
      <CardContent className="space-y-2 text-sm leading-relaxed">
        <p className="text-lg leading-relaxed">
          Get ready to rally your coworkers and build the ultimate team-building experience. From your dashboard, you
          can:
        </p>
        <ul className="space-y-4">
          <li className="flex gap-3 items-start">
            <CalendarCheckIcon className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
            <div>
              <strong className="block">Secure Your Spot</strong>
              <span className="text-muted-foreground">Purchase team entries and reserve tents for your group.</span>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <MegaphoneIcon className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
            <div>
              <strong className="block">Promote Your Team</strong>
              <span className="text-muted-foreground">Access a library of free marketing assets to drum up excitement.</span>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <UsersIcon className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
            <div>
              <strong className="block">Grow Your Player Interest</strong>
              <span className="text-muted-foreground">A custom recruitment link is provided to share with colleagues and watch your team fill up in real time.</span>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <ClipboardListIcon className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
            <div>
              <strong className="block">Build Your Team &amp; Event Roster</strong>
              <span className="text-muted-foreground">Build your winning team(s) with the Team and Event rosters for game day.</span>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
