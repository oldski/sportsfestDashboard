import * as React from 'react';
import type { Metadata } from 'next';

import { createTitle } from '~/lib/formatters';
import {Page, PageActions, PageBody, PageHeader, PagePrimaryBar, PageSecondaryBar} from "@workspace/ui/components/page";
import {OrganizationPageTitle} from "~/components/organizations/slug/organization-page-title";
import {TransitionProvider} from "~/hooks/use-transition-context";
import {PlayerSignUpButton} from "~/components/organizations/slug/dashboard/player-signup-button";

export const metadata: Metadata = {
  title: createTitle('Players')
};

interface PlayersLayoutProps {
  playersTable: React.ReactNode;
  params: { slug: string };
}

export default function PlayersLayout({
  playersTable,
  params
}: PlayersLayoutProps): React.JSX.Element {
  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Players"
              info=" Players who've showed interest in joining the team"
            />

            <PlayerSignUpButton organizationSlug={params.slug} />
          </PagePrimaryBar>
        </PageHeader>
        <PageBody disableScroll>
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
