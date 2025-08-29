import * as React from 'react';
import { redirect } from 'next/navigation';

import { getSettingsAccess } from '~/lib/super-admin-settings';
import type { ProfileDto } from '~/types/dtos/profile-dto';

export interface SuperAdminRouteGuardProps {
  profile: ProfileDto;
  settingType: 'billing' | 'developers' | 'account';
  fallbackPath: string;
  children: React.ReactNode;
}

/**
 * Guards sensitive settings routes from super admin access
 */
export function SuperAdminRouteGuard({
  profile,
  settingType,
  fallbackPath,
  children
}: SuperAdminRouteGuardProps): React.JSX.Element {
  const access = getSettingsAccess(profile);

  // Check if super admin is trying to access restricted settings
  if (access.isImpersonating) {
    switch (settingType) {
      case 'billing':
        if (!access.canViewBilling) {
          redirect(fallbackPath);
        }
        break;
      case 'developers':
        if (!access.canViewDevelopers) {
          redirect(fallbackPath);
        }
        break;
      case 'account':
        if (!access.canViewAccountSettings) {
          redirect(fallbackPath);
        }
        break;
    }
  }

  return <>{children}</>;
}