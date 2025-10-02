import * as React from 'react';
import { type Metadata } from 'next';

import {
  Page, PageActions,
  PageBody,
  PageHeader,
  PagePrimaryBar, PageSecondaryBar
} from '@workspace/ui/components/page';
import { Separator } from '@workspace/ui/components/separator';

import { getProfile } from '~/data/account/get-profile';
import { createTitle } from '~/lib/formatters';
import { AdminPageTitle } from "~/components/admin/admin-page-title";
import {EventRegistrationNav} from "~/components/admin/event-registration/event-registration-nav";

export const metadata: Metadata = {
  title: createTitle('Event Registration Management'),
};

export type EventRegistrationOverviewLayoutProps = {
  activeProducts: React.ReactNode;
  eventYearsManagement: React.ReactNode;
  invoiceManagement: React.ReactNode;
  paymentManagement: React.ReactNode;
  pendingPayments: React.ReactNode;
  productManagement: React.ReactNode;
  quickActions: React.ReactNode;
  systemAlerts: React.ReactNode;
  tentTracking: React.ReactNode;
  totalRevenue: React.ReactNode;
};

export default async function EventRegistrationOverviewLayout({
  activeProducts,
  eventYearsManagement,
  invoiceManagement,
  paymentManagement,
  pendingPayments,
  productManagement,
  quickActions,
  systemAlerts,
  tentTracking,
  totalRevenue,
}: EventRegistrationOverviewLayoutProps & NextPageProps): Promise<React.JSX.Element> {

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <AdminPageTitle
            title="Event Registration Management"
          />
        </PagePrimaryBar>
        <PageSecondaryBar>
          <EventRegistrationNav />
        </PageSecondaryBar>
      </PageHeader>
      <PageBody>
        <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6">
            <div>
              {pendingPayments}
            </div>
            <div>
              {totalRevenue}
            </div>
            <div>
              {activeProducts}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6">
            <div>
              {productManagement}
            </div>
            <div>
              {eventYearsManagement}
            </div>
            <div>
              {tentTracking}
            </div>
            <div>
              {paymentManagement}
            </div>
            <div>
              {invoiceManagement}
            </div>
            <div>
              {systemAlerts}
            </div>
          </div>
          {quickActions}
        </div>
      </PageBody>
    </Page>
  );
}
