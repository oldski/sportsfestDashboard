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
import { CreateInvoiceButton } from '~/components/admin/event-registration/create-invoice-button';
import { CreateInvoiceDialog } from '~/components/admin/event-registration/create-invoice-dialog';
import { CreateInvoiceDialogProvider } from '~/components/admin/event-registration/create-invoice-dialog-provider';
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
    <CreateInvoiceDialogProvider>
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
              <CreateInvoiceButton />
            </PagePrimaryBar>
          </PageHeader>
          <PageBody>
            <div className="mx-auto space-y-2 p-2 sm:space-y-8 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Invoice Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate and manage organization invoices
                  </p>
                </div>

              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
                <div className="lg:col-span-3">
                  {invoiceTable}
                </div>
                <div className="lg:col-span-1">
                  {quickActions}
                </div>
              </div>
            </div>
          </PageBody>
        </Page>
        <CreateInvoiceDialog />
        <RecordPaymentDialog />
      </RecordPaymentDialogProvider>
    </CreateInvoiceDialogProvider>
  );
}
