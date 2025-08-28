import * as React from 'react';
import type { Metadata } from 'next';

import { createTitle } from '~/lib/formatters';
import {Page, PageActions, PageBody, PageHeader, PagePrimaryBar, PageSecondaryBar} from "@workspace/ui/components/page";
import {OrganizationPageTitle} from "~/components/organizations/slug/organization-page-title";
import {TransitionProvider} from "~/hooks/use-transition-context";

export const metadata: Metadata = {
  title: createTitle('Teams')
};

export default function TeamsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Teams"
              info="Company Teams"
            />
            <PageActions>
              actions area. see org / home for reference
            </PageActions>
          </PagePrimaryBar>
          <PageSecondaryBar>
            a secondary bar
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
