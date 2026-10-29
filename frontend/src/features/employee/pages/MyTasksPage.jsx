import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock3,
  CircleDashed,
  X,
  CalendarDays,
  ListTodo,
  ArrowUpRight,
  MoreHorizontal,
  SlidersHorizontal,
  FolderKanban,
  CircleCheck,
  ClipboardList,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";

const initialTasks = [
  {
    id: 1,
    title: "Build Task Kanban Board",
    project: "WorkSync",
    priority: "High",
    status: "In Progress",
    dueDate: "Oct 30",
  },
  {
    id: 2,
    title: "Integrate Auth API",
    project: "Auth Core",
    priority: "High",
    status: "Pending",
    dueDate: "Nov 01",
  },
  {
    id: 3,
    title: "Design System Specs",
    project: "WorkSync",
    priority: "Medium",
    status: "Completed",
    dueDate: "Oct 25",
  },
  {
    id: 4,
    title: "Write Unit Tests for Table",
    project: "Testing",
    priority: "Low",
    status: "In Progress",
    dueDate: "Nov 03",
  },
];

const filters = [
  { label: "All tasks", value: "all" },
  { label: "In progress", value: "in-progress" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

const priorityStyles = {
  High: "bg-rose-50 text-rose-600 ring-rose-100",
  Medium: "bg-amber-50 text-amber-700 ring-amber-100",
  Low: "bg-sky-50 text-sky-700 ring-sky-100",
};

const statusStyles = {
  "In Progress": "bg-violet-50 text-violet-700",
  Pending: "bg-amber-50 text-amber-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

function StatCard({ title, value, subtitle, icon: Icon, accent, percent }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${accent}`}>
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <ArrowUpRight size={14} />
          {percent}
        </span>

        <span className="text-xs text-slate-400">{subtitle}</span>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      {action}
    </div>
  );
}

export default function TasksPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("Nov 05");
  const [tasks, setTasks] = useState(initialTasks);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(
      (task) => task.status === "Completed"
    ).length;
    const inProgress = tasks.filter(
      (task) => task.status === "In Progress"
    ).length;
    const pending = tasks.filter(
      (task) => task.status === "Pending"
    ).length;

    return {
      total,
      completed,
      inProgress,
      pending,
      completion: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "completed" && task.status === "Completed") ||
        (filter === "in-progress" && task.status === "In Progress") ||
        (filter === "pending" && task.status === "Pending");

      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        task.project.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, searchQuery]);

  const toggleTaskStatus = (id) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== id) return task;

        return {
          ...task,
          status:
            task.status === "Completed" ? "In Progress" : "Completed",
        };
      })
    );
  };

  const handleAddTask = (event) => {
    event.preventDefault();

    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      project: newTaskProject.trim() || "General",
      priority: newTaskPriority,
      status: "Pending",
      dueDate: newTaskDueDate.trim() || "No date",
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);

    setNewTaskTitle("");
    setNewTaskProject("");
    setNewTaskPriority("Medium");
    setNewTaskDueDate("Nov 05");
    setIsModalOpen(false);
    setFilter("all");
    setSearchQuery("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page Header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Workspace / Tasks
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Task Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Plan your work, track progress, and get things done.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100"
          >
            <Plus size={18} />
            Create new task
          </button>
        </header>

        {/* Welcome / Progress Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 p-6 text-white shadow-xl shadow-teal-900/10 sm:p-8">
          <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[35px] border-white/5" />
          <div className="absolute -bottom-28 right-32 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

          <div className="relative grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-50">
                <LayoutGrid size={14} />
                Your productivity overview
              </span>

              <h2 className="mt-5 max-w-xl text-2xl font-bold leading-tight sm:text-3xl">
                Make progress on what matters most.
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-teal-50/80">
                Keep your priorities clear and your projects moving forward.
                Every completed task brings you one step closer to your goals.
              </p>

              <button
                type="button"
                onClick={() => {
                  setFilter("in-progress");
                  document
                    .getElementById("task-list")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
              >
                View active tasks
                <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-teal-50/90">
                  Overall completion
                </span>

                <CircleCheck size={20} className="text-teal-100" />
              </div>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-bold">
                  {stats.completion}%
                </span>
                <span className="mb-1 text-xs text-teal-50/70">
                  of all tasks
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${stats.completion}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-teal-50/80">
                {stats.completed} of {stats.total} tasks completed
              </p>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total tasks"
            value={stats.total}
            subtitle="Across your workspace"
            percent="Overview"
            icon={ClipboardList}
            accent="bg-slate-100 text-slate-700"
          />

          <StatCard
            title="In progress"
            value={stats.inProgress}
            subtitle="Currently being worked on"
            percent="Active"
            icon={Clock3}
            accent="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Pending tasks"
            value={stats.pending}
            subtitle="Waiting to be started"
            percent="To do"
            icon={CircleDashed}
            accent="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            subtitle="Successfully finished"
            percent={`${stats.completion}%`}
            icon={CheckCircle2}
            accent="bg-emerald-50 text-emerald-600"
          />
        </section>

        {/* Main Task Section */}
        <section
          id="task-list"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        >
          {/* Section Header */}
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <SectionHeading
              icon={ListTodo}
              title="Your tasks"
              description="Manage your tasks and monitor their status."
              action={
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {filteredTasks.length}{" "}
                  {filteredTasks.length === 1 ? "task" : "tasks"}
                </span>
              }
            />

            {/* Search and Filter */}
            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 ${
                      filter === item.value
                        ? "bg-white text-teal-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {item.label}
                    {item.value === "all" && (
                      <span className="ml-1.5 text-[10px] opacity-70">
                        {stats.total}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1 lg:w-64">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search tasks or projects..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFilter("all");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <SlidersHorizontal size={16} />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                <Search size={28} />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-800">
                No tasks found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Try a different search term or select another filter to find
                your tasks.
              </p>

              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}
                className="mt-4 text-sm font-semibold text-teal-700 hover:text-teal-900"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table Header */}
              <div className="hidden grid-cols-[minmax(220px,2fr)_minmax(100px,1fr)_110px_120px_110px] items-center gap-4 bg-slate-50/80 px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
                <span>Task name</span>
                <span>Project</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Due date</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <article
                    key={task.id}
                    className="group px-5 py-5 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(220px,2fr)_minmax(100px,1fr)_110px_120px_110px] lg:items-center lg:gap-4">
                      {/* Task Title */}
                      <div className="flex min-w-0 items-start gap-3">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={task.status === "Completed"}
                          aria-label={`Mark ${task.title} ${
                            task.status === "Completed"
                              ? "incomplete"
                              : "complete"
                          }`}
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                            task.status === "Completed"
                              ? "border-teal-600 bg-teal-600 text-white"
                              : "border-slate-300 bg-white text-transparent hover:border-teal-500"
                          }`}
                        >
                          <CheckCircle2 size={14} />
                        </button>

                        <div className="min-w-0">
                          <h3
                            className={`break-words text-sm font-semibold ${
                              task.status === "Completed"
                                ? "text-slate-400 line-through"
                                : "text-slate-800"
                            }`}
                          >
                            {task.title}
                          </h3>

                          <p className="mt-1.5 text-xs text-slate-400 lg:hidden">
                            {task.project}
                          </p>
                        </div>
                      </div>

                      {/* Project */}
                      <div className="hidden min-w-0 items-center gap-2 lg:flex">
                        <FolderKanban
                          size={15}
                          className="shrink-0 text-slate-400"
                        />

                        <span className="truncate text-sm text-slate-600">
                          {task.project}
                        </span>
                      </div>

                      {/* Priority */}
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                            priorityStyles[task.priority] ||
                            priorityStyles.Low
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {task.priority}
                        </span>
                      </div>

                      {/* Status and Date on Mobile */}
                      <div className="flex flex-wrap items-center gap-3 lg:contents">
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                            statusStyles[task.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {task.status}
                        </span>

                        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 lg:ml-0">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />
                          {task.dueDate}
                        </div>
                      </div>

                      {/* Desktop Action */}
                      <div className="hidden justify-end lg:flex">
                        <button
                          type="button"
                          onClick={() => {
                            setNewTaskTitle(task.title);
                            setNewTaskProject(task.project);
                            setNewTaskPriority(task.priority);
                            setNewTaskDueDate(task.dueDate);
                            setTasks((currentTasks) =>
                              currentTasks.filter((item) => item.id !== task.id)
                            );
                            setIsModalOpen(true);
                          }}
                          aria-label={`Edit ${task.title}`}
                          title="Edit task"
                          className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-white hover:text-teal-700 group-hover:opacity-100"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* List Footer */}
          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredTasks.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {tasks.length}
              </span>{" "}
              tasks
            </p>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 transition hover:text-teal-900"
            >
              <Plus size={15} />
              Add another task
            </button>
          </div>
        </section>

        {/* Productivity Footer */}
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Keep the momentum going
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                You have {stats.pending + stats.inProgress} tasks left to work
                on.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-600 transition-all duration-500"
                style={{ width: `${stats.completion}%` }}
              />
            </div>

            <span className="text-sm font-bold text-slate-700">
              {stats.completion}%
            </span>
          </div>
        </section>
      </div>

      {/* Create / Edit Task Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-7">
              <div>
                <div className="mb-2 inline-flex rounded-lg bg-teal-50 p-2 text-teal-700">
                  <ListTodo size={20} />
                </div>

                <h2
                  id="task-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Create a new task
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add details to keep your work organized.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close dialog"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-5 p-6 sm:p-7">
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Task title <span className="text-rose-500">*</span>
                </label>

                <input
                  id="task-title"
                  type="text"
                  required
                  autoFocus
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                />
              </div>

              <div>
                <label
                  htmlFor="task-project"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Project name
                </label>

                <div className="relative">
                  <FolderKanban
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="task-project"
                    type="text"
                    placeholder="e.g. WorkSync"
                    value={newTaskProject}
                    onChange={(event) =>
                      setNewTaskProject(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="task-priority"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Priority
                  </label>

                  <div className="relative">
                    <select
                      id="task-priority"
                      value={newTaskPriority}
                      onChange={(event) =>
                        setNewTaskPriority(event.target.value)
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                    >
                      <option value="Low">Low priority</option>
                      <option value="Medium">Medium priority</option>
                      <option value="High">High priority</option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="task-date"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Due date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="task-date"
                      type="text"
                      placeholder="e.g. Nov 05"
                      value={newTaskDueDate}
                      onChange={(event) =>
                        setNewTaskDueDate(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-teal-900/10 transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100"
                >
                  <Plus size={17} />
                  Create task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}