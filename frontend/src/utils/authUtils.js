/**
 * Authentication & Role-Based Authorization Utilities
 * Provides consistent role normalization and portal mapping across the platform.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  MEMBER: 'employee'
};

/**
 * Normalizes any role string variation to a standard system role.
 * e.g., 'super-admin', 'super_admin', 'SuperAdmin' -> 'super_admin'
 * e.g., 'member', 'employee' -> 'employee'
 */
export const normalizeRole = (role) => {
  if (!role) return 'employee';
  const clean = String(role).trim().toLowerCase().replace(/[-_\s]/g, '');
  if (clean.includes('super')) return 'super_admin';
  if (clean === 'admin') return 'admin';
  if (clean === 'manager') return 'manager';
  if (clean === 'employee' || clean === 'member' || clean === 'viewer') return 'employee';
  return role;
};

/**
 * Returns the designated portal dashboard path based on the user's role.
 */
export const getRoleDashboard = (role) => {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'super_admin':
      return '/super-admin/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'manager':
      return '/manager/dashboard';
    case 'employee':
    default:
      return '/employee/dashboard';
  }
};

/**
 * Checks if a given role is permitted by an allowed roles whitelist.
 */
export const hasRoleAccess = (userRole, allowedRoles = []) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const userNorm = normalizeRole(userRole);
  const normalizedAllowed = allowedRoles.map(normalizeRole);
  return normalizedAllowed.includes(userNorm);
};

/**
 * Safely reads current authenticated user and token from localStorage.
 */
export const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('worksync_token');
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    return {
      token: token || null,
      user: user || null,
      role: user ? normalizeRole(user.role) : null,
      isAuthenticated: Boolean(token && user)
    };
  } catch (err) {
    console.error('Error reading stored auth:', err);
    return { token: null, user: null, role: null, isAuthenticated: false };
  }
};

export default {
  ROLES,
  normalizeRole,
  getRoleDashboard,
  hasRoleAccess,
  getStoredAuth
};
