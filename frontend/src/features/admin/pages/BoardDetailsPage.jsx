import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  ListFilter,
  Search,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import adminService from '../adminService';

const statusStyles = {
  'In progress': 'bg-violet-50 text-violet-700 ring-violet-600/10',
  Planning: 'bg-sky-50 text-sky-700 ring-sky-600/10',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
};

const taskStatusStyles = {
  'To do': 'bg-slate-100 text-slate-600',
  'In progress': 'bg-violet-50 text-violet-700',
  Done: 'bg-emerald-50 text-emerald-700',
};

const priorityStyles = {
  High: 'bg-rose-50 text-rose-700',
  Medium: 'bg-orange-50 text-orange-700',
  Low: 'bg-slate-100 text-slate-600',
};

const formatDate = (value) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`));

const BoardDetailsPage = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  useEffect(() => {
    setIsLoading(true);
    setError('');
    try {
      setBoard(adminService.getBoardById(boardId));
    } catch (loadError) {
      setBoard(null);
      setError(loadError instanceof Error ? loadError.message : 'This board could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  const doneCount = board?.tasks.filter((task) => task.status === 'Done').length ?? 0;
  const progress = board?.tasks.length ? Math.round((doneCount / board.tasks.length) * 100) : 0;
  const visibleTasks = useMemo(() => {
    if (!board) return [];
    const query = search.trim().toLocaleLowerCase();

    return board.tasks
      .filter((task) => (
        (!query || `${task.title} ${task.assignee.name}`.toLocaleLowerCase().includes(query)) &&
        (statusFilter === 'all' || task.status === statusFilter) &&
        (priorityFilter === 'all' || task.priority === priorityFilter)
      ))
      .sort((first, second) => (
        sortBy === 'title'
          ? first.title.localeCompare(second.title)
          : first.dueDate.localeCompare(second.dueDate)
      ));
  }, [board, priorityFilter, search, sortBy, statusFilter]);

  if (isLoading) {
    return (
      <div role="status" className="space-y-4">
        <span className="sr-only">Loading board</span>
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-36 animate-pulse rounded-2xl bg-white" />
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (error || !board) {
    return (
      <section className="rounded-2xl border border-[#E6E7EC] bg-white px-6 py-14 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertCircle aria-hidden="true" className="size-5" />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">{error ? 'Board unavailable' : 'Board not found'}</h1>
        <p role={error ? 'alert' : undefined} className="mt-2 text-sm text-slate-500">
          {error || 'This board may have been removed or the link may be incorrect.'}
        </p>
        <Link to="/admin/boards" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6542F5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5635E0]">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to boards
        </Link>
      </section>
    );
  }

  const boardStatusTone = statusStyles[board.status] ?? statusStyles.Planning;

  return (
    <div className="space-y-6">
      <Link to="/admin/boards" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#6542F5]">
        <ArrowLeft aria-hidden="true" className="size-4" />
        All boards
      </Link>

      <section className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{board.title}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${boardStatusTone}`}>
                {board.status}
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{board.description}</p>
            <p className="mt-3 text-xs text-slate-500">{board.workspace} workspace · Owned by {board.owner.name}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-[#F8F9FC] px-4 py-3">
            <div className="min-w-28">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-slate-600">Board progress</span>
                <span className="font-semibold text-slate-900">{progress}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Board task completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
              >
                <div className="h-full rounded-full bg-[#6542F5] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{doneCount} of {board.tasks.length} tasks complete</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-[#EEF0F4] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Board members</p>
            <div className="mt-2 flex items-center">
              <MemberAvatars members={board.members} />
              <span className="ml-3 text-sm text-slate-600">{board.members.length} collaborators</span>
            </div>
          </div>
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Clock3 aria-hidden="true" className="size-4" />
            Updated {formatDate(board.updatedAt.slice(0, 10))}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Task summary">
        <TaskSummary label="To do" count={board.tasks.filter((task) => task.status === 'To do').length} tone="bg-slate-100 text-slate-700" />
        <TaskSummary label="In progress" count={board.tasks.filter((task) => task.status === 'In progress').length} tone="bg-violet-50 text-violet-700" />
        <TaskSummary label="Done" count={doneCount} tone="bg-emerald-50 text-emerald-700" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
        <div className="flex flex-col gap-4 border-b border-[#E6E7EC] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Board tasks</h2>
            <p className="mt-1 text-sm text-slate-500">{visibleTasks.length} of {board.tasks.length} tasks</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:flex">
            <label className="relative block">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks"
                aria-label="Search board tasks"
                className="h-10 w-full rounded-xl border border-[#E6E7EC] pl-9 pr-3 text-sm outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15 lg:w-52"
              />
            </label>
            <label className="relative">
              <ListFilter aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <select
                aria-label="Filter tasks by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-[#E6E7EC] bg-white pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="all">All statuses</option>
                <option value="To do">To do</option>
                <option value="In progress">In progress</option>
                <option value="Done">Done</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Filter tasks by priority</span>
              <select
                aria-label="Filter tasks by priority"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="all">All priorities</option>
                <option value="High">High priority</option>
                <option value="Medium">Medium priority</option>
                <option value="Low">Low priority</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Sort tasks</span>
              <select
                aria-label="Sort tasks"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="dueDate">Sort by due date</option>
                <option value="title">Sort by title</option>
              </select>
            </label>
          </div>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
              <Search aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No tasks match these filters</h3>
            <p className="mt-1 text-sm text-slate-500">Change your search or select a different status or priority.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#EEF0F4]">
            {visibleTasks.map((task) => <TaskRow key={task.id} task={task} />)}
          </ul>
        )}
      </section>
      <p className="text-xs text-slate-400">Sample board data for interface preview.</p>
    </div>
  );
};

const MemberAvatars = ({ members }) => (
  <div className="flex -space-x-2">
    {members.map((member) => (
      <span
        key={member.id}
        title={member.name}
        aria-label={member.name}
        className={`grid size-8 place-items-center rounded-full border-2 border-white text-[10px] font-bold ${member.color}`}
      >
        {member.initials}
      </span>
    ))}
  </div>
);

const TaskSummary = ({ label, count, tone }) => (
  <div className="flex items-center justify-between rounded-2xl border border-[#E6E7EC] bg-white p-4">
    <span className="text-sm font-medium text-slate-600">{label}</span>
    <span className={`grid min-w-9 place-items-center rounded-lg px-2.5 py-1 text-sm font-semibold ${tone}`}>{count}</span>
  </div>
);

const TaskRow = ({ task }) => {
  const isDone = task.status === 'Done';

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        {isDone
          ? <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          : <Circle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-slate-300" />}
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${isDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{task.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${taskStatusStyles[task.status] ?? taskStatusStyles['To do']}`}>
              {task.status}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority] ?? priorityStyles.Low}`}>
              {task.priority}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 pl-8 sm:justify-end sm:pl-0">
        <span className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`grid size-7 place-items-center rounded-full text-[10px] font-bold ${task.assignee.color}`}>{task.assignee.initials}</span>
          <span className="max-w-28 truncate">{task.assignee.name}</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          Due {formatDate(task.dueDate)}
        </span>
      </div>
    </li>
  );
};

export default BoardDetailsPage;
