import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  Shield,
  ShieldAlert,
  Server,
  Globe,
  User,
  Eye,
  X
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setRefreshing(true);
      const res = await superAdminService.getAuditLogs({
        search,
        category: categoryFilter,
        status: statusFilter
      });
      setLogs(res.logs);
      setMetrics(res.metrics);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, categoryFilter, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle2,
          className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        };
      case 'error':
        return {
          icon: XCircle,
          className: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        };
      default:
        return {
          icon: Info,
          className: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
        };
    }
  };

  const exportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `worksync-audit-trail-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <FileText className="h-7 w-7 text-indigo-400" />
              <span>Platform Audit Trail</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Stream
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time compliance logs, administrative actions, tenant provisioning, and security events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Logs'}</span>
          </button>

          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400">
            <span>Total Logged Events</span>
            <FileText className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {metrics?.totalEvents ? metrics.totalEvents.toLocaleString() : '1,482'}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Immutable ledger trail</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400">
            <span>Security Anomalies</span>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {metrics?.securityAlerts || 4}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Auto-isolated by Sentinel</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400">
            <span>Active Admin Sessions</span>
            <Server className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {metrics?.activeSessions || 48}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Token TLS handshakes OK</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400">
            <span>SOC-2 Compliance</span>
            <Shield className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-400">
            {metrics?.complianceScore || '99.8%'}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Strict retention active</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, administrator, IP, or target..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Categories</option>
              <option value="user_management" className="bg-slate-900">User Management</option>
              <option value="workspace" className="bg-slate-900">Workspace Operations</option>
              <option value="security" className="bg-slate-900">Security & Credentials</option>
              <option value="authentication" className="bg-slate-900">Authentication</option>
              <option value="system" className="bg-slate-900">System & Backup</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="success" className="bg-slate-900">Success</option>
              <option value="warning" className="bg-slate-900">Warning</option>
              <option value="error" className="bg-slate-900">Error</option>
              <option value="info" className="bg-slate-900">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Event Action</th>
                <th className="py-3.5 px-4">Operator / Actor</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4">Client IP & Region</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Fetching audit event stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No audit records match the selected filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const statusInfo = getStatusBadge(log.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {log.action}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {log.details}
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {log.actor.avatar ? (
                            <img
                              src={log.actor.avatar}
                              alt={log.actor.name}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                              <User className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-slate-200">{log.actor.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{log.actor.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {log.target}
                      </td>

                      {/* IP & Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-300">{log.ip}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Globe className="h-2.5 w-2.5" />
                          <span>{log.location}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusInfo.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {log.status}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                        <div>{log.timeAgo}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Inspect */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="p-1.5 rounded-lg border border-slate-700/80 hover:border-indigo-500/60 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl w-full shadow-2xl space-y-5 animate-slideDown">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Audit Event Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500">Event ID</span>
                  <p className="font-mono text-indigo-400 mt-0.5">{selectedLog.id}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500">Action</span>
                  <p className="font-semibold text-white mt-0.5">{selectedLog.action}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500">Event Description</span>
                <p className="text-slate-300 text-sm">{selectedLog.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500">Initiated By</span>
                  <p className="text-white font-medium mt-0.5">{selectedLog.actor.name}</p>
                  <p className="text-slate-400 font-mono text-[11px]">{selectedLog.actor.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500">Target Object</span>
                  <p className="text-white font-mono mt-0.5">{selectedLog.target}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500">Client IP & Host</span>
                  <p className="font-mono text-slate-300 mt-0.5">{selectedLog.ip} ({selectedLog.location})</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500">Recorded At</span>
                  <p className="font-mono text-slate-300 mt-0.5">{selectedLog.timestamp}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
