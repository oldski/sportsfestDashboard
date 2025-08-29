import * as React from 'react';
import { type Metadata } from 'next';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { replaceOrgSlug, routes } from '@workspace/routes';
import { AnnotatedLayout } from '@workspace/ui/components/annotated';
import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';
import { Separator } from '@workspace/ui/components/separator';

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { SuperAdminRouteGuard } from '~/components/admin/super-admin-route-guard';
import { getProfile } from '~/data/account/get-profile';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Developers')
};

export type DevelopersLayoutProps = {
  apiKeys: React.ReactNode;
  webhooks: React.ReactNode;
};

export default async function DevelopersLayout({
  apiKeys,
  webhooks
}: DevelopersLayoutProps): Promise<React.JSX.Element> {
  const [profile, ctx] = await Promise.all([
    getProfile(),
    getAuthOrganizationContext()
  ]);
  
  return (
    <SuperAdminRouteGuard 
      profile={profile} 
      settingType="developers"
      fallbackPath={replaceOrgSlug(routes.dashboard.organizations.slug.settings.organization.General, ctx.organization.slug)}
    >
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
    </SuperAdminRouteGuard>
  );
}
