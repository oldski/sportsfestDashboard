import { isSuperAdmin } from './admin-utils';
import type { ProfileDto } from '~/types/dtos/profile-dto';

export interface SettingsAccess {
  canViewGeneral: boolean;
  canViewMembers: boolean;
  canViewBilling: boolean;
  canViewDevelopers: boolean;
  canViewAccountSettings: boolean;
  isImpersonating: boolean;
}

/**
 * Determines what settings sections a user can access
 */
export function getSettingsAccess(profile: ProfileDto): SettingsAccess {
  const isSuper = isSuperAdmin(profile);
  
  return {
    // Super admins can view general settings for support purposes
    canViewGeneral: true,
    
    // Super admins can view members to understand team structure
    canViewMembers: true,
    
    // Hide billing from super admins (too sensitive)
    canViewBilling: !isSuper,
    
    // Hide developers section (API keys/webhooks are security risks)
    canViewDevelopers: !isSuper,
    
    // Hide account settings when impersonating (personal to the actual user)
    canViewAccountSettings: !isSuper,
    
    // Flag for UI indicators
    isImpersonating: isSuper
  };
}

/**
 * Settings sections that super admins can access (for navigation filtering)
 */
export const SUPER_ADMIN_ALLOWED_SETTINGS = [
  'general',
  'members'
] as const;

/**
 * Check if a settings path is accessible to super admins
 */
export function isSuperAdminAllowedSetting(path: string): boolean {
  return SUPER_ADMIN_ALLOWED_SETTINGS.some(allowedPath => 
    path.includes(`/settings/organization/${allowedPath}`)
  );
}