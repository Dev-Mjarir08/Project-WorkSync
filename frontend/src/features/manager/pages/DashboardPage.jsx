import React, { useState, useMemo } from "react";
import {
  ClipboardList,
  Clock3,
  CircleCheck,
  AlertCircle,
  Plus,
  Users,
  ArrowUpRight,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Kanban,
  UserPlus,
  BarChart3,
  TrendingUp,
  Activity,
  Bell,
  Search,
  Calendar,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Filter,
} from "lucide-react";
import ProjectsPage from "./ProjectsPage.jsx";

// Initial Summary Data preserving original values
const initialSummaryCards = [
  {
    title: "Total Tasks",
    value: 24,
    description: "Tasks across your projects",
    change: "+4 this sprint",
    icon: ClipboardList,
    accent: "blue",
    color: "bg-blue-50 text-blue-600 ring-1 ring-blue-500/20",
    glow: "hover:border-blue-200/80 hover:shadow-blue-500/5",
  },
  {
    title: "In Progress",
    value: 8,
    description: "Currently being worked on",
    change: "33% of active workload",
    icon: Clock3,
    accent: "amber",
    color: "bg-amber-50 text-amber-600 ring-1 ring-amber-500/20",
    glow: "hover:border-amber-200/80 hover:shadow-amber-500/5",
  },
  {
    title: "Completed",
    value: 12,
    description: "Tasks completed",
    change: "50% milestone rate",
    icon: CircleCheck,
    accent: "emerald",
    color: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20",
    glow: "hover:border-emerald-200/80 hover:shadow-emerald-500/5",
  },
  {
    title: "Overdue",
    value: 4,
    description: "Need your attention",
    change: "Immediate priority",
    icon: AlertCircle,
    accent: "rose",
    color: "bg-rose-50 text-rose-600 ring-1 ring-rose-500/20",
    glow: "hover:border-rose-200/80 hover:shadow-rose-500/5",
  },
];

// Preserving original sample tasks
const initialTasks = [
  {
    id: 1,
    title: "Design login page",
    project: "WorkSync Web App",
    assignee: "Ayan",
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

// Preserving original team members with enhanced workload tracking
const teamMembersData = [
  {
    name: "Devanshi",
    fullName: "Devanshi Sharma",
    role: "Manager",
    tasks: 8,
    capacity: 80,
    avatar: "DS",
    color: "from-indigo-500 to-purple-600",
    status: "Online",
  },
  {
    name: "Ayan",
    fullName: "Ayan Mukherjee",
    role: "Admin",
    tasks: 6,
    capacity: 60,
    avatar: "AM",
    color: "from-blue-500 to-cyan-600",
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

// Active Projects Overview summary
const activeProjectsSnapshot = [
  {
    name: "WorkSync Web App",
    category: "Core Platform",
    progress: 72,
    totalTasks: 25,
    completedTasks: 18,
    status: "On Track",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },
  {
    name: "Mobile Companion App",
    category: "Mobile",
    progress: 45,
    totalTasks: 20,
    completedTasks: 9,
    status: "In Progress",
    statusColor: "bg-blue-50 text-blue-700 border-blue-200/80",
  },
  {
    name: "Real-Time Sync Engine",
    category: "Infrastructure",
    progress: 85,
    totalTasks: 14,
    completedTasks: 12,
    status: "Near Completion",
    statusColor: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
  },
  {
    name: "Client Onboarding Portal",
    category: "Product",
    progress: 30,
    totalTasks: 10,
    completedTasks: 3,
    status: "On Hold",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200/80",
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
    color: "from-blue-500 to-cyan-600",
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
    action: "assigned 2 new tasks in",
    target: "WorkSync Web App",
    status: null,
    time: "4h ago",
    avatar: "DS",
    color: "from-indigo-500 to-purple-600",
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
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200/80",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  Pending: "bg-amber-50 text-amber-700 border-amber-200/80",
};

const priorityStyles = {
  High: "bg-rose-50 text-rose-700 border-rose-200/80",
  Medium: "bg-amber-50 text-amber-700 border-amber-200/80",
  Low: "bg-slate-100 text-slate-600 border-slate-200/80",
};

const navSections = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, viewKey: "dashboard", active: true },
      { name: "Projects", icon: FolderKanban, viewKey: "projects", badge: "6" },
      { name: "Task Management", icon: ListTodo, viewKey: "tasks", badge: "24" },
      { name: "Kanban Boards", icon: Kanban, viewKey: "boards" },
    ],
  },
  {
    title: "TEAM & WORKLOAD",
    items: [
      { name: "Team Members", icon: Users, viewKey: "team", badge: "3" },
      { name: "Assignments", icon: UserPlus, viewKey: "assignments" },
      { name: "Team Workload", icon: BarChart3, viewKey: "workload" },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { name: "Reports & Analytics", icon: TrendingUp, viewKey: "reports" },
      { name: "Activity", icon: Activity, viewKey: "activity" },
      { name: "Notifications", icon: Bell, viewKey: "notifications", badge: "3" },
    ],
  },
];

const sampleNotifications = [
  { id: 1, text: "Ayan updated 'Design login page' to In Progress", time: "15m ago", unread: true },
  { id: 2, text: "Rouhan completed 'Set up workspace'", time: "2h ago", unread: true },
  { id: 3, text: "Review task assignments pending approval", time: "5h ago", unread: false },
];

const DashboardPage = () => {
  // Allow seamless switching between Dashboard and Projects without modifying external routes
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash === "#projects" || window.location.pathname.endsWith("/projects")) {
        return "projects";
      }
    }
    return "dashboard";
  });

  const [tasks, setTasks] = useState(initialTasks);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationList, setNotificationList] = useState(sampleNotifications);

  // Form state for Create Task Modal (local safe state)
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
      Devanshi: "from-indigo-500 to-purple-600",
      Ayan: "from-blue-500 to-cyan-600",
      Rouhan: "from-emerald-500 to-teal-600",
    };

    const created = {
      id: Date.now(),
      title: newTask.title.trim(),
      project: newTask.project,
      assignee: newTask.assignee,
      assigneeRole: newTask.assignee === "Devanshi" ? "Manager" : newTask.assignee === "Ayan" ? "Admin" : "Employee",
      assigneeColor: assigneeColors[newTask.assignee] || "from-slate-500 to-slate-700",
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

  const handleNavClick = (viewKey) => {
    setMobileMenuOpen(false);
    if (viewKey === "projects") {
      setActiveView("projects");
      if (typeof window !== "undefined") {
        window.location.hash = "#projects";
      }
    } else if (viewKey === "dashboard") {
      setActiveView("dashboard");
      if (typeof window !== "undefined") {
        window.location.hash = "#dashboard";
      }
    }
  };

  // If user switches to projects view, render the full ProjectsPage
  if (activeView === "projects") {
    return <ProjectsPage onNavigate={(view) => setActiveView(view)} />;
  }

  // Sidebar contents
  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
      <div>
        {/* Brand Logo & Workspace Tag */}
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/30">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">WorkSync</span>
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">Manager Workspace</p>
          </div>
        </div>

        {/* Workspace Sprint Status Card */}
        <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Sprint 4 Active</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 ring-1 ring-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              On Track
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" style={{ width: "74%" }}></div>
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
            <span>Velocity: 34 pts</span>
            <span>74% done</span>
          </div>
        </div>

        {/* Navigation Section List */}
        <nav className="mt-6 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {section.title}
              </p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.viewKey === "dashboard";

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleNavClick(item.viewKey)}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-500/25"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-200/80 text-slate-600 group-hover:bg-slate-300/80"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Profile & Account Section */}
      <div className="pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between rounded-xl p-2 transition hover:bg-slate-100/70">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold text-white shadow-sm">
                DS
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900 leading-tight">Devanshi Sharma</p>
              <p className="text-xs text-slate-500">Engineering Manager</p>
            </div>
          </div>
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
            Admin
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white flex">
      {/* Persistent Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col fixed inset-y-0 left-0 z-30 border-r border-slate-200/80 bg-white/90 backdrop-blur-xl">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu backdrop"
          />
          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <span className="text-sm font-semibold text-slate-700">Workspace Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderSidebarContent()}</div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile trigger & Breadcrumbs */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-200/80 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Open mobile navigation menu"
              >
                <Menu size={20} />
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-medium text-slate-700">WorkSync</span>
                <ChevronRight size={14} className="text-slate-400" />
                <span>Manager</span>
                <ChevronRight size={14} className="text-slate-400" />
                <span className="font-semibold text-indigo-600">Dashboard</span>
              </div>
            </div>

            {/* Right: Search, Notifications, Avatar, Create Task */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Search bar */}
              <div className="relative hidden md:block w-64 lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search tasks, members... (⌘K)"
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {taskSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setTaskSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
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
                  className="relative rounded-xl border border-slate-200/80 p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  aria-label="View notifications"
                >
                  <Bell size={18} />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl ring-1 ring-black/5 z-40">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setNotificationList(notificationList.map((n) => ({ ...n, unread: false })))
                        }
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto">
                      {notificationList.map((notif) => (
                        <div
                          key={notif.id}
                          className={`rounded-xl p-2.5 text-xs transition ${
                            notif.unread ? "bg-indigo-50/60 text-slate-800" : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          <p className="font-medium leading-relaxed">{notif.text}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar */}
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200 sm:border-transparent">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold text-white text-xs shadow-sm">
                  DS
                </div>
              </div>

              {/* Create Task Button */}
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Welcome Banner */}
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Manager Workspace
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, Devanshi!
              </h1>

              <p className="mt-1.5 text-sm text-slate-500">
                Here is an overview of your team and project progress.
              </p>
            </div>

            {/* Quick Link to Projects */}
            <button
              type="button"
              onClick={() => handleNavClick("projects")}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-xs hover:bg-indigo-100 transition"
            >
              <FolderKanban size={15} />
              <span>View All 6 Projects</span>
              <ArrowUpRight size={14} />
            </button>
          </header>

          {/* Summary Cards Grid (Total Tasks, In Progress, Completed, Overdue) */}
          <section>
            <div className="mb-3.5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Task Performance Overview</h2>
                <p className="text-xs text-slate-500">A quick look at your task progress.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {initialSummaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${card.glow}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {card.title}
                        </p>
                        <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                          {card.value}
                        </p>
                      </div>

                      <div className={`rounded-xl p-3 ${card.color} transition-transform group-hover:scale-105`}>
                        <Icon size={22} />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <span>{card.description}</span>
                      <span className="font-semibold text-slate-700">{card.change}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Middle Row: Active Projects Progress & Velocity Insights */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Projects Progress (2 Columns) */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Project Progress Overview</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Live delivery milestones across active project initiatives.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavClick("projects")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                >
                  Manage Projects
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {activeProjectsSnapshot.map((proj) => (
                  <div
                    key={proj.name}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50 hover:border-slate-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{proj.name}</p>
                          <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {proj.category}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {proj.completedTasks} of {proj.totalTasks} deliverables completed
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${proj.statusColor}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                          {proj.status}
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 min-w-[38px] text-right">
                          {proj.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                        style={{ width: `${proj.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sprint Velocity & Activity Insights (1 Column) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Sprint 4 Velocity</h3>
                      <p className="text-[11px] text-slate-500">Sprint cycle Oct 14 - Oct 28</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/20">
                    +18%
                  </span>
                </div>

                {/* Velocity Stats */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                    <p className="text-[11px] font-medium text-slate-500">Points Done</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">34</p>
                    <p className="mt-0.5 text-[10px] text-emerald-600 font-semibold">of 42 points</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                    <p className="text-[11px] font-medium text-slate-500">Days Remaining</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">6</p>
                    <p className="mt-0.5 text-[10px] text-indigo-600 font-semibold">On Schedule</p>
                  </div>
                </div>

                {/* Collaborative Activity Feed */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recent Collaborative Activity
                  </h4>
                  <div className="mt-3 space-y-3">
                    {recentActivityItems.map((act) => (
                      <div key={act.id} className="flex items-start gap-2.5 text-xs">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${act.color} text-[9px] font-bold text-white shadow-xs`}
                        >
                          {act.avatar}
                        </div>
                        <div className="min-w-0 flex-1 leading-snug">
                          <p className="text-slate-700">
                            <span className="font-semibold text-slate-900">{act.user}</span>{" "}
                            {act.action}{" "}
                            <span className="font-medium text-indigo-600">{act.target}</span>
                          </p>
                          <span className="text-[10px] text-slate-400">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Tasks Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
            {/* Table Header Controls */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Tasks</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  A snapshot of your team's latest work.
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
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Task</th>
                    <th className="px-5 py-3.5 font-semibold">Assignee</th>
                    <th className="px-5 py-3.5 font-semibold">Due Date</th>
                    <th className="px-5 py-3.5 font-semibold">Priority</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="transition hover:bg-slate-50/70">
                        {/* Task Title & Project */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">{task.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{task.project}</p>
                        </td>

                        {/* Assignee */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr ${task.assigneeColor} text-[10px] font-bold text-white shadow-xs`}
                            >
                              {task.assignee.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{task.assignee}</p>
                              <p className="text-[10px] text-slate-400">{task.assigneeRole}</p>
                            </div>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-5 py-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{task.dueDate}</span>
                          </div>
                        </td>

                        {/* Priority Badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                              priorityStyles[task.priority] || priorityStyles.Medium
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                            {task.priority}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
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
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
              <button
                type="button"
                onClick={() => setTaskStatusFilter("All")}
                className="font-medium text-indigo-600 hover:text-indigo-800 transition"
              >
                Reset task filter
              </button>
            </div>
          </section>

          {/* Team Overview & Workload Allocation */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 ring-1 ring-indigo-500/20">
                  <Users size={22} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">Team Overview</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Manage assignments and keep track of team progress.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Total Active Capacity: 78%
                </span>
              </div>
            </div>

            {/* Team Members Cards */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {teamMembersData.map((member) => (
                <div
                  key={member.name}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-white hover:border-slate-200 hover:shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${member.color} font-bold text-white text-xs shadow-xs`}
                      >
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{member.name}</p>
                        <p className="text-[11px] text-slate-500">{member.role}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {member.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Workload Capacity</span>
                    <span className="font-extrabold text-slate-800">{member.capacity}%</span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        member.capacity > 90
                          ? "bg-rose-500"
                          : member.capacity > 70
                          ? "bg-indigo-600"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${member.capacity}%` }}
                    ></div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span>Assigned tasks</span>
                    <span className="font-bold text-slate-900">{member.tasks} tasks</span>
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCreateTaskModal(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Task</h3>
                <p className="text-xs text-slate-500">Assign a deliverable to your team member.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement drag-and-drop kanban"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Project</label>
                <select
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="WorkSync Web App">WorkSync Web App</option>
                  <option value="Mobile Companion App">Mobile Companion App</option>
                  <option value="Real-Time Sync Engine">Real-Time Sync Engine</option>
                  <option value="Team Management">Team Management</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Assignee</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Devanshi">Devanshi (Manager)</option>
                    <option value="Ayan">Ayan (Admin)</option>
                    <option value="Rouhan">Rouhan (Employee)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Due Date</label>
                <input
                  type="text"
                  placeholder="e.g. Oct 30, 2026"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus size={15} />
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
