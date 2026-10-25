import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  ListTodo,
  Search,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../adminService';
import {
  dashboardStats,
  dashboardTasks,
  workloadStatus,
} from '../adminDashboardData';
import ProjectTimeline from '../components/ProjectTimeline';
import TimeTracker from '../components/TimeTracker';

const priorityStyles = {
  High: 'bg-rose-50 text-rose-700',
  Medium: 'bg-orange-50 text-orange-700',
  Low: 'bg-slate-100 text-slate-600',
};

const taskStatusStyles = {
  'To do': 'bg-slate-100 text-slate-600',
  'In progress': 'bg-violet-50 text-violet-700',
  Done: 'bg-emerald-50 text-emerald-700',
};

const statIcons = {
  total: ListTodo,
  overdue: CircleAlert,
  open: TrendingUp,
  completed: CheckCircle2,
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));

const getMemberInitials = (name) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase();

const DashboardPage = () => {
  const boards = adminService.getBoards();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  const memberById = useMemo(
    () => new Map(boards.flatMap((board) => [board.owner, ...board.members]).map((member) => [member.id, member])),
    [boards]
  );
  const teams = useMemo(
    () => [...new Set(dashboardTasks.map((task) => task.workspace))].sort(),
    []
  );
  const visibleTasks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return dashboardTasks
      .filter((task) => (
        (!query || task.title.toLocaleLowerCase().includes(query)) &&
        (statusFilter === 'all' || task.status === statusFilter) &&
        (teamFilter === 'all' || task.workspace === teamFilter)
      ))
      .sort((first, second) => {
        if (sortBy === 'title') return first.title.localeCompare(second.title);
        if (sortBy === 'priority') {
          const rank = { High: 0, Medium: 1, Low: 2 };
          return rank[first.priority] - rank[second.priority];
        }
        return first.dueDate.localeCompare(second.dueDate);
      });
  }, [search, sortBy, statusFilter, teamFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#6542F5]">Your workspace at a glance</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Keep projects moving and see how your team's work is progressing.
          </p>
        </div>
        <Link
          to="/admin/boards/new"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-[#6542F5] px-4 text-sm font-semibold text-white transition hover:bg-[#5635E0] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
        >
          <ListTodo aria-hidden="true" className="size-4" />
          Create board
        </Link>
      </div>

      <section aria-label="Task statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = statIcons[stat.id];
          return (
            <article key={stat.id} className={`rounded-2xl border border-[#E6E7EC] p-4 shadow-sm shadow-slate-200/25 sm:p-5 ${stat.tone}`}>
              <div className="flex items-start justify-between gap-3">
                <span className={`grid size-10 place-items-center rounded-xl shadow-sm ${stat.iconTone}`}>
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className={`rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold ${stat.accent}`}>
                  {stat.change}
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              <p className="mt-2 text-xs text-slate-500">{stat.description}</p>
            </article>
          );
        })}
      </section>

      <ProjectTimeline />

      <section className="grid gap-5 xl:grid-cols-2">
        <WorkloadCard />
        <TimeTracker />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
        <div className="border-b border-[#EEF0F4] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Task List</h2>
              <p className="mt-1 text-sm text-slate-500">A quick view of tasks across your workspaces.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:flex">
              <label className="relative block sm:col-span-2 xl:col-span-1">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks"
                  aria-label="Search dashboard tasks"
                  className="h-10 w-full rounded-xl border border-[#E6E7EC] pl-9 pr-3 text-sm outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15 xl:w-56"
                />
              </label>
              <label>
                <span className="sr-only">Filter tasks by status</span>
                <select
                  aria-label="Filter tasks by status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                >
                  <option value="all">All statuses</option>
                  <option value="To do">To do</option>
                  <option value="In progress">In progress</option>
                  <option value="Done">Done</option>
                </select>
              </label>
              <label>
                <span className="sr-only">Filter tasks by team</span>
                <select
                  aria-label="Filter tasks by team"
                  value={teamFilter}
                  onChange={(event) => setTeamFilter(event.target.value)}
                  className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                >
                  <option value="all">All teams</option>
                  {teams.map((team) => <option key={team} value={team}>{team}</option>)}
                </select>
              </label>
              <label>
                <span className="sr-only">Sort dashboard tasks</span>
                <select
                  aria-label="Sort dashboard tasks"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                >
                  <option value="dueDate">Sort by due date</option>
                  <option value="title">Sort by name</option>
                  <option value="priority">Sort by priority</option>
                </select>
              </label>
            </div>
          </div>
          <p aria-live="polite" className="mt-3 text-xs text-slate-500">
            Showing {visibleTasks.length} of {dashboardTasks.length} sample tasks
          </p>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
              <Search aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No tasks match these filters</h3>
            <p className="mt-1 text-sm text-slate-500">Try another search or select a different team or status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-[#FAFAFC]">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-5 py-3">Task name</th>
                  <th scope="col" className="px-4 py-3">Priority</th>
                  <th scope="col" className="px-4 py-3">Start date</th>
                  <th scope="col" className="px-4 py-3">Assigned members</th>
                  <th scope="col" className="px-4 py-3">Due date</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F4]">
                {visibleTasks.map((task) => (
                  <tr key={task.id} className="transition hover:bg-[#FCFCFE]">
                    <th scope="row" className="max-w-64 px-5 py-4 text-sm font-semibold text-slate-800">
                      <span className="block truncate">{task.title}</span>
                      <span className="mt-1 block text-xs font-normal text-slate-400">{task.workspace}</span>
                    </th>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority] ?? priorityStyles.Low}`}>{task.priority}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">{formatDate(task.startDate)}</td>
                    <td className="px-4 py-4">
                      <div className="flex -space-x-2">
                        {task.assigneeIds.map((memberId) => {
                          const member = memberById.get(memberId);
                          const memberName = member?.name ?? memberId;
                          return (
                            <span
                              key={member?.id ?? memberId}
                              title={memberName}
                              aria-label={memberName}
                              className={`grid size-7 place-items-center rounded-full border-2 border-white text-[9px] font-bold ${member?.color ?? 'bg-slate-100 text-slate-600'}`}
                            >
                              {member?.initials ?? getMemberInitials(memberName)}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">{formatDate(task.dueDate)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${taskStatusStyles[task.status] ?? taskStatusStyles['To do']}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/admin/boards/${task.boardId}`}
                        aria-label={`View board for ${task.title}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#F1EEFF] hover:text-[#6542F5] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/30"
                      >
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="text-xs text-slate-400">Dashboard statistics and task examples are sample data for interface preview.</p>
    </div>
  );
};

const workloadTotal = workloadStatus.reduce((sum, item) => sum + item.value, 0);
const otherWorkloadPercentage = Math.max(0, 100 - workloadTotal);

const WorkloadCard = () => (
  <section aria-labelledby="workload-title" className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/30">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 id="workload-title" className="text-base font-semibold text-slate-900">Workload by Status</h2>
        <p className="mt-1 text-xs text-slate-500">Task distribution across your team</p>
      </div>
      <span className="rounded-lg bg-[#F8F9FC] px-2.5 py-1.5 text-xs font-medium text-slate-500">28 Days</span>
    </div>
    <div
      role="group"
      aria-label={`Workload by status: ${workloadStatus.map((item) => `${item.label} ${item.value}%`).join(', ')}, Other ${otherWorkloadPercentage}%`}
      className="mt-6 flex h-3 overflow-hidden rounded-full bg-slate-100"
    >
      {workloadStatus.map((item) => (
        <span
          key={item.id}
          role="img"
          aria-label={`${item.label}: ${item.value}%`}
          className={`h-full ${item.color}`}
          style={{ width: `${item.value}%` }}
        />
      ))}
      {otherWorkloadPercentage > 0 && (
        <span
          role="img"
          aria-label={`Other: ${otherWorkloadPercentage}%`}
          className="h-full bg-slate-100"
          style={{ width: `${otherWorkloadPercentage}%` }}
        />
      )}
    </div>
    <ul className="mt-4 grid gap-3 sm:grid-cols-3">
      {workloadStatus.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
          <span className="flex min-w-0 items-center gap-2 font-medium text-slate-700">
            <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-sm ${item.color}`} />
            <span className="truncate">{item.label}</span>
          </span>
          <span className={`font-bold ${item.textColor}`}>{item.value}%</span>
        </li>
      ))}
      {otherWorkloadPercentage > 0 && (
        <li className="flex items-center justify-between gap-2 text-sm">
          <span className="flex min-w-0 items-center gap-2 font-medium text-slate-700">
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-sm bg-slate-100" />
            <span>Other</span>
          </span>
          <span className="font-bold text-slate-500">{otherWorkloadPercentage}%</span>
        </li>
      )}
    </ul>
    <div className="mt-6 flex items-center gap-2 border-t border-[#EEF0F4] pt-4 text-xs text-slate-500">
      <ArrowDown aria-hidden="true" className="size-4 text-[#278A8F]" />
      <span>Workload is distributed across active and completed tasks.</span>
    </div>
  </section>
);

export default DashboardPage;
