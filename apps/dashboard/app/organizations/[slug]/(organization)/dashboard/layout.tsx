import * as React from 'react';
import { type Metadata } from 'next';
import Link from 'next/link';

import { GitHubIcon, XIcon } from '@workspace/ui/components/brand-icons';
import { buttonVariants } from '@workspace/ui/components/button';
import {
  Page,
  PageActions,
  PageBody,
  PageHeader,
  PagePrimaryBar,
  PageSecondaryBar
} from '@workspace/ui/components/page';

import { HomeFilters } from '~/components/organizations/slug/home/home-filters';
import { HomeSpinner } from '~/components/organizations/slug/home/home-spinner';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { TransitionProvider } from '~/hooks/use-transition-context';
import { createTitle } from '~/lib/formatters';

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
};

export default function HomeLayout({
  gameDayInformation,
  recruitmentTools,
  totalCompanyTeams,
  totalPlayers,
  totalTents,
  welcomeMessage,
  yourRecruitmentTeam,
}: HomeLayoutProps): React.JSX.Element {
  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Dashboard"
            />
          </PagePrimaryBar>
        </PageHeader>
        <PageBody>
          <div className="mx-auto space-y-2 p-2 sm:space-y-8 sm:p-6">
            <div className="grid grid-cols-1 gap-2 sm:gap-8 md:grid-cols-3">
              <div className="col-span-1 md:col-span-2">
                {welcomeMessage}
              </div>
              {yourRecruitmentTeam}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:gap-8 md:grid-cols-3">
              {totalCompanyTeams}
              {totalPlayers}
              {totalTents}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:gap-8 md:grid-cols-2">
              {recruitmentTools}
              {gameDayInformation}
            </div>
          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}
