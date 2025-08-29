'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

import {
  baseUrl,
  getPathname,
  replaceOrgSlug,
  routes
} from '@workspace/routes';

import { AppSidebar } from '~/components/organizations/slug/app-sidebar';
import { useActiveOrganization } from '~/hooks/use-active-organization';
import type { OrganizationDto } from '~/types/dtos/organization-dto';
import type { ProfileDto } from '~/types/dtos/profile-dto';

export type SidebarRendererProps = {
  organizations: OrganizationDto[];
  profile: ProfileDto;
};

export function SidebarRenderer(
  props: SidebarRendererProps
): React.JSX.Element {
  // Now using the unified collapsible sidebar for all organization routes
  return <AppSidebar {...props} />;
}
