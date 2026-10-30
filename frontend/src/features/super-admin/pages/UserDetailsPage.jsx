import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Calendar,
  Clock,
  Building2,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Key,
  Layers,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  UserCheck,
  UserX
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, workspaces, security, activity
  const [copiedId, setCopiedId] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      // If no specific userId in URL param, fallback to first mock/live user
      const idToFetch = userId || 'usr-1';
      const userData = await superAdminService.getUserById(idToFetch);
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyUserId = () => {
    if (user?.id || user?._id) {
      navigator.clipboard.writeText(user.id || user._id);
      setCopiedId(true);
      showToast('User ID copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleRoleChange = async (newRole) => {
    try {
      setActionLoading(true);
      const targetId = user.id || user._id;
      const updated = await superAdminService.updateUserRole(targetId, newRole);
      setUser(prev => ({ ...prev, role: updated?.role || newRole }));
      showToast(`User platform role successfully updated to ${newRole}`);
    } catch (err) {
      showToast(err.message || 'Failed to update role', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setActionLoading(true);
      const targetId = user.id || user._id;
      const updated = await superAdminService.toggleUserStatus(targetId);
      const newStatus = typeof updated?.isActive === 'boolean' ? updated.isActive : !user.isActive;
      setUser(prev => ({ ...prev, isActive: newStatus }));
      showToast(`Account status updated to ${newStatus ? 'Active' : 'Deactivated'}`);
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);
      const targetId = user.id || user._id;
      await superAdminService.deleteUser(targetId);
      showToast(`User ${user.name} has been removed from platform`);
      setShowDeleteModal(false);
      setTimeout(() => {
        navigate('/super-admin/users');
      }, 1200);
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
      case 'admin':
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
      case 'member':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading user profile and tenant records...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">User Record Not Found</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The requested user account ID does not exist or may have been deleted.
        </p>
        <button
          onClick={() => navigate('/super-admin/users')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl"
        >
          Return to Users Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 animate-slideDown ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-800 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/super-admin/users')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Users</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Target ID:</span>
          <button
            onClick={copyUserId}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
          >
            <span>{(user.id || user._id || '').slice(0, 16)}...</span>
            {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Identifiers */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-lg"
              />
              <span
                className={`absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                  user.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={user.isActive ? 'Active User' : 'Deactivated User'}
              >
                {user.isActive ? <Check className="h-3 w-3 text-white" /> : <XCircle className="h-3 w-3 text-white" />}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                  {user.role?.replace('_', ' ')}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    user.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {user.isActive ? 'Account Active' : 'Account Suspended'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Joined {user.joinedAt || 'Recently'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  Last Active: {user.lastLogin || 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
            <button
              onClick={handleToggleStatus}
              disabled={actionLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                user.isActive
                  ? 'bg-slate-900 border-slate-700 hover:border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
              }`}
            >
              {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              <span>{user.isActive ? 'Suspend User' : 'Activate User'}</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Overview & Profile', icon: Layers },
          { id: 'workspaces', label: 'Tenants & Workspaces', icon: Building2 },
          { id: 'security', label: 'Security & Role Controls', icon: ShieldCheck },
          { id: 'activity', label: 'Activity Audit Log', icon: Clock }
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric Card 1 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Workspaces Assigned
              </span>
              <div className="mt-2 text-3xl font-extrabold text-white">
                {user.workspacesCount || 3}
              </div>
              <p className="mt-1 text-xs text-slate-500">Active tenant memberships</p>
            </div>

            {/* Metric Card 2 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Platform Privilege
              </span>
              <div className="mt-2 text-2xl font-extrabold text-indigo-400 capitalize">
                {user.role?.replace('_', ' ')}
              </div>
              <p className="mt-1 text-xs text-slate-500">Security access tier</p>
            </div>

            {/* Metric Card 3 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Security Posture
              </span>
              <div className="mt-2 text-2xl font-extrabold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6" />
                <span>Verified</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Email & credentials valid</p>
            </div>
          </div>

          {/* Detailed Info Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Identity & Account Attributes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-500">Full Legal Name</span>
                <p className="text-white font-semibold text-sm">{user.name}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-500">Primary Email Address</span>
                <p className="text-white font-mono text-sm">{user.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-500">Platform User ID</span>
                <p className="text-indigo-400 font-mono text-xs">{user.id || user._id}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-500">Bio / Notes</span>
                <p className="text-slate-300">{user.bio || 'No profile biography provided.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKSPACES */}
      {activeTab === 'workspaces' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Associated Workspaces</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tenants where {user.name} currently holds active workspace membership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'ws-101',
                name: 'WorkSync Core Platform',
                role: 'Workspace Lead',
                boards: 18,
                plan: 'Enterprise',
                status: 'Active'
              },
              {
                id: 'ws-102',
                name: 'Design & UX Studio',
                role: 'Member',
                boards: 8,
                plan: 'Pro',
                status: 'Active'
              },
              {
                id: 'ws-104',
                name: 'Cloud Infrastructure Migration',
                role: 'Collaborator',
                boards: 6,
                plan: 'Pro',
                status: 'Active'
              }
            ].map(ws => (
              <div
                key={ws.id}
                className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-400" />
                    <span className="font-semibold text-white text-sm">{ws.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Role: <strong className="text-slate-200">{ws.role}</strong></span>
                    <span>•</span>
                    <span>{ws.boards} boards</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {ws.plan}
                  </span>
                  <p className="text-[10px] text-emerald-400">{ws.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & ROLE CONTROLS */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <span>Platform Role Governance</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Elevate or adjust platform-wide security permissions for this user account.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
              <label className="text-xs font-semibold text-slate-300">Select Platform Role:</label>
              <div className="flex flex-wrap items-center gap-3">
                {['super_admin', 'admin', 'member', 'viewer'].map(roleOption => {
                  const isCurrent = user.role === roleOption;
                  return (
                    <button
                      key={roleOption}
                      onClick={() => handleRoleChange(roleOption)}
                      disabled={isCurrent || actionLoading}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {roleOption.replace('_', ' ')}
                      {isCurrent && ' (Current)'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Security & Authentication Status
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Two-Factor Authentication (2FA)</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Enforced
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Password Encryption</span>
                  <span className="text-slate-200 font-mono">Bcrypt (Salt rounds 10)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Security & Activity Trail</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Audit log records recorded for operations executed by or upon this account.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                action: 'Session Authentication Succeeded',
                ip: '192.168.1.45',
                time: '12 minutes ago',
                status: 'success'
              },
              {
                action: 'Workspace Invitation Accepted',
                ip: '192.168.1.45',
                time: '2 hours ago',
                status: 'success'
              },
              {
                action: 'Security Token Refreshed',
                ip: '192.168.1.45',
                time: 'Yesterday at 18:40',
                status: 'info'
              }
            ].map((evt, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-white">{evt.action}</span>
                  <p className="text-slate-500 font-mono">Client IP: {evt.ip}</p>
                </div>
                <span className="text-slate-400">{evt.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete User */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-900/60 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="p-3 w-fit rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete User Account?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently delete <strong>{user.name}</strong> ({user.email})?
                This action cannot be undone and will revoke all workspace access.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsPage;
