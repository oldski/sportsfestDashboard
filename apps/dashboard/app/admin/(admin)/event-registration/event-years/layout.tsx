import * as React from 'react';
import { type Metadata } from 'next';
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';
import { PageTitle } from '@workspace/ui/components/page';

import { createTitle } from '~/lib/formatters';
import { EventYearDialogProvider } from '~/components/admin/event-registration/event-year-dialog-provider';
import { CreateEventYearButton } from '~/components/admin/event-registration/create-event-year-button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@workspace/ui/components/card";

// TODO: Implement analytics for event years (future enhancement)
// - Registration trends over time (daily/weekly signups)
// - Revenue breakdown by product/service type
// - Organization engagement and repeat participation
// - Geographic distribution and demographics
// - Year-over-year growth metrics and ROI analysis
// - Create analytics page at /admin/event-registration/event-years/[id]/analytics

export const metadata: Metadata = {
  title: createTitle('Event Years')
};

export type EventYearsLayoutProps = {
  eventYearsTable: React.ReactNode;
  eventYearStats: React.ReactNode;
};

export default async function EventYearsLayout({
  eventYearsTable,
  eventYearStats
}: EventYearsLayoutProps & NextPageProps): Promise<React.JSX.Element> {
  return (
    <EventYearDialogProvider>
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
              <PageTitle>Event Years Management</PageTitle>
            </div>
            <CreateEventYearButton />
          </PagePrimaryBar>
        </PageHeader>
        <PageBody disableScroll>
          <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">All Event Years</h3>
                <p className="text-sm text-muted-foreground">
                  Manage all SportsFest event years and their configurations
                </p>
              </div>
            </div>
            {eventYearStats}
            {eventYearsTable}
          </div>
        </PageBody>
      </Page>
    </EventYearDialogProvider>
  );
}
