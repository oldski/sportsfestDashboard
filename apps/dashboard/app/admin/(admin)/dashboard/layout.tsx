import * as React from 'react';
import { type Metadata } from 'next';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';
import { PageTitle } from '@workspace/ui/components/page';

import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Admin Dashboard')
};

export type DashboardLayoutProps = {
  totalCompanies: React.ReactNode;
  totalPlayers: React.ReactNode;
  revenueStats: React.ReactNode;
  tentRentals: React.ReactNode;
  topOrganizations: React.ReactNode;
  systemHealth: React.ReactNode;
  accountGrowthCharts: React.ReactNode;
};

export default async function DashboardLayout({
  totalCompanies,
  totalPlayers,
  revenueStats,
  tentRentals,
  topOrganizations,
  accountGrowthCharts,
  systemHealth
}: DashboardLayoutProps & NextPageProps): Promise<React.JSX.Element> {
  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <PageTitle>SportsFest Admin Dashboard</PageTitle>
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {totalCompanies}
            {totalPlayers}
            {tentRentals}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-1 lg:col-span-2">
              {revenueStats}
            </div>
            <div className="col-span-1 lg:col-span-2">
              {accountGrowthCharts}
            </div>
          </div>
          {/* Analytics Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              {topOrganizations}
            </div>
            <div className="lg:col-span-3">
              {systemHealth}
            </div>
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
