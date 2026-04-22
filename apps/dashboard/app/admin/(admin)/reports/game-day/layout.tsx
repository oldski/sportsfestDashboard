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
  equipmentPurchases: React.ReactNode;
}

export default async function GameDayLayout({
  totalCompanies,
  totalCompanyTeams,
  teamsPaidFully,
  teamsNotPaid,
  equipmentPurchases,
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
            <TabsList
              className="flex h-auto w-full snap-x snap-mandatory gap-1 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:h-9 sm:grid-cols-5 sm:gap-0 sm:p-[3px]"
            >
              <TabsTrigger
                value="companies"
                className="h-8 flex-none snap-start px-3 text-xs sm:h-auto sm:flex-1 sm:px-2 sm:text-sm"
              >
                <span className="sm:hidden">Companies</span>
                <span className="hidden sm:inline">Total Companies &amp; Users</span>
              </TabsTrigger>
              <TabsTrigger
                value="teams"
                className="h-8 flex-none snap-start px-3 text-xs sm:h-auto sm:flex-1 sm:px-2 sm:text-sm"
              >
                <span className="sm:hidden">Teams</span>
                <span className="hidden sm:inline">Company Teams</span>
              </TabsTrigger>
              <TabsTrigger
                value="fullyPaid"
                className="h-8 flex-none snap-start px-3 text-xs sm:h-auto sm:flex-1 sm:px-2 sm:text-sm"
              >
                <span className="sm:hidden">Fully Paid</span>
                <span className="hidden sm:inline">Teams Fully Paid</span>
              </TabsTrigger>
              <TabsTrigger
                value="depositsPaid"
                className="h-8 flex-none snap-start px-3 text-xs sm:h-auto sm:flex-1 sm:px-2 sm:text-sm"
              >
                <span className="sm:hidden">Deposits</span>
                <span className="hidden sm:inline">Teams Deposit Paid</span>
              </TabsTrigger>
              <TabsTrigger
                value="equipment"
                className="h-8 flex-none snap-start px-3 text-xs sm:h-auto sm:flex-1 sm:px-2 sm:text-sm"
              >
                <span className="sm:hidden">Equipment</span>
                <span className="hidden sm:inline">Equipment Purchases</span>
              </TabsTrigger>
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
            <TabsContent value="equipment" className="mt-4">
              {equipmentPurchases}
            </TabsContent>
          </Tabs>
        </div>
      </PageBody>
    </Page>
  );
}
