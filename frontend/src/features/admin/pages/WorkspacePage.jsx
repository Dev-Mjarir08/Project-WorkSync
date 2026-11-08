import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CircleHelp,
  FolderKanban,
  ListTodo,
  Send,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../adminService';
import { mockInvitations } from '../adminInvitationData';

const boardStatusStyles = {
  'In progress': 'bg-violet-50 text-violet-700 ring-violet-600/10',
  Planning: 'bg-sky-50 text-sky-700 ring-sky-600/10',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
};

const WorkspacePage = () => {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setBoards(adminService.getBoards());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Workspace data could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const workspaces = useMemo(() => {
    const groups = new Map();

    boards.forEach((board) => {
      const name = board.workspace?.trim();
      if (!name) return;

      const workspace = groups.get(name) ?? { name, boards: [], members: new Map() };
      workspace.boards.push(board);
      [board.owner, ...board.members].filter(Boolean).forEach((member) => {
        workspace.members.set(member.id, member);
      });
      groups.set(name, workspace);
    });

    return [...groups.values()]
      .map((workspace) => ({
        ...workspace,
        members: [...workspace.members.values()].sort((first, second) =>
          first.name.localeCompare(second.name)
        ),
      }))
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [boards]);

  const totalTasks = boards.reduce((total, board) => total + board.tasks.length, 0);
  const totalBoardListedPeople = new Set(
    workspaces.flatMap((workspace) => workspace.members.map((member) => member.id))
  ).size;
  const samplePendingInvitations = mockInvitations.filter(
    (invitation) => invitation.status === 'Pending'
  ).length;

  const stats = [
    {
      label: 'Workspace labels',
      value: isLoading ? '—' : workspaces.length,
      detail: 'Found on board records',
      icon: BriefcaseBusiness,
      tone: 'bg-[#F1EEFF] text-[#6542F5]',
    },
    {
      label: 'Boards',
      value: isLoading ? '—' : boards.length,
      detail: 'Across listed workspaces',
      icon: FolderKanban,
      tone: 'bg-[#EAF2FF] text-[#3971C6]',
    },
    {
      label: 'Tasks',
      value: isLoading ? '—' : totalTasks,
      detail: 'Across available boards',
      icon: ListTodo,
      tone: 'bg-[#E2F5F3] text-[#278A8F]',
    },
    {
      label: 'People on boards',
      value: isLoading ? '—' : totalBoardListedPeople,
      detail: 'Unique board-listed people',
      icon: Users,
      tone: 'bg-[#FFF3E8] text-[#B76825]',
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#6542F5]">Workspace overview</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Workspace
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage your workspace information, members, and projects.
          </p>
        </div>
        <Link
          to="/admin/boards"
          className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-xl bg-[#6542F5] px-4 text-sm font-semibold text-white transition hover:bg-[#5635E0] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
        >
          <FolderKanban aria-hidden="true" className="size-4" />
          Browse boards
        </Link>
      </header>

      {error ? (
        <section className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">Workspace information unavailable</h2>
            <p role="alert" className="mt-1">{error}</p>
          </div>
        </section>
      ) : (
        <>
          <section aria-label="Workspace statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, detail, icon: Icon, tone }) => (
              <article
                key={label}
                className="rounded-2xl border border-[#E6E7EC] bg-white p-4 shadow-sm shadow-slate-200/25"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`grid size-10 place-items-center rounded-xl ${tone}`}>
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="text-xl font-bold text-slate-900">{value}</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-800">{label}</p>
                <p className="mt-1 text-xs text-slate-500">{detail}</p>
              </article>
            ))}
          </section>

          <section
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-[#D8D1FF] bg-[#F8F6FF] p-4 sm:p-5"
          >
            <CircleHelp aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6542F5]" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Workspace management is not connected
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                The app currently stores workspace labels on boards, not as separate editable
                workspace records. People below are listed on boards; this data does not provide
                workspace roles, member emails, or workspace-level permissions.
              </p>
            </div>
          </section>

          <section aria-labelledby="workspace-list-title" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="workspace-list-title" className="text-lg font-semibold text-slate-900">
                  Workspaces in board data
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Board records grouped by their workspace label.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/admin/invitations"
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-[#D8D1FF] hover:bg-[#F8F6FF] hover:text-[#6542F5] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/30"
                >
                  <Send aria-hidden="true" className="size-4" />
                  Invitations
                </Link>
                <Link
                  to="/admin/settings"
                  className="inline-flex h-9 items-center rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-[#D8D1FF] hover:bg-[#F8F6FF] hover:text-[#6542F5] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/30"
                >
                  Settings
                </Link>
              </div>
            </div>

            {isLoading ? (
              <div role="status" className="grid gap-4 lg:grid-cols-2">
                <span className="sr-only">Loading workspace data</span>
                {[0, 1].map((item) => (
                  <div key={item} className="h-72 animate-pulse rounded-2xl bg-white" />
                ))}
              </div>
            ) : workspaces.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D7D9E1] bg-white px-6 py-14 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
                  <BriefcaseBusiness aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  No workspace labels available
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Workspace summaries will appear when boards have workspace labels.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {workspaces.map((workspace) => (
                  <WorkspaceCard key={workspace.name} workspace={workspace} />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/25 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#E2F5F3] text-[#278A8F]">
                  <Send aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Invitation records
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    The invitation list contains sample records, not verified workspace invitations.
                    Its {samplePendingInvitations} pending entries are shown only on the Invitations page.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/invitations"
                className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-xl border border-[#E6E7EC] bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#D8D1FF] hover:bg-[#F8F6FF] hover:text-[#6542F5] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
              >
                Review invitations
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const WorkspaceCard = ({ workspace }) => {
  const taskCount = workspace.boards.reduce((total, board) => total + board.tasks.length, 0);

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/25">
      <div className="flex items-start gap-3 border-b border-[#EEF0F4] p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F1EEFF] text-[#6542F5]">
          <span className="text-sm font-bold">{workspace.name.slice(0, 1).toLocaleUpperCase()}</span>
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900">{workspace.name}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {workspace.boards.length} {workspace.boards.length === 1 ? 'board' : 'boards'} · {taskCount} tasks
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#E2F5F3] px-2.5 py-1 text-xs font-medium text-[#247A7F]">
          <Users aria-hidden="true" className="size-3.5" />
          {workspace.members.length}
        </span>
      </div>

      <div className="p-5">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Boards and projects
          </h4>
          <ul className="mt-3 divide-y divide-[#EEF0F4]">
            {workspace.boards.map((board) => {
              const completedTasks = board.tasks.filter((task) => task.status === 'Done').length;
              const progress = board.tasks.length
                ? Math.round((completedTasks / board.tasks.length) * 100)
                : 0;

              return (
                <li key={board.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/admin/boards/${board.id}`}
                        className="inline-flex max-w-full items-center gap-1.5 text-sm font-semibold text-slate-800 transition hover:text-[#6542F5]"
                      >
                        <span className="truncate">{board.title}</span>
                        <ArrowRight aria-hidden="true" className="size-3.5 shrink-0" />
                      </Link>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {board.description}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${boardStatusStyles[board.status] ?? 'bg-slate-100 text-slate-600 ring-slate-500/10'}`}>
                      {board.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="truncate">Board owner: {board.owner.name}</span>
                    <span className="shrink-0">{board.tasks.length} tasks</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#6542F5]"
                      role="progressbar"
                      aria-label={`${board.title} task completion`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[11px] text-slate-400">
                    {completedTasks} of {board.tasks.length} complete
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-5 border-t border-[#EEF0F4] pt-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              People listed on boards
            </h4>
            <span className="text-xs text-slate-400">{workspace.members.length} people</span>
          </div>
          {workspace.members.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {workspace.members.map((member) => (
                <li
                  key={member.id}
                  title={`${member.name} — listed on a board`}
                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#EEF0F4] bg-white py-1 pl-1 pr-3"
                >
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${member.color}`}>
                    {member.initials}
                  </span>
                  <span className="max-w-36 truncate text-xs font-medium text-slate-700">
                    {member.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No people are listed on these boards.</p>
          )}
        </div>
      </div>
    </article>
  );
};

export default WorkspacePage;
