'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3Icon,
  CalendarDaysIcon,
  UsersIcon
} from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

const navigationItems = [
  {
    label: 'Analytics',
    href: '/admin/reports',
    icon: BarChart3Icon,
    description: 'Revenue, registration & organization analytics'
  },
  {
    label: 'Game Day',
    href: '/admin/reports/game-day',
    icon: CalendarDaysIcon,
    description: 'Real-time event day reports'
  },
  {
    label: 'Players',
    href: '/admin/reports/players',
    icon: UsersIcon,
    description: 'Player performance and registration analytics'
  }
];

export function ReportsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-1 overflow-x-auto">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        
        const isActive = pathname === item.href || 
          (item.href !== '/admin/reports' && pathname.startsWith(item.href));

        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'flex items-center space-x-2 whitespace-nowrap',
              isActive && 'shadow-sm'
            )}
          >
            <Link href={item.href}>
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}