import React, { useState } from "react";
import {
  FolderGit2,
  ArrowLeft,
  Users,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GitBranch,
  GitCommit,
  ExternalLink,
  Plus,
  MoreHorizontal,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  AlertCircle,
  MessageSquare,
  LayoutDashboard,
  Target,
  Activity,
  ChevronRight,
  CircleDot,
  Code2,
  Search,
  Bell,
  ArrowUpRight,
  CircleCheck,
  X,
} from "lucide-react";

const initialProject = {
  id: 1,
  title: "WorkSync Platform Core",
  category: "SaaS Platform",
  status: "Active",
  health: "On Track",
  progress: 75,
  startDate: "Aug 15, 2026",
  deadline: "Nov 30, 2026",
  description:
    "A unified employee workspace for task management, team collaboration, project tracking, and real-time productivity insights.",
  repository: "https://github.com/worksync/core-platform",
  branch: "main",
  stats: {
    totalTasks: 48,
    completedTasks: 36,
    openBugs: 2,
    teamCount: 8,
  },
};

const initialMilestones = [
  {
    id: 101,
    title: "Authentication & Navigation",
    description: "User authentication, protected routes, and navigation.",
    dueDate: "Sep 30, 2026",
    status: "Completed",
    assignee: "Rouhan",
    avatar: "R",
    tasksCount: 12,
    completedTasks: 12,
  },
  {
    id: 102,
    title: "Dashboard & Task Management",
    description: "Dashboard statistics, task cards, and Kanban workflow.",
    dueDate: "Oct 25, 2026",
    status: "Completed",
    assignee: "Sarah Jenkins",
    avatar: "SJ",
    tasksCount: 14,
    completedTasks: 14,
  },
  {
    id: 103,
    title: "Discussion & Notifications",
    description: "Team discussions and real-time notification system.",
    dueDate: "Nov 15, 2026",
    status: "In Progress",
    assignee: "Rouhan",
    avatar: "R",
    tasksCount: 16,
    completedTasks: 10,
  },
  {
    id: 104,
    title: "Performance & Release",
    description: "Performance audits, testing, and release preparation.",
    dueDate: "Nov 30, 2026",
    status: "Pending",
    assignee: "Alex Rivera",
    avatar: "AR",
    tasksCount: 6,
    completedTasks: 0,
  },
];

const initialTeamMembers = [
  {
    name: "Rouhan",
    role: "Frontend Developer",
    avatar: "R",
    status: "Active",
    color: "bg-teal-600",
  },
  {
    name: "Sarah Jenkins",
    role: "UI/UX Designer",
    avatar: "SJ",
    status: "Active",
    color: "bg-violet-600",
  },
  {
    name: "Alex Rivera",
    role: "Backend Engineer",
    avatar: "AR",
    status: "Active",
    color: "bg-blue-600",
  },
  {
    name: "Michael Chen",
    role: "Product Manager",
    avatar: "MC",
    status: "In Meeting",
    color: "bg-amber-600",
  },
];

const initialCommits = [
  {
    hash: "8f3a2b1",
    msg: "Optimize mobile footer navigation",
    type: "refactor",
    author: "Rouhan",
    date: "2 hours ago",
    avatar: "R",
  },
  {
    hash: "4c7e9d2",
    msg: "Add task details checklist",
    type: "feat",
    author: "Sarah Jenkins",
    date: "Yesterday",
    avatar: "SJ",
  },
  {
    hash: "1b9f3a8",
    msg: "Update authentication session validation",
    type: "fix",
    author: "Alex Rivera",
    date: "2 days ago",
    avatar: "AR",
  },
];

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "team", label: "Team", icon: Users },
  { id: "code", label: "Activity", icon: GitCommit },
];

const milestoneStyles = {
  Completed: {
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  "In Progress": {
    badge:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    dot: "bg-blue-500",
    icon: Clock3,
  },
  Pending: {
    badge:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
    icon: CircleDot,
  },
};

export default function ProjectDetailsPage({ onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [project] = useState(initialProject);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [teamMembers] = useState(initialTeamMembers);
  const [commits] = useState(initialCommits);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");

  const completedMilestones = milestones.filter(
    (milestone) => milestone.status === "Completed"
  ).length;

  const completedTasks = milestones.reduce(
    (sum, milestone) => sum + milestone.completedTasks,
    0
  );

  const totalMilestoneTasks = milestones.reduce(
    (sum, milestone) => sum + milestone.tasksCount,
    0
  );

  const filteredMilestones = milestones.filter((milestone) =>
    milestone.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMilestone = (event) => {
    event.preventDefault();

    if (!newMilestoneTitle.trim()) return;

    const newMilestone = {
      id: Date.now(),
      title: newMilestoneTitle.trim(),
      description: "New project milestone.",
      dueDate: newMilestoneDate
        ? new Date(`${newMilestoneDate}T00:00:00`).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric", year: "numeric" }
          )
        : "Not scheduled",
      status: "Pending",
      assignee: "Unassigned",
      avatar: "?",
      tasksCount: 0,
      completedTasks: 0,
    };

    setMilestones((previous) => [...previous, newMilestone]);
    setNewMilestoneTitle("");
    setNewMilestoneDate("");
    setShowAddMilestone(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6 pb-12">
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-teal-400"
              aria-label="Back to projects"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <span>Workspace</span>
                <ChevronRight size={14} />
                <span>Projects</span>
                <ChevronRight size={14} />
              </div>
              <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">
                Project details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <a
              href={project.repository}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/15 transition hover:bg-teal-700"
            >
              <GitBranch size={17} />
              <span className="hidden sm:inline">Open repository</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Project Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-blue-500" />

          <div className="p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
              <div className="flex min-w-0 items-start gap-4">
                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300 sm:flex">
                  <FolderGit2 size={31} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                      {project.category}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {project.status}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      <Activity size={13} />
                      {project.health}
                    </span>
                  </div>

                  <h1 className="break-words text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl">
                    {project.title}
                  </h1>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={15} />
                      Started {project.startDate}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={15} />
                      Due {project.deadline}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <GitBranch size={15} />
                      <span className="font-mono">{project.branch}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Completion */}
              <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50 xl:w-64 xl:shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Project completion
                  </span>
                  <Target size={17} className="text-teal-600 dark:text-teal-400" />
                </div>

                <div className="mt-3 flex items-end gap-1.5">
                  <span className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
                    {project.progress}
                  </span>
                  <span className="mb-1 text-lg font-semibold text-teal-600 dark:text-teal-400">
                    %
                  </span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {project.stats.completedTasks} of{" "}
                    {project.stats.totalTasks} tasks
                  </span>
                  <span className="font-semibold text-teal-700 dark:text-teal-300">
                    {project.stats.totalTasks
                      ? Math.round(
                          (project.stats.completedTasks /
                            project.stats.totalTasks) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total tasks"
            value={project.stats.totalTasks}
            detail={`${project.stats.completedTasks} completed`}
            icon={CheckSquare}
            iconStyle="bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
            progress={
              project.stats.totalTasks
                ? (project.stats.completedTasks / project.stats.totalTasks) *
                  100
                : 0
            }
          />

          <StatCard
            title="Open issues"
            value={project.stats.openBugs}
            detail="Issues requiring attention"
            icon={AlertCircle}
            iconStyle="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
          />

          <StatCard
            title="Team members"
            value={project.stats.teamCount}
            detail="Contributors assigned"
            icon={Users}
            iconStyle="bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
          />

          <StatCard
            title="Milestones"
            value={`${completedMilestones}/${milestones.length}`}
            detail="Milestones completed"
            icon={Target}
            iconStyle="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
            progress={
              milestones.length
                ? (completedMilestones / milestones.length) * 100
                : 0
            }
          />
        </section>

        {/* Tabs */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 dark:border-slate-800 sm:px-6">
            <div className="flex gap-5 overflow-x-auto sm:gap-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex shrink-0 items-center gap-2.5 py-4 text-sm font-semibold transition ${
                      selected
                        ? "text-teal-700 dark:text-teal-300"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={17} />
                    {tab.label}

                    {tab.id === "overview" && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                          selected
                            ? "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                        }`}
                      >
                        {milestones.length}
                      </span>
                    )}

                    {selected && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-teal-600 dark:bg-teal-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              {/* Milestones */}
              <div className="min-w-0">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                      Project milestones
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Track deliverables and sprint progress.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddMilestone(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                  >
                    <Plus size={16} />
                    Add milestone
                  </button>
                </div>

                <div className="relative mt-6">
                  {milestones.length > 0 && (
                    <div className="absolute bottom-8 left-[17px] top-6 w-px bg-slate-200 dark:bg-slate-800" />
                  )}

                  <div className="space-y-4">
                    {filteredMilestones.map((milestone) => (
                      <MilestoneCard
                        key={milestone.id}
                        milestone={milestone}
                      />
                    ))}
                  </div>

                  {filteredMilestones.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                      <Search
                        size={25}
                        className="mx-auto text-slate-400"
                      />
                      <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-white">
                        No milestones found
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Try searching for a different milestone.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              <aside className="space-y-5">
                {/* Milestone Search */}
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Find a milestone
                  </h3>

                  <div className="relative mt-3">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search milestones..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Team Preview */}
                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Project team
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        People working on this project
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("team")}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300"
                    >
                      View all
                    </button>
                  </div>

                  <div className="mt-5 flex items-center">
                    {teamMembers.slice(0, 4).map((member, index) => (
                      <div
                        key={member.name}
                        title={member.name}
                        className={`-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white first:ml-0 dark:border-slate-900 ${member.color}`}
                      >
                        {member.avatar}
                      </div>
                    ))}

                    <span className="ml-3 text-xs text-slate-500 dark:text-slate-400">
                      {project.stats.teamCount} contributors
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {teamMembers.slice(0, 3).map((member) => (
                      <div
                        key={member.name}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${member.color}`}
                        >
                          {member.avatar}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {member.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                            {member.role}
                          </p>
                        </div>

                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            member.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                          title={member.status}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTab("team")}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Users size={15} />
                    Manage team
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Repository Card */}
                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <GitBranch size={20} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Repository
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Source code
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <GitBranch size={14} className="text-teal-600" />
                      {project.branch}
                    </div>

                    <p className="mt-2 break-all font-mono text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                      {project.repository.replace("https://", "")}
                    </p>
                  </div>

                  <a
                    href={project.repository}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    Open on GitHub
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </aside>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    Team members
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Project contributors and their current availability.
                  </p>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Users size={15} />
                  {teamMembers.length} displayed
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.name}
                    className="rounded-2xl border border-slate-200 p-5 transition hover:border-teal-500/40 hover:shadow-md dark:border-slate-800 dark:hover:border-teal-500/30"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white ${member.color}`}
                      >
                        {member.avatar}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          member.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            member.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {member.status}
                      </span>
                    </div>

                    <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                      {member.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {member.role}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <span>Project contributor</span>
                      <ShieldCheck
                        size={16}
                        className="text-teal-600 dark:text-teal-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "code" && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    Recent development activity
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Latest commit activity recorded for this project.
                  </p>
                </div>

                <a
                  href={project.repository}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <GitBranch size={15} />
                  View repository
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 dark:bg-slate-800/70 dark:text-slate-400 sm:grid-cols-[minmax(0,1fr)_130px_120px]">
                  <span>Commit message</span>
                  <span className="hidden sm:block">Author</span>
                  <span>Commit hash</span>
                </div>

                {commits.map((commit) => (
                  <div
                    key={commit.hash}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-200 px-4 py-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 sm:grid-cols-[minmax(0,1fr)_130px_120px]"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                        <GitCommit size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {commit.msg}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                              commit.type === "feat"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                                : commit.type === "fix"
                                  ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                                  : "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                            }`}
                          >
                            {commit.type}
                          </span>

                          <span className="text-[11px] text-slate-400 sm:hidden">
                            {commit.author} · {commit.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden min-w-0 items-center gap-2 sm:flex">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {commit.avatar}
                      </div>

                      <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                        {commit.author}
                      </span>
                    </div>

                    <div>
                      <code className="rounded-lg bg-slate-100 px-2 py-1.5 font-mono text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {commit.hash}
                      </code>
                      <p className="mt-2 hidden text-[10px] text-slate-400 sm:block">
                        {commit.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-500/10">
                <Activity
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
                />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Activity preview
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-800/80 dark:text-blue-300/80">
                    These commits are sample project data. Connect your GitHub
                    API to display real repository activity.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Bottom Summary */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              <Sparkles size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Keep the project moving
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {completedTasks} of {totalMilestoneTasks} milestone tasks
                completed.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab("overview");
              setSearchQuery("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            View milestones
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddMilestone(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="milestone-modal-title"
            className="my-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="milestone-modal-title"
                  className="text-lg font-bold text-slate-950 dark:text-white"
                >
                  Add milestone
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Create a new project deliverable.
                </p>
              </div>

              <button
                onClick={() => setShowAddMilestone(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="milestone-title"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Milestone title
                </label>

                <input
                  id="milestone-title"
                  required
                  maxLength={120}
                  value={newMilestoneTitle}
                  onChange={(event) =>
                    setNewMilestoneTitle(event.target.value)
                  }
                  placeholder="e.g. Complete dashboard redesign"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="milestone-deadline"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Target date
                </label>

                <input
                  id="milestone-deadline"
                  type="date"
                  value={newMilestoneDate}
                  onChange={(event) =>
                    setNewMilestoneDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddMilestone(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!newMilestoneTitle.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={16} />
                  Create milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------
   Statistics Card
---------------------------------- */

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  iconStyle,
  progress,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {detail}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={21} />
        </div>
      </div>

      {typeof progress === "number" && (
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* ----------------------------------
   Milestone Card
---------------------------------- */

function MilestoneCard({ milestone }) {
  const style =
    milestoneStyles[milestone.status] || milestoneStyles.Pending;

  const StatusIcon = style.icon;

  const progress = milestone.tasksCount
    ? Math.round(
        (milestone.completedTasks / milestone.tasksCount) * 100
      )
    : 0;

  return (
    <article className="relative z-10 flex gap-3 sm:gap-4">
      <div
        className={`mt-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-4 border-white text-white dark:border-slate-900 ${style.dot}`}
      >
        <StatusIcon size={15} />
      </div>

      <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-500/40 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sprint milestone
              </span>

              <span
                className={`rounded-md px-2 py-1 text-[10px] font-semibold ${style.badge}`}
              >
                {milestone.status}
              </span>
            </div>

            <h3 className="mt-2 break-words text-sm font-bold leading-6 text-slate-900 dark:text-white sm:text-base">
              {milestone.title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {milestone.description}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <CalendarDays size={14} />
            {milestone.dueDate}
          </span>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Task completion
            </span>

            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {milestone.completedTasks}/{milestone.tasksCount}
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                milestone.status === "Completed"
                  ? "bg-emerald-500"
                  : milestone.status === "In Progress"
                    ? "bg-blue-500"
                    : "bg-slate-300 dark:bg-slate-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[10px] font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              {milestone.avatar}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] text-slate-400">Assigned to</p>
              <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                {milestone.assignee}
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {progress}% complete
          </span>
        </div>
      </div>
    </article>
  );
}