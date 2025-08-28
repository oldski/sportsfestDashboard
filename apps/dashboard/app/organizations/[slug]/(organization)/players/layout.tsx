import * as React from 'react';
import type { Metadata } from 'next';

import { createTitle } from '~/lib/formatters';
import {Page, PageActions, PageBody, PageHeader, PagePrimaryBar, PageSecondaryBar} from "@workspace/ui/components/page";
import {OrganizationPageTitle} from "~/components/organizations/slug/organization-page-title";
import {TransitionProvider} from "~/hooks/use-transition-context";

export const metadata: Metadata = {
  title: createTitle('Players')
};

export default function PlayersLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Players"
              info=" Players who've showed interest in joining the team"
            />
            <PageActions>
              actions area. see org / home for reference
            </PageActions>
          </PagePrimaryBar>
          <PageSecondaryBar>
            Add a link to copy URL Here
          </PageSecondaryBar>
        </PageHeader>
        <PageBody>
          <div className="mx-auto w-full space-y-2 p-2 sm:space-y-8 sm:p-6">
            {children}
          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}
