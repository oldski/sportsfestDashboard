'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BellIcon,
  BuildingIcon,
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
  VolleyballIcon,
  ChevronRightIcon
} from 'lucide-react';

import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@workspace/ui/components/sidebar';

import { NavUser } from '~/components/shared/nav-user';
import { NavSupport } from '~/components/organizations/slug/nav-support';
import { NavAccount } from '~/components/organizations/slug/settings/nav-account';
import { OrganizationSwitcher } from '~/components/organizations/slug/organization-switcher';
import { useActiveOrganization } from '~/hooks/use-active-organization';
import { replaceOrgSlug, routes } from '@workspace/routes';
import { getSettingsAccess } from '~/lib/super-admin-settings';
import { isSuperAdmin } from "~/lib/admin-utils";
import type { OrganizationDto } from '~/types/dtos/organization-dto';
import type { ProfileDto } from '~/types/dtos/profile-dto';

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
};

function createCollapsibleNavItems(slug: string, profile?: ProfileDto): NavItem[] {
  const access = profile ? getSettingsAccess(profile) : {
    canViewGeneral: true,
    canViewMembers: true,
    canViewBilling: true,
    canViewDevelopers: true,
    canViewAccountSettings: true,
    isImpersonating: false
  };

  // Registration sub-items
  const registrationSubItems = [
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

  // Organization settings sub-items (filtered by permissions)
  const organizationSubItems = [
    ...(access.canViewGeneral ? [{
      title: 'General',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.settings.organization.General, slug),
      icon: StoreIcon
    }] : []),
    ...(access.canViewMembers ? [{
      title: 'Members',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.settings.organization.Members, slug),
      icon: UserPlus2Icon
    }] : []),
    ...(access.canViewBilling ? [{
      title: 'Billing',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.settings.organization.Billing, slug),
      icon: CreditCardIcon
    }] : [])
  ];

  return [
    {
      title: 'Home',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Home, slug),
      icon: HomeIcon
    },
    {
      title: 'Registration',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.registration.Index, slug),
      icon: ClipboardCheckIcon,
      subItems: registrationSubItems
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
      href: replaceOrgSlug(routes.dashboard.organizations.slug.settings.Index, slug),
      icon: SettingsIcon,
      subItems: organizationSubItems.length > 0 ? organizationSubItems : undefined
    }
  ];
}

export type AppSidebarProps = {
  organizations: OrganizationDto[];
  profile: ProfileDto;
};

export function AppSidebar({
  organizations,
  profile
}: AppSidebarProps): React.JSX.Element {
  const activeOrganization = useActiveOrganization();
  const pathname = usePathname();
  const { state, setOpen } = useSidebar();
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

  const navItems = React.useMemo(() =>
    createCollapsibleNavItems(activeOrganization.slug, profile),
    [activeOrganization.slug, profile]
  );

  // Initialize open sections based on active routes
  React.useEffect(() => {
    const initialOpenSections: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.subItems) {
        const itemPath = item.href.startsWith('http') ? new URL(item.href).pathname : item.href;
        const directMatch = pathname === itemPath || pathname.startsWith(itemPath + '/');
        const hasActiveSubItem = item.subItems.some(sub => {
          const subPath = sub.href.startsWith('http') ? new URL(sub.href).pathname : sub.href;
          return pathname === subPath || pathname.startsWith(subPath + '/');
        });
        const isActive = directMatch || hasActiveSubItem;
        initialOpenSections[item.href] = isActive;

      }
    });
    setOpenSections(prev => {
      // Only update if the sections actually changed to prevent infinite loops
      const hasChanged = Object.keys(initialOpenSections).some(key =>
        prev[key] !== initialOpenSections[key]
      ) || Object.keys(prev).length !== Object.keys(initialOpenSections).length;
      return hasChanged ? initialOpenSections : prev;
    });
  }, [pathname, navItems]);

  return (
    <Sidebar collapsible="icon" variant="inset" hasSuperAdminBanner={isSuperAdmin(profile)}>
      <SidebarHeader className="flex h-14 flex-row items-center py-0">
        {isSuperAdmin(profile) && (
          <OrganizationSwitcher organizations={organizations} profile={profile} />
        )}
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <ScrollArea
          verticalScrollBar
          className="h-full [&>[data-radix-scroll-area-viewport]>div]:flex! [&>[data-radix-scroll-area-viewport]>div]:h-full [&>[data-radix-scroll-area-viewport]>div]:flex-col"
        >
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  // Extract pathname from href if it's a full URL
                  const itemPath = item.href.startsWith('http') ? new URL(item.href).pathname : item.href;

                  // Check if current page exactly matches or starts with the item path
                  const directMatch = pathname === itemPath || pathname.startsWith(itemPath + '/');
                  // Check if any sub-item is active
                  const hasActiveSubItem = item.subItems?.some(sub => {
                    const subPath = sub.href.startsWith('http') ? new URL(sub.href).pathname : sub.href;
                    return pathname === subPath || pathname.startsWith(subPath + '/');
                  }) ?? false;
                  const isActive = directMatch || hasActiveSubItem;


                  const hasSubItems = item.subItems && item.subItems.length > 0;

                  if (!hasSubItems) {
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                          <Link href={item.href}>
                            <item.icon className="size-4 shrink-0" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <Collapsible
                      key={item.href}
                      asChild
                      open={state === 'collapsed' ? false : openSections[item.href]}
                      onOpenChange={(open) => {
                        if (state !== 'collapsed') {
                          setOpenSections(prev => ({ ...prev, [item.href]: open }));
                        }
                      }}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isActive}
                            className="group-data-[collapsible=icon]:[&>span]:hidden group-data-[collapsible=icon]:justify-center"
                            onClick={(e) => {
                              // When sidebar is collapsed, expand it and open the collapsible
                              if (state === 'collapsed') {
                                e.preventDefault();
                                setOpen(true);
                                // Set this section to open when sidebar expands
                                setOpenSections(prev => ({ ...prev, [item.href]: true }));
                              }
                            }}
                          >
                            <item.icon className="size-4 shrink-0" />
                            <span>{item.title}</span>
                            <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => {
                              const subPath = subItem.href.startsWith('http') ? new URL(subItem.href).pathname : subItem.href;

                              // Find the most specific matching path among siblings
                              const allSubPaths = item.subItems?.map(s => s.href.startsWith('http') ? new URL(s.href).pathname : s.href) || [];
                              const matchingPaths = allSubPaths.filter(path => pathname === path || pathname.startsWith(path + '/'));
                              const mostSpecificPath = matchingPaths.reduce((longest, current) =>
                                current.length > longest.length ? current : longest, ''
                              );

                              // Only show as active if this is the most specific match
                              const subIsActive = subPath === mostSpecificPath;

                              return (
                                <SidebarMenuSubItem key={subItem.href}>
                                  <SidebarMenuSubButton asChild isActive={subIsActive}>
                                    <Link href={subItem.href}>
                                      {subItem.icon && <subItem.icon className="size-4 shrink-0" />}
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Account Navigation - only show if user has access */}
          {getSettingsAccess(profile).canViewAccountSettings && <NavAccount />}

          <NavSupport
            profile={profile}
            className="mt-auto pb-0"
          />
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="h-14">
        <NavUser
          profile={profile}
          mode="organization"
          organizationSlug={activeOrganization.slug}
          className="p-0"
        />
      </SidebarFooter>
    </Sidebar>
  );
}
