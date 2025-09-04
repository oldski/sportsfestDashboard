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
  title: createTitle('Reports & Analytics')
};

export type ReportsLayoutProps = {};

export default async function ReportsLayout({ children }: ReportsLayoutProps & React.PropsWithChildren & NextPageProps): Promise<React.JSX.Element> {
  return(
    <div className="flex h-screen flex-row overflow-hidden">
      <div className="size-full">{children}</div>
    </div>
  )
}
