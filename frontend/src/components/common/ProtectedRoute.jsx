
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldAlert, LogOut, ArrowRight } from 'lucide-react';

import { logoutUser } from '../../features/auth/authSlice.js';
import {
  getStoredAuth,
  hasRoleAccess,
  getRoleDashboard,
} from '../../utils/authUtils.js';

/**
 * ProtectedRoute
 * Guards private portal routes based on authentication
 * and role-based permissions.
 */
export const ProtectedRoute = ({
  allowedRoles = [],
  fallbackToDashboard = false,
}) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-300">
        <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">
          Verifying Platform Permissions...
        </p>
      </div>
    );
  }

  // Check Redux authentication state and persistent storage.
  const storedAuth = getStoredAuth();
  const isAuth = isAuthenticated || storedAuth.isAuthenticated;
  const effectiveUser = user || storedAuth.user;
  const effectiveRole = effectiveUser?.role || storedAuth.role;

  // Redirect unauthenticated users to login.
  if (!isAuth || !effectiveUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verify role authorization.
  if (allowedRoles.length > 0) {
    const isAuthorized = hasRoleAccess(effectiveRole, allowedRoles);

    if (!isAuthorized) {
      if (fallbackToDashboard) {
        return (
          <Navigate
            to={getRoleDashboard(effectiveRole)}
            replace
          />
        );
      }

      return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0d1322] border border-rose-500/30 text-center shadow-2xl space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-bold text-white">
              Access Denied: Role Unauthorized
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              Your account role{' '}
              <strong className="text-rose-400 uppercase font-mono">
                [{effectiveRole}]
              </strong>{' '}
              is not authorized to access this workspace section.
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
              Required Roles: {allowedRoles.join(', ')}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={getRoleDashboard(effectiveRole)}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={() => dispatch(logoutUser())}
                className="w-full py-2 px-4 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Switch / Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
};

/**
 * PublicOnlyRoute
 * Prevents authenticated users from accessing login/register pages.
 */
export const PublicOnlyRoute = () => {
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const storedAuth = getStoredAuth();
  const isAuth = isAuthenticated || storedAuth.isAuthenticated;
  const effectiveUser = user || storedAuth.user;
  const effectiveRole = effectiveUser?.role || storedAuth.role;

  if (isAuth && effectiveRole) {
    return (
      <Navigate
        to={getRoleDashboard(effectiveRole)}
        replace
      />
    );
  }

  return <Outlet />;
};

/**
 * RootRedirect
 * Redirects users to their role dashboard or login.
 */
export const RootRedirect = () => {
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const storedAuth = getStoredAuth();
  const isAuth = isAuthenticated || storedAuth.isAuthenticated;
  const effectiveUser = user || storedAuth.user;
  const effectiveRole = effectiveUser?.role || storedAuth.role;

  if (isAuth && effectiveRole) {
    return (
      <Navigate
        to={getRoleDashboard(effectiveRole)}
        replace
      />
    );
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;