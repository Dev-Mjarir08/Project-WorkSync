import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ListTodo,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  List,
  FolderKanban,
  User,
  ArrowRight,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import { initialProjects } from "./ProjectsPage.jsx";

// Initial tasks compiled from the existing project catalog and board datasets
export const initialManagerTasks = [
  {
    id: "task-1",
    title: "Implement WebSocket connection and live presence sync",
    project: "WorkSync Web App",
    projectId: "proj-1",
    boardId: "board-1",
    status: "Completed",
    priority: "High",
    assignee: "Ayan Mukherjee",
    assigneeRole: "Fullstack Admin",
    assigneeAvatar: "AM",
    assigneeColor: "from-cyan-500 to-blue-600",
    dueDate: "Oct 18, 2026",
  },
  {
    id: "task-2",
    title: "Design light theme SaaS workspace layout and card tokens",
    project: "WorkSync Web App",
    projectId: "proj-1",
    boardId: "board-1",
    status: "Completed",
    priority: "Medium",
    assignee: "Priya Patel",
    assigneeRole: "UI Designer",
    assigneeAvatar: "PP",
    assigneeColor: "from-violet-500 to-purple-600",
    dueDate: "Oct 20, 2026",
  },
  {
    id: "task-3",
    title: "Build Kanban board column state and status transition handlers",
    project: "WorkSync Web App",
    projectId: "proj-1",
    boardId: "board-1",
    status: "In Progress",
    priority: "High",
    assignee: "Rouhan Siddiqui",
    assigneeRole: "Frontend Dev",
    assigneeAvatar: "RS",
    assigneeColor: "from-emerald-500 to-teal-600",
    dueDate: "Oct 28, 2026",
  },
  {
    id: "task-4",
    title: "Configure role-based access control and manager route guards",
    project: "WorkSync Web App",
    projectId: "proj-1",
    boardId: "board-1",
    status: "In Progress",
    priority: "High",
    assignee: "Devanshi Sharma",
    assigneeRole: "Engineering Manager",
    assigneeAvatar: "DS",
    assigneeColor: "from-blue-600 to-indigo-600",
    dueDate: "Oct 30, 2026",
  },
  {
    id: "task-5",
    title: "Audit client-side bundle size and verify Vite code splitting",
    project: "Mobile Companion App",
    projectId: "proj-2",
    boardId: "board-2",
    status: "In Review",
    priority: "Low",
    assignee: "Ayan Mukherjee",
    assigneeRole: "Fullstack Admin",
    assigneeAvatar: "AM",
    assigneeColor: "from-cyan-500 to-blue-600",
    dueDate: "Nov 02, 2026",
  },
  {
    id: "task-6",
    title: "Write integration tests for sprint burn-down calculations",
    project: "WorkSync Web App",
    projectId: "proj-1",
    boardId: "board-1",
    status: "To Do",
    priority: "Medium",
    assignee: "Rouhan Siddiqui",
    assigneeRole: "Frontend Dev",
    assigneeAvatar: "RS",
    assigneeColor: "from-emerald-500 to-teal-600",
    dueDate: "Nov 08, 2026",
  },
  {
    id: "task-7",
    title: "Deploy staging environment and configure automated CI pipeline",
    project: "Real-Time Sync Engine",
    projectId: "proj-3",
    boardId: "board-3",
    status: "To Do",
    priority: "High",
    assignee: "Devanshi Sharma",
    assigneeRole: "Engineering Manager",
    assigneeAvatar: "DS",
    assigneeColor: "from-blue-600 to-indigo-600",
    dueDate: "Nov 12, 2026",
  },
  {
    id: "task-8",
    title: "Mobile viewport regression tests and touch target verification",
    project: "Mobile Companion App",
    projectId: "proj-2",
    boardId: "board-2",
    status: "To Do",
    priority: "Medium",
    assignee: "Vikram Malhotra",
    assigneeRole: "Mobile Engineer",
    assigneeAvatar: "VM",
    assigneeColor: "from-amber-500 to-orange-600",
    dueDate: "Nov 14, 2026",
  },
  {
    id: "task-9",
    title: "SOC2 Type II compliance audit checklist verification",
    project: "Enterprise Security Audit",
    projectId: "proj-4",
    boardId: "board-4",
    status: "Completed",
    priority: "High",
    assignee: "Devanshi Sharma",
    assigneeRole: "Engineering Manager",
    assigneeAvatar: "DS",
    assigneeColor: "from-blue-600 to-indigo-600",
    dueDate: "Oct 15, 2026",
  },
  {
    id: "task-10",
    title: "Setup client onboarding template repository",
    project: "Client Onboarding Portal",
    projectId: "proj-5",
    boardId: "board-5",
    status: "To Do",
    priority: "Medium",
    assignee: "Rouhan Siddiqui",
    assigneeRole: "Frontend Dev",
    assigneeAvatar: "RS",
    assigneeColor: "from-emerald-500 to-teal-600",
    dueDate: "Jan 10, 2027",
  },
  {
    id: "task-11",
    title: "Executive velocity graphs and burn-down reporting export",
    project: "Analytics & Reporting Hub",
    projectId: "proj-6",
    boardId: "board-6",
    status: "In Progress",
    priority: "Medium",
    assignee: "Neha Verma",
    assigneeRole: "Data Analyst",
    assigneeAvatar: "NV",
    assigneeColor: "from-violet-500 to-fuchsia-600",
    dueDate: "Nov 28, 2026",
  },
];

const priorityStyles = {
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusStyles = {
  "To Do": "bg-slate-100 text-slate-700 border-slate-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  "In Review": "bg-purple-50 text-purple-700 border-purple-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const TasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(initialManagerTasks);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    projectId: "proj-1",
    assignee: "Devanshi Sharma",
    priority: "High",
    status: "To Do",
    dueDate: "Nov 20, 2026",
  });

  // Extract distinct assignees and projects
  const distinctProjects = useMemo(() => {
    return initialProjects.map((p) => ({ id: p.id, name: p.name }));
  }, []);

  const distinctAssignees = useMemo(() => {
    const list = new Set();
    initialManagerTasks.forEach((t) => list.add(t.assignee));
    return Array.from(list);
  }, []);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter ||
        (statusFilter === "Completed" && (task.status === "Completed" || task.status === "Done"));

      const matchesProject =
        projectFilter === "All" || task.projectId === projectFilter || task.project === projectFilter;

      const matchesAssignee =
        assigneeFilter === "All" || task.assignee === assigneeFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesProject && matchesAssignee && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, projectFilter, assigneeFilter, priorityFilter]);

  // Dynamic summary stats
  const summaryStats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const inReview = tasks.filter((t) => t.status === "In Review").length;
    const completed = tasks.filter((t) => t.status === "Completed" || t.status === "Done").length;
    const highPriority = tasks.filter((t) => t.priority === "High").length;
    return { total, inProgress, inReview, completed, highPriority };
  }, [tasks]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setProjectFilter("All");
    setAssigneeFilter("All");
    setPriorityFilter("All");
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (selectedTaskDetails && selectedTaskDetails.id === taskId) {
      setSelectedTaskDetails((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const proj = initialProjects.find((p) => p.id === newTask.projectId) || initialProjects[0];

    const assigneeColors = {
      "Devanshi Sharma": "from-blue-600 to-indigo-600",
      "Ayan Mukherjee": "from-cyan-500 to-blue-600",
      "Rouhan Siddiqui": "from-emerald-500 to-teal-600",
      "Priya Patel": "from-violet-500 to-purple-600",
      "Vikram Malhotra": "from-amber-500 to-orange-600",
      "Neha Verma": "from-violet-500 to-fuchsia-600",
    };

    const assigneeRoles = {
      "Devanshi Sharma": "Engineering Manager",
      "Ayan Mukherjee": "Fullstack Admin",
      "Rouhan Siddiqui": "Frontend Dev",
      "Priya Patel": "UI Designer",
      "Vikram Malhotra": "Mobile Engineer",
      "Neha Verma": "Data Analyst",
    };

    const initials = newTask.assignee
      .split(" ")
      .map((w) => w[0])
      .join("");

    const created = {
      id: `task-${Date.now()}`,
      title: newTask.title.trim(),
      project: proj.name,
      projectId: proj.id,
      boardId: proj.boardId || "board-1",
      status: newTask.status,
      priority: newTask.priority,
      assignee: newTask.assignee,
      assigneeRole: assigneeRoles[newTask.assignee] || "Team Member",
      assigneeAvatar: initials || "TM",
      assigneeColor: assigneeColors[newTask.assignee] || "from-slate-600 to-slate-800",
      dueDate: newTask.dueDate || "Nov 25, 2026",
    };

    setTasks([created, ...tasks]);
    setNewTask({
      title: "",
      projectId: "proj-1",
      assignee: "Devanshi Sharma",
      priority: "High",
      status: "To Do",
      dueDate: "Nov 20, 2026",
    });
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Scroll-Fixed Sidebar */}
      <Sidebar activeItem="tasks" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile Trigger & Breadcrumbs */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                aria-label="Open mobile navigation menu"
              >
                <Menu size={18} />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">WorkSync</span>
                <ChevronRight size={13} className="text-slate-400" />
                <span>Manager</span>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="font-medium text-blue-600">Tasks</span>
              </div>
            </div>

            {/* Right: Create Task Action */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98]"
              >
                <Plus size={14} />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Title & Intro */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Tasks
                </h1>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/80">
                  {tasks.length} Total
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                View, organize, and track tasks across your projects.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "table"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="List view"
              >
                <List size={14} />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "grid"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Cards view"
              >
                <LayoutGrid size={14} />
                <span>Grid</span>
              </button>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Tasks
                  </p>
                  <p className="mt-1.5 text-2xl font-extrabold text-slate-900">{summaryStats.total}</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600 border border-blue-100">
                  <ListTodo size={18} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    In Progress
                  </p>
                  <p className="mt-1.5 text-2xl font-extrabold text-slate-900">{summaryStats.inProgress}</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600 border border-blue-100">
                  <Clock3 size={18} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    In Review
                  </p>
                  <p className="mt-1.5 text-2xl font-extrabold text-slate-900">{summaryStats.inReview}</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-2 text-purple-600 border border-purple-100">
                  <AlertCircle size={18} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Completed
                  </p>
                  <p className="mt-1.5 text-2xl font-extrabold text-slate-900">{summaryStats.completed}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 border border-emerald-100">
                  <CheckCircle2 size={18} />
                </div>
              </div>
            </div>
          </section>

          {/* Search & Filters Controls */}
          <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search tasks, projects, assignees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="All">All Statuses</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                </select>

                {/* Project Dropdown */}
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 max-w-[180px] truncate"
                >
                  <option value="All">All Projects</option>
                  {distinctProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {/* Assignee Dropdown */}
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="All">All Assignees</option>
                  {distinctAssignees.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>

                {/* Priority Dropdown */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Active Filters Bar */}
            {(searchQuery || statusFilter !== "All" || projectFilter !== "All" || assigneeFilter !== "All" || priorityFilter !== "All") && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-2">
                  <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
                  {searchQuery && (
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700 border border-blue-200">
                      Query: "{searchQuery}"
                    </span>
                  )}
                  {statusFilter !== "All" && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 border border-slate-200">
                      Status: {statusFilter}
                    </span>
                  )}
                  {projectFilter !== "All" && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 border border-slate-200">
                      Project
                    </span>
                  )}
                  {assigneeFilter !== "All" && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 border border-slate-200">
                      Assignee: {assigneeFilter}
                    </span>
                  )}
                  {priorityFilter !== "All" && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 border border-slate-200">
                      Priority: {priorityFilter}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-medium text-blue-600 hover:text-blue-700 text-[11px] transition"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          {/* Tasks Display */}
          {filteredTasks.length > 0 ? (
            viewMode === "table" ? (
              /* List / Table Layout */
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                <div className="overflow-x-auto [scrollbar-width:thin]">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Task</th>
                        <th className="py-3 px-4 font-semibold">Project</th>
                        <th className="py-3 px-4 font-semibold">Assignee</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Priority</th>
                        <th className="py-3 px-4 font-semibold">Due Date</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-slate-50/70 transition cursor-pointer"
                          onClick={() => setSelectedTaskDetails(task)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 hover:text-blue-600 transition">
                              {task.title}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              to={`/manager/projects/${task.projectId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200/80 transition"
                            >
                              <FolderKanban size={11} className="text-slate-400" />
                              <span className="truncate max-w-[140px]">{task.project}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr ${task.assigneeColor} text-[9px] font-bold text-white shadow-xs`}
                              >
                                {task.assigneeAvatar}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 leading-tight">{task.assignee}</p>
                                <p className="text-[10px] text-slate-400">{task.assigneeRole}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={task.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold cursor-pointer focus:outline-none ${
                                statusStyles[task.status] || statusStyles["To Do"]
                              }`}
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="In Review">In Review</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                                priorityStyles[task.priority] || priorityStyles.Medium
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-slate-400" />
                              <span>{task.dueDate}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskDetails(task);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                              title="View Task Details"
                            >
                              <ArrowRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid / Card Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskDetails(task)}
                    className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Top: Project & Priority */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 truncate max-w-[160px]">
                          {task.project}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.2 text-[9px] font-semibold ${
                            priorityStyles[task.priority] || priorityStyles.Medium
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                        {task.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                      {/* Assignee & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr ${task.assigneeColor} text-[9px] font-bold text-white shadow-xs`}
                          >
                            {task.assigneeAvatar}
                          </div>
                          <span className="text-xs font-medium text-slate-700">{task.assignee}</span>
                        </div>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            statusStyles[task.status] || statusStyles["To Do"]
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      {/* Due date */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{task.dueDate}</span>
                        </div>
                        <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          <span>Details</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <ListTodo size={24} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">No tasks found</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
                We couldn't find any tasks matching your active search and filter parameters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Task Details */}
      {selectedTaskDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSelectedTaskDetails(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl z-10 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                  {selectedTaskDetails.project}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {selectedTaskDetails.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskDetails(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Assignee</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr ${selectedTaskDetails.assigneeColor} text-[9px] font-bold text-white shadow-xs`}
                  >
                    {selectedTaskDetails.assigneeAvatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{selectedTaskDetails.assignee}</p>
                    <p className="text-[10px] text-slate-500">{selectedTaskDetails.assigneeRole}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Due Date</span>
                <div className="flex items-center gap-1.5 mt-2 font-medium text-slate-700">
                  <Calendar size={14} className="text-slate-400" />
                  <span>{selectedTaskDetails.dueDate}</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Priority</span>
                <div className="mt-1.5">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      priorityStyles[selectedTaskDetails.priority] || priorityStyles.Medium
                    }`}
                  >
                    {selectedTaskDetails.priority}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Status</span>
                <div className="mt-1.5">
                  <select
                    value={selectedTaskDetails.status}
                    onChange={(e) => handleStatusChange(selectedTaskDetails.id, e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Link
                to={`/manager/boards/${selectedTaskDetails.boardId}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                <span>Open in Kanban Board</span>
                <ExternalLink size={13} />
              </Link>

              <button
                type="button"
                onClick={() => setSelectedTaskDetails(null)}
                className="rounded-xl bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Task */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Create Task</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement user permission schema"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Project</label>
                <select
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  {distinctProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Assignee</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    {distinctAssignees.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Due Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 20, 2026"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
