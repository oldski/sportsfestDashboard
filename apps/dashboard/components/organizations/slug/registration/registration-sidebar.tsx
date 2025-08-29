'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {baseUrl, getPathname, replaceOrgSlug, routes} from '@workspace/routes';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarGroupProps, SidebarHeader
} from '@workspace/ui/components/sidebar';
import { cn } from '@workspace/ui/lib/utils';

import { createRegistrationNavItems } from '~/components/organizations/slug/nav-items';
import { useActiveOrganization } from '~/hooks/use-active-organization';
import {ChevronLeftIcon} from "lucide-react";

export type RegistrationSidebarProps = SidebarGroupProps;

export function RegistrationSidebar({ ...props }: RegistrationSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const activeOrganization = useActiveOrganization();

  const navItems = createRegistrationNavItems(activeOrganization.slug);

  return (
    <SidebarGroup {...props}>
      <SidebarHeader className="flex h-14 flex-row items-center py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Back"
            >
              <Link
                href={replaceOrgSlug(
                  routes.dashboard.organizations.slug.Home,
                  activeOrganization.slug
                )}
                className="h-10"
              >
                <ChevronLeftIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-semibold">Registration</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarGroupLabel>Registration</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item, index) => {
          const isActive = pathname === getPathname(item.href, baseUrl.Dashboard);

          return (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
              >
                <Link
                  href={item.disabled ? '~/' : item.href}
                  target={item.external ? '_blank' : undefined}
                >
                  <item.icon
                    className={cn(
                      'size-4 shrink-0',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  />
                  <span
                    className={
                      isActive
                        ? 'dark:text-foreground'
                        : 'dark:text-muted-foreground'
                    }
                  >
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
