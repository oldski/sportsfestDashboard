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


interface ReportsAnalyticsLayoutProps {
  revenueAnalytics: React.ReactNode;
  registrationProgress: React.ReactNode;
  organizationPerformance: React.ReactNode;
  playersData: React.ReactNode;
  organizationsData: React.ReactNode;
  usersData: React.ReactNode;
  revenueStats: React.ReactNode;
  topOrganizations: React.ReactNode;
}

export default async function ReportsAnalyticsLayout({
  revenueAnalytics,
  registrationProgress,
  organizationPerformance,
  playersData,
  organizationsData,
  usersData,
  revenueStats,
  topOrganizations,
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {revenueAnalytics}
            {registrationProgress}
          </div>

          {/* Revenue & Organization Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {revenueStats}
            {topOrganizations}
          </div>

          {/* Full Width Sections */}
          <div className="space-y-6">
            {organizationPerformance}
            {organizationsData}
          </div>

          {/* Players & Users Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {playersData}
            {usersData}
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
