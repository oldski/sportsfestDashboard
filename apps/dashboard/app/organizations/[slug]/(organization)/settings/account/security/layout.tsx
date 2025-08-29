import * as React from 'react';
import { type Metadata } from 'next';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { session } from '@workspace/auth/session';
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
  title: createTitle('Security')
};

export type SecurityLayoutProps = {
  changePassword: React.ReactNode;
  connectedAccounts: React.ReactNode;
  multiFactorAuthentication: React.ReactNode;
  manageSessions: React.ReactNode;
};

export default async function SecurityLayout({
  changePassword,
  multiFactorAuthentication,
  manageSessions
}: SecurityLayoutProps): Promise<React.JSX.Element> {
  const [profile, ctx] = await Promise.all([
    getProfile(),
    getAuthOrganizationContext()
  ]);
  
  return (
    <SuperAdminRouteGuard 
      profile={profile} 
      settingType="account"
      fallbackPath={replaceOrgSlug(routes.dashboard.organizations.slug.settings.organization.General, ctx.organization.slug)}
    >
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              index={{
                route: routes.dashboard.organizations.slug.settings.account.Index,
                title: 'Account'
              }}
              title="Security"
            />
          </PagePrimaryBar>
        </PageHeader>
        <PageBody>
          <AnnotatedLayout>
            {changePassword}
            <Separator />
            {multiFactorAuthentication}
            {session.strategy === 'database' && (
              <>
                <Separator />
                {manageSessions}
              </>
            )}
          </AnnotatedLayout>
        </PageBody>
      </Page>
    </SuperAdminRouteGuard>
  );
}
