/**
 * Check if user has super admin privileges
 */
export function isSuperAdmin(user: { isSportsFestAdmin?: boolean | null }): boolean {
  return user.isSportsFestAdmin === true;
}