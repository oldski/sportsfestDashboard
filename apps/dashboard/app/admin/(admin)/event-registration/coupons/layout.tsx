import * as React from 'react';
import { type Metadata } from 'next';
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar,
  PageSecondaryBar,
  PageTitle
} from '@workspace/ui/components/page';

import { createTitle } from '~/lib/formatters';
import { EventRegistrationNav } from '~/components/admin/event-registration/event-registration-nav';
import { CreateCouponButton } from '~/components/admin/event-registration/create-coupon-button';
import { CreateCouponDialog } from '~/components/admin/event-registration/create-coupon-dialog';
import { CreateCouponDialogProvider } from '~/components/admin/event-registration/create-coupon-dialog-provider';

export const metadata: Metadata = {
  title: createTitle('Coupon Management')
};

export type CouponsLayoutProps = {
  couponManagementTable: React.ReactNode;
};

export default async function CouponsLayout({
  couponManagementTable,
}: CouponsLayoutProps & NextPageProps): Promise<React.JSX.Element> {
  return (
    <CreateCouponDialogProvider>
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
                <PageTitle>Coupon Management</PageTitle>
              </div>
              <CreateCouponButton />
            </PagePrimaryBar>
            <PageSecondaryBar>
              <EventRegistrationNav />
            </PageSecondaryBar>
          </PageHeader>
          <PageBody disableScroll>
            <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6 ">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Coupon Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and manage discount coupons for organizations
                  </p>
                </div>
              </div>
              <div className="w-full">
                {couponManagementTable}
              </div>
            </div>
          </PageBody>
        </Page>
        <CreateCouponDialog />
      </CreateCouponDialogProvider>
  );
}
