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
  title: createTitle('Game Day Reports')
};

export type GameDayLayoutProps = {};

export default async function GameDayLayout({ children }: GameDayLayoutProps & React.PropsWithChildren & NextPageProps): Promise<React.JSX.Element> {

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <AdminPageTitle
            title="Game Day Reports"
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
