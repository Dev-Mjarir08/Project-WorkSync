import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldAlert, LogOut, ArrowRight } from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice.js';
import { getStoredAuth, hasRoleAccess, getRoleDashboard, normalizeRole } from '../../utils/authUtils.js';

/**
 * ProtectedRoute Component
 * Guards private portal routes based on authentication and role-based permissions.
 */
export const ProtectedRoute = ({ allowedRoles = [], fallbackToDashboard = true }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-300">
        <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Verifying Platform Permissions...</p>
      </div>
    );
  }

  // Check state or persistent storage
  const storedAuth = getStoredAuth();
  const isAuth = isAuthenticated || storedAuth.isAuthenticated;
  const effectiveUser = user || storedAuth.user;
  const effectiveRole = effectiveUser?.role || storedAuth.role;

  // 1. Authentication Check: If not logged in, redirect to /login
  if (!isAuth || !effectiveUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authorization Check: Verify role permissions
  if (allowedRoles.length > 0) {
    const isAuthorized = hasRoleAccess(effectiveRole, allowedRoles);

    if (!isAuthorized) {
      // If configured to automatically redirect to their authorized dashboard
      if (fallbackToDashboard) {
        const designatedDashboard = getRoleDashboard(effectiveRole);
        return <Navigate to={designatedDashboard} replace />;
      }

      // Or show Access Denied Screen
      return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0d1322] border border-rose-500/30 text-center shadow-2xl space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Access Denied: Role Unauthorized</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account role <strong className="text-rose-400 uppercase font-mono">[{effectiveRole}]</strong> is not authorized to access this workspace section.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
              Required: {allowedRoles.map(r => r.toUpperCase()).join(', ')}
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
 * PublicOnlyRoute Component
 * Prevents already authenticated users from accessing login/register pages
 * and redirects them straight to their respective role dashboard.
 */
export const PublicOnlyRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const storedAuth = getStoredAuth();
  const isAuth = isAuthenticated || storedAuth.isAuthenticated;
  const effectiveRole = user?.role || storedAuth.role;

  if (isAuth && effectiveRole) {
    const designatedDashboard = getRoleDashboard(effectiveRole);
    return <Navigate to={designatedDashboard} replace />;
  }

  return <Outlet />;
};

/**
 * RootRedirect Component
 * Directs users at root path '/' to their authorized dashboard if logged in,
 * or to '/login' if unauthenticated.
 */
export const RootRedirect = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const storedAuth = getStoredAuth();
  const isAuth = isAuthenticated || storedAuth.isAuthenticated;
  const effectiveRole = user?.role || storedAuth.role;

  if (isAuth && effectiveRole) {
    return <Navigate to={getRoleDashboard(effectiveRole)} replace />;
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
