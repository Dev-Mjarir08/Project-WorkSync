import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Kanban,
  Users,
  UserPlus,
  BarChart3,
  TrendingUp,
  Activity,
  Bell,
  Search,
  Plus,
  FolderPlus,
  Clock3,
  AlertCircle,
  CircleCheck,
  Calendar,
  Menu,
  X,
  Sparkles,
  SlidersHorizontal,
  Layers,
  CheckCircle2,
  ChevronRight,
  Filter,
} from "lucide-react";

// Initial realistic project data for Manager Workspace
const initialProjects = [
  {
    id: "proj-1",
    name: "WorkSync Web App",
    description:
      "Next-generation collaborative workspace suite featuring real-time task boards, live presence, and team workload analytics.",
    status: "Active",
    category: "Core Platform",
    priority: "High",
    progress: 72,
    totalTasks: 25,
    completedTasks: 18,
    deadline: "Nov 12, 2026",
    team: [
      { name: "Devanshi Sharma", role: "Manager", avatar: "DS", color: "from-indigo-500 to-purple-600" },
      { name: "Ayan Mukherjee", role: "Admin", avatar: "AM", color: "from-blue-500 to-cyan-600" },
      { name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
      { name: "Priya Patel", role: "UI Designer", avatar: "PP", color: "from-pink-500 to-rose-600" },
    ],
  },
  {
    id: "proj-2",
    name: "Mobile Companion App",
    description:
      "Cross-platform iOS and Android app for on-the-go sprint updates, instant task assignment notifications, and offline sync.",
    status: "Active",
    category: "Mobile",
    priority: "High",
    progress: 45,
    totalTasks: 20,
    completedTasks: 9,
    deadline: "Dec 05, 2026",
    team: [
      { name: "Devanshi Sharma", role: "Manager", avatar: "DS", color: "from-indigo-500 to-purple-600" },
      { name: "Ayan Mukherjee", role: "Admin", avatar: "AM", color: "from-blue-500 to-cyan-600" },
      { name: "Vikram Malhotra", role: "React Native Dev", avatar: "VM", color: "from-amber-500 to-orange-600" },
    ],
  },
  {
    id: "proj-3",
    name: "Real-Time Sync Engine",
    description:
      "Low-latency WebSocket event mesh ensuring sub-50ms synchronization across concurrent board edits and cursor presence.",
    status: "Active",
    category: "Infrastructure",
    priority: "Medium",
    progress: 85,
    totalTasks: 14,
    completedTasks: 12,
    deadline: "Oct 30, 2026",
    team: [
      { name: "Ayan Mukherjee", role: "Admin", avatar: "AM", color: "from-blue-500 to-cyan-600" },
      { name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
    ],
  },
  {
    id: "proj-4",
    name: "Enterprise Security Audit",
    description:
      "SOC2 Type II compliance audit, role-based access policy enforcement, and automated token invalidation protocols.",
    status: "Completed",
    category: "Security",
    priority: "High",
    progress: 100,
    totalTasks: 16,
    completedTasks: 16,
    deadline: "Oct 15, 2026",
    team: [
      { name: "Devanshi Sharma", role: "Manager", avatar: "DS", color: "from-indigo-500 to-purple-600" },
      { name: "Ayan Mukherjee", role: "Admin", avatar: "AM", color: "from-blue-500 to-cyan-600" },
    ],
  },
  {
    id: "proj-5",
    name: "Client Onboarding Portal",
    description:
      "Interactive customer setup flow, guided workspace tour templates, and automated invite provisioning for enterprise clients.",
    status: "On Hold",
    category: "Product",
    priority: "Medium",
    progress: 30,
    totalTasks: 10,
    completedTasks: 3,
    deadline: "Jan 10, 2027",
    team: [
      { name: "Devanshi Sharma", role: "Manager", avatar: "DS", color: "from-indigo-500 to-purple-600" },
      { name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
    ],
  },
  {
    id: "proj-6",
    name: "Analytics & Reporting Hub",
    description:
      "Executive velocity graphs, sprint burn-down projections, and custom CSV/PDF export generation for stakeholders.",
    status: "Active",
    category: "Analytics",
    priority: "Medium",
    progress: 60,
    totalTasks: 15,
    completedTasks: 9,
    deadline: "Nov 28, 2026",
    team: [
      { name: "Devanshi Sharma", role: "Manager", avatar: "DS", color: "from-indigo-500 to-purple-600" },
      { name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
      { name: "Neha Verma", role: "Data Analyst", avatar: "NV", color: "from-violet-500 to-fuchsia-600" },
    ],
  },
];

const navSections = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "#dashboard", badge: null },
      { name: "Projects", icon: FolderKanban, href: "#projects", active: true, badge: "6" },
      { name: "Task Management", icon: ListTodo, href: "#tasks", badge: "24" },
      { name: "Kanban Boards", icon: Kanban, href: "#boards" },
    ],
  },
  {
    title: "TEAM & WORKLOAD",
    items: [
      { name: "Team Members", icon: Users, href: "#team", badge: "3" },
      { name: "Assignments", icon: UserPlus, href: "#assignments" },
      { name: "Team Workload", icon: BarChart3, href: "#workload" },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { name: "Reports & Analytics", icon: TrendingUp, href: "#reports" },
      { name: "Activity", icon: Activity, href: "#activity" },
      { name: "Notifications", icon: Bell, href: "#notifications", badge: "3" },
    ],
  },
];

const sampleNotifications = [
  { id: 1, text: "Ayan updated 'Design login page' to In Progress", time: "15m ago", unread: true },
  { id: 2, text: "Rouhan completed 'Set up workspace'", time: "2h ago", unread: true },
  { id: 3, text: "Security audit milestone achieved 100%", time: "5h ago", unread: false },
];

const priorityConfig = {
  High: {
    bg: "bg-rose-50 text-rose-700 border-rose-200/80",
    dot: "bg-rose-500",
  },
  Medium: {
    bg: "bg-amber-50 text-amber-700 border-amber-200/80",
    dot: "bg-amber-500",
  },
  Low: {
    bg: "bg-slate-100 text-slate-700 border-slate-200/80",
    dot: "bg-slate-400",
  },
};

const statusConfig = {
  Active: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-500",
    bar: "bg-gradient-to-r from-blue-600 to-indigo-600",
  },
  Completed: {
    badge: "bg-blue-50 text-blue-700 border-blue-200/80",
    dot: "bg-blue-500",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
  },
  "On Hold": {
    badge: "bg-amber-50 text-amber-700 border-amber-200/80",
    dot: "bg-amber-500",
    bar: "bg-gradient-to-r from-amber-400 to-amber-500",
  },
};

const ProjectsPage = ({ onNavigate }) => {
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationList, setNotificationList] = useState(sampleNotifications);

  // Form state for local Create Project modal
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    category: "Core Platform",
    priority: "Medium",
    deadline: "",
    totalTasks: 10,
  });

  // Calculate dynamic summary stats based on current projects array
  const summaryStats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "Active").length;
    const completed = projects.filter((p) => p.status === "Completed").length;
    const onHold = projects.filter((p) => p.status === "On Hold").length;
    return { total, active, completed, onHold };
  }, [projects]);

  // Filter projects by search query, status, and priority
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" || project.status === selectedStatus;

      const matchesPriority =
        selectedPriority === "All" || project.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projects, searchQuery, selectedStatus, selectedPriority]);

  const handleCreateProjectSubmit = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    const created = {
      id: `proj-${Date.now()}`,
      name: newProject.name.trim(),
      description:
        newProject.description.trim() ||
        "Project created for team tracking and agile sprint delivery.",
      status: "Active",
      category: newProject.category || "General",
      priority: newProject.priority,
      progress: 0,
      totalTasks: Number(newProject.totalTasks) || 8,
      completedTasks: 0,
      deadline: newProject.deadline || "Dec 31, 2026",
      team: [
        { name: "Devanshi Sharma", role: "Manager", avatar: "DS", color: "from-indigo-500 to-purple-600" },
        { name: "Ayan Mukherjee", role: "Admin", avatar: "AM", color: "from-blue-500 to-cyan-600" },
      ],
    };

    setProjects([created, ...projects]);
    setNewProject({
      name: "",
      description: "",
      category: "Core Platform",
      priority: "Medium",
      deadline: "",
      totalTasks: 10,
    });
    setShowCreateModal(false);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedPriority("All");
  };

  const handleNavClick = (itemName) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      if (itemName === "Dashboard") {
        onNavigate("dashboard");
      } else if (itemName === "Projects") {
        onNavigate("projects");
      }
    }
  };

  // Reusable Sidebar content
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

        {/* Workspace Quick Status */}
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

        {/* Navigation Sections */}
        <nav className="mt-6 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {section.title}
              </p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.active;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleNavClick(item.name)}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive
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
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isActive
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
        {/* Top Header Bar */}
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
                <span className="font-semibold text-indigo-600">Projects</span>
              </div>
            </div>

            {/* Right: Search, Notifications, Profile & Primary CTA */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Search bar */}
              <div className="relative hidden md:block w-64 lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Quick search... (⌘K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Notification Bell with Dropdown */}
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
                          className={`rounded-xl p-2.5 text-xs transition ${notif.unread ? "bg-indigo-50/60 text-slate-800" : "bg-slate-50 text-slate-600"
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

              {/* Create Project Button */}
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-md active:scale-[0.98]"
              >
                <FolderPlus size={16} />
                <span>Create Project</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-7">
          {/* Page Title & Context Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  My Projects
                </h1>
                <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-500/20">
                  {projects.length} Total
                </span>
              </div>
              <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">
                Oversee all active and upcoming projects, monitor team velocity, and track delivery milestones across your workspace.
              </p>
            </div>
          </div>

          {/* Project Summary Cards (Calculated directly from local state) */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Total Projects */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200/80">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Projects
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                    {summaryStats.total}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Across manager portfolio</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600 ring-1 ring-blue-500/20 transition-transform group-hover:scale-105">
                  <FolderKanban size={22} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-blue-700">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                <span>All active workspaces</span>
              </div>
            </div>

            {/* Active Projects */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-200/80">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Active Projects
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                    {summaryStats.active}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Currently in sprint progress</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 ring-1 ring-emerald-500/20 transition-transform group-hover:scale-105">
                  <Clock3 size={22} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active sprint deliverables</span>
              </div>
            </div>

            {/* Completed Projects */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200/80">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Completed Projects
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                    {summaryStats.completed}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Successfully delivered</p>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 ring-1 ring-indigo-500/20 transition-transform group-hover:scale-105">
                  <CircleCheck size={22} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-indigo-700">
                <CheckCircle2 size={13} />
                <span>100% milestone verified</span>
              </div>
            </div>

            {/* On Hold Projects */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-200/80">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    On Hold Projects
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                    {summaryStats.onHold}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Pending review / scope</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600 ring-1 ring-amber-500/20 transition-transform group-hover:scale-105">
                  <AlertCircle size={22} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                <span>Review scheduled soon</span>
              </div>
            </div>
          </section>

          {/* Search, Filter Tabs & Controls */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "All", label: "All", count: summaryStats.total },
                  { key: "Active", label: "Active", count: summaryStats.active },
                  { key: "Completed", label: "Completed", count: summaryStats.completed },
                  { key: "On Hold", label: "On Hold", count: summaryStats.onHold },
                ].map((tab) => {
                  const isSelected = selectedStatus === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSelectedStatus(tab.key)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${isSelected
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                        }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                          }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Priority Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search field */}
                <div className="relative min-w-[240px] flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    placeholder="Search by project name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-2 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Priority Selector */}
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-400 hidden sm:block" />
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/80 py-2 px-3 text-xs font-medium text-slate-700 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Bar / Results Count */}
            {(searchQuery || selectedStatus !== "All" || selectedPriority !== "All") && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Showing {filteredProjects.length} of {projects.length} projects</span>
                  {searchQuery && (
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                      Query: "{searchQuery}"
                    </span>
                  )}
                  {selectedStatus !== "All" && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      Status: {selectedStatus}
                    </span>
                  )}
                  {selectedPriority !== "All" && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      Priority: {selectedPriority}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 transition"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>

          {/* Project Cards Grid */}
          {filteredProjects.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const statusStyle = statusConfig[project.status] || statusConfig.Active;
                const priorityStyle = priorityConfig[project.priority] || priorityConfig.Medium;

                return (
                  <div
                    key={project.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300/80"
                  >
                    <div>
                      {/* Card Top: Category, Priority, and Status Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 tracking-wide uppercase">
                          {project.category}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Priority badge */}
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${priorityStyle.bg}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`}></span>
                            {project.priority}
                          </span>

                          {/* Status badge */}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}></span>
                            {project.status}
                          </span>
                        </div>
                      </div>

                      {/* Project Name & Description */}
                      <div className="mt-4">
                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                          {project.name}
                        </h2>
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      {/* Progress Percentage & Visual Bar */}
                      <div className="mt-5 space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-500">Sprint Progress</span>
                          <span className="font-bold text-slate-800">{project.progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${statusStyle.bar}`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Task Counts */}
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50/80 p-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span>
                            {project.completedTasks} / {project.totalTasks} Tasks Completed
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {project.totalTasks - project.completedTasks} Remaining
                        </span>
                      </div>
                    </div>

                    {/* Card Footer: Deadline & Team Members */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      {/* Deadline */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        <span>Due {project.deadline}</span>
                      </div>

                      {/* Team Member Avatars Stack */}
                      <div className="flex items-center">
                        <div className="flex -space-x-2 overflow-hidden">
                          {project.team.slice(0, 3).map((member) => (
                            <div
                              key={member.name}
                              title={`${member.name} (${member.role})`}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr ${member.color} text-[10px] font-bold text-white ring-2 ring-white shadow-xs`}
                            >
                              {member.avatar}
                            </div>
                          ))}
                        </div>
                        {project.team.length > 3 && (
                          <span className="ml-1 text-[11px] font-medium text-slate-500">
                            +{project.team.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center shadow-xs">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/50">
                <FolderKanban size={32} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No matching projects found</h3>
              <p className="mt-1.5 max-w-sm text-xs text-slate-500 leading-relaxed">
                We couldn't find any projects matching your search term or filter criteria. Try resetting the filters to view all projects.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Local Modal: Create Project (Self-contained, no external navigation/APIs) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create New Project</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add an initiative to your manager workspace portfolio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile Design System 2.0"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of the goals and deliverables..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Core Platform">Core Platform</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Security">Security</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Target Deadline</label>
                  <input
                    type="text"
                    placeholder="e.g. Dec 20, 2026"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Estimated Total Tasks</label>
                  <input
                    type="number"
                    min="1"
                    value={newProject.totalTasks}
                    onChange={(e) => setNewProject({ ...newProject, totalTasks: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-blue-700"
                >
                  <Plus size={15} />
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
