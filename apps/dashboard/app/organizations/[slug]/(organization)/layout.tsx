import * as React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { billingConfig } from '@workspace/billing/config';
import { createPurchasesHelper } from '@workspace/billing/helpers';
import { replaceOrgSlug, routes } from '@workspace/routes';
import { SidebarInset } from '@workspace/ui/components/sidebar';

import { SidebarRenderer } from '~/components/organizations/slug/sidebar-renderer';
import { SuperAdminBanner } from '~/components/admin/super-admin-banner';
import { getProfile } from '~/data/account/get-profile';
import { getOrganizations } from '~/data/organization/get-organizations';
import { createTitle } from '~/lib/formatters';
import { isSuperAdmin } from '~/lib/admin-utils';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: createTitle('Organization')
};

const freeProductExists = billingConfig.products.some(
  (product) => product.isFree
);

export default async function OrganizationLayout(
  props: NextPageProps & React.PropsWithChildren
): Promise<React.JSX.Element> {
  const ctx = await getAuthOrganizationContext();

  const { hasPurchasedProduct } = createPurchasesHelper(ctx.organization);
  if (!freeProductExists && !hasPurchasedProduct()) {
    return redirect(
      replaceOrgSlug(
        routes.dashboard.organizations.slug.ChoosePlan,
        ctx.organization.slug
      )
    );
  }

  const [cookieStore, organizations, profile] = await Promise.all([
    cookies(),
    getOrganizations(),
    getProfile()
  ]);
  return (
    <div className="flex flex-col size-full overflow-hidden">
      <Providers
        organization={ctx.organization}
        defaultOpen={
          (cookieStore.get('sidebar:state')?.value ?? 'true') === 'true'
        }
        defaultWidth={cookieStore.get('sidebar:width')?.value}
      >
        <SidebarRenderer
          organizations={organizations}
          profile={profile}
        />
        {/* Set max-width so full-width tables can overflow horizontally correctly */}
        <SidebarInset
          id="skip"
          className="bg-background relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2"
        >
          {isSuperAdmin(profile) && <SuperAdminBanner className="mb-4" organizationName={ctx.organization.name} />}
          {props.children}
        </SidebarInset>
      </Providers>
    </div>
  );
}
