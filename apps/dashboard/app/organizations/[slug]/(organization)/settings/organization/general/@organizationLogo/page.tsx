import * as React from 'react';

import { getAuthOrganizationContext } from '@workspace/auth/context';

import { OrganizationLogoCard } from '~/components/organizations/slug/settings/organization/general/organization-logo-card';
import { getOrganizationLogo } from '~/data/organization/get-organization-logo';

export default async function OrganizationLogoPage(): Promise<React.JSX.Element> {
  const logo = await getOrganizationLogo();
  const ctx = await getAuthOrganizationContext();
  return <OrganizationLogoCard logo={logo} organizationSlug={ctx.organization.slug} />;
}
