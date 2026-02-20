import * as React from 'react';
import { type Metadata } from 'next';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar,
  PageSecondaryBar,
} from '@workspace/ui/components/page';

import { createTitle } from '~/lib/formatters';
import { AdminPageTitle } from '~/components/admin/admin-page-title';
import { ReportsNav } from '~/components/admin/reports/reports-nav';
import { EventYearSelector } from '~/components/admin/reports/event-year-selector';
import { getEventYearsSimple } from '~/actions/admin/get-event-years-simple';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@workspace/ui/components/tabs";

export const metadata: Metadata = {
  title: createTitle('Game Day Reports'),
};

// Ensure fresh data on every request for reports
export const dynamic = 'force-dynamic';

interface GameDayLayoutProps {
  totalCompanies: React.ReactNode;
  totalCompanyTeams: React.ReactNode;
  teamsPaidFully: React.ReactNode;
  teamsNotPaid: React.ReactNode;
}

export default async function GameDayLayout({
  totalCompanies,
  totalCompanyTeams,
  teamsPaidFully,
  teamsNotPaid,
}: GameDayLayoutProps & React.PropsWithChildren & NextPageProps): Promise<React.JSX.Element> {
  const eventYears = await getEventYearsSimple();
  const currentYear = eventYears.find((y) => y.isActive);

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <AdminPageTitle title="Game Day Reports" />
        </PagePrimaryBar>
        <PageSecondaryBar>
          <div className="flex items-center justify-between w-full">
            <ReportsNav />
            <EventYearSelector
              eventYears={eventYears}
              currentYearId={currentYear?.id}
            />
          </div>
        </PageSecondaryBar>
      </PageHeader>
      <PageBody>
        <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
          <Tabs defaultValue="companies" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="companies">Total Companies & Users</TabsTrigger>
              <TabsTrigger value="teams">Company Teams</TabsTrigger>
              <TabsTrigger value="fullyPaid">Teams Fully Paid</TabsTrigger>
              <TabsTrigger value="depositsPaid">Teams Deposit Paid</TabsTrigger>
            </TabsList>

            <TabsContent value="companies" className="mt-4">
              {totalCompanies}
            </TabsContent>
            <TabsContent value="teams" className="mt-4">
              {totalCompanyTeams}
            </TabsContent>
            <TabsContent value="fullyPaid" className="mt-4">
              {teamsPaidFully}
            </TabsContent>
            <TabsContent value="depositsPaid" className="mt-4">
              {teamsNotPaid}
            </TabsContent>
          </Tabs>
        </div>
      </PageBody>
    </Page>
  );
}
