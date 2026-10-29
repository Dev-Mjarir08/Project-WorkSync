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
  Shield,
  Server,
  Database,
  RefreshCw,
  Plus,
  AlertTriangle,
  Clock,
  Sparkles
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

  const { stats, userGrowthChart, recentAuditLogs, topWorkspaces } = data || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Super Admin Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live Overview
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Global platform analytics, tenant operations, and real-time database monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stats?.totalUsers}
            </h3>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {stats?.usersGrowth}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Across all enterprise organizations</p>
        </div>

        {/* Card 2: Workspaces */}
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Workspaces</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stats?.activeWorkspaces}
            </h3>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {stats?.workspacesGrowth}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Dedicated tenant environments</p>
        </div>

        {/* Card 3: Boards & Projects */}
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Boards & Projects</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stats?.totalBoards}
            </h3>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {stats?.boardsGrowth}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Kanban, Scrum, & Sprint boards</p>
        </div>

        {/* Card 4: Database & System */}
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-slate-800 shadow-xl group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Database Status</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              {stats?.databaseStatus}
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {stats?.apiUptime}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">MongoDB Atlas replica set healthy</p>
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

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/super-admin/users')}
              className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              Role & Permissions
            </button>
            <button
              onClick={() => navigate('/super-admin/workspaces')}
              className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              Workspace Tenants
            </button>
            <button
              onClick={() => navigate('/super-admin/system-health')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              System Diagnostics
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
              <p className="text-xs text-slate-400">Platform user base and workspace adoption over time</p>
            </div>
            <span className="text-xs text-indigo-400 font-medium bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              Q3 - Q4 2026
            </span>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="grid grid-cols-5 gap-3 pt-4 items-end h-48 border-b border-slate-800 pb-4">
            {userGrowthChart?.map((item) => {
              const maxUsers = 1600;
              const heightPercent = Math.min(100, Math.round((item.users / maxUsers) * 100));
              return (
                <div key={item.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[11px] font-mono text-slate-400 group-hover:text-indigo-400 transition-colors">
                    {item.users}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[48px] bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-lg group-hover:from-indigo-600 group-hover:to-purple-400 transition-all relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-[10px] text-white px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap transition-opacity">
                      {item.workspaces} Workspaces
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span> Registered Users
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span> Provisioned Workspaces
              </span>
            </div>
            <span className="text-emerald-400 font-medium">Steady +14.2% Growth</span>
          </div>
        </div>

        {/* Right Column (1 col): Top Workspaces */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Top Workspaces</h3>
            <button
              onClick={() => navigate('/super-admin/workspaces')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {topWorkspaces?.map((ws) => (
              <div
                key={ws.id}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
              >
                <div className="space-y-1">
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

      {/* Recent Platform Audit Trail */}
      <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Platform Security & Audit Trail</h3>
            <p className="text-xs text-slate-400">Live operational events logged across platform services</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Encrypted Ledger</span>
          </div>
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
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
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
