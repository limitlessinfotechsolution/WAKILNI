/**
 * Protected Routes Tests
 * Tests for role-based routing and access control
 */

import { describe, it, expect } from 'vitest';
import { ROUTES, ROUTE_CONFIG, canAccessRoute, getDashboardRoute } from '@/config/routes';
import type { UserRole } from '@/config/constants';

describe('Protected Routes', () => {
  describe('Route Configuration', () => {
    it('should have public routes defined', () => {
      expect(ROUTE_CONFIG[ROUTES.HOME]).toBeDefined();
      expect(ROUTE_CONFIG[ROUTES.HOME].allowedRoles).toBe('public');
    });

    it('should have role-restricted routes defined', () => {
      expect(ROUTE_CONFIG[ROUTES.BOOKINGS]).toBeDefined();
      expect(Array.isArray(ROUTE_CONFIG[ROUTES.BOOKINGS].allowedRoles)).toBe(true);
    });

    it('should have role-specific routes defined', () => {
      const adminRoute = ROUTE_CONFIG[ROUTES.ADMIN_USERS];
      expect(adminRoute).toBeDefined();
      expect(Array.isArray(adminRoute.allowedRoles)).toBe(true);
    });
  });

  describe('Access Control', () => {
    const roles: UserRole[] = ['super_admin', 'admin', 'vendor', 'provider', 'traveler'];

    it('should allow all roles to access public routes', () => {
      roles.forEach(role => {
        expect(canAccessRoute(ROUTES.HOME, role, true)).toBe(true);
        expect(canAccessRoute(ROUTES.SERVICES, role, true)).toBe(true);
      });
    });

    it('should allow unauthenticated users to access public routes', () => {
      expect(canAccessRoute(ROUTES.HOME, null, false)).toBe(true);
      expect(canAccessRoute(ROUTES.SERVICES, null, false)).toBe(true);
    });

    it('should deny unauthenticated users from role-protected routes', () => {
      // Route not in ROUTE_CONFIG returns true (falls through to 404)
      // For configured routes with role restrictions, null role should be denied
      expect(canAccessRoute(ROUTES.BOOKINGS, null, false)).toBe(false);
      expect(canAccessRoute(ROUTES.ADMIN_USERS, null, false)).toBe(false);
    });

    it('should restrict admin routes to admins only', () => {
      expect(canAccessRoute(ROUTES.ADMIN_USERS, 'traveler', true)).toBe(false);
      expect(canAccessRoute(ROUTES.ADMIN_USERS, 'provider', true)).toBe(false);
      expect(canAccessRoute(ROUTES.ADMIN_USERS, 'admin', true)).toBe(true);
    });

    it('should restrict super-admin routes to super_admin only', () => {
      expect(canAccessRoute(ROUTES.SUPER_ADMIN_ANALYTICS, 'admin', true)).toBe(false);
      expect(canAccessRoute(ROUTES.SUPER_ADMIN_ANALYTICS, 'super_admin', true)).toBe(true);
    });

    it('should restrict provider routes to providers', () => {
      expect(canAccessRoute(ROUTES.PROVIDER_SERVICES, 'provider', true)).toBe(true);
      expect(canAccessRoute(ROUTES.PROVIDER_SERVICES, 'traveler', true)).toBe(false);
    });

    it('should restrict vendor routes to vendors', () => {
      expect(canAccessRoute(ROUTES.VENDOR_BOOKINGS, 'vendor', true)).toBe(true);
      expect(canAccessRoute(ROUTES.VENDOR_BOOKINGS, 'traveler', true)).toBe(false);
    });
  });

  describe('Dashboard Routing', () => {
    it('should route super_admin to analytics dashboard', () => {
      expect(getDashboardRoute('super_admin')).toBe(ROUTES.SUPER_ADMIN_ANALYTICS);
    });

    it('should route admin to admin dashboard', () => {
      expect(getDashboardRoute('admin')).toBe(ROUTES.ADMIN_DASHBOARD);
    });

    it('should route provider to provider dashboard', () => {
      expect(getDashboardRoute('provider')).toBe(ROUTES.PROVIDER_DASHBOARD);
    });

    it('should route vendor to vendor dashboard', () => {
      expect(getDashboardRoute('vendor')).toBe(ROUTES.VENDOR_DASHBOARD);
    });

    it('should route traveler to traveler dashboard', () => {
      expect(getDashboardRoute('traveler')).toBe(ROUTES.TRAVELER_DASHBOARD);
    });

    it('should default to traveler dashboard for unknown roles', () => {
      expect(getDashboardRoute(null)).toBe(ROUTES.TRAVELER_DASHBOARD);
      expect(getDashboardRoute(undefined as unknown as UserRole)).toBe(ROUTES.TRAVELER_DASHBOARD);
    });
  });

  describe('Route Hierarchy', () => {
    it('should allow super_admin to access all admin routes', () => {
      expect(canAccessRoute(ROUTES.ADMIN_USERS, 'super_admin', true)).toBe(true);
      expect(canAccessRoute(ROUTES.ADMIN_PROVIDERS, 'super_admin', true)).toBe(true);
      expect(canAccessRoute(ROUTES.ADMIN_DONATIONS, 'super_admin', true)).toBe(true);
    });

    it('should allow admins to access their specific routes', () => {
      expect(canAccessRoute(ROUTES.ADMIN_USERS, 'admin', true)).toBe(true);
      expect(canAccessRoute(ROUTES.ADMIN_PROVIDERS, 'admin', true)).toBe(true);
    });
  });
});
