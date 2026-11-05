import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ShieldAlert,
  MoreVertical,
  CheckCircle,
  XCircle,
  Mail,
  ShieldCheck,
  Building,
  Key,
  Trash2,
  RefreshCw,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { useSuperAdmin } from '../../../context/SuperAdminContext.jsx';
import superAdminService from '../superAdminService.js';

export const UsersPage = () => {
  const navigate = useNavigate();
  const {
    usersState,
    loadUsers,
    createUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    loadWorkspaces
  } = useSuperAdmin();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [workspacesList, setWorkspacesList] = useState([]);
  const [creating, setCreating] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'WorkSync@2026',
    role: 'member',
    workspaceId: ''
  });

  useEffect(() => {
    loadUsers({
      search,
      role: roleFilter,
      status: statusFilter
    });
    loadWorkspaces().then(list => setWorkspacesList(list || []));
  }, [search, roleFilter, statusFilter]);

  const showToast = (msg, isError = false) => {
    setActionMessage({ text: msg, isError });
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleRoleChange = async (userId, newRole) => {
    await updateUserRole(userId, newRole);
  };

  const handleToggleStatus = async (userId) => {
    await toggleUserStatus(userId);
  };

  const handleDeleteUser = async (userId, name) => {
    if (window.confirm(`Are you sure you want to remove user "${name}" from the platform?`)) {
      await deleteUser(userId, name);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser(prev => ({ ...prev, password: pwd }));
    showToast('Temporary password generated');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) {
      showToast('Name and email are required', true);
      return;
    }

    try {
      setCreating(true);
      const payload = {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password || 'WorkSync@2026',
        role: newUser.role
      };

      const created = await createUser(payload);

      // If a workspace was selected, assign the user to that workspace immediately
      if (newUser.workspaceId && created) {
        const userId = created.id || created._id;
        await superAdminService.addWorkspaceMember(newUser.workspaceId, {
          userId,
          role: newUser.role === 'admin' ? 'admin' : (newUser.role === 'manager' ? 'manager' : 'member')
        }).catch(err => console.error('Workspace assignment error:', err));
      }

      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: 'WorkSync@2026',
        role: 'member',
        workspaceId: ''
      });
      showToast('User provisioned successfully');
    } catch (err) {
      showToast(err.message || 'Failed to create user', true);
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
      case 'admin':
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
      case 'manager':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'employee':
        return 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30';
      case 'member':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'viewer':
        return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all ${
            actionMessage.isError
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}
        >
          {actionMessage.isError ? (
            <AlertCircle className="h-5 w-5 text-rose-400" />
          ) : (
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Platform User Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Provision, manage roles, inspect security sessions and oversee team members across workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadUsers({ search, role: roleFilter, status: statusFilter }, true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs sm:text-sm text-slate-300 font-medium transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${usersState.loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Provision User</span>
          </button>
        </div>
      </div>

      {/* Role Summary Badges */}
      {usersState.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(usersState.summary).map(([role, count]) => (
            <div
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                roleFilter === role
                  ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                  : 'bg-[#0d1322] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{role.replace('_', ' ')}</div>
              <div className="text-lg font-extrabold text-white mt-0.5">{count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by full name, email or role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Suspended / Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Platform Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {usersState.loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs">Loading platform accounts...</p>
                  </td>
                </tr>
              ) : usersState.list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                usersState.list.map((u) => {
                  const uid = u.id || u._id;
                  return (
                    <tr key={uid} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow">
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <button
                              onClick={() => navigate(`/super-admin/users/${uid}`)}
                              className="font-semibold text-white hover:text-indigo-400 transition-colors text-left"
                            >
                              {u.name}
                            </button>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={u.role || 'member'}
                          onChange={(e) => handleRoleChange(uid, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${getRoleBadge(u.role)}`}
                        >
                          <option value="super_admin" className="bg-slate-900 text-white">Super Admin</option>
                          <option value="admin" className="bg-slate-900 text-white">Admin</option>
                          <option value="manager" className="bg-slate-900 text-white">Manager</option>
                          <option value="employee" className="bg-slate-900 text-white">Employee</option>
                          <option value="member" className="bg-slate-900 text-white">Member</option>
                          <option value="viewer" className="bg-slate-900 text-white">Viewer</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(uid)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            u.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                        >
                          {u.isActive ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Suspended</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-400">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/super-admin/users/${uid}`)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Inspect Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(uid, u.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-400" />
                <span>Provision Platform Account</span>
              </h3>
              <p className="text-xs text-slate-400">
                Create a new user with predefined role and auto-generated security credentials.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. john@worksync.io"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Password with generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Temporary Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Platform Role *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="super_admin">Super Admin (Root Access)</option>
                    <option value="admin">Admin (Workspace Lead)</option>
                    <option value="manager">Manager (Project Lead)</option>
                    <option value="employee">Employee (Contributor)</option>
                    <option value="member">Member (Standard User)</option>
                    <option value="viewer">Viewer (Read-only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Assign To Workspace
                  </label>
                  <select
                    value={newUser.workspaceId}
                    onChange={(e) => setNewUser({ ...newUser, workspaceId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None (Platform only)</option>
                    {workspacesList.map(ws => (
                      <option key={ws.id || ws._id} value={ws.id || ws._id}>{ws.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs text-white font-bold shadow-lg shadow-indigo-600/25"
                >
                  {creating ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
