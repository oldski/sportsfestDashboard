'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PackageIcon,
  CalendarIcon,
  TentIcon,
  CreditCardIcon,
  FileTextIcon,
  BarChart3Icon,
  TagIcon,
  HeartHandshakeIcon
} from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

const navigationItems = [
  {
    label: 'Overview',
    href: '/admin/event-registration',
    icon: BarChart3Icon,
    description: 'Dashboard and quick stats'
  },
  {
    label: 'Products',
    href: '/admin/event-registration/products',
    icon: PackageIcon,
    description: 'Manage product catalog'
  },
  {
    label: 'Coupons',
    href: '/admin/event-registration/coupons',
    icon: TagIcon,
    description: 'Manage discount coupons'
  },
  {
    label: 'Event Years',
    href: '/admin/event-registration/event-years',
    icon: CalendarIcon,
    description: 'Manage event years'
  },
  {
    label: 'Tent Tracking',
    href: '/admin/event-registration/tent-tracking',
    icon: TentIcon,
    description: 'Monitor tent purchases'
  },
  {
    label: 'Payments',
    href: '/admin/event-registration/payments',
    icon: CreditCardIcon,
    description: 'Payment management'
  },
  {
    label: 'Invoices',
    href: '/admin/event-registration/invoices',
    icon: FileTextIcon,
    description: 'Invoice management'
  },
  {
    label: 'Sponsorships',
    href: '/admin/event-registration/sponsorships',
    icon: HeartHandshakeIcon,
    description: 'Manage sponsorship invoices'
  }
];

export function EventRegistrationNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-1 overflow-x-auto">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || 
          (item.href !== '/admin/event-registration' && pathname.startsWith(item.href));

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