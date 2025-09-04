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
import { ReportsNav } from "~/components/admin/reports/reports-nav";

export const metadata: Metadata = {
  title: createTitle('Players')
};

export type ReportsAnalyticsLayoutProps = {};

export default async function ReportsAnalyticsLayout({ children }: ReportsAnalyticsLayoutProps & React.PropsWithChildren & NextPageProps): Promise<React.JSX.Element> {

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <AdminPageTitle
            title="Player Reports"
          />
        </PagePrimaryBar>
        <PageSecondaryBar>
          <ReportsNav />
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
