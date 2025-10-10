'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

import { Footer } from '~/components/footer';
import { CookieBanner } from '~/components/fragments/cookie-banner';

const NO_LAYOUT_PATHS = ['/team-member-signup'];

export function ConditionalLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  const pathname = usePathname();
  const shouldShowLayout = !NO_LAYOUT_PATHS.includes(pathname);

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Footer />
      <CookieBanner />
    </>
  );
}
