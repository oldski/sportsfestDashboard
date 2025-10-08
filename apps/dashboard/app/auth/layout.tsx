import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { dedupedAuth } from '@workspace/auth';
import { getRequestStoragePathname } from '@workspace/auth/redirect';
import { baseUrl, getPathname, replaceOrgSlug, routes } from '@workspace/routes';
import { Logo } from '@workspace/ui/components/logo';

import { getOrganizations } from '~/data/organization/get-organizations';
import { createTitle } from '~/lib/formatters';
import { isSuperAdmin } from '~/lib/admin-utils';
import { Footer } from "~/components/auth/footer";

export const metadata: Metadata = {
  title: createTitle('Auth')
};

function isChangeEmailRoute(): boolean {
  const pathname = getRequestStoragePathname();
  return (
    !!pathname &&
    pathname.startsWith(
      getPathname(routes.dashboard.auth.changeEmail.Index, baseUrl.Dashboard)
    )
  );
}

export default async function AuthLayout({
  children
}: React.PropsWithChildren): Promise<React.JSX.Element> {
  const session = await dedupedAuth();

  if (!isChangeEmailRoute() && session) {
    // Check if user is a super admin
    if (isSuperAdmin(session.user)) {
      // Redirect super admins to the admin area
      return redirect('/admin');
    }
    // Get user's organizations and redirect to their primary organization
    const organizations = await getOrganizations();
    if (organizations.length > 0) {
      // Redirect to the first organization (primary organization)
      return redirect(replaceOrgSlug(routes.dashboard.organizations.slug.Home, organizations[0].slug));
    } else {
      // Fallback to organization selection if no organizations
      return redirect(routes.dashboard.organizations.Index);
    }
  }
  return (
    <main className="flex min-h-svh">
      <div className="fixed h-screen w-screen block z-0">
        <img
          src="/assets/team-photo.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="z-10 w-1/3 mx-auto flex flex-col items-center gap-6 space-y-6 p-6 md:p-10 ">
        <div className="flex justify-center gap-2">
          <Link
            href={routes.marketing.Index}
            className="flex items-center gap-2 font-medium"
          >
            <Logo variant="light" isFull />
          </Link>
        </div>
        {children}
      </div>

      <Footer />
    </main>
  );
}
