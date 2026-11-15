import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Search,
  Users,
  UserPlus,
  Trash2,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  MoreVertical,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../adminService';
import { useConfirm } from '../../../context/ConfirmContext.jsx';

const getInitials = (name = 'Member') =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase();

const roleColors = {
  owner: 'bg-purple-50 text-purple-700 border-purple-200',
  admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  manager: 'bg-blue-50 text-blue-700 border-blue-200',
  member: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  employee: 'bg-teal-50 text-teal-700 border-teal-200',
};

const MembersPage = () => {
  const confirm = useConfirm();
  const [members, setMembers] = useState([]);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  const fetchMembersAndInvitations = async () => {
    setIsLoading(true);
    try {
      const [membersData, invitationsData] = await Promise.all([
        adminService.getMembers(),
        adminService.getInvitations()
      ]);
      setMembers(Array.isArray(membersData) ? membersData : []);
      const pendingCount = Array.isArray(invitationsData)
        ? invitationsData.filter((i) => i.status === 'Pending' || i.status === 'pending').length
        : 0;
      setPendingInvitationsCount(pendingCount);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersAndInvitations();
  }, []);

  const handleRoleChange = async (memberId, newRole) => {
    setActionLoading(true);
    try {
      await adminService.updateMemberRole(memberId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      setNotification({ type: 'success', message: `Member role updated to ${newRole}.` });
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to update member role.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    const isConfirmed = await confirm({
      title: "Remove Member",
      message: `Are you sure you want to remove ${memberName || 'this member'} from the workspace? They will lose access to all workspace projects and resources.`,
      confirmText: "Remove Member",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      await adminService.removeMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setNotification({ type: 'success', message: `${memberName || 'Member'} removed from workspace.` });
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to remove member.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSubmitting(true);
    try {
      await adminService.inviteMember({
        email: inviteEmail.trim(),
        role: inviteRole,
        message: inviteMessage.trim(),
      });
      setNotification({ type: 'success', message: `Invitation sent to ${inviteEmail} successfully!` });
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteMessage('');
      fetchMembersAndInvitations();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to send invitation.' });
    } finally {
      setInviteSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const visibleMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const name = (member.name || '').toLowerCase();
      const email = (member.email || '').toLowerCase();
      const matchesSearch = !query || name.includes(query) || email.includes(query);
      const matchesRole = roleFilter === 'all' || (member.role || '').toLowerCase() === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  const hasFilters = Boolean(search.trim()) || roleFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#6542F5]">Workspace access</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Workspace Members</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            View live workspace members, assign roles, manage access permissions, and invite new colleagues.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/invitations"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Mail aria-hidden="true" className="size-4 text-slate-500" />
            Invitations ({pendingInvitationsCount})
          </Link>
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#6542F5] px-4 text-sm font-semibold text-white transition hover:bg-[#5635E0] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
          >
            <UserPlus aria-hidden="true" className="size-4" />
            Invite member
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <section aria-label="Member statistics" className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total active members"
          value={isLoading ? '—' : members.length}
          icon={Users}
          tone="bg-[#F1EEFF] text-[#6542F5]"
          description="Members with active roles in this workspace"
        />
        <StatCard
          label="Pending invitations"
          value={isLoading ? '—' : pendingInvitationsCount}
          icon={BriefcaseBusiness}
          tone="bg-[#E2F5F3] text-[#278A8F]"
          description="Awaiting email confirmation or acceptance"
        />
      </section>

      {/* Members Directory */}
      <section className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
        <div className="border-b border-[#E6E7EC] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Members Directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isLoading
                  ? 'Loading member records…'
                  : `Showing ${visibleMembers.length} of ${members.length} members`}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_minmax(10rem,auto)_auto]">
              <label className="relative block">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                />
              </label>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="member">Member</option>
                <option value="employee">Employee</option>
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-[#6542F5]"
                >
                  <X aria-hidden="true" className="size-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : visibleMembers.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Member</th>
                  <th scope="col" className="px-6 py-3.5">Workspace Role</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5">Joined Date</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 font-bold text-indigo-700 text-sm">
                          {getInitials(member.name)}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">{member.name || 'Workspace Member'}</div>
                          <div className="text-xs text-slate-500">{member.email || 'No email registered'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={(member.role || 'member').toLowerCase()}
                        disabled={actionLoading || member.role === 'owner'}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold border outline-none transition ${
                          roleColors[(member.role || 'member').toLowerCase()] || 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="owner" disabled>Owner</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        {member.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'owner' ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                          title="Remove member from workspace"
                        >
                          <Trash2 className="size-3.5" />
                          Remove
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Workspace Owner</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-16 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
              <Users aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-4 font-semibold text-slate-900">
              {members.length ? 'No members match these filters' : 'No members found'}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {members.length
                ? 'Try adjusting your search query or role filter.'
                : 'Invite colleagues to collaborate with them on boards and tasks in this workspace.'}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-[#6542F5] transition hover:bg-[#F1EEFF]"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#6542F5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5635E0]"
              >
                <UserPlus className="size-4" />
                Invite First Member
              </button>
            )}
          </div>
        )}
      </section>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Invite Team Member</h2>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Workspace Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                >
                  <option value="admin">Admin - Can manage members and projects</option>
                  <option value="manager">Manager - Can assign and supervise tasks</option>
                  <option value="member">Member - Can create and work on tasks</option>
                  <option value="employee">Employee - Regular contributor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Personal Note (Optional)
                </label>
                <textarea
                  rows="2"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Welcome to our team workspace!"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteSubmitting}
                  className="rounded-xl bg-[#6542F5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5635E0] disabled:opacity-50"
                >
                  {inviteSubmitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, tone, description }) => (
  <article className="rounded-2xl border border-[#E6E7EC] bg-white p-4 shadow-sm shadow-slate-200/25 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <span className={`grid size-10 place-items-center rounded-xl ${tone}`}>
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
    </div>
    <p className="mt-4 text-sm font-semibold text-slate-800">{label}</p>
    <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
  </article>
);

export default MembersPage;
