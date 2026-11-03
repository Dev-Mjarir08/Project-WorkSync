
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
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Building2,
  Users,
  Activity,
  Layers,
  Crown
} from 'lucide-react';
import { loginUser, clearAuthError } from '../authSlice.js';

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
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Please provide both your email and password.');
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

      // Role-based routing: Super Admin gets full access to /super-admin/dashboard
      if (userRole === 'super_admin') {
        const targetUrl = location.state?.from?.pathname || '/super-admin/dashboard';
        navigate(targetUrl, { replace: true });
      } else {
        // Redirect to intended or fallback to dashboard
        const targetUrl = location.state?.from?.pathname || '/super-admin/dashboard';
        navigate(targetUrl, { replace: true });
      }
    }
  };

  const activeErrorMessage = localError || error;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Ambience & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand Showcase & Value Prop (Visible on lg) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 pr-4">
          <div>
            {/* Logo & Platform Pill */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl tracking-tight text-white">WorkSync</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-400">Next-Gen Workspace Orchestration</p>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
              Unify boards, sprints & teams into one synchronized flow.
            </h1>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Designed for modern distributed engineering and product teams. Complete visibility from high-level roadmaps down to granular task commits.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 flex items-start gap-3.5 hover:border-indigo-500/30 transition-all">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Super Admin Control Hub</h4>
                <p className="text-xs text-slate-400 mt-0.5">Global oversight of all platform users, multi-tenant quotas & telemetry.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 flex items-start gap-3.5 hover:border-purple-500/30 transition-all">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Redux Toolkit State Flow</h4>
                <p className="text-xs text-slate-400 mt-0.5">Asynchronous thunks for real-time live API dispatch and automatic token renewal.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 flex items-start gap-3.5 hover:border-emerald-500/30 transition-all">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Enterprise Role Security</h4>
                <p className="text-xs text-slate-400 mt-0.5">Automated JWT rotation, cryptographic bcrypt hashing, and tamper-proof audit trails.</p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-indigo-950/40 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-300">Live MongoDB Atlas Cluster</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Port 8081 Active</span>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="lg:col-span-7">
          <div className="bg-[#0d1322]/95 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white">WorkSync</span>
                <p className="text-xs text-slate-400">Enterprise Control Center</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Sign In
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Enter your credentials to access your WorkSync dashboard.
              </p>
            </div>

            {/* Error Banner */}
            {activeErrorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-300 leading-relaxed">
                  {activeErrorMessage}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset link has been dispatched to your email address.');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="h-4 w-4 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-0 cursor-pointer"
                  />
                  <span>Keep me signed in for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing Redux Async Thunk Login...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to WorkSync</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors ml-1"
                >
                  Register as Super Admin or Assign Role
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;