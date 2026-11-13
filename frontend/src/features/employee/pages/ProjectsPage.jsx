import React, { useMemo, useState } from "react";
import {
  FolderGit2,
  Plus,
  Search,
  Users,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
  X,
  CheckCircle2,
  Clock3,
  GitBranch,
  LayoutGrid,
  ListFilter,
  MoreHorizontal,
  CircleDot,
  Layers3,
  TrendingUp,
  Code2,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Target,
  SlidersHorizontal,
  Command,
} from "lucide-react";
import { getUserItem, setUserItem } from "../../../utils/userStorage.js";

const initialProjects = [];

const statusStyles = {
  Active: {
    badge:
      "bg-teal-50 text-teal-700 ring-1 ring-teal-600/15 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20",
    dot: "bg-teal-500",
    progress: "bg-teal-500",
  },
  "In Progress": {
    badge:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-600/15 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20",
    dot: "bg-blue-500",
    progress: "bg-blue-500",
  },
  Completed: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
    progress: "bg-emerald-500",
  },
};

const categoryStyles = {
  SaaS: {
    icon: Layers3,
    style:
      "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
  },
  "E-Commerce": {
    icon: LayoutGrid,
    style:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  },
  Security: {
    icon: ShieldCheck,
    style:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  Mobile: {
    icon: Code2,
    style:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  },
};

const formatDate = (date) => {
  if (!date) return "No deadline";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDaysRemaining = (date) => {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(`${date}T00:00:00`);
  return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState(() => getUserItem("employee_projects", []));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("SaaS");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        project.title.toLowerCase().includes(query) ||
        project.desc.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query);

      const matchesStatus =
        filterStatus === "All" || project.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(
      (project) => project.status === "Active"
    ).length;
    const inProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;
    const completed = projects.filter(
      (project) => project.status === "Completed"
    ).length;

    const averageProgress = total
      ? Math.round(
          projects.reduce((sum, project) => sum + project.progress, 0) /
            total
        )
      : 0;

    return { total, active, inProgress, completed, averageProgress };
  }, [projects]);

  const handleCreateProject = (event) => {
    event.preventDefault();

    if (!newTitle.trim()) return;

    const newProject = {
      id: Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      desc: newDesc.trim() || "No project description has been added yet.",
      status: "Active",
      progress: 0,
      members: 1,
      deadline: newDeadline,
      repo: "",
    };

    setProjects((previous) => {
      const updated = [newProject, ...previous];
      setUserItem("employee_projects", updated);
      return updated;
    });

    setNewTitle("");
    setNewCategory("SaaS");
    setNewDesc("");
    setNewDeadline("");
    setFilterStatus("All");
    setSearchQuery("");
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewTitle("");
    setNewCategory("SaaS");
    setNewDesc("");
    setNewDeadline("");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-8 pb-12">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 dark:border-slate-800 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-400">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Workspace / Projects
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Projects
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Manage your team's projects, monitor progress, and keep every
              milestone on track.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/15 transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 active:scale-[0.98]"
          >
            <Plus size={18} />
            Create project
          </button>
        </header>

        {/* Overview Stats */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Project overview
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                A quick snapshot of your workspace
              </p>
            </div>

            <span className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:flex">
              <TrendingUp size={14} />
              Live overview
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Total Projects */}
            <StatCard
              title="Total projects"
              value={stats.total}
              subtitle="Across your workspace"
              icon={FolderGit2}
              iconStyle="bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
              footer="All projects"
            />

            {/* Active */}
            <StatCard
              title="Active projects"
              value={stats.active}
              subtitle="Currently active"
              icon={CircleDot}
              iconStyle="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
              footer="Active"
            />

            {/* Completed */}
            <StatCard
              title="Completed"
              value={stats.completed}
              subtitle="Successfully finished"
              icon={CheckCircle2}
              iconStyle="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              footer="Completed"
            />

            {/* Average Progress */}
            <StatCard
              title="Average progress"
              value={`${stats.averageProgress}%`}
              subtitle="Across all projects"
              icon={Target}
              iconStyle="bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
              footer="Overall completion"
              progress={stats.averageProgress}
            />
          </div>
        </section>

        {/* Project Workspace */}
        <section>
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                All projects
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Browse and manage your team's work.
              </p>
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredProjects.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {projects.length}
              </span>{" "}
              projects
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search by project name, category..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white dark:focus:bg-slate-800"
                />

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <ListFilter
                    size={16}
                    className="shrink-0 text-slate-400"
                  />

                  {["All", "Active", "In Progress", "Completed"].map(
                    (status) => {
                      const isSelected = filterStatus === status;

                      return (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            isSelected
                              ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          {status}
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="hidden h-7 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

                <div className="flex items-center self-end rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800 sm:self-auto">
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    title="Grid view"
                    className={`rounded-lg p-2 transition ${
                      viewMode === "grid"
                        ? "bg-white text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-300"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    }`}
                  >
                    <LayoutGrid size={17} />
                  </button>

                  <button
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    title="List view"
                    className={`rounded-lg p-2 transition ${
                      viewMode === "list"
                        ? "bg-white text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-300"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    }`}
                  >
                    <SlidersHorizontal size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Project Cards */}
          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <FolderGit2 size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                No projects found
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                We couldn't find any projects matching your search. Try
                another keyword or change the selected filter.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("All");
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Clear filters
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Create project
                </button>
              </div>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3"
                  : "flex flex-col gap-4"
              }
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </section>

        {/* Workspace Footer */}
        <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p>
            WorkSync Projects{" "}
            <span className="mx-1 text-slate-300 dark:text-slate-700">
              /
            </span>{" "}
            Manage your work in one place.
          </p>

          <p>
            {stats.inProgress} project
            {stats.inProgress === 1 ? "" : "s"} in progress
          </p>
        </footer>
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  <Sparkles size={21} />
                </div>

                <div>
                  <h2
                    id="create-project-title"
                    className="text-lg font-bold text-slate-950 dark:text-white"
                  >
                    Create a project
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Add a new project to your workspace.
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateProject} className="p-5 sm:p-7">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="project-title"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Project name <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="project-title"
                    type="text"
                    required
                    autoFocus
                    maxLength={100}
                    placeholder="e.g. Customer Analytics Dashboard"
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label
                    htmlFor="project-category"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Category
                  </label>

                  <div className="relative">
                    <select
                      id="project-category"
                      value={newCategory}
                      onChange={(event) =>
                        setNewCategory(event.target.value)
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="SaaS">SaaS Platform</option>
                      <option value="E-Commerce">E-Commerce</option>
                      <option value="Security">Security & Authentication</option>
                      <option value="Mobile">Mobile Application</option>
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="project-description"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Description
                  </label>

                  <textarea
                    id="project-description"
                    rows={4}
                    maxLength={500}
                    placeholder="What is this project about?"
                    value={newDesc}
                    onChange={(event) => setNewDesc(event.target.value)}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
                  />

                  <p className="mt-1.5 text-right text-xs text-slate-400">
                    {newDesc.length}/500
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="project-deadline"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Target deadline
                  </label>

                  <input
                    id="project-deadline"
                    type="date"
                    value={newDeadline}
                    onChange={(event) => setNewDeadline(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Form Footer */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/15 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={17} />
                  Create project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------
   Overview Stat Card
--------------------------------------- */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconStyle,
  footer,
  progress,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {value}
          </h3>

          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={21} />
        </div>
      </div>

      {typeof progress === "number" ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Overall completion
            </span>
            <span className="font-bold text-teal-700 dark:text-teal-300">
              {progress}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {footer}
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------
   Project Card
--------------------------------------- */

function ProjectCard({ project, viewMode }) {
  const status = statusStyles[project.status] || statusStyles.Active;
  const category = categoryStyles[project.category] || categoryStyles.SaaS;
  const CategoryIcon = category.icon;
  const daysRemaining = getDaysRemaining(project.deadline);

  const deadlineText =
    daysRemaining === null
      ? "No deadline"
      : daysRemaining < 0
        ? `${Math.abs(daysRemaining)} days overdue`
        : daysRemaining === 0
          ? "Due today"
          : `${daysRemaining} days left`;

  const deadlineColor =
    daysRemaining !== null && daysRemaining < 0
      ? "text-red-600 dark:text-red-400"
      : daysRemaining !== null && daysRemaining <= 7
        ? "text-amber-600 dark:text-amber-400"
        : "text-slate-500 dark:text-slate-400";

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 ${
        viewMode === "list" ? "lg:flex-row" : ""
      }`}
    >
      {/* Card Top Accent */}
      <div
        className={`h-1 w-full shrink-0 ${
          project.status === "Completed"
            ? "bg-emerald-500"
            : project.status === "In Progress"
              ? "bg-blue-500"
              : "bg-teal-500"
        } ${viewMode === "list" ? "lg:h-auto lg:w-1" : ""}`}
      />

      <div
        className={`flex flex-1 flex-col p-5 sm:p-6 ${
          viewMode === "list" ? "lg:flex-row lg:items-center lg:gap-8" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${category.style}`}
            >
              <CategoryIcon size={23} />
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {project.status}
            </span>
          </div>

          {/* Project Title and Description */}
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {project.category}
              </span>
            </div>

            <h3 className="mt-3 break-words text-lg font-bold leading-snug text-slate-950 transition-colors group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
              {project.title}
            </h3>

            <p className="mt-2 line-clamp-2 min-h-[42px] text-sm leading-6 text-slate-500 dark:text-slate-400">
              {project.desc}
            </p>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Target size={14} />
                Project progress
              </div>

              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {project.progress}%
              </span>
            </div>

            <div
              className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
              role="progressbar"
              aria-valuenow={project.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${project.title} progress`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${status.progress}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>

            <div className="mt-2 text-right text-[11px] text-slate-400">
              {project.progress === 100
                ? "Project completed"
                : project.progress === 0
                  ? "Not started"
                  : "In progress"}
            </div>
          </div>
        </div>

        {/* Project Metadata */}
        <div
          className={`mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 ${
            viewMode === "list"
              ? "lg:mt-0 lg:min-w-[260px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
              : ""
          }`}
        >
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Users size={14} />
              Team
            </div>

            <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">
              {project.members}{" "}
              <span className="font-medium text-slate-500 dark:text-slate-400">
                {project.members === 1 ? "member" : "members"}
              </span>
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CalendarDays size={14} />
              Deadline
            </div>

            <p className="mt-2 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
              {formatDate(project.deadline)}
            </p>

            {project.deadline && (
              <p className={`mt-1 text-[11px] font-medium ${deadlineColor}`}>
                {deadlineText}
              </p>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div
          className={`mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 ${
            viewMode === "list"
              ? "lg:mt-0 lg:min-w-[170px] lg:border-t-0 lg:pt-0"
              : ""
          }`}
        >
          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <GitBranch size={15} className="shrink-0" />

            <span className="truncate">
              {project.repo ? "Repository" : "No repository"}
            </span>
          </div>

          {project.repo ? (
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-500/10"
            >
              Open repo
              <ArrowUpRight size={14} />
            </a>
          ) : (
            <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-400 dark:bg-slate-800">
              Not linked
            </span>
          )}
        </div>
      </div>
    </article>
  );
}