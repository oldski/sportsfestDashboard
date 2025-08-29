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
  ShoppingCartIcon,
  ChevronRightIcon,
  DatabaseIcon,
  ShieldIcon,
  BellIcon,
  CogIcon
} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
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
  SidebarGroupLabel,
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
import type { AdminProfileDto } from '~/data/admin/get-admin-profile';

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  subItems?: {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
};

const adminNavItems: NavItem[] = [
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
    description: 'System configuration',
    subItems: [
      {
        title: 'System Configuration',
        href: '/admin/settings/system',
        icon: CogIcon
      },
      {
        title: 'Database Management',
        href: '/admin/settings/database',
        icon: DatabaseIcon
      },
      {
        title: 'Security Settings',
        href: '/admin/settings/security',
        icon: ShieldIcon
      },
      {
        title: 'Notifications',
        href: '/admin/settings/notifications',
        icon: BellIcon
      }
    ]
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
  const { state, setOpen } = useSidebar();
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});
  
  // Initialize open sections based on active routes  
  React.useEffect(() => {
    const initialOpenSections: Record<string, boolean> = {};
    adminNavItems.forEach((item) => {
      if (item.subItems) {
        const directMatch = item.href === '/admin' 
          ? pathname === '/admin' 
          : pathname === item.href || pathname.startsWith(item.href + '/');
        const hasActiveSubItem = item.subItems.some(sub => 
          pathname === sub.href || pathname.startsWith(sub.href + '/')
        );
        const isActive = directMatch || hasActiveSubItem;
        initialOpenSections[item.href] = isActive;
      }
    });
    setOpenSections(prev => {
      // Only update if the sections actually changed to prevent infinite loops
      const hasChanged = Object.keys(initialOpenSections).some(key => 
        prev[key] !== initialOpenSections[key]
      );
      return hasChanged ? initialOpenSections : prev;
    });
  }, [pathname]);

  return (
    <Sidebar collapsible="icon" variant="inset" hasSuperAdminBanner={false}>
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
                // Special handling for admin root route
                const directMatch = item.href === '/admin' 
                  ? pathname === '/admin' 
                  : pathname === item.href || pathname.startsWith(item.href + '/');
                // Check if any sub-item is active
                const hasActiveSubItem = item.subItems?.some(sub => 
                  pathname === sub.href || pathname.startsWith(sub.href + '/')
                ) ?? false;
                const isActive = directMatch || hasActiveSubItem;
                
                const hasSubItems = item.subItems && item.subItems.length > 0;

                if (!hasSubItems) {
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
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => {
                            const subIsActive = pathname === subItem.href ||
                              pathname.startsWith(subItem.href + '/');
                            
                            return (
                              <SidebarMenuSubItem key={subItem.href}>
                                <SidebarMenuSubButton asChild isActive={subIsActive}>
                                  <Link href={subItem.href}>
                                    {subItem.icon && <subItem.icon />}
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