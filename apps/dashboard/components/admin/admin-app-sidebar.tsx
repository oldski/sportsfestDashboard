'use client';

import * as React from 'react';
import Link from 'next/link';
import type { AdminProfileDto } from '~/data/admin/get-admin-profile';
import { usePathname } from 'next/navigation';
import {
  BarChart3Icon,
  BuildingIcon,
  HomeIcon,
  SettingsIcon,
  UsersIcon,
  ShoppingCartIcon
} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar';

import { NavUser } from '~/components/shared/nav-user';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
    description: 'Overview and quick actions'
  },
  {
    title: 'Event Registration',
    href: '/admin/event-registration',
    icon: ShoppingCartIcon,
    description: 'Product catalog and registration management'
  },
  {
    title: 'Organizations',
    href: '/admin/organizations',
    icon: BuildingIcon,
    description: 'Manage participating companies'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: UsersIcon,
    description: 'Global user administration'
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: BarChart3Icon,
    description: 'Analytics and insights'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: SettingsIcon,
    description: 'System configuration'
  }
];

const quickAccessItems = [
  {
    title: 'View Organizations',
    href: '/organizations',
    icon: BuildingIcon,
  }
];

interface AdminAppSidebarProps {
  profile: AdminProfileDto;
}

export function AdminAppSidebar({ profile }: AdminAppSidebarProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-sm font-bold">SF</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SportsFest</span>
                  <Badge variant="secondary" className="w-fit text-xs">
                    Admin
                  </Badge>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickAccessItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="h-14">
        <NavUser
          profile={profile}
          mode="admin"
          className="p-0"
        />
      </SidebarFooter>
    </Sidebar>
  );
}
