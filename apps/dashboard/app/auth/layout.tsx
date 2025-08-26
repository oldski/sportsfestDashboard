import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { dedupedAuth } from '@workspace/auth';
import { getRequestStoragePathname } from '@workspace/auth/redirect';
import { baseUrl, getPathname, routes } from '@workspace/routes';
import { Logo } from '@workspace/ui/components/logo';
import { ThemeToggle } from '@workspace/ui/components/theme-toggle';

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
    return redirect(routes.dashboard.organizations.Index);
  }
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 items-center justify-between md:p-10">
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
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://unsplash.com/illustrations/beach-scene-framed-within-an-arched-structure-0Zhn6UiW7zc"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />

        <ThemeToggle className="fixed bottom-2 right-2 rounded-full" />
      </div>
    </main>
  );
}
