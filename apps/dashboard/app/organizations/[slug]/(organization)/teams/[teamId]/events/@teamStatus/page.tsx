import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { getEventRosters } from '~/data/teams/get-event-rosters';
import { getCompanyTeamById } from '~/data/teams/get-company-team-by-id';
import {Alert, AlertDescription, AlertTitle} from "@workspace/ui/components/alert";

type TeamStatusProps = {
  params: Promise<{ slug: string; teamId: string }>;
};

export default async function TeamStatusPage({
  params
}: TeamStatusProps): Promise<React.JSX.Element> {
  const { slug, teamId } = await params;

  const [eventRosters, team] = await Promise.all([
    getEventRosters(teamId),
    getCompanyTeamById(teamId)
  ]);

  if (!eventRosters || !team) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Rosters</h1>
          <p className="text-muted-foreground mt-1">
            {eventRosters.teamName} • {eventRosters.eventYear.name}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{team.memberCount}</div>
          <div className="text-sm text-muted-foreground">Team Members</div>
        </div>
      </div>

      {/* Team Status Alert */}
      {team.memberCount < 12 && (
        <Alert variant="warning">
          <AlertTitle>Team Needs More Members</AlertTitle>
          <AlertDescription>
            Your team needs {12 - team.memberCount} more members to meet the minimum requirement before creating event rosters.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
