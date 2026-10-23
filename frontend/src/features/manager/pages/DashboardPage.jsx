import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ClipboardList,
  Clock3,
  CircleCheck,
  AlertCircle,
  Plus,
  Users,
  ArrowUpRight,
  TrendingUp,
  Bell,
  Search,
  Calendar,
  Menu,
  X,
  ChevronRight,
  Filter,
  FolderKanban,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";

// Summary Cards Data in Dark Theme
const initialSummaryCards = [
  {
    title: "Total Tasks",
    value: 24,
    description: "Tasks across your projects",
    change: "+4 this sprint",
    icon: ClipboardList,
    accent: "blue",
    color: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    glow: "hover:border-blue-500/30 hover:shadow-blue-500/5",
  },
  {
    title: "In Progress",
    value: 8,
    description: "Currently being worked on",
    change: "33% active workload",
    icon: Clock3,
    accent: "amber",
    color: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    glow: "hover:border-amber-500/30 hover:shadow-amber-500/5",
  },
  {
    title: "Completed",
    value: 12,
    description: "Tasks completed",
    change: "50% milestone rate",
    icon: CircleCheck,
    accent: "emerald",
    color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    glow: "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
  },
  {
    title: "Overdue / Risk",
    value: 4,
    description: "Need your attention",
    change: "Immediate priority",
    icon: AlertCircle,
    accent: "rose",
    color: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    glow: "hover:border-rose-500/30 hover:shadow-rose-500/5",
  },
];

// Preserving original sample tasks
const initialTasks = [
  {
    id: 1,
    title: "Design login page",
    project: "WorkSync Web App",
    assignee: "Jarir",
    assigneeRole: "Admin",
    assigneeColor: "from-blue-500 to-cyan-600",
    priority: "High",
    status: "In Progress",
    dueDate: "Oct 24, 2026",
  },
  {
    id: 2,
    title: "Set up workspace",
    project: "WorkSync Web App",
    assignee: "Rouhan",
    assigneeRole: "Employee",
    assigneeColor: "from-emerald-500 to-teal-600",
    priority: "Medium",
    status: "Completed",
    dueDate: "Oct 20, 2026",
  },
  {
    id: 3,
    title: "Review task assignments",
    project: "Team Management",
    assignee: "Devanshi",
    assigneeRole: "Manager",
    assigneeColor: "from-indigo-500 to-purple-600",
    priority: "High",
    status: "Pending",
    dueDate: "Oct 23, 2026",
  },
  {
    id: 4,
    title: "Update project documentation",
    project: "Team Management",
    assignee: "Ayan",
    assigneeRole: "Admin",
    assigneeColor: "from-blue-500 to-cyan-600",
    priority: "Low",
    status: "In Progress",
    dueDate: "Oct 28, 2026",
  },
  {
    id: 5,
    title: "Configure WebSocket sync rooms",
    project: "WorkSync Web App",
    assignee: "Rouhan",
    assigneeRole: "Employee",
    assigneeColor: "from-emerald-500 to-teal-600",
    priority: "High",
    status: "In Progress",
    dueDate: "Oct 26, 2026",
  },
  {
    id: 6,
    title: "Sprint 4 retrospective prep",
    project: "Team Management",
    assignee: "Devanshi",
    assigneeRole: "Manager",
    assigneeColor: "from-indigo-500 to-purple-600",
    priority: "Medium",
    status: "Completed",
    dueDate: "Oct 22, 2026",
  },
];

// Preserving original team members with workload tracking
const teamMembersData = [
  {
    name: "Devanshi",
    fullName: "Devanshi Sharma",
    role: "Manager",
    tasks: 8,
    capacity: 80,
    avatar: "DS",
    color: "from-blue-600 to-indigo-600",
    status: "Online",
  },
  {
    name: "Ayan",
    fullName: "Ayan Mukherjee",
    role: "Admin",
    tasks: 6,
    capacity: 60,
    avatar: "AM",
    color: "from-cyan-500 to-blue-600",
    status: "In Meeting",
  },
  {
    name: "Rouhan",
    fullName: "Rouhan Siddiqui",
    role: "Employee",
    tasks: 10,
    capacity: 95,
    avatar: "RS",
    color: "from-emerald-500 to-teal-600",
    status: "Active",
  },
];

// Active Projects Overview snapshot
const activeProjectsSnapshot = [
  {
    name: "WorkSync Web App",
    category: "Core Platform",
    progress: 72,
    totalTasks: 25,
    completedTasks: 18,
    status: "On Track",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  },
  {
    name: "Mobile Companion App",
    category: "Mobile",
    progress: 45,
    totalTasks: 20,
    completedTasks: 9,
    status: "In Progress",
    statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  },
  {
    name: "Real-Time Sync Engine",
    category: "Infrastructure",
    progress: 85,
    totalTasks: 14,
    completedTasks: 12,
    status: "Near Completion",
    statusColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  },
  {
    name: "Client Onboarding Portal",
    category: "Product",
    progress: 30,
    totalTasks: 10,
    completedTasks: 3,
    status: "On Hold",
    statusColor: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  },
];

// Activity Feed items
const recentActivityItems = [
  {
    id: 1,
    user: "Ayan Mukherjee",
    action: "updated task",
    target: "Design login page",
    status: "In Progress",
    time: "15m ago",
    avatar: "AM",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: 2,
    user: "Rouhan Siddiqui",
    action: "completed task",
    target: "Set up workspace",
    status: "Completed",
    time: "2h ago",
    avatar: "RS",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 3,
    user: "Devanshi Sharma",
    action: "assigned 2 tasks in",
    target: "WorkSync Web App",
    status: null,
    time: "4h ago",
    avatar: "DS",
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: 4,
    user: "System Bot",
    action: "flagged milestone as",
    target: "Sprint 4 Milestone Ready",
    status: "Verified",
    time: "Yesterday",
    avatar: "WS",
    color: "from-slate-600 to-slate-800",
  },
];

const statusStyles = {
  "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/25",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/25",
};

const priorityStyles = {
  High: "bg-rose-500/10 text-rose-400 border-rose-500/25",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  Low: "bg-slate-500/10 text-slate-400 border-slate-500/25",
};

const sampleNotifications = [
  { id: 1, text: "Ayan updated 'Design login page' to In Progress", time: "15m ago", unread: true },
  { id: 2, text: "Rouhan completed 'Set up workspace'", time: "2h ago", unread: true },
  { id: 3, text: "Review task assignments pending approval", time: "5h ago", unread: false },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(initialTasks);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationList, setNotificationList] = useState(sampleNotifications);

  // Form state for Create Task Modal
  const [newTask, setNewTask] = useState({
    title: "",
    project: "WorkSync Web App",
    assignee: "Ayan",
    priority: "High",
    dueDate: "Oct 28, 2026",
  });

  // Filter tasks based on search query and status filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        taskSearchQuery.trim() === "" ||
        task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
        task.project.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(taskSearchQuery.toLowerCase());

      const matchesStatus =
        taskStatusFilter === "All" || task.status === taskStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, taskSearchQuery, taskStatusFilter]);

  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const assigneeColors = {
      Devanshi: "from-blue-600 to-indigo-600",
      Ayan: "from-cyan-500 to-blue-600",
      Rouhan: "from-emerald-500 to-teal-600",
      Jarir: "from-blue-500 to-cyan-600",
    };

    const created = {
      id: Date.now(),
      title: newTask.title.trim(),
      project: newTask.project,
      assignee: newTask.assignee,
      assigneeRole:
        newTask.assignee === "Devanshi"
          ? "Manager"
          : newTask.assignee === "Ayan" || newTask.assignee === "Jarir"
          ? "Admin"
          : "Employee",
      assigneeColor: assigneeColors[newTask.assignee] || "from-slate-600 to-slate-800",
      priority: newTask.priority,
      status: "In Progress",
      dueDate: newTask.dueDate || "Nov 01, 2026",
    };

    setTasks([created, ...tasks]);
    setNewTask({
      title: "",
      project: "WorkSync Web App",
      assignee: "Ayan",
      priority: "High",
      dueDate: "Oct 28, 2026",
    });
    setShowCreateTaskModal(false);
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Unified Dark Theme Sidebar with Independent Scroll */}
      <Sidebar activeItem="dashboard" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#0B1120]/80 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile trigger & Breadcrumbs */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-850 hover:text-slate-200 lg:hidden"
                aria-label="Open mobile navigation menu"
              >
                <Menu size={18} />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">WorkSync</span>
                <ChevronRight size={13} className="text-slate-600" />
                <span>Manager</span>
                <ChevronRight size={13} className="text-slate-600" />
                <span className="font-medium text-blue-400">Dashboard</span>
              </div>
            </div>

            {/* Right: Search, Notifications, Avatar, Create Task */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Search bar */}
              <div className="relative hidden md:block w-64 lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="Search tasks, members... (⌘K)"
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-1.5 pl-9 pr-7 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
                {taskSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setTaskSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-slate-300"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 focus:outline-none"
                  aria-label="View notifications"
                >
                  <Bell size={16} />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#0B1120]"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-[#0F172A] p-4 shadow-2xl ring-1 ring-white/5 z-40">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="text-xs font-semibold text-slate-200">Notifications</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setNotificationList(notificationList.map((n) => ({ ...n, unread: false })))
                        }
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                      {notificationList.map((notif) => (
                        <div
                          key={notif.id}
                          className={`rounded-xl p-2.5 text-xs transition border ${
                            notif.unread
                              ? "bg-blue-500/10 text-slate-200 border-blue-500/20"
                              : "bg-slate-900/60 text-slate-400 border-slate-800/60"
                          }`}
                        >
                          <p className="font-medium leading-relaxed">{notif.text}</p>
                          <p className="mt-1 text-[10px] text-slate-500">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar */}
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white text-xs shadow-md shadow-blue-500/20">
                  DS
                </div>
              </div>

              {/* Create Task Button */}
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition active:scale-[0.98]"
              >
                <Plus size={15} />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl w-full mx-auto">
          {/* Welcome Banner */}
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                Manager Workspace
              </p>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Welcome back, Devanshi!
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Here is an overview of your team deliverables, active sprints, and workload capacity.
              </p>
            </div>

            {/* Quick Link to Projects */}
            <Link
              to="/manager/projects"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-800 bg-[#0F172A]/80 px-3.5 py-2 text-xs font-semibold text-blue-400 shadow-sm hover:bg-slate-800 hover:text-blue-300 transition"
            >
              <FolderKanban size={15} />
              <span>View All 6 Projects</span>
              <ArrowUpRight size={14} />
            </Link>
          </header>

          {/* Summary Cards Grid */}
          <section>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {initialSummaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className={`group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0F172A]/70 p-4 sm:p-5 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:shadow-blue-500/5 ${card.glow}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {card.title}
                        </p>
                        <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                          {card.value}
                        </p>
                      </div>

                      <div className={`rounded-xl p-2.5 ${card.color} transition-transform group-hover:scale-105`}>
                        <Icon size={20} />
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-500">
                      <span>{card.description}</span>
                      <span className="font-medium text-slate-400">{card.change}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Middle Row: Active Projects Progress & Velocity Insights */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Active Projects Progress (2 Columns) */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Project Progress Overview</h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Live delivery milestones across active project initiatives.
                  </p>
                </div>
                <Link
                  to="/manager/projects"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                >
                  Manage Projects
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {activeProjectsSnapshot.map((proj) => (
                  <div
                    key={proj.name}
                    className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 transition hover:bg-slate-900/80 hover:border-slate-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">{proj.name}</p>
                          <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700/60">
                            {proj.category}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {proj.completedTasks} of {proj.totalTasks} deliverables completed
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${proj.statusColor}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                          {proj.status}
                        </span>
                        <span className="text-xs font-extrabold text-slate-200 min-w-[38px] text-right">
                          {proj.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${proj.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sprint Velocity & Activity Insights (1 Column) */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Sprint 4 Velocity</h3>
                      <p className="text-[10px] text-slate-400">Oct 14 - Oct 28 cycle</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                    +18%
                  </span>
                </div>

                {/* Velocity Stats */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
                    <p className="text-[10px] font-medium text-slate-400">Points Done</p>
                    <p className="mt-1 text-xl font-extrabold text-white">34</p>
                    <p className="mt-0.5 text-[10px] text-emerald-400 font-semibold">of 42 points</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
                    <p className="text-[10px] font-medium text-slate-400">Days Remaining</p>
                    <p className="mt-1 text-xl font-extrabold text-white">6</p>
                    <p className="mt-0.5 text-[10px] text-blue-400 font-semibold">On Schedule</p>
                  </div>
                </div>

                {/* Collaborative Activity Feed */}
                <div className="mt-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Recent Collaborative Activity
                  </h4>
                  <div className="mt-2.5 space-y-2.5">
                    {recentActivityItems.map((act) => (
                      <div key={act.id} className="flex items-start gap-2 text-xs">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${act.color} text-[8px] font-bold text-white shadow-xs`}
                        >
                          {act.avatar}
                        </div>
                        <div className="min-w-0 flex-1 leading-snug">
                          <p className="text-slate-300 text-[11px]">
                            <span className="font-semibold text-white">{act.user}</span>{" "}
                            {act.action}{" "}
                            <span className="font-medium text-blue-400">{act.target}</span>
                          </p>
                          <span className="text-[10px] text-slate-500">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Tasks Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-sm shadow-sm">
            {/* Table Header Controls */}
            <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Tasks</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  A snapshot of your team's latest deliverables and assignments.
                </p>
              </div>

              {/* Status Filter Pills for tasks */}
              <div className="flex flex-wrap items-center gap-1.5">
                {["All", "In Progress", "Completed", "Pending"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setTaskStatusFilter(status)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      taskStatusFilter === status
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/60 text-[10px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Task</th>
                    <th className="px-5 py-3 font-semibold">Assignee</th>
                    <th className="px-5 py-3 font-semibold">Due Date</th>
                    <th className="px-5 py-3 font-semibold">Priority</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-850">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="transition hover:bg-slate-900/50">
                        {/* Task Title & Project */}
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-200">{task.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">{task.project}</p>
                        </td>

                        {/* Assignee */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr ${task.assigneeColor} text-[9px] font-bold text-white shadow-xs`}
                            >
                              {task.assignee.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-300">{task.assignee}</p>
                              <p className="text-[10px] text-slate-500">{task.assigneeRole}</p>
                            </div>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-500" />
                            <span>{task.dueDate}</span>
                          </div>
                        </td>

                        {/* Priority Badge */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                              priorityStyles[task.priority] || priorityStyles.Medium
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                            {task.priority}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                              statusStyles[task.status] || statusStyles["In Progress"]
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-500">
                        No tasks match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 text-xs text-slate-400">
              <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
              <button
                type="button"
                onClick={() => setTaskStatusFilter("All")}
                className="font-medium text-blue-400 hover:text-blue-300 transition text-[11px]"
              >
                Reset task filter
              </button>
            </div>
          </section>

          {/* Team Overview & Workload Allocation */}
          <section className="rounded-2xl border border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20">
                  <Users size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">Team Overview</h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Manage assignments and keep track of team member workload capacity.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                  Total Active Capacity: 78%
                </span>
              </div>
            </div>

            {/* Team Members Cards */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {teamMembersData.map((member) => (
                <div
                  key={member.name}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 transition-all hover:bg-slate-900/80 hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${member.color} font-bold text-white text-xs shadow-xs`}
                      >
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs leading-tight">{member.name}</p>
                        <p className="text-[10px] text-slate-400">{member.role}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      {member.status}
                    </span>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Workload Capacity</span>
                    <span className="font-bold text-slate-200">{member.capacity}%</span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        member.capacity > 90
                          ? "bg-rose-500"
                          : member.capacity > 70
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${member.capacity}%` }}
                    ></div>
                  </div>

                  <p className="mt-3 text-[11px] text-slate-400 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <span>Assigned deliverables</span>
                    <span className="font-bold text-slate-200">{member.tasks} tasks</span>
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Local Modal: Quick Create Task */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCreateTaskModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0F172A] p-5 sm:p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Create New Task</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Assign a deliverable to your team member.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement drag-and-drop kanban"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Project</label>
                <select
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="WorkSync Web App">WorkSync Web App</option>
                  <option value="Mobile Companion App">Mobile Companion App</option>
                  <option value="Real-Time Sync Engine">Real-Time Sync Engine</option>
                  <option value="Team Management">Team Management</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Assignee</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Devanshi">Devanshi (Manager)</option>
                    <option value="Ayan">Ayan (Admin)</option>
                    <option value="Rouhan">Rouhan (Employee)</option>
                    <option value="Jarir">Jarir (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Due Date</label>
                <input
                  type="text"
                  placeholder="e.g. Oct 30, 2026"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="rounded-xl border border-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:from-blue-500 hover:to-indigo-500"
                >
                  <Plus size={14} />
                  <span>Add Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
