import * as React from 'react';
import { type Metadata } from 'next';

import {
  Page, PageActions,
  PageBody,
  PageHeader,
  PagePrimaryBar, PageSecondaryBar
} from '@workspace/ui/components/page';

import { createTitle } from '~/lib/formatters';
import { AdminPageTitle } from "~/components/admin/admin-page-title";

export const metadata: Metadata = {
  title: createTitle('Organizations')
};

export type AdminOrganizationsLayoutProps = {};

export default async function AdminOrganizationsLayout({ children }: AdminOrganizationsLayoutProps & React.PropsWithChildren & NextPageProps): Promise<React.JSX.Element> {

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <AdminPageTitle
            title="Organizations"
          />
          <PageActions>
            actions area. see org / home for reference
          </PageActions>
        </PagePrimaryBar>
        <PageSecondaryBar>
          sfsdf
        </PageSecondaryBar>
      </PageHeader>
      <PageBody>
        <div className="mx-auto space-y-2 p-2 sm:space-y-8 sm:p-6">
          {children}
        </div>
      </PageBody>
    </Page>
  );
}
