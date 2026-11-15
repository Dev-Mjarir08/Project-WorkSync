import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { loginUser, clearAuthError } from '../authSlice.js';
import { getRoleDashboard } from '../../../utils/authUtils.js';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
    if (isAuthenticated && user?.role) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [dispatch, isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Please enter both your email address and password.');
      return;
    }

    const actionResult = await dispatch(
      loginUser({
        email: formData.email,
        password: formData.password
      })
    );

    if (loginUser.fulfilled.match(actionResult)) {
      const loggedUser = actionResult.payload.user;
      const userRole = loggedUser?.role;
      const defaultDashboard = getRoleDashboard(userRole);

      const requestedUrl = location.state?.from?.pathname;
      let targetUrl = defaultDashboard;
      if (
        requestedUrl &&
        requestedUrl !== '/' &&
        !requestedUrl.startsWith('/login') &&
        !requestedUrl.startsWith('/register')
      ) {
        const portalPrefix = defaultDashboard.split('/')[1];
        if (requestedUrl.startsWith(`/${portalPrefix}`)) {
          targetUrl = requestedUrl;
        }
      }

      navigate(targetUrl, { replace: true });
    }
  };

  const activeErrorMessage = localError || error;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Ambient Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_55%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Minimalist Centered Card */}
      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4 transition-transform hover:scale-105">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sign In to WorkSync
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Enter your credentials to access your organization dashboard
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0e1424]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
          {/* Error Banner */}
          {activeErrorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300 animate-fadeIn">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{activeErrorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="h-3.5 w-3.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
                />
                <span>Keep me signed in</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Super Admin Registration Notice & Link */}
          <div className="mt-6 pt-5 border-t border-slate-800/70 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <span>New organization?</span>
              <Link
                to="/register"
                className="font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
              >
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Register as Super Admin</span>
              </Link>
            </div>
            <p className="text-[11px] text-slate-400/90 leading-relaxed">
              Workspace Admins, Managers, and Employees are invited and assigned directly by their Super Admin.
            </p>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-400/70">
            WorkSync &bull; Secure Multi-Tenant Architecture
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
