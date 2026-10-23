import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Search,
  Plus,
  FolderPlus,
  Clock3,
  AlertCircle,
  Calendar,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  Bell,
  ArrowRight,
  Kanban,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";

// Standard realistic project catalog
export const initialProjects = [
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
    boardId: "board-1",
    team: [
      { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
      { name: "Ayan Mukherjee", role: "Fullstack Admin", avatar: "AM", color: "from-cyan-500 to-blue-600" },
      { name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
      { name: "Priya Patel", role: "UI Designer", avatar: "PP", color: "from-violet-500 to-purple-600" },
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
    boardId: "board-2",
    team: [
      { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
      { name: "Ayan Mukherjee", role: "Fullstack Admin", avatar: "AM", color: "from-cyan-500 to-blue-600" },
      { name: "Vikram Malhotra", role: "Mobile Engineer", avatar: "VM", color: "from-amber-500 to-orange-600" },
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
    boardId: "board-3",
    team: [
      { name: "Ayan Mukherjee", role: "Fullstack Admin", avatar: "AM", color: "from-cyan-500 to-blue-600" },
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
    boardId: "board-4",
    team: [
      { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
      { name: "Ayan Mukherjee", role: "Fullstack Admin", avatar: "AM", color: "from-cyan-500 to-blue-600" },
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
    boardId: "board-5",
    team: [
      { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
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
    boardId: "board-6",
    team: [
      { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
      { name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
      { name: "Neha Verma", role: "Data Analyst", avatar: "NV", color: "from-violet-500 to-fuchsia-600" },
    ],
  },
];

const priorityStyles = {
  High: {
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/25",
    dot: "bg-rose-400",
  },
  Medium: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    dot: "bg-amber-400",
  },
  Low: {
    badge: "bg-slate-500/10 text-slate-400 border-slate-500/25",
    dot: "bg-slate-400",
  },
};

const statusStyles = {
  Active: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-400",
    bar: "bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400",
  },
  Completed: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/25",
    dot: "bg-blue-400",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
  },
  "On Hold": {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    dot: "bg-amber-400",
    bar: "bg-gradient-to-r from-amber-500 to-orange-400",
  },
};

const sampleNotifications = [
  { id: 1, text: "Ayan updated 'Design login page' to In Progress", time: "15m ago", unread: true },
  { id: 2, text: "Rouhan completed 'Set up workspace'", time: "2h ago", unread: true },
  { id: 3, text: "Security audit milestone achieved 100%", time: "5h ago", unread: false },
];

const ProjectsPage = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationList, setNotificationList] = useState(sampleNotifications);

  // Form state for Create Project modal
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    category: "Core Platform",
    priority: "Medium",
    deadline: "",
    totalTasks: 10,
  });

  // Calculate dynamic summary stats
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

      const matchesStatus = selectedStatus === "All" || project.status === selectedStatus;
      const matchesPriority = selectedPriority === "All" || project.priority === selectedPriority;

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
      boardId: `board-${Date.now()}`,
      team: [
        { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
        { name: "Ayan Mukherjee", role: "Fullstack Admin", avatar: "AM", color: "from-cyan-500 to-blue-600" },
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

  const handleCardClick = (projectId) => {
    navigate(`/manager/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Scroll-Fixed Sidebar Component */}
      <Sidebar activeItem="projects" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#0B1120]/80 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile Trigger & Breadcrumbs */}
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
                <span className="font-medium text-blue-400">Projects</span>
              </div>
            </div>

            {/* Right: Search, Notifications & Create Project CTA */}
            <div className="flex items-center gap-3">
              {/* Quick Search */}
              <div className="relative hidden md:block w-64 lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="Quick search... (⌘K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-1.5 pl-9 pr-8 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-slate-300"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 focus:outline-none"
                  aria-label="Notifications"
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
                        Mark all read
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

              {/* Create Project Button */}
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 active:scale-[0.98]"
              >
                <FolderPlus size={15} />
                <span>New Project</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Title & Intro */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Projects Portfolio
                </h1>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                  {projects.length} Total
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Track ongoing deliverables, monitor sprint velocities, and drill down into project tasks and kanban boards.
              </p>
            </div>
          </div>

          {/* Compact Summary Cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Total Projects */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0F172A]/70 p-4 sm:p-5 backdrop-blur-sm transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-blue-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Total Projects
                  </p>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {summaryStats.total}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Across manager portfolio</p>
                </div>
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20">
                  <FolderKanban size={20} />
                </div>
              </div>
            </div>

            {/* Active Projects */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0F172A]/70 p-4 sm:p-5 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Active Projects
                  </p>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {summaryStats.active}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-400/80 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    In sprint delivery
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20">
                  <Clock3 size={20} />
                </div>
              </div>
            </div>

            {/* Completed Projects */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0F172A]/70 p-4 sm:p-5 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Completed
                  </p>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {summaryStats.completed}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">100% milestone met</p>
                </div>
                <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/20">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            {/* On Hold Projects */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0F172A]/70 p-4 sm:p-5 backdrop-blur-sm transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    On Hold
                  </p>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {summaryStats.onHold}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Pending scope review</p>
                </div>
                <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/20">
                  <AlertCircle size={20} />
                </div>
              </div>
            </div>
          </section>

          {/* Search, Filter Tabs & Controls */}
          <section className="rounded-2xl border border-slate-800/80 bg-[#0F172A]/70 p-4 backdrop-blur-sm space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
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
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/30"
                          : "bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Priority Selector & Search input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-1.5 pl-8 pr-7 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-500 hidden sm:block" />
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 py-1.5 px-3 text-xs font-medium text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Bar if any filter is set */}
            {(searchQuery || selectedStatus !== "All" || selectedPriority !== "All") && (
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs text-slate-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span>Showing {filteredProjects.length} of {projects.length} projects</span>
                  {searchQuery && (
                    <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-400 border border-blue-500/20">
                      Query: "{searchQuery}"
                    </span>
                  )}
                  {selectedStatus !== "All" && (
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700">
                      Status: {selectedStatus}
                    </span>
                  )}
                  {selectedPriority !== "All" && (
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700">
                      Priority: {selectedPriority}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-medium text-blue-400 hover:text-blue-300 transition text-[11px]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          {/* Project Cards Grid */}
          {filteredProjects.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const statusStyle = statusStyles[project.status] || statusStyles.Active;
                const priorityStyle = priorityStyles[project.priority] || priorityStyles.Medium;

                return (
                  <div
                    key={project.id}
                    onClick={() => handleCardClick(project.id)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0F172A]/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer backdrop-blur-sm"
                  >
                    <div>
                      {/* Card Header: Category & Status / Priority */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold text-slate-300 tracking-wider uppercase border border-slate-700/60">
                          {project.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Priority Pill */}
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityStyle.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`}></span>
                            {project.priority}
                          </span>

                          {/* Status Pill */}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusStyle.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}></span>
                            {project.status}
                          </span>
                        </div>
                      </div>

                      {/* Project Name & Description */}
                      <div className="mt-3.5">
                        <h2 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                          {project.name}
                        </h2>
                        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      {/* Progress Bar & Stats */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-400 text-[11px]">Sprint Progress</span>
                          <span className="font-bold text-slate-200">{project.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${statusStyle.bar}`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Task Counts Summary */}
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900/60 border border-slate-800/80 p-2.5 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          <span>
                            {project.completedTasks} / {project.totalTasks} Tasks
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">
                          {project.totalTasks - project.completedTasks} remaining
                        </span>
                      </div>
                    </div>

                    {/* Card Footer: Deadline, Team Avatars & View Details Link */}
                    <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                      {/* Deadline */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar size={13} className="text-slate-500" />
                        <span>{project.deadline}</span>
                      </div>

                      {/* Team Avatars & Hover Link */}
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {project.team.slice(0, 3).map((member) => (
                            <div
                              key={member.name}
                              title={`${member.name} (${member.role})`}
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr ${member.color} text-[9px] font-bold text-white ring-2 ring-[#0F172A]`}
                            >
                              {member.avatar}
                            </div>
                          ))}
                        </div>
                        <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5 duration-200">
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-[#0F172A]/50 p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <FolderKanban size={26} />
              </div>
              <h3 className="mt-3.5 text-sm font-bold text-white">No projects found</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-400 leading-relaxed">
                We couldn't find any projects matching your search term or filter criteria.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Local Modal: Create Project */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0F172A] p-5 sm:p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Create New Project</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Add an initiative to your manager workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design System 2.0"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of goals and deliverables..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Category</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
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
                  <label className="block text-[11px] font-semibold text-slate-300">Priority</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Deadline</label>
                  <input
                    type="text"
                    placeholder="e.g. Dec 20, 2026"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Estimated Tasks</label>
                  <input
                    type="number"
                    min="1"
                    value={newProject.totalTasks}
                    onChange={(e) => setNewProject({ ...newProject, totalTasks: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:from-blue-500 hover:to-indigo-500"
                >
                  <Plus size={14} />
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
