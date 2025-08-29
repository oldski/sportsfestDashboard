import * as React from 'react';
import { type Metadata } from 'next';

import { routes } from '@workspace/routes';
import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Registration Overview')
};

export type RegistrationOverviewLayoutProps = {
  snapshot: React.ReactNode;
  shopProducts: React.ReactNode;
  viewOrders: React.ReactNode;
  invoices: React.ReactNode;
  recentActivity: React.ReactNode;
};


export default function RegistrationOverviewLayout({
  snapshot,
  shopProducts,
  viewOrders,
  invoices,
  recentActivity
}: RegistrationOverviewLayoutProps): React.JSX.Element {
  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            title="Registration Overview"
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <div className="mx-auto space-y-2 p-2 sm:space-y-8 sm:p-6">
          {snapshot}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              {shopProducts}
            </div>
            <div>
              {viewOrders}
            </div>
            <div>
              {invoices}
            </div>
          </div>

          {recentActivity}
        </div>
      </PageBody>
    </Page>
  );
}
