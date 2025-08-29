'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

import type { AdminProfileDto } from '~/data/admin/get-admin-profile';
import { AdminAppSidebar } from './admin-app-sidebar';
import { AdminSettingsSidebar } from './admin-settings-sidebar';

export type AdminSidebarRendererProps = {
  profile: AdminProfileDto;
};

export function AdminSidebarRenderer(
  props: AdminSidebarRendererProps
): React.JSX.Element {
  const pathname = usePathname();

  // Check if we're in admin settings
  if (pathname.startsWith('/admin/settings')) {
    return <AdminSettingsSidebar profile={props.profile} />;
  }

  return <AdminAppSidebar profile={props.profile} />;
}