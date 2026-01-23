import * as React from 'react';
import { type Metadata } from 'next';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar, PageSecondaryBar
} from '@workspace/ui/components/page';

import { createTitle } from '~/lib/formatters';
import { AdminPageTitle } from "~/components/admin/admin-page-title";
import { ReportsNav } from "~/components/admin/reports/reports-nav";
import { EventYearSelector } from "~/components/admin/reports/event-year-selector";
import { getEventYearsSimple } from "~/actions/admin/get-event-years-simple";

export const metadata: Metadata = {
  title: createTitle('Reports & Analytics')
};

// Ensure fresh data on every request for reports
export const dynamic = 'force-dynamic';


interface ReportsAnalyticsLayoutProps {
  revenueAnalytics: React.ReactNode;
  registrationProgress: React.ReactNode;
  organizationPerformance: React.ReactNode;
  topCompaniesByPlayers: React.ReactNode;
  companyLeaderboard: React.ReactNode;
  playersData: React.ReactNode;
  organizationsData: React.ReactNode;
  usersData: React.ReactNode;
  revenueStats: React.ReactNode;
  referralSourceAnalytics: React.ReactNode;
}

export default async function ReportsAnalyticsLayout({
  revenueAnalytics,
  registrationProgress,
  organizationPerformance,
  topCompaniesByPlayers,
  companyLeaderboard,
  playersData,
  organizationsData,
  usersData,
  revenueStats,
  referralSourceAnalytics,
}: ReportsAnalyticsLayoutProps & React.PropsWithChildren & NextPageProps): Promise<React.JSX.Element> {
  const eventYears = await getEventYearsSimple();
  const currentYear = eventYears.find(y => y.isActive);

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <AdminPageTitle
            title="Reports & Analytics"
          />
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
          {/* Primary Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {revenueStats}
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:col-span-2 gap-6">
              {revenueAnalytics}
              {registrationProgress}
            </div>
          </div>

          {/* Company Leaderboard */}
          <div className="space-y-6">
            {companyLeaderboard}
          </div>

          {/* Company Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {organizationPerformance}
            {topCompaniesByPlayers}
          </div>

          {/* Organizations Table */}
          <div className="space-y-6">
            {organizationsData}
          </div>

          {/* Marketing Analytics */}
          <div className="grid grid-cols-1 gap-6">
            {referralSourceAnalytics}
          </div>

          {/* Players & Users Analytics */}
          <div className="grid grid-cols-1 gap-6">
            {playersData}
          </div>
          <div className="grid grid-cols-1 gap-6">
            {usersData}
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
