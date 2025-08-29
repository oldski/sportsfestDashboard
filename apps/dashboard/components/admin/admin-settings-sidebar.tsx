'use client';

import * as React from 'react';
import Link from 'next/link';
import type { AdminProfileDto } from '~/data/admin/get-admin-profile';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftIcon,
  SettingsIcon,
  DatabaseIcon,
  ShieldIcon,
  BellIcon,
  CogIcon,
  ChevronsUpDownIcon,
  LogOutIcon,
  UserIcon
} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
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
  SidebarRail,
} from '@workspace/ui/components/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';

const adminSettingsNavItems = [
  {
    title: 'System Configuration',
    href: '/admin/settings/system',
    icon: CogIcon,
    description: 'Global system settings'
  },
  {
    title: 'Database Management',
    href: '/admin/settings/database',
    icon: DatabaseIcon,
    description: 'Database configuration and maintenance'
  },
  {
    title: 'Security Settings',
    href: '/admin/settings/security',
    icon: ShieldIcon,
    description: 'Security policies and access control'
  },
  {
    title: 'Notifications',
    href: '/admin/settings/notifications',
    icon: BellIcon,
    description: 'Email and system notifications'
  }
];

interface AdminSettingsSidebarProps {
  profile: AdminProfileDto;
}

export function AdminSettingsSidebar({ profile }: AdminSettingsSidebarProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ArrowLeftIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Settings</span>
                  <Badge variant="secondary" className="w-fit text-xs">
                    Configuration
                  </Badge>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminSettingsNavItems.map((item) => {
                const isActive = pathname === item.href ||
                  (pathname.startsWith(item.href) && item.href !== '/admin/settings');

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
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage 
                      src={profile.image || undefined} 
                      alt={profile.name || 'Admin'} 
                    />
                    <AvatarFallback className="rounded-lg">
                      {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile.name || 'Admin User'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {profile.email || 'admin@sportsfest.com'}
                    </span>
                  </div>
                  <ChevronsUpDownIcon className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage 
                        src={profile.image || undefined} 
                        alt={profile.name || 'Admin'} 
                      />
                      <AvatarFallback className="rounded-lg">
                        {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {profile.name || 'Admin User'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {profile.email || 'admin@sportsfest.com'}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <ArrowLeftIcon />
                    Back to Admin
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/organizations">
                    <UserIcon />
                    Switch to Organizations
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/auth/sign-out">
                    <LogOutIcon />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}