import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  Users,
  FolderKanban,
  CheckCircle2,
  HardDrive,
  Calendar,
  Layers,
  MoreVertical,
  Archive,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  X,
  CheckCircle
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const WorkspacesPage = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWs, setNewWs] = useState({
    name: '',
    slug: '',
    ownerName: '',
    ownerEmail: '',
    plan: 'Pro'
  });
  const [toast, setToast] = useState(null);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getWorkspaces({
        search,
        status: statusFilter,
        plan: planFilter
      });
      setWorkspaces(res.workspaces);
      setMetrics(res.metrics);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [search, planFilter, statusFilter]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await superAdminService.toggleWorkspaceStatus(id);
    showToast(`Workspace is now ${currentStatus === 'Active' ? 'Archived' : 'Active'}`);
    fetchWorkspaces();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete workspace "${name}"? All associated boards will be decommissioned.`)) {
      await superAdminService.deleteWorkspace(id);
      showToast(`Workspace ${name} deleted`);
      fetchWorkspaces();
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWs.name) return;

    await superAdminService.createWorkspace(newWs);
    setShowCreateModal(false);
    setNewWs({ name: '', slug: '', ownerName: '', ownerEmail: '', plan: 'Pro' });
    showToast('New workspace tenant provisioned successfully');
    fetchWorkspaces();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="h-4 w-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Building2 className="h-7 w-7 text-indigo-400" />
            <span>Workspace Tenants</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global management of multi-tenant environments, storage allocation, subscription tiers, and project boards.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workspace</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Total Workspaces</p>
          <p className="text-xl font-bold text-white mt-1">{workspaces.length + 80}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800">
          <p className="text-xs text-purple-400 font-medium">Enterprise Tier</p>
          <p className="text-xl font-bold text-white mt-1">{metrics?.enterprise || 24}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800">
          <p className="text-xs text-indigo-400 font-medium">Pro Tier</p>
          <p className="text-xl font-bold text-white mt-1">{metrics?.pro || 48}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800">
          <p className="text-xs text-emerald-400 font-medium">Total Cloud Storage</p>
          <p className="text-xl font-bold text-white mt-1">{metrics?.totalStorage || '10.5 GB'}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces by name, slug, or owner email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Plans</option>
            <option value="enterprise">Enterprise</option>
            <option value="pro">Pro</option>
            <option value="starter">Starter</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800/80 hover:border-indigo-500/40 shadow-xl flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Header: Icon, Name, Plan */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-indigo-600/20">
                    {ws.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">
                      {ws.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">/{ws.slug}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                    ws.plan === 'Enterprise'
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      : ws.plan === 'Pro'
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      : 'bg-slate-700/40 text-slate-400 border border-slate-700'
                  }`}
                >
                  {ws.plan}
                </span>
              </div>

              {/* Owner Info */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Owner: <strong className="text-slate-200">{ws.owner.name}</strong></span>
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    ws.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      ws.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {ws.status}
                </span>
              </div>

              {/* Workspace Metrics */}
              <div className="mt-4 grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div>
                  <p className="text-xs font-semibold text-white">{ws.membersCount}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Members</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{ws.boardsCount}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Boards</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{ws.storageUsed}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Storage</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Created: {ws.createdAt}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(ws.id, ws.status)}
                  className="px-2.5 py-1 rounded-lg border border-slate-700 hover:border-slate-600 text-xs text-slate-300 transition-colors"
                >
                  {ws.status === 'Active' ? 'Archive' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(ws.id, ws.name)}
                  className="p-1.5 rounded-lg border border-slate-700 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Provision Tenant Workspace</h3>
            <p className="text-xs text-slate-400 mb-6">
              Establish a dedicated organization boundary with isolated boards and storage.
            </p>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  value={newWs.name}
                  onChange={(e) =>
                    setNewWs({
                      ...newWs,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    })
                  }
                  placeholder="e.g. Acme Global Logistics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  URL Slug
                </label>
                <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                  <span className="px-3 text-xs text-slate-500 font-mono">worksync.io/</span>
                  <input
                    type="text"
                    required
                    value={newWs.slug}
                    onChange={(e) => setNewWs({ ...newWs, slug: e.target.value })}
                    className="flex-1 py-2.5 pr-3 bg-transparent text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Owner Email
                </label>
                <input
                  type="email"
                  required
                  value={newWs.ownerEmail}
                  onChange={(e) => setNewWs({ ...newWs, ownerEmail: e.target.value })}
                  placeholder="e.g. owner@acme.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Subscription Tier
                </label>
                <select
                  value={newWs.plan}
                  onChange={(e) => setNewWs({ ...newWs, plan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Pro">Pro Plan (Unlimited boards, 100 members)</option>
                  <option value="Enterprise">Enterprise Plan (Custom SLA, Unlimited members)</option>
                  <option value="Starter">Starter Plan (Up to 10 members)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-semibold shadow-lg shadow-indigo-600/25"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspacesPage;
