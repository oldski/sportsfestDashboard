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
import { CreateSponsorshipDialogProvider } from '~/components/admin/event-registration/create-sponsorship-dialog-provider';
import { CreateSponsorshipDialog } from '~/components/admin/event-registration/create-sponsorship-dialog';
import { CreateSponsorshipButton } from '~/components/admin/event-registration/create-sponsorship-button';

export const metadata: Metadata = {
  title: createTitle('Sponsorships')
};

export type SponsorshipsLayoutProps = {
  sponsorshipTable: React.ReactNode;
};

export default async function SponsorshipsLayout({
  sponsorshipTable
}: SponsorshipsLayoutProps & NextPageProps): Promise<React.JSX.Element> {
  return (
    <CreateSponsorshipDialogProvider>
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
              <PageTitle>Sponsorships</PageTitle>
            </div>
            <CreateSponsorshipButton />
          </PagePrimaryBar>
        </PageHeader>
        <PageBody>
          <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Sponsorship Management</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage sponsorship invoices
                </p>
              </div>
            </div>
            {sponsorshipTable}
          </div>
        </PageBody>
      </Page>
      <CreateSponsorshipDialog />
    </CreateSponsorshipDialogProvider>
  );
}
