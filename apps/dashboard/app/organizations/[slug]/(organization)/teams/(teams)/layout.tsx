import * as React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { getCompanyTeams } from '~/data/teams/get-company-teams';
import {Page, PageActions, PageBody, PageHeader, PagePrimaryBar, PageSecondaryBar} from "@workspace/ui/components/page";
import {OrganizationPageTitle} from "~/components/organizations/slug/organization-page-title";
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";
import {Plus} from "lucide-react";
import {TransitionProvider} from "~/hooks/use-transition-context";
import {TeamSecondaryNavigation} from "~/components/teams/team-secondary-navigation";

export type TeamsOverviewLayoutProps = {
  teams: React.ReactNode;
  companyTeamsOverview: React.ReactNode;
  transferWarnings: React.ReactNode;
  availablePlayers: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function TeamsOverviewLayout({
  teams,
  companyTeamsOverview,
  transferWarnings,
  availablePlayers,
  params,
}: TeamsOverviewLayoutProps): Promise<React.JSX.Element> {

  const { slug } = await params;
  // Fetch teams data for event year check
  const teamsData = await getCompanyTeams();

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Teams"
              info="Manage company teams and rosters"
            />
            <PageActions>
              <Button asChild variant="outline">
                <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.registration.Shop, slug)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Purchase Teams
                </Link>
              </Button>
            </PageActions>
          </PagePrimaryBar>
          <PageSecondaryBar>
            <TeamSecondaryNavigation teamsData={teamsData} slug={slug} />
          </PageSecondaryBar>
        </PageHeader>
        <PageBody>
          { !teamsData.eventYear ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">No Active Event Year</h2>
                  <p className="text-muted-foreground">
                    Teams can only be managed when there is an active event year.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="mx-auto w-full space-y-2 p-2 sm:space-y-8 sm:p-6">
              <div className="space-y-6">
                {/* Company Teams Overview */}
                {companyTeamsOverview}

                {/* Teams Grid */}
                {teams}

                {/* Available Players and Transfer Warnings */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {availablePlayers}
                  <div className={teamsData.availablePlayerCount > 0 ? '' : 'lg:col-span-2'}>
                    {transferWarnings}
                  </div>
                </div>
              </div>
            </div>
          )}
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}
