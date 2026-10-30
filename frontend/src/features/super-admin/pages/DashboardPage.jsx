import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  FolderKanban,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowRight,
  Shield,
  ShieldCheck,
  Server,
  Database,
  RefreshCw,
  Plus,
  AlertTriangle,
  Clock,
  Sparkles,
  FileText,
  Sliders,
  Eye,
  Layers
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async () => {
    try {
      setRefreshing(true);
      const overview = await superAdminService.getDashboardOverview();
      setData(overview);
    } catch (err) {
      console.error('Failed to load dashboard overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading Super Admin metrics...</p>
      </div>
    );
  }

  const { stats, userGrowthChart, recentAuditLogs, topWorkspaces, rolesSummary } = data || {};

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Super Admin Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live Operations
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Global platform governance, RBAC permissions, immutable audit trail, and multi-tenant telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchOverview}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => navigate('/super-admin/users')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Manage Users</span>
          </button>
        </div>
      </div>

      {/* Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Users */}
        <div
          onClick={() => navigate('/super-admin/users')}
          className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl group hover:border-indigo-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stats?.totalUsers || '0'}
            </h3>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {stats?.usersGrowth || '+14.2%'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Across all tenants</span>
            <span className="text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
              Directory <ArrowRight className="h-3 w-3" />
            </span>
          </p>
        </div>

        {/* Card 2: Workspaces */}
        <div
          onClick={() => navigate('/super-admin/workspaces')}
          className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl group hover:border-purple-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Workspaces</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stats?.activeWorkspaces || '5'}
            </h3>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {stats?.workspacesGrowth || '+8.5%'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Dedicated environments</span>
            <span className="text-purple-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
              Tenants <ArrowRight className="h-3 w-3" />
            </span>
          </p>
        </div>

        {/* Card 3: Roles & Permissions Active */}
        <div
          onClick={() => navigate('/super-admin/roles')}
          className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl group hover:border-cyan-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">RBAC Governance</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              4 Roles
            </h3>
            <span className="flex items-center gap-1 text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
              Active Matrix
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Strict policy tiering</span>
            <span className="text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
              Inspect <ArrowRight className="h-3 w-3" />
            </span>
          </p>
        </div>

        {/* Card 4: Database & System */}
        <div
          onClick={() => navigate('/super-admin/system-health')}
          className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl group hover:border-emerald-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Database Status</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              {stats?.databaseStatus || 'Connected'}
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {stats?.apiUptime || '99.98%'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>MongoDB Atlas Cluster</span>
            <span className="text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
              Diagnostics <ArrowRight className="h-3 w-3" />
            </span>
          </p>
        </div>
      </div>

      {/* PROMINENT SHOWCASE: The 3 Core Super Admin Consoles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              <span>Super Admin Consoles & Modules</span>
            </h2>
            <p className="text-xs text-slate-400">
              Direct access to dedicated administrative management surfaces.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">3 Active Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: Roles & Permissions */}
          <div
            onClick={() => navigate('/super-admin/roles')}
            className="p-6 rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#0b101f] border border-slate-800 hover:border-indigo-500/50 shadow-xl cursor-pointer group transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  RBAC Matrix
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  Roles & Permissions
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Inspect privilege tiers, define capability boundaries across modules, and prevent unauthorized actions.
                </p>
              </div>

              {/* Roles Pills Preview */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 text-[10px] font-semibold">
                  Super Admin
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 text-[10px] font-semibold">
                  Admin
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold">
                  Member
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-[10px] font-semibold">
                  Viewer
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
              <span>Open Permissions Grid</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Module 2: Audit Trail & Compliance */}
          <div
            onClick={() => navigate('/super-admin/audit-logs')}
            className="p-6 rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#0b101f] border border-slate-800 hover:border-indigo-500/50 shadow-xl cursor-pointer group transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Stream
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Security & Audit Logs
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Real-time immutable ledger of user activities, administrative mutations, IP access logs, and anomaly events.
                </p>
              </div>

              {/* Quick Metrics Preview */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500">Security Alerts</span>
                  <p className="font-bold text-amber-400">4 Flagged</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500">SOC-2 Readiness</span>
                  <p className="font-bold text-emerald-400">99.8% Pass</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
              <span>Inspect Audit Trail</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Module 3: User Inspector & Identity Records */}
          <div
            onClick={() => navigate('/super-admin/users')}
            className="p-6 rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#0b101f] border border-slate-800 hover:border-indigo-500/50 shadow-xl cursor-pointer group transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Eye className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  User Inspector
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  User Profiles & Tenants
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Deep user account lookup, assigned tenant memberships, account status toggle, and role elevation.
                </p>
              </div>

              {/* User Directory Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500">Active Users</span>
                  <p className="font-bold text-emerald-400">{rolesSummary?.active || '6'} Online</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500">Platform Admins</span>
                  <p className="font-bold text-blue-400">{rolesSummary?.admin || '2'} Admins</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
              <span>Browse User Directory</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-900/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Super Admin Operations</span>
            </div>
            <h3 className="text-lg font-bold text-white">Central Operations & Control</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Quickly provision workspaces, oversee role security policies, and inspect active platform audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/super-admin/roles')}
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              Role & Permissions
            </button>
            <button
              onClick={() => navigate('/super-admin/audit-logs')}
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              Audit Trail
            </button>
            <button
              onClick={() => navigate('/super-admin/settings')}
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              Platform Settings
            </button>
            <button
              onClick={() => navigate('/super-admin/workspaces')}
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              Workspace Tenants
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Growth Stats + Top Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Growth Overview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0d1322] border border-slate-800/80 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Platform Adoption</h3>
              <p className="text-xs text-slate-400">Total users and organizations provisioned per month</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                Users
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                Workspaces
              </span>
            </div>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="pt-6 grid grid-cols-5 gap-3 items-end h-48 border-b border-slate-800 pb-2">
            {userGrowthChart?.map((item, idx) => {
              const maxUsers = 2000;
              const heightPercent = Math.min(Math.round((item.users / maxUsers) * 100), 100);
              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[11px] font-mono text-slate-400 group-hover:text-indigo-400 transition-colors">
                    {item.users}
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end h-32 relative">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all duration-500 group-hover:from-indigo-500 group-hover:to-purple-400"
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 col): Top Workspaces */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Top Workspaces</h3>
              <p className="text-xs text-slate-400">High-volume tenant accounts</p>
            </div>
            <button
              onClick={() => navigate('/super-admin/workspaces')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {topWorkspaces?.map((ws) => (
              <div
                key={ws.id}
                onClick={() => navigate('/super-admin/workspaces')}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-white truncate max-w-[150px]">
                    {ws.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {ws.membersCount} members • {ws.boardsCount} boards
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase ${
                      ws.plan === 'Enterprise'
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                        : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {ws.plan}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">{ws.storageUsed}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Security & Audit Trail Section with direct link to /super-admin/audit-logs */}
      <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              <span>Platform Security & Recent Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-400">Live operational events logged across platform services</p>
          </div>

          <button
            onClick={() => navigate('/super-admin/audit-logs')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:text-white transition-all self-start sm:self-auto"
          >
            <span>Open Full Audit Trail Console</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentAuditLogs?.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => navigate('/super-admin/audit-logs')}
                  className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-xs">{log.details}</td>
                  <td className="py-3 px-4 text-slate-400 text-xs font-medium whitespace-nowrap">
                    {log.user}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {log.ip}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        log.status === 'success'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : log.status === 'warning'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : log.status === 'error'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 text-right whitespace-nowrap">
                    {log.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
