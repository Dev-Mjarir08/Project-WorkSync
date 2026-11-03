import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import superAdminService from '../superAdminService.js';
import {
  ArrowLeft,
  Building2,
  Users,
  FolderKanban,
  HardDrive,
  Calendar,
  Shield,
  Trash2,
  Archive,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Edit3,
  Copy,
  Check,
  Plus,
  Layers,
  Activity,
  AlertTriangle,
  Lock,
  Globe,
  Settings,
  RefreshCw
} from 'lucide-react';

export const WorkspaceDetailsPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, members, boards, quotas
  const [toast, setToast] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    plan: 'Pro',
    storageQuota: 10
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const ws = await superAdminService.getWorkspaceById(workspaceId);
        if (ws) {
          setWorkspace({
            ...ws,
            storageQuota: ws.plan === 'Enterprise' ? 20 : ws.plan === 'Pro' ? 10 : 5,
            members: ws.members || [],
            boards: ws.boards || []
          });
          setEditForm({
            name: ws.name,
            description: ws.description || '',
            plan: ws.plan || 'Pro',
            storageQuota: ws.plan === 'Enterprise' ? 20 : ws.plan === 'Pro' ? 10 : 5
          });
        }
      } catch (err) {
        console.error('Failed to load workspace details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading workspace tenant details...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#0d1322] border border-slate-800 space-y-4">
        <Building2 className="h-12 w-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Workspace Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          The requested tenant workspace does not exist or has been decommissioned.
        </p>
        <button
          onClick={() => navigate('/super-admin/workspaces')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Back to Workspaces
        </button>
      </div>
    );
  }

  const copySlug = () => {
    navigator.clipboard.writeText(workspace.slug);
    setCopiedSlug(true);
    showToast('Workspace slug copied to clipboard');
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const handleToggleStatus = (newStatus) => {
    setWorkspace(prev => ({
      ...prev,
      status: newStatus
    }));
    showToast(`Workspace status updated to ${newStatus}`);
  };

  const handlePlanChange = (newPlan) => {
    setWorkspace(prev => ({
      ...prev,
      plan: newPlan
    }));
    showToast(`Workspace tier updated to ${newPlan}`);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setWorkspace(prev => ({
      ...prev,
      name: editForm.name,
      description: editForm.description,
      plan: editForm.plan,
      storageQuota: editForm.storageQuota
    }));
    setShowEditModal(false);
    showToast('Workspace attributes updated successfully');
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    showToast(`Workspace "${workspace.name}" decommissioned`);
    setTimeout(() => {
      navigate('/super-admin/workspaces');
    }, 1200);
  };

  const storagePercentage = Math.round((workspace.storageUsed / workspace.storageQuota) * 100);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-200 text-sm font-medium shadow-2xl flex items-center gap-3 animate-slideDown">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/super-admin/workspaces')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Workspaces</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Slug:</span>
          <button
            onClick={copySlug}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
          >
            <span>{workspace.slug}</span>
            {copiedSlug ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Hero Workspace Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/20 shrink-0">
              <Building2 className="h-9 w-9 text-white" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {workspace.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  workspace.plan === 'Enterprise'
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                    : workspace.plan === 'Pro'
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                }`}>
                  {workspace.plan} Plan
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  workspace.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : workspace.status === 'Archived'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {workspace.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-500" />
                  Owner: <strong className="text-slate-300 font-semibold">{workspace.owner.name}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Created {workspace.createdAt}
                </span>
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-slate-500" />
                  Storage: {workspace.storageUsed} GB / {workspace.storageQuota} GB ({storagePercentage}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
            <button
              onClick={() => handleToggleStatus(workspace.status === 'Active' ? 'Archived' : 'Active')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                workspace.status === 'Active'
                  ? 'bg-slate-900 border-slate-700 hover:border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
              }`}
            >
              <Archive className="h-4 w-4" />
              <span>{workspace.status === 'Active' ? 'Archive Workspace' : 'Activate Workspace'}</span>
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Attributes</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-all"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Workspace Overview', icon: Layers },
          { id: 'members', label: `Members (${workspace.members.length})`, icon: Users },
          { id: 'boards', label: `Boards & Projects (${workspace.boards.length})`, icon: FolderKanban },
          { id: 'quotas', label: 'Quotas & Governance', icon: HardDrive }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs uppercase font-semibold text-slate-400">Total Members</span>
              <div className="mt-2 text-2xl font-extrabold text-white">{workspace.membersCount}</div>
              <p className="mt-1 text-[11px] text-slate-500">Active team seats</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs uppercase font-semibold text-slate-400">Boards Provisioned</span>
              <div className="mt-2 text-2xl font-extrabold text-indigo-400">{workspace.boardsCount}</div>
              <p className="mt-1 text-[11px] text-slate-500">Kanban & Scrum boards</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs uppercase font-semibold text-slate-400">Tasks Handled</span>
              <div className="mt-2 text-2xl font-extrabold text-emerald-400">{workspace.tasksCount}</div>
              <p className="mt-1 text-[11px] text-slate-500">Completed & in-progress</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs uppercase font-semibold text-slate-400">Cloud Storage</span>
              <div className="mt-2 text-2xl font-extrabold text-purple-400">{workspace.storageUsed} GB</div>
              <p className="mt-1 text-[11px] text-slate-500">Quota: {workspace.storageQuota} GB</p>
            </div>
          </div>

          {/* Description & Storage Allocation Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Organization Synopsis</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{workspace.description}</p>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500">Primary Administrator</span>
                  <p className="text-white font-semibold mt-0.5">{workspace.owner.name}</p>
                  <p className="text-slate-400 font-mono text-[11px]">{workspace.owner.email}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500">Security Architecture</span>
                  <p className="text-emerald-400 font-semibold mt-0.5">SOC-2 Isolated Schema</p>
                  <p className="text-slate-400 text-[11px]">Strict multi-tenant boundary</p>
                </div>
              </div>
            </div>

            {/* Storage Gauge */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Storage Consumption</h3>
                <span className="text-xs font-mono text-purple-400 font-bold">{storagePercentage}%</span>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${storagePercentage}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{workspace.storageUsed} GB used</span>
                  <span>{workspace.storageQuota} GB total</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex justify-between">
                  <span>Task Attachments:</span>
                  <span className="text-white font-mono">2.1 GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Board Backups:</span>
                  <span className="text-white font-mono">1.3 GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === 'members' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Workspace Members & Collaborators</h3>
              <p className="text-xs text-slate-400">Active users holding privileges inside this tenant workspace.</p>
            </div>
            <button
              onClick={() => showToast('Invitation modal triggered')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {workspace.members.map((m) => (
              <div key={m.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{m.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">{m.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    m.role === 'Owner'
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      : m.role === 'Admin'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {m.role}
                  </span>
                  <span className="text-xs text-slate-500 font-mono hidden sm:inline">Joined {m.joinedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BOARDS */}
      {activeTab === 'boards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Project & Sprint Boards</h3>
              <p className="text-xs text-slate-400">Active agile boards provisioned inside this workspace.</p>
            </div>
            <button
              onClick={() => showToast('Create Board modal triggered')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Board</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workspace.boards.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold uppercase">
                    {b.type}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {b.lastActive}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white">{b.name}</h4>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{b.tasksCount} Tasks</span>
                  <span>{b.listsCount} Workflow Columns</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: QUOTAS & GOVERNANCE */}
      {activeTab === 'quotas' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-400" />
              <span>Tenant Policy & Subscription Management</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {['Starter', 'Pro', 'Enterprise'].map((tier) => (
                <div
                  key={tier}
                  onClick={() => handlePlanChange(tier)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    workspace.plan === tier
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs uppercase font-bold text-slate-400">{tier} Tier</span>
                  <p className="text-sm font-bold text-white mt-1">
                    {tier === 'Enterprise' ? '20 GB Storage • Unlimited' : tier === 'Pro' ? '10 GB Storage • 50 seats' : '5 GB Storage • 10 seats'}
                  </p>
                  <p className="text-xs text-indigo-400 mt-2 font-semibold">
                    {workspace.plan === tier ? '✓ Current Active Plan' : 'Click to Switch'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              <span>Danger Zone (Decommissioning)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Permanently decommission this tenant workspace, wipe all project boards, and release assigned storage allocations.
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-300 font-semibold">Decommission Workspace</span>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
              >
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Attributes */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Edit Workspace Attributes</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Workspace Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description</label>
                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Storage Quota (GB)</label>
                <input
                  type="number"
                  value={editForm.storageQuota}
                  onChange={(e) => setEditForm({ ...editForm, storageQuota: parseInt(e.target.value) || 20 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Workspace Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/60 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="p-3 w-fit rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Decommission Workspace?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently delete <strong>{workspace.name}</strong>?
                This action is irreversible and all {workspace.boardsCount} project boards will be wiped.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDetailsPage;
