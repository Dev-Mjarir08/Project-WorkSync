import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Mail,
  Search,
  UserPlus,
  Users,
  X,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import adminService from '../adminService';
import { useConfirm } from '../../../context/ConfirmContext.jsx';

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  Accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  Expired: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  expired: 'bg-slate-100 text-slate-600 ring-slate-500/10',
};

const formatDate = (date) => {
  if (!date) return 'Recent';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return String(date);
  }
};

const getInitials = (name = 'Invitee') => (
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase()
);

const InvitationsPage = () => {
  const confirm = useConfirm();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [dateSort, setDateSort] = useState('newest');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getInvitations();
      setInvitations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching invitations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const roles = useMemo(() => {
    const list = [...new Set(invitations.map((inv) => inv.role).filter(Boolean))];
    return list.length > 0 ? list : ['admin', 'manager', 'member', 'employee'];
  }, [invitations]);

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invitations
      .filter((inv) => {
        const emailStr = (inv.email || '').toLowerCase();
        const roleStr = (inv.role || '').toLowerCase();
        const statusStr = (inv.status || '').toLowerCase();

        const matchesSearch = !query || emailStr.includes(query) || roleStr.includes(query);
        const matchesStatus = statusFilter === 'All statuses' || statusStr === statusFilter.toLowerCase();
        const matchesRole = roleFilter === 'All roles' || roleStr === roleFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesRole;
      })
      .sort((first, second) => {
        const firstDate = new Date(first.invitedAt || first.createdAt || 0);
        const secondDate = new Date(second.invitedAt || second.createdAt || 0);
        return dateSort === 'newest' ? secondDate - firstDate : firstDate - secondDate;
      });
  }, [invitations, dateSort, roleFilter, search, statusFilter]);

  const summaryCards = [
    {
      icon: Users,
      label: 'Total invitations',
      value: invitations.length,
      tone: 'bg-[#EAF2FF] text-[#3971C6]',
    },
    {
      icon: Clock3,
      label: 'Pending',
      value: invitations.filter((i) => (i.status || '').toLowerCase() === 'pending').length,
      tone: 'bg-[#F1EEFF] text-[#6542F5]',
    },
    {
      icon: CheckCircle2,
      label: 'Accepted',
      value: invitations.filter((i) => (i.status || '').toLowerCase() === 'accepted').length,
      tone: 'bg-[#E2F5F3] text-[#278A8F]',
    },
    {
      icon: Mail,
      label: 'Expired',
      value: invitations.filter((i) => (i.status || '').toLowerCase() === 'expired').length,
      tone: 'bg-[#FDEBE3] text-[#C76A3F]',
    },
  ];

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      await adminService.inviteMember({
        email: email.trim(),
        role,
        message: message.trim(),
      });
      setToast({ type: 'success', text: `Invitation sent to ${email}!` });
      setIsInviteModalOpen(false);
      setEmail('');
      setMessage('');
      fetchInvitations();
    } catch (err) {
      setToast({ type: 'error', text: err.message || 'Failed to send invitation.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleRevokeInvitation = async (invitationId, invEmail) => {
    const isConfirmed = await confirm({
      title: "Revoke Invitation",
      message: `Are you sure you want to revoke the invitation link for ${invEmail}? Once revoked, the recipient will not be able to use this join link.`,
      confirmText: "Revoke Link",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!isConfirmed) return;

    try {
      await adminService.revokeInvitation(invitationId);
      setInvitations((prev) => prev.filter((inv) => (inv.id || inv._id) !== invitationId));
      setToast({ type: 'success', text: `Invitation for ${invEmail} has been revoked.` });
    } catch (err) {
      setToast({ type: 'error', text: err.message || 'Failed to revoke invitation.' });
    } finally {
      setTimeout(() => setToast(null), 4000);
    }
  };

  const hasActiveFilters = search.trim() || statusFilter !== 'All statuses' || roleFilter !== 'All roles';

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium border ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#6542F5]">Grow your team</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Workspace Invitations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Invite colleagues to join this workspace, track pending invitations, and revoke unaccepted invites.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchInvitations}
            disabled={isLoading}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin text-[#6542F5]' : 'text-slate-500'}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-xl bg-[#6542F5] px-4 text-sm font-semibold text-white transition hover:bg-[#5635E0] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
          >
            <UserPlus aria-hidden="true" className="size-4" />
            Invite member
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <section aria-label="Invitation summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ icon: Icon, label, value, tone }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-[#E6E7EC] bg-white p-4 shadow-sm shadow-slate-200/30"
          >
            <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${tone}`}>
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="text-2xl font-bold text-slate-900">{isLoading ? '—' : value}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Directory Table */}
      <section className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
        <div className="border-b border-[#E6E7EC] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Invitation Log</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isLoading
                  ? 'Loading invitations…'
                  : `Showing ${filteredInvitations.length} of ${invitations.length} invitations`}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(12rem,1fr)_minmax(9rem,auto)_minmax(9rem,auto)_auto]">
              <label className="relative block">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search email or role"
                  className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="All statuses">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="All roles">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r.toUpperCase()}</option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('All statuses');
                    setRoleFilter('All roles');
                  }}
                  className="inline-flex h-10 items-center justify-center gap-1 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#6542F5]"
                >
                  <X className="size-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : filteredInvitations.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Invited User</th>
                  <th scope="col" className="px-6 py-3.5">Assigned Role</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5">Date Invited</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvitations.map((inv) => {
                  const invId = inv.id || inv._id;
                  const normalizedStatus = (inv.status || 'Pending').toLowerCase();
                  const isPending = normalizedStatus === 'pending';

                  return (
                    <tr key={invId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-700 font-bold text-xs">
                            {getInitials(inv.email)}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">{inv.email}</div>
                            {inv.name && inv.name !== inv.email && (
                              <div className="text-xs text-slate-500">{inv.name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
                          {inv.role || 'member'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                            statusStyles[inv.status] || 'bg-slate-100 text-slate-700 ring-slate-500/10'
                          }`}
                        >
                          {inv.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(inv.invitedAt || inv.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleRevokeInvitation(invId, inv.email)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                            title="Revoke invitation"
                          >
                            <Trash2 className="size-3.5" />
                            Revoke
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-16 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
              <Mail aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-4 font-semibold text-slate-900">
              {invitations.length ? 'No invitations match these filters' : 'No invitations found'}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {invitations.length
                ? 'Try adjusting your search query or status filter.'
                : 'Send invitations to add teammates to this workspace.'}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('All statuses');
                  setRoleFilter('All roles');
                }}
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
                Send First Invitation
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Workspace Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="member">Member</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Invitation Message (Optional)
                </label>
                <textarea
                  rows="2"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hey, join our workspace on WorkSync!"
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
                  disabled={submitting}
                  className="rounded-xl bg-[#6542F5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5635E0] disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationsPage;
