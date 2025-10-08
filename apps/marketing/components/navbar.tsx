'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { baseUrl, getPathname, routes } from '@workspace/routes';
import { buttonVariants } from '@workspace/ui/components/button';
import { Logo } from '@workspace/ui/components/logo';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@workspace/ui/components/navigation-menu';
import { ThemeToggle } from '@workspace/ui/components/theme-toggle';
import { cn } from '@workspace/ui/lib/utils';

import { ExternalLink } from '~/components/fragments/external-link';
import { MobileMenu } from '~/components/mobile-menu';

export function Navbar(): React.JSX.Element {
  const pathname = usePathname();
  return (
    <section className="sticky inset-x-0 top-0 z-40 border-b bg-background py-4">
      <div className="container">
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-x-9">
            <Link
              href={routes.marketing.Index}
              className="flex items-center gap-2"
            >
              <Logo />
            </Link>
            <div className="flex items-center">
              <NavigationMenu
                style={
                  {
                    ['--radius']: '1rem'
                  } as React.CSSProperties
                }
              >
                <NavigationMenuList>
                  empty menu
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="rounded-xl border-none shadow-none" />
            <Link
              href={routes.dashboard.auth.SignIn}
              className={cn(
                buttonVariants({
                  variant: 'outline'
                }),
                'rounded-xl'
              )}
            >
              Sign in
            </Link>
            <Link
              href={routes.dashboard.auth.SignUp}
              className={cn(
                buttonVariants({
                  variant: 'default'
                }),
                'rounded-xl'
              )}
            >
              Start for free
            </Link>
          </div>
        </nav>
        <MobileMenu className="lg:hidden" />
      </div>
    </section>
  );
}
