import * as React from 'react';
import { notFound } from 'next/navigation';
import { getCompanyTeamById } from '~/data/teams/get-company-team-by-id';
import { getCompanyTeams } from '~/data/teams/get-company-teams';
import { getEventRosters } from '~/data/teams/get-event-rosters';
import {Page, PageBody, PageHeader, PagePrimaryBar, PageSecondaryBar} from "@workspace/ui/components/page";
import {OrganizationPageTitle} from "~/components/organizations/slug/organization-page-title";
import {replaceOrgSlug, routes} from "@workspace/routes";
import {TransitionProvider} from "~/hooks/use-transition-context";
import {TeamSecondaryNavigation} from "~/components/teams/team-secondary-navigation";
import {RosterExportDropdown} from "~/components/teams/roster-export-dropdown";

export type TeamOverviewLayoutProps = {
  teamOverview: React.ReactNode;
  teamRoster: React.ReactNode;
  teamSidebar: React.ReactNode;
  params: Promise<{ slug: string; teamId: string }>;
};

export default async function TeamOverviewLayout({
  teamOverview,
  teamRoster,
  teamSidebar,
  params
}: TeamOverviewLayoutProps): Promise<React.JSX.Element> {
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
              title={team.name || `Team ${team.teamNumber}`}
              info={`${team.eventYear.name} • Team #${team.teamNumber}`}
            />
          </PagePrimaryBar>
          <PageSecondaryBar>
            <div className="flex items-center justify-between w-full">
              <TeamSecondaryNavigation teamsData={teamsData} slug={slug} />
              <RosterExportDropdown teamData={team} eventRostersData={eventRostersData || undefined} />
            </div>
          </PageSecondaryBar>
        </PageHeader>
        <PageBody>
          <div className="mx-auto w-full space-y-2 p-2 sm:space-y-8 sm:p-6">
            <div className="space-y-6">
              {/* Team Overview */}
              {teamOverview}

              {/* Main Content Area */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Team Roster */}
                <div className="lg:col-span-2 space-y-6">
                  {teamRoster}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {teamSidebar}
                </div>
              </div>
            </div>
          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}
