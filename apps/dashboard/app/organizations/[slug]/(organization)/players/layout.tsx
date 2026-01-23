import * as React from 'react';
import type { Metadata } from 'next';

import { createTitle } from '~/lib/formatters';
import {Page, PageActions, PageBody, PageHeader, PagePrimaryBar, PageSecondaryBar} from "@workspace/ui/components/page";
import {OrganizationPageTitle} from "~/components/organizations/slug/organization-page-title";
import {TransitionProvider} from "~/hooks/use-transition-context";
import {PlayerSignUpButton} from "~/components/organizations/slug/dashboard/player-signup-button";
import { getOrganizationDashboardStats } from '~/data/organization/get-organization-dashboard-stats';

export const metadata: Metadata = {
  title: createTitle('Players')
};

interface PlayersLayoutProps {
  playersTable: React.ReactNode;
  params: { slug: string };
}

export default async function PlayersLayout({
  playersTable,
  params
}: PlayersLayoutProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const stats = await getOrganizationDashboardStats();
  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Players"
              info=" Players who've showed interest in joining the team"
            />

            <PlayerSignUpButton
              organizationSlug={slug}
              organizationName={stats.organizationName}
              eventYearName={stats.currentEventYear.name}
              eventDate={stats.currentEventYear.eventEndDate}
              locationName={stats.currentEventYear.locationName}
              address={stats.currentEventYear.address}
              city={stats.currentEventYear.city}
              state={stats.currentEventYear.state}
              zipCode={stats.currentEventYear.zipCode}
              latitude={stats.currentEventYear.latitude}
              longitude={stats.currentEventYear.longitude}
            />
          </PagePrimaryBar>
        </PageHeader>
        <PageBody>
          <div className="mx-auto w-full space-y-4 p-2 py-4 sm:space-y-8 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Players</h3>
                <p className="text-sm text-muted-foreground">
                  All players that have shown interest in joining your team
                </p>
              </div>
            </div>
            {playersTable}
          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}
