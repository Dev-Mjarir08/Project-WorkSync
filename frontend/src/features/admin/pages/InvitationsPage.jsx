import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Mail,
  Search,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { mockInvitations } from '../adminInvitationData';

const statusStyles = {
  Pending: 'bg-orange-50 text-orange-700',
  Accepted: 'bg-emerald-50 text-emerald-700',
  Expired: 'bg-slate-100 text-slate-600',
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(`${date}T12:00:00`));

const InvitationsPage = () => {
  const [search, setSearch] = useState('');
  const [isInviteNoticeOpen, setIsInviteNoticeOpen] = useState(false);
  const openButtonRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isInviteNoticeOpen) return undefined;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsInviteNoticeOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isInviteNoticeOpen]);

  useEffect(() => {
    if (!isInviteNoticeOpen) openButtonRef.current?.focus();
  }, [isInviteNoticeOpen]);

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return mockInvitations.filter((invitation) => (
      !query ||
      `${invitation.name} ${invitation.email} ${invitation.role} ${invitation.workspace} ${invitation.status}`
        .toLocaleLowerCase()
        .includes(query)
    ));
  }, [search]);

  const pendingCount = mockInvitations.filter((invitation) => invitation.status === 'Pending').length;
  const acceptedCount = mockInvitations.filter((invitation) => invitation.status === 'Accepted').length;
  const expiredCount = mockInvitations.filter((invitation) => invitation.status === 'Expired').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#6542F5]">Grow your team</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Invitations</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review the status of invitations shared with your team.
          </p>
        </div>
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setIsInviteNoticeOpen(true)}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-[#6542F5] px-4 text-sm font-semibold text-white transition hover:bg-[#5635E0] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
        >
          <UserPlus aria-hidden="true" className="size-4" />
          Invite member
        </button>
      </div>

      <section aria-label="Invitation summary" className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={Clock3} label="Pending" value={pendingCount} tone="bg-[#FDEBE3] text-[#C76A3F]" />
        <SummaryCard icon={CheckCircle2} label="Accepted" value={acceptedCount} tone="bg-[#E2F5F3] text-[#278A8F]" />
        <SummaryCard icon={Mail} label="Expired" value={expiredCount} tone="bg-[#F1EEFF] text-[#6542F5]" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
        <div className="flex flex-col gap-4 border-b border-[#EEF0F4] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Team invitations</h2>
            <p className="mt-1 text-sm text-slate-500">Search by invitee, role, workspace, or status.</p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invitations"
              aria-label="Search invitations"
              className="h-10 w-full rounded-xl border border-[#E6E7EC] pl-9 pr-3 text-sm outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
            />
          </label>
        </div>

        {filteredInvitations.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
              <Users aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No invitations found</h3>
            <p className="mt-1 text-sm text-slate-500">Try another search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#FAFAFC]">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-5 py-3">Invitee</th>
                  <th scope="col" className="px-4 py-3">Role</th>
                  <th scope="col" className="px-4 py-3">Workspace</th>
                  <th scope="col" className="px-4 py-3">Invited</th>
                  <th scope="col" className="px-4 py-3">Expires</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F4]">
                {filteredInvitations.map((invitation) => (
                  <tr key={invitation.id} className="transition hover:bg-[#FCFCFE]">
                    <th scope="row" className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#EAF2FF] text-xs font-bold text-[#3971C6]">
                          {invitation.name.split(' ').map((part) => part[0]).join('')}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">{invitation.name}</p>
                          <p className="truncate text-xs font-normal text-slate-500">{invitation.email}</p>
                        </div>
                      </div>
                    </th>
                    <td className="px-4 py-4 text-sm text-slate-600">{invitation.role}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{invitation.workspace}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">{formatDate(invitation.invitedAt)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">{formatDate(invitation.expiresAt)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[invitation.status] ?? statusStyles.Pending}`}>
                        {invitation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-[#EEF0F4] px-5 py-3 text-xs text-slate-500" aria-live="polite">
          Showing {filteredInvitations.length} of {mockInvitations.length} sample invitations
        </div>
      </section>

      <p className="text-xs text-slate-400">Invitation records are illustrative sample data and are not connected to an email service.</p>

      {isInviteNoticeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsInviteNoticeOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-unavailable-title"
            className="w-full max-w-md rounded-2xl border border-[#E6E7EC] bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-[#F1EEFF] text-[#6542F5]">
                <UserPlus aria-hidden="true" className="size-5" />
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsInviteNoticeOpen(false)}
                aria-label="Close invitation notice"
                className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <h2 id="invite-unavailable-title" className="mt-4 text-lg font-semibold text-slate-900">Invitation sending is unavailable</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The invitation service and role catalog are not connected in this project yet. No email has been sent, and no invitation was created.
            </p>
            <p className="mt-3 rounded-xl bg-[#F8F9FC] p-3 text-xs leading-5 text-slate-500">
              Once invitation delivery and role definitions are available, this action can be connected without replacing the invitation list.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInviteNoticeOpen(false)}
                className="h-10 rounded-xl bg-[#6542F5] px-4 text-sm font-semibold text-white hover:bg-[#5635E0] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-[#E6E7EC] bg-white p-4 shadow-sm shadow-slate-200/30">
    <span className={`grid size-11 place-items-center rounded-xl ${tone}`}>
      <Icon aria-hidden="true" className="size-5" />
    </span>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default InvitationsPage;
