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

export const metadata: Metadata = {
  title: createTitle('Payments')
};

export type PaymentsLayoutProps = {
  completedPayments: React.ReactNode;
  failedPayments: React.ReactNode;
  pendingPayments: React.ReactNode;
};

export default async function PaymentsLayout({
  completedPayments,
  failedPayments,
  pendingPayments
}: PaymentsLayoutProps & NextPageProps): Promise<React.JSX.Element> {
  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <div className="flex flex-row items-center gap-2">
            <Link
              className="text-sm font-semibold hover:underline"
              href="/admin/event-registration"
            >
              Event Registration
            </Link>
            <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <PageTitle>Payments</PageTitle>
          </div>
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <div className="mx-auto space-y-2 p-2 sm:space-y-8 sm:p-6">
          {failedPayments}
          {pendingPayments}
          {completedPayments}
        </div>
      </PageBody>
    </Page>
  );
}
