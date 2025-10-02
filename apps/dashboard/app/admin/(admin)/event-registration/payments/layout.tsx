import * as React from 'react';
import { type Metadata } from 'next';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar, PageSecondaryBar
} from '@workspace/ui/components/page';

import { createTitle } from '~/lib/formatters';
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';
import { PageTitle } from '@workspace/ui/components/page';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@workspace/ui/components/tabs";

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
      <Tabs defaultValue="completedPayments">
      <PageSecondaryBar>
        <TabsList>
          <TabsTrigger value="completedPayments">Completed</TabsTrigger>
          <TabsTrigger value="pendingPayments">Pending</TabsTrigger>
          <TabsTrigger value="failedPayments">Failed</TabsTrigger>
        </TabsList>
      </PageSecondaryBar>
      <PageBody>
        <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
          <TabsContent value="completedPayments" className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Completed Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Successfully processed transactions
                </p>
              </div>
            </div>
            {completedPayments}
          </TabsContent>
          <TabsContent value="pendingPayments" className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Pending Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Payments awaiting processing or customer action
                </p>
              </div>
            </div>
            {pendingPayments}
          </TabsContent>
          <TabsContent value="failedPayments" className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Failed Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Payments that failed processing and require attention
                </p>
              </div>
            </div>
            {failedPayments}
          </TabsContent>
        </div>
      </PageBody>
      </Tabs>
    </Page>
  );
}
