import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { createTitle } from '~/lib/formatters';
import { TransitionProvider } from "~/hooks/use-transition-context";
import {routes} from "@workspace/routes";
import { getCompanyTeamById } from '~/data/teams/get-company-team-by-id';
import { getCompanyTeams } from '~/data/teams/get-company-teams';
import { getEventRosters } from '~/data/teams/get-event-rosters';
import {OrganizationPageTitle} from "~/components/organizations/slug/organization-page-title";
import {TeamSecondaryNavigation} from "~/components/teams/team-secondary-navigation";
import {RosterExportDropdown} from "~/components/teams/roster-export-dropdown";
import {Page, PageBody, PageHeader, PagePrimaryBar, PageSecondaryBar} from "@workspace/ui/components/page";

export async function generateMetadata({
  params
}: {
  params: Promise<{ teamId: string }>;
}): Promise<Metadata> {
  const { teamId } = await params;
  const team = await getCompanyTeamById(teamId);

  const title = team ? `${team.name || `Team ${team.teamNumber}`} - Event Rosters` : 'Event Rosters';
  return {
    title: createTitle(title)
  };
}

export type EventsParallelLayoutProps = {
  teamStatus: React.ReactNode;
  eventsGrid: React.ReactNode;
  params: Promise<{ slug: string; teamId: string }>;
};

export default async function EventsParallelLayout({
  teamStatus,
  eventsGrid,
  params
}: EventsParallelLayoutProps): Promise<React.JSX.Element> {
  const { teamId, slug } = await params;

  // Fetch team data for validation
  const team = await getCompanyTeamById(teamId);
  // Fetch teams data for event year check
  const teamsData = await getCompanyTeams();
  // Fetch event rosters for export functionality
  const eventRostersData = await getEventRosters(teamId);

  if (!team) {
    notFound();
  }

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              index={{
                route: routes.dashboard.organizations.slug.Teams,
                title: "Teams"
              }}
              secondary={{
                route: routes.dashboard.organizations.slug.Teams + `/${teamId}` as any,
                title: team.name || `Team ${team.teamNumber}`
              }}
              title="Events"
              info={`${team.eventYear.name} • Team #${team.teamNumber}`}
            />
          </PagePrimaryBar>
          <PageSecondaryBar>
            <div className="flex items-center justify-between w-full gap-4">
              <TeamSecondaryNavigation teamsData={teamsData} slug={slug} />
              <RosterExportDropdown teamData={team} eventRostersData={eventRostersData || undefined} />
            </div>
          </PageSecondaryBar>
        </PageHeader>
        <PageBody>
          <div className="mx-auto w-full space-y-2 p-2 sm:space-y-8 sm:p-6">
          <div className="space-y-6">
            {/* Team Status and Header */}
            {teamStatus}

            {/* Events Grid - Takes up 3 columns */}
            {eventsGrid}
          </div>
          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}
