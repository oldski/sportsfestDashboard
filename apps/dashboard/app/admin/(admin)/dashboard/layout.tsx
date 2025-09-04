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
  totalRevenue: React.ReactNode;
  tentRentals: React.ReactNode;
  topOrganizations: React.ReactNode;
  systemHealth: React.ReactNode;
  organizationGrowthChart : React.ReactNode;
  revenueByTypeChart : React.ReactNode;
  userGrowthChart : React.ReactNode;
};

export default async function DashboardLayout({
  totalCompanies,
  totalPlayers,
  totalRevenue,
  tentRentals,
  topOrganizations,
  organizationGrowthChart,
  revenueByTypeChart,
  userGrowthChart,
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
        <div className="mx-auto space-y-2 p-2 sm:space-y-8 sm:p-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {totalCompanies}
            {totalPlayers}
            {totalRevenue}
            {tentRentals}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {revenueByTypeChart}
            {userGrowthChart}
            {organizationGrowthChart}
          </div>
          {/* Analytics Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              {topOrganizations}
            </div>
            <div className="col-span-3">
              {systemHealth}
            </div>
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
