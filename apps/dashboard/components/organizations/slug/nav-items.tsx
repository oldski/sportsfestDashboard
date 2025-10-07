import {
  BellIcon,
  BuildingIcon,
  ChartBarBigIcon,
  ClipboardCheckIcon,
  CreditCardIcon,
  FileTextIcon,
  HomeIcon,
  LockKeyholeIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingCartIcon,
  StoreIcon,
  UserIcon,
  UserPlus2Icon,
  UsersIcon,
  VolleyballIcon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { replaceOrgSlug, routes } from '@workspace/routes';
import { getSettingsAccess } from '~/lib/super-admin-settings';
import type { ProfileDto } from '~/types/dtos/profile-dto';

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
      title: 'Registration',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.registration.Index, slug),
      icon: ClipboardCheckIcon
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

export function createOrganizationNavItems(slug: string, profile?: ProfileDto): NavItem[] {
  const access = profile ? getSettingsAccess(profile) : {
    canViewGeneral: true,
    canViewMembers: true,
    canViewBilling: true,
    canViewDevelopers: true,
    canViewAccountSettings: true,
    isImpersonating: false
  };

  const allItems = [
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
    // {
    //   title: 'Billing',
    //   href: replaceOrgSlug(
    //     routes.dashboard.organizations.slug.settings.organization.Billing,
    //     slug
    //   ),
    //   icon: CreditCardIcon
    // },
  ];

  // Filter items based on access permissions
  return allItems.filter(item => {
    if (item.title === 'General') return access.canViewGeneral;
    if (item.title === 'Members') return access.canViewMembers;
    if (item.title === 'Billing') return access.canViewBilling;
    return true; // Default allow for any other items
  });
}

export function createRegistrationNavItems(slug: string): NavItem[] {
  return [
    {
      title: 'Overview',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.registration.Index, slug),
      icon: ClipboardCheckIcon
    },
    {
      title: 'Shop',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.registration.Shop, slug),
      icon: ShoppingCartIcon
    },
    {
      title: 'Orders',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.registration.Orders, slug),
      icon: PackageIcon
    },
    {
      title: 'Invoices',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.registration.Invoices, slug),
      icon: FileTextIcon
    }
  ];
}
