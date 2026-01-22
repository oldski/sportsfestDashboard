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
  title: createTitle('Users')
};

export type UsersAdminDetailsLayoutProps = {
  usersTable: React.ReactNode;
};

export default async function UsersAdminDetailsLayout({
   usersTable
 }: UsersAdminDetailsLayoutProps): Promise<React.JSX.Element> {

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <AdminPageTitle
            title="Users"
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">SportsFest Dashboard Users</h3>
              <p className="text-sm text-muted-foreground">
                View all users on SportsFest Dashboard
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:gap-8">
            {usersTable}
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
