import * as React from 'react';
import { type Metadata } from 'next';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';

import { createTitle } from '~/lib/formatters';
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';
import { PageTitle } from '@workspace/ui/components/page';
import {AdminPageTitle} from "~/components/admin/admin-page-title";

export const metadata: Metadata = {
  title: createTitle('Players')
};

export type PlayersAdminDetailsLayoutProps = {
  playersTable: React.ReactNode;
};

export default async function PlayersAdminDetailsLayout({
    playersTable
  }: PlayersAdminDetailsLayoutProps & NextPageProps): Promise<React.JSX.Element> {
  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <div className="flex flex-row items-center gap-2">
            <AdminPageTitle
              title="Players"
            />
          </div>
        </PagePrimaryBar>
      </PageHeader>
      <PageBody disableScroll>
        <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Players Table</h3>
              <p className="text-sm text-muted-foreground">
                View all interested players from all companies
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:gap-8">
            {playersTable}
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
