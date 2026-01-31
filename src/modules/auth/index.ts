/**
 * Auth Module
 * Re-exports auth utilities and adds module-specific helpers
 */

import { USER_ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '@/config/constants';

export { useAuth, AuthProvider } from '@/lib/auth';
export { USER_ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY };
export { ROUTES, getDashboardRoute, canAccessRoute } from '@/config/routes';

/**
 * Check if user has a specific permission
 */
export function hasPermission(userRole: string | null, permission: string): boolean {
  if (!userRole) return false;
  
  const permissions = (ROLE_PERMISSIONS as Record<string, readonly string[]>)[userRole];
  if (!permissions) return false;
  
  // Super admin has all permissions
  if (permissions.includes('*')) return true;
  
  return permissions.includes(permission);
}
