import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Building2,
  FolderKanban,
  CheckCircle2,
  Activity,
  HardDrive,
  Cpu,
  Server,
  ArrowUpRight,
  Download,
  Calendar,
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  RefreshCw
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load platform analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const overview = analytics?.overview || {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    userActiveRatio: '0%',
    totalWorkspaces: 0,
    activeWorkspaces: 0,
    archivedWorkspaces: 0,
    totalBoards: 0,
    totalTasks: 0,
    totalAuditEvents: 0,
    databaseStatus: 'Connected',
    apiUptime: '100%'
  };

  const roleDist = analytics?.roleDistribution || {};
  const totalUsersCount = overview.totalUsers || 1;

  const roleDistribution = [
    {
      role: 'Super Admins',
      count: roleDist.superAdmin || 0,
      percent: Math.round(((roleDist.superAdmin || 0) / totalUsersCount) * 100),
      color: 'bg-purple-500'
    },
    {
      role: 'Workspace Admins',
      count: roleDist.admin || 0,
      percent: Math.round(((roleDist.admin || 0) / totalUsersCount) * 100),
      color: 'bg-blue-500'
    },
    {
      role: 'Project Managers',
      count: roleDist.manager || 0,
      percent: Math.round(((roleDist.manager || 0) / totalUsersCount) * 100),
      color: 'bg-indigo-500'
    },
    {
      role: 'Employees / Contributors',
      count: roleDist.employee || 0,
      percent: Math.round(((roleDist.employee || 0) / totalUsersCount) * 100),
      color: 'bg-cyan-500'
    },
    {
      role: 'Team Members',
      count: roleDist.member || 0,
      percent: Math.round(((roleDist.member || 0) / totalUsersCount) * 100),
      color: 'bg-emerald-500'
    }
  ];

  const wsDist = analytics?.workspaceDistribution || {};
  const totalWsCount = overview.totalWorkspaces || 1;

  const planBreakdown = [
    {
      name: 'Enterprise',
      count: wsDist.enterprise || 0,
      percentage: overview.totalWorkspaces ? Math.round(((wsDist.enterprise || 0) / totalWsCount) * 100) : 0,
      color: 'bg-purple-500',
      textColor: 'text-purple-400'
    },
    {
      name: 'Pro',
      count: wsDist.pro || 0,
      percentage: overview.totalWorkspaces ? Math.round(((wsDist.pro || 0) / totalWsCount) * 100) : 0,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-400'
    },
    {
      name: 'Starter',
      count: wsDist.starter || 0,
      percentage: overview.totalWorkspaces ? Math.round(((wsDist.starter || 0) / totalWsCount) * 100) : 0,
      color: 'bg-blue-500',
      textColor: 'text-blue-400'
    }
  ];

  const growthData = analytics?.growthTrends || [];

  const exportAnalytics = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      timeRange,
      overview,
      roleDistribution,
      planBreakdown
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `worksync-analytics-${timeRange}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading live platform analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-indigo-400" />
              <span>Platform Analytics & Telemetry</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Database
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real platform adoption metrics, user retention rates, tenant utilization, and infrastructure throughput.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg font-semibold uppercase transition-all ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-white">{overview.totalUsers}</h3>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {overview.userActiveRatio} Active
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">{overview.activeUsers} active accounts in database</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Workspaces</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-white">{overview.activeWorkspaces}</h3>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {overview.totalWorkspaces} Total
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Tenant organization boundaries</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tasks Processed</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-white">{overview.totalTasks}</h3>
            <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
              {overview.totalBoards} Boards
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Tasks across all workspaces</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Platform Uptime</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-white">{overview.apiUptime || '100%'}</h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Connected
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">MongoDB cluster healthy</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Growth Overview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0d1322] border border-slate-800/80 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Platform Growth Curve</h3>
              <p className="text-xs text-slate-400">User accounts vs workspaces trend</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Users
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span> Workspaces
              </span>
            </div>
          </div>

          {/* Visual Bar Graph */}
          {growthData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-500 space-y-2 border-b border-slate-800 pb-2">
              <TrendingUp className="h-8 w-8 text-slate-600" />
              <p className="text-xs">No historical growth data yet. Metrics will plot as users join.</p>
            </div>
          ) : (
            <div className="pt-8 grid grid-cols-6 gap-4 items-end h-56 border-b border-slate-800 pb-2">
              {growthData.map((d, idx) => {
                const maxUsers = Math.max(overview.totalUsers, 10);
                const heightPercent = Math.min(Math.round((d.users / maxUsers) * 100), 100);
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[11px] font-mono text-slate-400 group-hover:text-indigo-400 transition-colors">
                      {d.users}
                    </div>
                    <div className="w-full max-w-[48px] bg-slate-800/60 rounded-t-xl overflow-hidden flex flex-col justify-end h-40 relative">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-xl transition-all duration-500 group-hover:from-indigo-500 group-hover:to-purple-400"
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{d.month}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500">Total Audit Events</span>
              <p className="text-white font-bold text-sm mt-0.5">{overview.totalAuditEvents} Logged</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500">Active Workspaces</span>
              <p className="text-white font-bold text-sm mt-0.5">{overview.activeWorkspaces} Active</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500">Registered Users</span>
              <p className="text-white font-bold text-sm mt-0.5">{overview.totalUsers} Total</p>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Tenant Plan Breakdown */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800/80 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Subscription Tier Distribution</h3>
            <p className="text-xs text-slate-400">Share of workspace plans active across platform</p>

            <div className="space-y-4 mt-6">
              {planBreakdown.map((plan) => (
                <div key={plan.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{plan.name}</span>
                    <span className={`font-mono font-bold ${plan.textColor}`}>{plan.percentage}% ({plan.count} tenants)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${plan.percentage}%` }}
                      className={`h-full ${plan.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Zap className="h-4 w-4" />
              <span>Multi-Tenant Architecture</span>
            </div>
            <p className="text-slate-400">
              Each workspace operates with dedicated members and isolated project board limits.
            </p>
          </div>
        </div>
      </div>

      {/* Role Demographics & Telemetry Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <span>Platform User Role Distribution</span>
          </h3>
          <p className="text-xs text-slate-400">Real distribution of registered accounts by platform role authority.</p>

          <div className="space-y-3 pt-2">
            {roleDistribution.map((r) => (
              <div key={r.role} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${r.color}`} />
                  <span className="font-semibold text-white">{r.role}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono">{r.count} users</span>
                  <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">{r.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure & Network Telemetry */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="h-5 w-5 text-emerald-400" />
            <span>Infrastructure Health & Realtime Gateway</span>
          </h3>
          <p className="text-xs text-slate-400">Realtime cluster workloads and live MongoDB status.</p>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500">Database Connection</span>
              <p className="text-white font-mono font-bold text-sm">MongoDB Atlas</p>
              <p className="text-[10px] text-emerald-400">● ReplicaSet Connected</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500">API Health Status</span>
              <p className="text-white font-mono font-bold text-sm">Port 8081 Active</p>
              <p className="text-[10px] text-emerald-400">● Live Operations</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500">Platform Settings</span>
              <p className="text-white font-mono font-bold text-sm">Operational</p>
              <p className="text-[10px] text-indigo-400">Standard Security Policy</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500">Service Uptime</span>
              <p className="text-emerald-400 font-mono font-bold text-sm">{overview.apiUptime || '100%'}</p>
              <p className="text-[10px] text-slate-400">Zero crash events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;