import * as React from 'react';
import { type Metadata } from 'next';

import { routes } from '@workspace/routes';
import { AnnotatedLayout } from '@workspace/ui/components/annotated';
import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';
import { Separator } from '@workspace/ui/components/separator';

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Developers')
};

export type DevelopersLayoutProps = {
  apiKeys: React.ReactNode;
  webhooks: React.ReactNode;
};

export default function DevelopersLayout({
  apiKeys,
  webhooks
}: DevelopersLayoutProps): React.JSX.Element {
  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            index={{
              route:
                routes.dashboard.organizations.slug.settings.organization.Index,
              title: 'Organization'
            }}
            title="Developers"
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <AnnotatedLayout>
          {apiKeys}
          <Separator />
          {webhooks}
        </AnnotatedLayout>
      </PageBody>
    </Page>
  );
}
