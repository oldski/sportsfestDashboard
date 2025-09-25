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
  title: createTitle('Tent Purchase Details')
};

export type TentTrackingPurchaseDetailsLayoutProps = {
  atLimit: React.ReactNode;
  totalPurchases: React.ReactNode;
  tentPurchaseDetails: React.ReactNode;
  tentAvailability: React.ReactNode;
};

export default async function TentTrackingPurchaseDetailsLayout({
  atLimit,
  totalPurchases,
  tentPurchaseDetails,
  tentAvailability
}: TentTrackingPurchaseDetailsLayoutProps & NextPageProps): Promise<React.JSX.Element> {
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
            <PageTitle>Tent tentPurchaseDetails</PageTitle>
          </div>
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Tent Purchase Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor tent purchases and enforce 2-tent limit per organization
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
            <div className="lg:col-span-3">
              {tentPurchaseDetails}
            </div>
            <div className="lg:col-span-1 space-y-6">
              {tentAvailability}
            </div>
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
