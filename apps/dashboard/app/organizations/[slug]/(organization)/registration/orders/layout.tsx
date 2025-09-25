import * as React from 'react';
import { type Metadata } from 'next';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { routes } from '@workspace/routes';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';
import { Separator } from '@workspace/ui/components/separator';

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { getProfile } from '~/data/account/get-profile';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Shop')
};

export type OrdersLayoutProps = {
  ordersTable: React.ReactNode;
};

export default async function OrdersLayout({
   ordersTable
}: OrdersLayoutProps & NextPageProps): Promise<React.JSX.Element> {
  const [profile, ctx] = await Promise.all([
    getProfile(),
    getAuthOrganizationContext()
  ]);

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            index={{
              route: routes.dashboard.organizations.slug.registration.Index,
              title: 'Registration'
            }}
            title="Orders"
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody disableScroll>
        <div className="mx-auto w-full space-y-4 p-2 py-4 sm:space-y-8 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Orders</h3>
              <p className="text-sm text-muted-foreground">
                Your orders of current and past SportsFest Events
              </p>
            </div>
          </div>
          {ordersTable}
        </div>
      </PageBody>
    </Page>
  );
}
