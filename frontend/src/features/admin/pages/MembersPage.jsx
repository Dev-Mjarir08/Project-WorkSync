import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Search,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../adminService';
import { mockInvitations } from '../adminInvitationData';

const getInitials = (name) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase();

const MembersPage = () => {
  const [boards, setBoards] = useState([]);
  const [search, setSearch] = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setBoards(adminService.getBoards());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Members could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const members = useMemo(() => {
    const membersById = new Map();

    boards.forEach((board) => {
      [board.owner, ...board.members].forEach((member) => {
        const existingMember = membersById.get(member.id) ?? {
          ...member,
          boards: [],
          workspaces: [],
        };

        if (!existingMember.boards.some((assignedBoard) => assignedBoard.id === board.id)) {
          existingMember.boards.push(board);
        }
        if (!existingMember.workspaces.includes(board.workspace)) {
          existingMember.workspaces.push(board.workspace);
        }
        membersById.set(member.id, existingMember);
      });
    });

    return [...membersById.values()].sort((first, second) =>
      first.name.localeCompare(second.name)
    );
  }, [boards]);

  const workspaces = useMemo(
    () => [...new Set(members.flatMap((member) => member.workspaces))].sort(),
    [members],
  );

  const visibleMembers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return members.filter((member) => (
      (!query || member.name.toLocaleLowerCase().includes(query)) &&
      (workspaceFilter === 'all' || member.workspaces.includes(workspaceFilter))
    ));
  }, [members, search, workspaceFilter]);

  const pendingInvitations = mockInvitations.filter(
    (invitation) => invitation.status === 'Pending',
  ).length;
  const hasFilters = Boolean(search.trim()) || workspaceFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setWorkspaceFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#6542F5]">Workspace access</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Members</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage workspace members, roles, and access.
          </p>
        </div>
        <Link
          to="/admin/invitations"
          className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-xl bg-[#6542F5] px-4 text-sm font-semibold text-white transition hover:bg-[#5635E0] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
        >
          <Users aria-hidden="true" className="size-4" />
          Invite member
        </Link>
      </div>

      {error ? (
        <section className="rounded-2xl border border-rose-200 bg-white px-6 py-10 text-center">
          <h2 className="font-semibold text-slate-900">Members unavailable</h2>
          <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>
        </section>
      ) : (
        <>
          <section aria-label="Member statistics" className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Total members"
              value={isLoading ? '—' : members.length}
              icon={Users}
              tone="bg-[#F1EEFF] text-[#6542F5]"
              description="Unique people listed on workspace boards"
            />
            <StatCard
              label="Pending invitations"
              value={pendingInvitations}
              icon={BriefcaseBusiness}
              tone="bg-[#E2F5F3] text-[#278A8F]"
              description="Invitations tracked separately from member records"
            />
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
            <div className="border-b border-[#E6E7EC] p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Workspace members</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {isLoading
                      ? 'Loading member records…'
                      : `Showing ${visibleMembers.length} of ${members.length} members`}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(12rem,1fr)_minmax(10rem,auto)_auto]">
                  <label className="relative block">
                    <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name"
                      aria-label="Search members by name"
                      className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                    />
                  </label>

                  <label className="sr-only" htmlFor="member-workspace-filter">Filter by workspace</label>
                  <select
                    id="member-workspace-filter"
                    value={workspaceFilter}
                    onChange={(event) => setWorkspaceFilter(event.target.value)}
                    className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                  >
                    <option value="all">All workspaces</option>
                    {workspaces.map((workspace) => (
                      <option key={workspace} value={workspace}>{workspace}</option>
                    ))}
                  </select>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-[#6542F5] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/30"
                    >
                      <X aria-hidden="true" className="size-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div role="status" className="space-y-3 p-5">
                <span className="sr-only">Loading members</span>
                {[1, 2, 3].map((row) => (
                  <div key={row} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : visibleMembers.length ? (
              <ul className="grid gap-3 p-4 sm:p-5 lg:grid-cols-2">
                {visibleMembers.map((member) => (
                  <li
                    key={member.id}
                    className="min-w-0 rounded-2xl border border-[#EEF0F4] bg-white p-4 transition hover:border-[#DCD5FF] hover:shadow-sm"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${member.color ?? 'bg-[#F1EEFF] text-[#6542F5]'}`}>
                        {member.initials || getInitials(member.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-semibold text-slate-900">{member.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {member.boards.length} {member.boards.length === 1 ? 'board' : 'boards'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#EEF0F4] pt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Workspaces</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {member.workspaces.map((workspace) => (
                          <span
                            key={workspace}
                            className="rounded-full bg-[#F8F9FC] px-2.5 py-1 text-xs font-medium text-slate-600"
                          >
                            {workspace}
                          </span>
                        ))}
                      </div>
                    </div>

                    {member.boards.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                        {member.boards.map((board) => (
                          <Link
                            key={board.id}
                            to={`/admin/boards/${board.id}`}
                            className="inline-flex min-w-0 items-center gap-1 text-xs font-medium text-[#6542F5] transition hover:text-[#5635E0]"
                          >
                            <span className="truncate">{board.title}</span>
                            <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-12 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
                  <Users aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">
                  {members.length ? 'No members match these filters' : 'No members available'}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {members.length
                    ? 'Try another name or workspace, or clear your filters.'
                    : 'Members appear here when they are assigned to a workspace board.'}
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-[#6542F5] transition hover:bg-[#F1EEFF]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </section>

          <p className="text-xs leading-5 text-slate-500">
            The current member records do not include email addresses, roles, membership status, or join dates.
            Member editing, role changes, and removal are not available in the existing service.
          </p>
        </>
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
