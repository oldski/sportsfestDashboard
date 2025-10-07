import * as React from 'react';
import { type Metadata } from 'next';
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar,
  PageTitle
} from '@workspace/ui/components/page';

import { createTitle } from '~/lib/formatters';
import { RecordPaymentDialog } from '~/components/admin/event-registration/record-payment-dialog';
import { RecordPaymentDialogProvider } from '~/components/admin/event-registration/record-payment-dialog-provider';

export const metadata: Metadata = {
  title: createTitle('Invoices')
};

export type InvoicesLayoutProps = {
  invoiceTable: React.ReactNode;
  quickActions: React.ReactNode;
};

export default async function InvoicesLayout({
  invoiceTable,
  quickActions
}: InvoicesLayoutProps & NextPageProps): Promise<React.JSX.Element> {
  return (
    <RecordPaymentDialogProvider>
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
              <PageTitle>Invoices</PageTitle>
            </div>
          </PagePrimaryBar>
        </PageHeader>
        <PageBody>
          <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Invoice Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage organization invoices
                </p>
              </div>
            </div>
            {invoiceTable}
          </div>
        </PageBody>
      </Page>
      <RecordPaymentDialog />
    </RecordPaymentDialogProvider>
  );
}
