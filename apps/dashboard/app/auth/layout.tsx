import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { dedupedAuth } from '@workspace/auth';
import { getRequestStoragePathname } from '@workspace/auth/redirect';
import { baseUrl, getPathname, replaceOrgSlug, routes } from '@workspace/routes';
import { Logo } from '@workspace/ui/components/logo';
import { ThemeToggle } from '@workspace/ui/components/theme-toggle';

import { getOrganizations } from '~/data/organization/get-organizations';
import { createTitle } from '~/lib/formatters';

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
      <div className="w-full md:w-1/3 flex flex-col gap-4 p-6 items-center justify-between md:p-10 bg-transparent md:bg-zinc-200">
        <div className="flex justify-center gap-2">
          <Link
            href={routes.marketing.Index}
            className="flex items-center gap-2 font-medium"
          >
            <Logo />
          </Link>
        </div>
        {children}
      </div>
      <div className="w-full md:w-2/3 bg-muted relative block">
        <img
          src="/images/team-photo.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />

        <ThemeToggle className="fixed bottom-2 right-2 rounded-full" />
      </div>
    </main>
  );
}
