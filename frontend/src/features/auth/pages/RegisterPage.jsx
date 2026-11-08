import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Check,
  CheckCircle,
  Briefcase,
  Crown,
  Laptop
} from 'lucide-react';
import { registerUser, clearAuthError } from '../authSlice.js';
import { getRoleDashboard } from '../../../utils/authUtils.js';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'super_admin', // Default to Super Admin as requested
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
    if (isAuthenticated && user?.role) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [dispatch, isAuthenticated, user, navigate]);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) || /[A-Z]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(formData.password);
  const passwordsMatch =
    formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  // Available selectable roles
  const rolesOptions = [
    {
      id: 'super_admin',
      title: 'Super Admin',
      badge: 'Platform Head',
      desc: 'Full governance, SuperAdmin dashboard, all users & workspaces',
      icon: Crown,
      color: 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
    },
    {
      id: 'admin',
      title: 'Workspace Admin',
      badge: 'Tenant Admin',
      desc: 'Workspace settings, invites, and tenant projects',
      icon: Building2,
      color: 'border-purple-500 bg-purple-500/15 text-purple-300'
    },
    {
      id: 'manager',
      title: 'Project Manager',
      badge: 'Lead',
      desc: 'Sprint cycles, boards execution, resource assignment',
      icon: Briefcase,
      color: 'border-blue-500 bg-blue-500/15 text-blue-300'
    },
    {
      id: 'employee',
      title: 'Employee / Dev',
      badge: 'Contributor',
      desc: 'Task updates, board backlog, team collaboration',
      icon: Laptop,
      color: 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessInfo('');

    if (formData.name.trim().length < 2) {
      setLocalError('Full name must be at least 2 characters long.');
      return;
    }

    if (!formData.email.includes('@')) {
      setLocalError('Please provide a valid work email address.');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!formData.agreeTerms) {
      setLocalError('Please accept the WorkSync Terms of Service to proceed.');
      return;
    }

    // Dispatch Redux async thunk
    const actionResult = await dispatch(
      registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
    );

    if (registerUser.fulfilled.match(actionResult)) {
      const registeredUser = actionResult.payload.user;
      const userRole = registeredUser?.role || formData.role;

      setSuccessInfo(
        `Account registered successfully as ${userRole.replace('_', ' ').toUpperCase()}! Redirecting to dashboard...`
      );

      setTimeout(() => {
        navigate(getRoleDashboard(userRole), { replace: true });
      }, 1000);
    }
  };

  const activeErrorMessage = localError || error;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand Showcase & Features (Visible on lg) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 pr-4">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl tracking-tight text-white">WorkSync</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    Register
                  </span>
                </div>
                <p className="text-xs text-slate-400">Collaborative Workspace Infrastructure</p>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
              Register with role authority & access your command center.
            </h1>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Register as Super Admin to manage the entire multi-tenant platform, or register as Workspace Admin, Manager, or Employee to orchestrate sprints and boards.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Super Admin Governance</h4>
                <p className="text-xs text-slate-400 mt-0.5">Instant dashboard telemetry, user provisioning, and full system configuration access.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Multi-Tenant Isolation</h4>
                <p className="text-xs text-slate-400 mt-0.5">Strict database organization boundaries with custom storage quotas and team roles.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Redux Toolkit + JWT Auth</h4>
                <p className="text-xs text-slate-400 mt-0.5">Asynchronous thunk API state flow, secure token caching, and automated session renewal.</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900/90 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0d1322]"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"
                  alt="Jarir"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0d1322]"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
                  alt="Sarah"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0d1322]"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
                  alt="Alex"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Live Atlas DB Connection</p>
                <p className="text-[11px] text-slate-400">All registered users saved directly to MongoDB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#0d1322]/95 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white">WorkSync</span>
                <p className="text-xs text-slate-400">Register & Assign Role</p>
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Create Account
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Select your role authority to initialize your profile and start managing your workspace.
              </p>
            </div>

            {/* Success Banner */}
            {successInfo && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-3 animate-fadeIn">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-emerald-300">{successInfo}</span>
              </div>
            )}

            {/* Error Banner */}
            {activeErrorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-300 leading-relaxed">
                  {activeErrorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection Matrix */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Select Platform Role Assignment
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {rolesOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = formData.role === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: opt.id })}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? `${opt.color} ring-1 ring-offset-0 ring-indigo-500 shadow-md`
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold text-white">{opt.title}</span>
                          </div>
                          {isSelected && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name & Work Email in Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Jarir Multani"
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. superadmin@worksync.io"
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password and Confirm Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      className={`w-full pl-10 pr-10 py-2 rounded-xl bg-slate-900 border text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all ${
                        formData.confirmPassword && !passwordsMatch
                          ? 'border-rose-500/60 focus:border-rose-500'
                          : passwordsMatch
                          ? 'border-emerald-500/60 focus:border-emerald-500'
                          : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Security rating:</span>
                    <span className={`font-semibold ${
                      strength.label === 'Strong' ? 'text-emerald-400' :
                      strength.label === 'Moderate' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                  </div>
                </div>
              )}

              {/* Match status */}
              {formData.confirmPassword && (
                <div className="text-[11px] flex items-center gap-1.5">
                  {passwordsMatch ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Passwords do not match yet
                    </span>
                  )}
                </div>
              )}

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    className="h-4 w-4 mt-0.5 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-0 cursor-pointer"
                  />
                  <span>
                    I confirm role registration authorization under WorkSync Platform Governance Policy.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (formData.confirmPassword && !passwordsMatch)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing Redux Async Thunk API Registration...</span>
                  </>
                ) : (
                  <>
                    <span>Register as {formData.role.replace('_', ' ').toUpperCase()}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Already registered with WorkSync?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors ml-1"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;