import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  FolderKanban,
  ListTodo,
  Search,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../adminService';

const statusStyles = {
  'In progress': 'bg-violet-50 text-violet-700 ring-violet-600/10',
  Planning: 'bg-sky-50 text-sky-700 ring-sky-600/10',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
};

const BoardsPage = () => {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workspaceFilter, setWorkspaceFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');

  useEffect(() => {
    try {
      setBoards(adminService.getBoards());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Boards could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const workspaces = useMemo(
    () => [...new Set(boards.map((board) => board.workspace))].sort(),
    [boards]
  );
  const owners = useMemo(
    () => [...new Map(boards.map((board) => [board.owner.id, board.owner])).values()]
      .sort((first, second) => first.name.localeCompare(second.name)),
    [boards]
  );
  const visibleBoards = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return boards.filter((board) => {
      const matchesQuery = !query || `${board.title} ${board.description} ${board.workspace} ${board.owner.name}`
        .toLocaleLowerCase()
        .includes(query);
      return (
        matchesQuery &&
        (statusFilter === 'all' || board.status === statusFilter) &&
        (workspaceFilter === 'all' || board.workspace === workspaceFilter) &&
        (ownerFilter === 'all' || board.owner.id === ownerFilter)
      );
    });
  }, [boards, ownerFilter, search, statusFilter, workspaceFilter]);

  const inProgressCount = boards.filter((board) => board.status === 'In progress').length;
  const totalTasks = boards.reduce((total, board) => total + board.tasks.length, 0);
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setWorkspaceFilter('all');
    setOwnerFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#6542F5]">Plan and track together</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Boards</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Browse your team’s workspaces and open a board to see its tasks and progress.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#E6E7EC] bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600">
          <FolderKanban aria-hidden="true" className="size-4 text-[#6542F5]" />
          {boards.length} boards
        </span>
      </div>

      <section aria-label="Board summary" className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={FolderKanban} label="Total boards" value={boards.length} tone="bg-[#F1EEFF] text-[#6542F5]" />
        <SummaryCard icon={Users} label="In progress" value={inProgressCount} tone="bg-[#E2F5F3] text-[#278A8F]" />
        <SummaryCard icon={ListTodo} label="Tracked tasks" value={totalTasks} tone="bg-[#EAF2FF] text-[#3971C6]" />
      </section>

      <section className="rounded-2xl border border-[#E6E7EC] bg-white p-4 shadow-sm shadow-slate-200/30 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Your boards</h2>
            <p className="mt-1 text-sm text-slate-500">Search by title or description, or narrow by status, workspace, and owner.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:flex">
            <label className="relative block sm:col-span-2 lg:col-span-1">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search boards"
                aria-label="Search boards"
                className="h-10 w-full rounded-xl border border-[#E6E7EC] pl-9 pr-3 text-sm outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15 lg:w-56"
              />
            </label>
            <label>
              <span className="sr-only">Filter boards by status</span>
              <select
                aria-label="Filter boards by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="all">All statuses</option>
                <option value="In progress">In progress</option>
                <option value="Planning">Planning</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Filter boards by workspace</span>
              <select
                aria-label="Filter boards by workspace"
                value={workspaceFilter}
                onChange={(event) => setWorkspaceFilter(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="all">All workspaces</option>
                {workspaces.map((workspace) => <option key={workspace} value={workspace}>{workspace}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Filter boards by owner</span>
              <select
                aria-label="Filter boards by owner"
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="all">All owners</option>
                {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EEF0F4] pt-3">
          <p className="text-xs text-slate-500" aria-live="polite">
            Showing {visibleBoards.length} of {boards.length} boards
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md px-2 py-1 text-xs font-semibold text-[#6542F5] hover:bg-[#F5F2FF] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40"
          >
            Clear filters
          </button>
        </div>
      </section>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div><p className="font-semibold">Boards unavailable</p><p className="mt-1">{error}</p></div>
        </div>
      ) : isLoading ? (
        <div role="status" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <span className="sr-only">Loading boards</span>
          {[0, 1, 2].map((item) => <div key={item} className="h-60 animate-pulse rounded-2xl bg-white" />)}
        </div>
      ) : visibleBoards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D7D9E1] bg-white px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
            <FolderKanban aria-hidden="true" className="size-5" />
          </span>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No boards match these filters</h3>
          <p className="mt-1 text-sm text-slate-500">Try another search or clear the selected filters.</p>
          <button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-[#6542F5] hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleBoards.map((board) => <BoardCard key={board.id} board={board} />)}
        </div>
      )}
      <p className="text-xs text-slate-400">Sample board data for interface preview.</p>
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

const BoardCard = ({ board }) => {
  const completedTasks = board.tasks.filter((task) => task.status === 'Done').length;
  const progress = board.tasks.length ? Math.round((completedTasks / board.tasks.length) * 100) : 0;
  const statusTone = statusStyles[board.status] ?? statusStyles.Planning;

  return (
    <article className="flex min-h-64 flex-col rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/30 transition hover:-translate-y-0.5 hover:border-[#D3CCFF] hover:shadow-md hover:shadow-slate-200/50">
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F1EEFF] text-[#6542F5]">
          <FolderKanban aria-hidden="true" className="size-5" />
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusTone}`}>
          {board.status}
        </span>
      </div>
      <div className="mt-4">
        <Link to={`/admin/boards/${board.id}`} className="group inline-flex items-center gap-1.5 text-base font-semibold text-slate-900 hover:text-[#6542F5]">
          <span>{board.title}</span>
          <ArrowRight aria-hidden="true" className="size-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
        </Link>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{board.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span className="truncate rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium text-slate-600">{board.workspace}</span>
        <span className="truncate">Owner: {board.owner.name}</span>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">Progress</span>
          <span className="text-slate-500">{completedTasks}/{board.tasks.length} tasks · {progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`${board.title} task completion`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
        >
          <div className="h-full rounded-full bg-[#6542F5]" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-[#EEF0F4] pt-4">
        <div className="flex -space-x-2" aria-label={`${board.members.length} board members`}>
          {board.members.slice(0, 4).map((member) => (
            <span
              key={member.id}
              title={member.name}
              aria-label={member.name}
              className={`grid size-7 place-items-center rounded-full border-2 border-white text-[9px] font-bold ${member.color}`}
            >
              {member.initials}
            </span>
          ))}
          {board.members.length > 4 && (
            <span className="grid size-7 place-items-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-semibold text-slate-600">
              +{board.members.length - 4}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <ListTodo aria-hidden="true" className="size-3.5" />
          {board.tasks.length} tasks
        </span>
      </div>
    </article>
  );
};

export default BoardsPage;
