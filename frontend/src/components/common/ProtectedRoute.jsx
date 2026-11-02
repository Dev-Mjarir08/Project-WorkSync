import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice.js';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // If loading session, show animated loader
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-300">
        <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Verifying Platform Permissions...</p>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0d1322] border border-rose-500/30 text-center shadow-2xl space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied: Role Unauthorized</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your current account role <strong className="text-rose-400 uppercase font-mono">[{user.role}]</strong> does not have permission to access the Super Admin control center.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            Required Roles: {allowedRoles.join(', ')}
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => dispatch(logoutUser())}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Switch / Re-login as Super Admin</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
