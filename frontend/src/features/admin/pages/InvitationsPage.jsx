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
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  Accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  Expired: 'bg-slate-100 text-slate-600 ring-slate-500/10',
};

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const formatDate = (date) => (
  date ? dateFormatter.format(new Date(`${date}T12:00:00`)) : 'Not available'
);

const getInitials = (name) => (
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase()
);

const InvitationsPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [dateSort, setDateSort] = useState('newest');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');
  const [hasAttemptedSubmission, setHasAttemptedSubmission] = useState(false);
  const openButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const wasModalOpen = useRef(false);

  const statuses = useMemo(
    () => [...new Set(mockInvitations.map((invitation) => invitation.status))],
    [],
  );
  const roles = useMemo(
    () => [...new Set(mockInvitations.map((invitation) => invitation.role))],
    [],
  );

  useEffect(() => {
    if (!isInviteModalOpen) {
      if (wasModalOpen.current) openButtonRef.current?.focus();
      wasModalOpen.current = false;
      return undefined;
    }

    wasModalOpen.current = true;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsInviteModalOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isInviteModalOpen]);

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return mockInvitations
      .filter((invitation) => {
        const matchesSearch = !query
          || `${invitation.name} ${invitation.email} ${invitation.role} ${invitation.workspace}`
            .toLocaleLowerCase()
            .includes(query);
        const matchesStatus = statusFilter === 'All statuses'
          || invitation.status === statusFilter;
        const matchesRole = roleFilter === 'All roles'
          || invitation.role === roleFilter;

        return matchesSearch && matchesStatus && matchesRole;
      })
      .sort((first, second) => {
        const dateDifference = new Date(first.invitedAt) - new Date(second.invitedAt);
        return dateSort === 'newest' ? -dateDifference : dateDifference;
      });
  }, [dateSort, roleFilter, search, statusFilter]);

  const summaryCards = [
    {
      icon: Users,
      label: 'Total invitations',
      value: mockInvitations.length,
      tone: 'bg-[#EAF2FF] text-[#3971C6]',
    },
    {
      icon: Clock3,
      label: 'Pending',
      value: mockInvitations.filter((invitation) => invitation.status === 'Pending').length,
      tone: 'bg-[#F1EEFF] text-[#6542F5]',
    },
    {
      icon: CheckCircle2,
      label: 'Accepted',
      value: mockInvitations.filter((invitation) => invitation.status === 'Accepted').length,
      tone: 'bg-[#E2F5F3] text-[#278A8F]',
    },
    {
      icon: Mail,
      label: 'Expired',
      value: mockInvitations.filter((invitation) => invitation.status === 'Expired').length,
      tone: 'bg-[#FDEBE3] text-[#C76A3F]',
    },
  ];

  const resetInviteForm = () => {
    setEmail('');
    setRole(roles[0] ?? '');
    setValidationErrors({});
    setSubmissionError('');
    setHasAttemptedSubmission(false);
  };

  const openInviteModal = () => {
    resetInviteForm();
    setIsInviteModalOpen(true);
  };

  const closeInviteModal = () => setIsInviteModalOpen(false);

  const handleInviteSubmit = (event) => {
    event.preventDefault();
    if (hasAttemptedSubmission) return;

    const nextErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = 'Enter an email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!role) nextErrors.role = 'Select a role.';

    setValidationErrors(nextErrors);
    setSubmissionError('');
    if (Object.keys(nextErrors).length > 0) return;

    setHasAttemptedSubmission(true);
    setSubmissionError(
      'Invitation sending is unavailable. No invitation was sent or saved because this project has no connected invitation service.',
    );
  };

  const hasActiveFilters = search.trim() || statusFilter !== 'All statuses' || roleFilter !== 'All roles';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#6542F5]">Grow your team</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Team Invitations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review invitation activity and manage access for your workspace.
          </p>
        </div>
        <button
          ref={openButtonRef}
          type="button"
          onClick={openInviteModal}
          className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-xl bg-[#6542F5] px-4 text-sm font-semibold text-white transition hover:bg-[#5635E0] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
        >
          <UserPlus aria-hidden="true" className="size-4" />
          Invite member
        </button>
      </header>

      <section aria-label="Invitation summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ icon: Icon, label, value, tone }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-[#E6E7EC] bg-white p-4 shadow-sm shadow-slate-200/30"
          >
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
        <div className="space-y-4 border-b border-[#EEF0F4] p-4 sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Invitation list</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search, filter, and sort the invitation sample.
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-[#F1EEFF] px-2.5 py-1 text-xs font-semibold text-[#6542F5]">
              Sample data
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(145px,0.55fr))]">
            <label className="relative block min-w-0">
              <span className="sr-only">Search invitations</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email"
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              />
            </label>

            <label className="block min-w-0">
              <span className="sr-only">Filter by status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option>All statuses</option>
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>

            <label className="block min-w-0">
              <span className="sr-only">Filter by role</span>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option>All roles</option>
                {roles.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <label className="block min-w-0">
              <span className="sr-only">Sort by invitation date</span>
              <select
                value={dateSort}
                onChange={(event) => setDateSort(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>
        </div>

        {filteredInvitations.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
              <Users aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              {hasActiveFilters ? 'No matching invitations' : 'No invitations yet'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {hasActiveFilters
                ? 'Try changing your search or filters.'
                : 'Invitations will appear here when invitation records are available.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-4 md:hidden">
              {filteredInvitations.map((invitation) => (
                <article
                  key={invitation.id}
                  className="rounded-xl border border-[#EEF0F4] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#EAF2FF] text-xs font-bold text-[#3971C6]">
                        {getInitials(invitation.name)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-800">
                          {invitation.name}
                        </h3>
                        <p className="break-all text-xs text-slate-500">{invitation.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={invitation.status} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-[#EEF0F4] pt-3">
                    <InvitationDetail label="Role" value={invitation.role} />
                    <InvitationDetail label="Workspace" value={invitation.workspace} />
                    <InvitationDetail label="Invited" value={formatDate(invitation.invitedAt)} />
                    <InvitationDetail label="Expires" value={formatDate(invitation.expiresAt)} />
                  </dl>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] border-collapse text-left">
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
                            {getInitials(invitation.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {invitation.name}
                            </p>
                            <p className="truncate text-xs font-normal text-slate-500">
                              {invitation.email}
                            </p>
                          </div>
                        </div>
                      </th>
                      <td className="px-4 py-4 text-sm text-slate-600">{invitation.role}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{invitation.workspace}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                        {formatDate(invitation.invitedAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                        {formatDate(invitation.expiresAt)}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={invitation.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="border-t border-[#EEF0F4] px-5 py-3 text-xs text-slate-500" aria-live="polite">
          Showing {filteredInvitations.length} of {mockInvitations.length} sample invitations
        </div>
      </section>

      <p className="text-xs leading-5 text-slate-500">
        These illustrative records are not connected to a live invitation service. No real
        invitation data is loaded or changed on this page.
      </p>

      {isInviteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeInviteModal();
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-member-title"
            aria-describedby="invite-member-description"
            className="my-auto w-full max-w-lg rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="grid size-11 place-items-center rounded-xl bg-[#F1EEFF] text-[#6542F5]">
                  <UserPlus aria-hidden="true" className="size-5" />
                </span>
                <h2 id="invite-member-title" className="mt-4 text-lg font-semibold text-slate-900">
                  Invite a team member
                </h2>
                <p id="invite-member-description" className="mt-1 text-sm leading-6 text-slate-600">
                  Enter invitation details. This form cannot submit an invitation until a service is connected.
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeInviteModal}
                aria-label="Close invite member dialog"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            <form className="mt-5 space-y-4" noValidate onSubmit={handleInviteSubmit}>
              <div>
                <label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address <span className="text-rose-600" aria-hidden="true">*</span>
                </label>
                <input
                  id="invite-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setValidationErrors((errors) => ({ ...errors, email: '' }));
                    setSubmissionError('');
                    setHasAttemptedSubmission(false);
                  }}
                  aria-invalid={Boolean(validationErrors.email)}
                  aria-describedby={validationErrors.email ? 'invite-email-error' : undefined}
                  className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#6542F5]/15 ${
                    validationErrors.email
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-[#E6E7EC] focus:border-[#6542F5]'
                  }`}
                  placeholder="name@example.com"
                />
                {validationErrors.email && (
                  <p id="invite-email-error" className="mt-1.5 text-xs text-rose-600" role="alert">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="invite-role" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Role <span className="text-rose-600" aria-hidden="true">*</span>
                </label>
                <select
                  id="invite-role"
                  required
                  value={role}
                  onChange={(event) => {
                    setRole(event.target.value);
                    setValidationErrors((errors) => ({ ...errors, role: '' }));
                    setSubmissionError('');
                    setHasAttemptedSubmission(false);
                  }}
                  aria-invalid={Boolean(validationErrors.role)}
                  aria-describedby={validationErrors.role ? 'invite-role-error' : 'invite-role-note'}
                  className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-[#6542F5]/15 ${
                    validationErrors.role
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-[#E6E7EC] focus:border-[#6542F5]'
                  }`}
                >
                  {roles.length === 0 && <option value="">No sample roles available</option>}
                  {roles.map((item) => <option key={item}>{item}</option>)}
                </select>
                {validationErrors.role ? (
                  <p id="invite-role-error" className="mt-1.5 text-xs text-rose-600" role="alert">
                    {validationErrors.role}
                  </p>
                ) : (
                  <p id="invite-role-note" className="mt-1.5 text-xs text-slate-500">
                    Choices come from sample records; they are not a connected role catalog.
                  </p>
                )}
              </div>

              {submissionError && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-800" role="alert">
                  {submissionError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-[#EEF0F4] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="h-10 rounded-xl border border-[#E6E7EC] px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#6542F5]/30"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={hasAttemptedSubmission || roles.length === 0}
                  className="h-10 rounded-xl bg-[#6542F5] px-4 text-sm font-semibold text-white transition hover:bg-[#5635E0] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send invitation
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
      statusStyles[status] ?? statusStyles.Pending
    }`}
  >
    {status}
  </span>
);

const InvitationDetail = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="mt-0.5 truncate text-sm font-medium text-slate-700">{value}</dd>
  </div>
);

export default InvitationsPage;
