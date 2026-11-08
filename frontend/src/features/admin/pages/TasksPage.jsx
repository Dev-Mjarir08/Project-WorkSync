import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  FolderKanban,
  ListTodo,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../adminService';

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

const getToday = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
};

const formatDate = (value) => (
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(`${value}T12:00:00`))
);

const TasksPage = () => {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [boardFilter, setBoardFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    try {
      setBoards(adminService.getBoards());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Tasks could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const tasks = useMemo(
    () => boards.flatMap((board) => board.tasks.map((task) => ({ ...task, board }))),
    [boards]
  );
  const assignees = useMemo(
    () => [...new Map(
      tasks
        .filter((task) => task.assignee)
        .map((task) => [task.assignee.id, task.assignee])
    ).values()].sort((first, second) => first.name.localeCompare(second.name)),
    [tasks]
  );
  const overdueCount = tasks.filter(
    (task) => task.status !== 'Done' && task.dueDate < getToday()
  ).length;
  const visibleTasks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return tasks
      .filter((task) => {
        const searchableText = [
          task.title,
          task.description,
          task.board.title,
          task.board.workspace,
          task.assignee?.name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase();

        return (
          (!query || searchableText.includes(query)) &&
          (statusFilter === 'all' || task.status === statusFilter) &&
          (priorityFilter === 'all' || task.priority === priorityFilter) &&
          (assigneeFilter === 'all' || task.assignee?.id === assigneeFilter) &&
          (boardFilter === 'all' || task.board.id === boardFilter) &&
          (!dateFrom || task.dueDate >= dateFrom) &&
          (!dateTo || task.dueDate <= dateTo)
        );
      })
      .sort((first, second) => first.dueDate.localeCompare(second.dueDate));
  }, [assigneeFilter, boardFilter, dateFrom, dateTo, priorityFilter, search, statusFilter, tasks]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setBoardFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const stats = [
    { label: 'Total tasks', value: tasks.length, icon: ListTodo, tone: 'bg-[#F1EEFF] text-[#6542F5]' },
    { label: 'To do', value: tasks.filter((task) => task.status === 'To do').length, icon: Circle, tone: 'bg-slate-100 text-slate-600' },
    { label: 'In progress', value: tasks.filter((task) => task.status === 'In progress').length, icon: Clock3, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Completed', value: tasks.filter((task) => task.status === 'Done').length, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Overdue', value: overdueCount, icon: CalendarDays, tone: 'bg-orange-50 text-orange-700' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#6542F5]">Workspace overview</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Tasks</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            View, organize, and track work across your workspace.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#E6E7EC] bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600">
          <ListTodo aria-hidden="true" className="size-4 text-[#6542F5]" />
          {tasks.length} tasks
        </span>
      </header>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Tasks unavailable</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <section aria-label="Task summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#E6E7EC] bg-white p-4 shadow-sm shadow-slate-200/25">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-[#E6E7EC] bg-white p-4 shadow-sm shadow-slate-200/30 sm:p-5">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">All tasks</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search tasks and combine filters to narrow the list.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="relative block sm:col-span-2 xl:col-span-1">
                  <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tasks"
                    aria-label="Search tasks"
                    className="h-10 w-full rounded-xl border border-[#E6E7EC] pl-9 pr-3 text-sm outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                  />
                </label>

                <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter}>
                  <option value="all">All statuses</option>
                  <option value="To do">To do</option>
                  <option value="In progress">In progress</option>
                  <option value="Done">Done</option>
                </FilterSelect>
                <FilterSelect label="Priority" value={priorityFilter} onChange={setPriorityFilter}>
                  <option value="all">All priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </FilterSelect>
                <FilterSelect label="Assignee" value={assigneeFilter} onChange={setAssigneeFilter}>
                  <option value="all">All assignees</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>{assignee.name}</option>
                  ))}
                </FilterSelect>
                <FilterSelect label="Board" value={boardFilter} onChange={setBoardFilter}>
                  <option value="all">All boards</option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>{board.title}</option>
                  ))}
                </FilterSelect>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Due from</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    aria-label="Tasks due from date"
                    className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Due to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                    aria-label="Tasks due to date"
                    className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[#EEF0F4] pt-3">
                <p className="text-xs text-slate-500" aria-live="polite">
                  Showing {visibleTasks.length} of {tasks.length} tasks
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-[#6542F5] hover:bg-[#F5F2FF] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </section>

          <section aria-label="Task list" className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
            {isLoading ? (
              <div role="status" className="space-y-3 p-5">
                <span className="sr-only">Loading tasks</span>
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
                  <Search aria-hidden="true" className="size-5" />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-slate-900">No tasks match these filters</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filters to see more tasks.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-[#6542F5] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-[#EEF0F4]">
                {visibleTasks.map((task) => (
                  <TaskRow key={`${task.board.id}-${task.id}`} task={task} />
                ))}
              </ul>
            )}
          </section>

          <p className="text-xs text-slate-400">
            Tasks are read from the available sample board data. Task edits and creation are not connected.
          </p>
        </>
      )}
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, children }) => (
  <label className="space-y-1">
    <span className="text-xs font-medium text-slate-600">{label}</span>
    <select
      aria-label={`Filter tasks by ${label.toLocaleLowerCase()}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
    >
      {children}
    </select>
  </label>
);

const TaskRow = ({ task }) => {
  const isDone = task.status === 'Done';
  const isOverdue = !isDone && task.dueDate < getToday();

  return (
    <li className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        {isDone ? (
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-600" />
        ) : (
          <Circle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-slate-300" />
        )}
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${isDone ? 'text-slate-500' : 'text-slate-800'}`}>
            {task.title}
          </p>
          <Link
            to={`/admin/boards/${task.board.id}`}
            className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-xs font-medium text-slate-500 transition hover:text-[#6542F5]"
          >
            <FolderKanban aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">{task.board.title}</span>
          </Link>
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

      <div className="flex flex-wrap items-center justify-between gap-3 pl-8 sm:justify-end sm:pl-0">
        {task.assignee && (
          <span className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
            <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${task.assignee.color}`}>
              {task.assignee.initials}
            </span>
            <span className="max-w-32 truncate">{task.assignee.name}</span>
          </span>
        )}
        <span className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'font-semibold text-orange-700' : 'text-slate-500'}`}>
          <CalendarDays aria-hidden="true" className="size-3.5" />
          {isOverdue ? 'Overdue · ' : 'Due '}
          {formatDate(task.dueDate)}
        </span>
      </div>
    </li>
  );
};

export default TasksPage;
