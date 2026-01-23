import * as React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getAuthContext } from '@workspace/auth/context';
import { SidebarInset } from '@workspace/ui/components/sidebar';

import { AdminSidebarRenderer } from '~/components/admin/admin-sidebar-renderer';
import { getAdminProfile } from '~/data/admin/get-admin-profile';
import { createTitle } from '~/lib/formatters';
import { isSuperAdmin } from '~/lib/admin-utils';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: createTitle('Admin')
};

// Disable route caching for admin pages - admins need fresh data on every request
export const dynamic = 'force-dynamic';

export default async function AdminLayout(
  props: NextPageProps & React.PropsWithChildren
): Promise<React.JSX.Element> {
  const ctx = await getAuthContext();

  if (!isSuperAdmin(ctx.session.user)) {
    redirect('/auth/sign-in');
  }

  const [cookieStore, profile] = await Promise.all([
    cookies(),
    getAdminProfile()
  ]);

  return (
    <div className="bg-background">
      <Providers
        defaultOpen={
          (cookieStore.get('admin-sidebar:state')?.value ?? 'true') === 'true'
        }
        defaultWidth={cookieStore.get('admin-sidebar:width')?.value}
      >
        <AdminSidebarRenderer
          profile={profile}
        />
        <SidebarInset
          className="bg-background relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2"
        >
          {props.children}
        </SidebarInset>
      </Providers>
    </div>
  );
}
