'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

import type { AdminProfileDto } from '~/data/admin/get-admin-profile';
import { AdminAppSidebar } from './admin-app-sidebar';

export type AdminSidebarRendererProps = {
  profile: AdminProfileDto;
};

export function AdminSidebarRenderer(
  props: AdminSidebarRendererProps
): React.JSX.Element {
  // Now using the unified collapsible sidebar for all admin routes
  return <AdminAppSidebar profile={props.profile} />;
}