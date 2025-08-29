'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import NiceModal from '@ebay/nice-modal-react';
import { MoreHorizontalIcon } from 'lucide-react';

import { replaceOrgSlug, routes } from '@workspace/routes';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@workspace/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarGroupProps
} from '@workspace/ui/components/sidebar';
import { toast } from '@workspace/ui/components/sonner';
import { ThemeSwitcher } from '@workspace/ui/components/theme-switcher';

import { signOut } from '~/actions/auth/sign-out';
import { CommandMenu } from '~/components/organizations/slug/command-menu';
import { AdminCommandMenu } from '~/components/admin/admin-command-menu';
import { getInitials } from '~/lib/formatters';
import { isSuperAdmin } from '~/lib/admin-utils';
import type { ProfileDto } from '~/types/dtos/profile-dto';
import type { AdminProfileDto } from '~/data/admin/get-admin-profile';

function isDialogOpen(): boolean {
  return !!document.querySelector('[role="dialog"]');
}

function isInputFocused(): boolean {
  const focusedElement = document.activeElement;
  return (
    !!focusedElement &&
    (focusedElement.tagName === 'INPUT' ||
      focusedElement.tagName === 'TEXTAREA')
  );
}

function getPlatform(): string {
  if (typeof window === 'undefined') {
    return 'unknown'; // Handle server-side rendering
  }

  const nav = navigator as Navigator & {
    userAgentData?: {
      platform: string;
    };
  };

  // Check for userAgentData (modern browsers)
  if (nav.userAgentData?.platform) {
    return nav.userAgentData.platform;
  }

  // Fallback to navigator.platform (older browsers)
  if (navigator.platform) {
    // Check for Android specifically
    if (navigator.userAgent && /android/i.test(navigator.userAgent)) {
      return 'android';
    }
    return navigator.platform;
  }

  return 'unknown';
}

function isMac(): boolean {
  return /mac/.test(getPlatform());
}

type BaseProfile = {
  name: string;
  email?: string | null;
  image?: string | null;
  isSportsFestAdmin?: boolean | null;
};

export type NavUserMode = 'admin' | 'organization' | 'auto';

export type NavUserProps = SidebarGroupProps & {
  profile: BaseProfile;
  mode?: NavUserMode;
  organizationSlug?: string; // For organization mode
};

export function NavUser({
  profile,
  mode = 'auto',
  organizationSlug,
  ...other
}: NavUserProps): React.JSX.Element {
  const router = useRouter();
  
  // Auto-detect mode based on current path and admin status
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAdminContext = mode === 'admin' || 
    (mode === 'auto' && currentPath.startsWith('/admin'));
  const isAdmin = isSuperAdmin(profile);
  
  // When in organization context but user is super admin, show admin options
  const shouldShowAdminOptions = isAdminContext || 
    (mode === 'auto' && !isAdminContext && isAdmin);

  const handleNavigateToFirstOption = (): void => {
    if (shouldShowAdminOptions) {
      router.push('/admin/settings');
    } else {
      router.push(
        replaceOrgSlug(
          routes.dashboard.organizations.slug.settings.account.Profile,
          organizationSlug || ''
        )
      );
    }
  };
  
  const handleNavigateToSecondOption = (): void => {
    if (shouldShowAdminOptions) {
      router.push('/admin');
    } else {
      router.push(
        replaceOrgSlug(
          routes.dashboard.organizations.slug.settings.organization.Billing,
          organizationSlug || ''
        )
      );
    }
  };
  
  const handleShowCommandMenu = (): void => {
    if (shouldShowAdminOptions) {
      void NiceModal.show(AdminCommandMenu);
    } else {
      void NiceModal.show(CommandMenu);
    }
  };
  
  const handleSignOut = async (): Promise<void> => {
    const result = await signOut({ redirect: true });
    if (result?.serverError || result?.validationErrors) {
      toast.error("Couldn't sign out");
    }
  };

  React.useEffect(() => {
    const mac = isMac();
    const hotkeys: Record<string, { action: () => void; shift: boolean }> = {
      p: { action: handleNavigateToFirstOption, shift: true },
      [shouldShowAdminOptions ? 'o' : 'b']: { action: handleNavigateToSecondOption, shift: true },
      k: { action: handleShowCommandMenu, shift: false },
      s: { action: handleSignOut, shift: true }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDialogOpen() || isInputFocused()) return;

      const modifierKey = mac ? e.metaKey : e.ctrlKey;
      if (!modifierKey) return;

      const hotkey = hotkeys[e.key];
      if (!hotkey) return;
      if (hotkey.shift && !e.shiftKey) return;

      e.preventDefault();
      hotkey.action();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowAdminOptions]);
  
  return (
    <SidebarGroup {...other}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="group/navuser -ml-1.5 transition-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:p-1!">
                <Avatar className="size-7 rounded-full">
                  <AvatarImage
                    src={profile.image || undefined}
                    alt={profile.name}
                  />
                  <AvatarFallback className="rounded-full text-xs group-hover/navuser:bg-neutral-200 dark:group-hover/navuser:bg-neutral-700">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex w-full flex-col truncate text-left group-data-[minimized=true]:hidden">
                  <span className="truncate text-sm font-semibold">
                    {profile.name}
                  </span>
                </div>
                <MoreHorizontalIcon className="h-8 text-muted-foreground group-data-[minimized=true]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="start"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="truncate text-sm font-medium leading-none">
                    {profile.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleNavigateToFirstOption}
                >
                  {shouldShowAdminOptions ? 'Admin Settings' : 'Profile'}
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleNavigateToSecondOption}
                >
                  {shouldShowAdminOptions ? 'Admin Dashboard' : 'Billing'}
                  <DropdownMenuShortcut>⇧⌘{shouldShowAdminOptions ? 'O' : 'B'}</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleShowCommandMenu}
                >
                  Command Menu
                  <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex cursor-default flex-row justify-between bg-transparent!"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p>Theme</p>
                  <ThemeSwitcher />
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleSignOut}
              >
                Sign out
                <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}