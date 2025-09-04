/**
 * Check if user has super admin privileges
 */
export function isSuperAdmin(user: any): boolean {
  return user?.isSportsFestAdmin === true;
}