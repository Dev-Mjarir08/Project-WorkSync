import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'member' });
  const [actionMessage, setActionMessage] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getUsers({
        search,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(res.users);
      setSummary(res.rolesSummary);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleRoleChange = async (userId, newRole) => {
    await superAdminService.updateUserRole(userId, newRole);
    showToast(`Role updated to ${newRole}`);
    fetchUsers();
  };

  const handleToggleStatus = async (userId) => {
    await superAdminService.toggleUserStatus(userId);
    showToast('Account status updated');
    fetchUsers();
  };

  const handleDeleteUser = async (userId, name) => {
    if (window.confirm(`Are you sure you want to remove user "${name}" from the platform?`)) {
      await superAdminService.deleteUser(userId);
      showToast(`User ${name} removed`);
      fetchUsers();
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    await superAdminService.createUser(newUser);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', role: 'member' });
    showToast('New user created successfully');
    fetchUsers();
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
        return 'bg-slate-700/40 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Feedback */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="h-4 w-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="h-7 w-7 text-indigo-400" />
            <span>Platform Users</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global directory of user accounts, platform roles, security credentials, and organization memberships.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Role & Status Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Total Accounts</p>
          <p className="text-xl font-bold text-white mt-1">{users.length + 1475}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800">
          <p className="text-xs text-emerald-400 font-medium">Active Accounts</p>
          <p className="text-xl font-bold text-white mt-1">{summary?.active || 6}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800">
          <p className="text-xs text-blue-400 font-medium">Platform Admins</p>
          <p className="text-xl font-bold text-white mt-1">{summary?.admin || 2}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800">
          <p className="text-xs text-rose-400 font-medium">Suspended Accounts</p>
          <p className="text-xl font-bold text-white mt-1">{summary?.inactive || 1}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or email address..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-[#0d1322] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Tenants</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Fetching user records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Selector */}
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`text-xs font-semibold uppercase px-2 py-1 rounded-md bg-slate-900 border cursor-pointer ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>

                    {/* Workspaces Count */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-mono text-slate-300 bg-slate-800/70 px-2 py-0.5 rounded">
                        {u.workspacesCount} workspaces
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {u.lastLogin}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          title={u.isActive ? 'Deactivate account' : 'Reactivate account'}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            u.isActive
                              ? 'border-slate-700 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                              : 'border-emerald-700/50 text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          title="Delete user"
                          className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Provision New User</h3>
            <p className="text-xs text-slate-400 mb-6">
              Create an account with platform permissions and an auto-generated temporary key.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. rachel@worksync.io"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Platform Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="member">Member (Standard Workspace Access)</option>
                  <option value="admin">Admin (Workspace & Team Administration)</option>
                  <option value="super_admin">Super Admin (Full Root Platform Control)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-semibold shadow-lg shadow-indigo-600/25"
                >
                  Provision User
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
