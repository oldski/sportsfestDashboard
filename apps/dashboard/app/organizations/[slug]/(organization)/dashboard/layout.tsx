import * as React from 'react';
import { type Metadata } from 'next';

import {
  Page,
  PageActions,
  PageBody,
  PageHeader,
  PagePrimaryBar,
} from '@workspace/ui/components/page';

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { TransitionProvider } from '~/hooks/use-transition-context';
import { createTitle } from '~/lib/formatters';
import {PlayerSignUpButton} from "~/components/organizations/slug/dashboard/player-signup-button";

export const metadata: Metadata = {
  title: createTitle('Home')
};

export type HomeLayoutProps = {
  gameDayInformation: React.ReactNode;
  recruitmentTools: React.ReactNode;
  totalCompanyTeams: React.ReactNode;
  totalPlayers: React.ReactNode;
  totalTents: React.ReactNode;
  welcomeMessage: React.ReactNode;
  yourRecruitmentTeam: React.ReactNode;
  params: { slug: string };
};

export default function HomeLayout({
  gameDayInformation,
  recruitmentTools,
  totalCompanyTeams,
  totalPlayers,
  totalTents,
  welcomeMessage,
  yourRecruitmentTeam,
  params
}: HomeLayoutProps): React.JSX.Element {
  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Dashboard"
            />
            <PlayerSignUpButton organizationSlug={params.slug} />
          </PagePrimaryBar>
        </PageHeader>
        <PageBody>
          <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
              <div className="col-span-1 md:col-span-2">
                {welcomeMessage}
              </div>
              {yourRecruitmentTeam}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
              {totalCompanyTeams}
              {totalPlayers}
              {totalTents}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-5">
              <div className="col-span-1 md:col-span-3">
                {recruitmentTools}
              </div>
              <div className="col-span-1 md:col-span-2">
              {gameDayInformation}
              </div>
            </div>
          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}
