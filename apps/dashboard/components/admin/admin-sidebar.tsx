'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3Icon,
  BuildingIcon,
  HomeIcon,
  SettingsIcon,
  UsersIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
  UserCheckIcon
} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

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
    title: 'Players',
    href: '/admin/players',
    icon: UserCheckIcon,
    description: 'Player management and statistics'
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

export function AdminSidebar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-50 border-r">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">SF</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">SportsFest</h1>
            <Badge variant="secondary" className="text-xs">Admin</Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        {adminNavItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start h-auto p-3 text-left',
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.title}</div>
                  </div>
                  {isActive && <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />}
                </div>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Organization Access */}
      <div className="p-4 border-t">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Quick Access
        </div>
        <Link href="/organizations">
          <Button variant="outline" className="w-full justify-start">
            <BuildingIcon className="mr-2 h-4 w-4" />
            View Organizations
          </Button>
        </Link>
      </div>
    </div>
  );
}
