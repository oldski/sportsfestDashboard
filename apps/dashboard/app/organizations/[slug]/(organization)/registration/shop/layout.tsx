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

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Shop')
};

export type ShopLayoutProps = {
  products: React.ReactNode;
  shoppingCart: React.ReactNode;
};

export default async function ShopLayout({
  products,
  shoppingCart
}: ShopLayoutProps & NextPageProps): Promise<React.JSX.Element> {

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            index={{
              route: routes.dashboard.organizations.slug.registration.Index,
              title: 'Registration'
            }}
            title="Shop"
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <div className="mx-auto space-y-2 p-2 sm:space-y-8 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="w-full lg:w-2/3">
              {products}
            </div>
            <div className="w-full lg:w-1/3">
              {shoppingCart}
            </div>
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
