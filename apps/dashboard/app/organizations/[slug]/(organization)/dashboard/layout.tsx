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
import {getOrganizationDashboardStats} from "~/data/organization/get-organization-dashboard-stats";
import {Card, CardContent, CardHeader} from "@workspace/ui/components/card";
import {CalendarCheckIcon, ClipboardListIcon, MegaphoneIcon, UsersIcon} from "lucide-react";

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

export default async function HomeLayout({
  gameDayInformation,
  recruitmentTools,
  totalCompanyTeams,
  totalPlayers,
  totalTents,
  welcomeMessage,
  yourRecruitmentTeam,
  params
}: HomeLayoutProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const stats = await getOrganizationDashboardStats();
  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Dashboard"
            />
            <PlayerSignUpButton organizationSlug={slug} />
          </PagePrimaryBar>
        </PageHeader>
        <PageBody>
          <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              <Card className="border-none shadow-none pb-0">
                <CardHeader className="px-2 md:px-0">
                  <h1 className="text-xl font-semibold">Welcome to {stats.currentEventYear.name} {stats.organizationName}!</h1>
                </CardHeader>
                <CardContent className="px-2 md:px-0 space-y-2 text-sm leading-relaxed">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="space-y-4">
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
                    </div>
                    {yourRecruitmentTeam}
                  </div>
                </CardContent>
              </Card>
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
