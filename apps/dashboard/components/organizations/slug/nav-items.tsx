import {
  BellIcon,
  BuildingIcon,
  ChartBarBigIcon,
  CreditCardIcon,
  HomeIcon,
  LockKeyholeIcon,
  SettingsIcon,
  StoreIcon,
  UserIcon,
  UserPlus2Icon,
  UsersIcon,
  VolleyballIcon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { replaceOrgSlug, routes } from '@workspace/routes';

type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon: LucideIcon;
};

export function createMainNavItems(slug: string): NavItem[] {
  return [
    {
      title: 'Home',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Home, slug),
      icon: HomeIcon
    },
    {
      title: 'Teams',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Teams, slug),
      icon: VolleyballIcon
    },
    {
      title: 'Players',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Players, slug),
      icon: UsersIcon
    },
    {
      title: 'Settings',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.Index,
        slug
      ),
      icon: SettingsIcon
    }
  ];
}

export function createAccountNavItems(slug: string): NavItem[] {
  return [
    {
      title: 'Profile',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.account.Profile,
        slug
      ),
      icon: UserIcon
    },
    {
      title: 'Security',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.account.Security,
        slug
      ),
      icon: LockKeyholeIcon
    },
    {
      title: 'Notifications',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.account.Notifications,
        slug
      ),
      icon: BellIcon
    }
  ];
}

export function createSuperAdminNavItems(slug: string): NavItem[] {
  return [
    {
      title: 'Organizations',
      href: routes.dashboard.organizations.Index,
      icon: BuildingIcon
    },
    {
      title: 'Reports',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Reports, slug),
      icon: ChartBarBigIcon
    },
    {
      title: 'Settings',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.Index,
        slug
      ),
      icon: SettingsIcon
    }
  ];
}

export function createOrganizationNavItems(slug: string): NavItem[] {
  return [
    {
      title: 'General',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.General,
        slug
      ),
      icon: StoreIcon
    },
    {
      title: 'Members',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Members,
        slug
      ),
      icon: UserPlus2Icon
    },
    {
      title: 'Billing',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Billing,
        slug
      ),
      icon: CreditCardIcon
    },
  ];
}
