import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FolderKanban,
  ArrowLeft,
  Calendar,
  Clock3,
  CheckCircle2,
  Users,
  Plus,
  Edit3,
  Kanban,
  AlertCircle,
  Search,
  Filter,
  Check,
  X,
  Menu,
  ChevronRight,
  Sparkles,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import { initialProjects } from "./ProjectsPage.jsx";

const initialProjectTasks = [
  {
    id: "task-101",
    title: "Implement WebSocket connection and live presence sync",
    status: "Completed",
    priority: "High",
    assignee: "Ayan Mukherjee",
    assigneeAvatar: "AM",
    assigneeRole: "Fullstack Admin",
    assigneeColor: "from-cyan-500 to-blue-600",
    dueDate: "Oct 18, 2026",
  },
  {
    id: "task-102",
    title: "Design dark theme SaaS workspace layout and card tokens",
    status: "Completed",
    priority: "Medium",
    assignee: "Priya Patel",
    assigneeAvatar: "PP",
    assigneeRole: "UI Designer",
    assigneeColor: "from-violet-500 to-purple-600",
    dueDate: "Oct 20, 2026",
  },
  {
    id: "task-103",
    title: "Build Kanban board column state and status transition handlers",
    status: "In Progress",
    priority: "High",
    assignee: "Rouhan Siddiqui",
    assigneeAvatar: "RS",
    assigneeRole: "Frontend Dev",
    assigneeColor: "from-emerald-500 to-teal-600",
    dueDate: "Oct 28, 2026",
  },
  {
    id: "task-104",
    title: "Configure role-based access control and manager route guards",
    status: "In Progress",
    priority: "High",
    assignee: "Devanshi Sharma",
    assigneeAvatar: "DS",
    assigneeRole: "Engineering Manager",
    assigneeColor: "from-blue-600 to-indigo-600",
    dueDate: "Oct 30, 2026",
  },
  {
    id: "task-105",
    title: "Audit client-side bundle size and verify Vite code splitting",
    status: "In Review",
    priority: "Low",
    assignee: "Ayan Mukherjee",
    assigneeAvatar: "AM",
    assigneeRole: "Fullstack Admin",
    assigneeColor: "from-cyan-500 to-blue-600",
    dueDate: "Nov 02, 2026",
  },
  {
    id: "task-106",
    title: "Write integration tests for sprint burn-down calculations",
    status: "To Do",
    priority: "Medium",
    assignee: "Rouhan Siddiqui",
    assigneeAvatar: "RS",
    assigneeRole: "Frontend Dev",
    assigneeColor: "from-emerald-500 to-teal-600",
    dueDate: "Nov 08, 2026",
  },
  {
    id: "task-107",
    title: "Deploy staging environment and configure automated CI pipeline",
    status: "To Do",
    priority: "High",
    assignee: "Devanshi Sharma",
    assigneeAvatar: "DS",
    assigneeRole: "Engineering Manager",
    assigneeColor: "from-blue-600 to-indigo-600",
    dueDate: "Nov 12, 2026",
  },
];

const priorityStyles = {
  High: "bg-rose-500/10 text-rose-400 border-rose-500/25",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  Low: "bg-slate-500/10 text-slate-400 border-slate-500/25",
};

const statusStyles = {
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  Completed: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  "On Hold": "bg-amber-500/10 text-amber-400 border-amber-500/25",
  "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/25",
  "To Do": "bg-slate-500/10 text-slate-400 border-slate-500/25",
  "In Review": "bg-purple-500/10 text-purple-400 border-purple-500/25",
  Done: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
};

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Look up project or fallback to first project or default template
  const matchedProject = useMemo(() => {
    const found = initialProjects.find((p) => p.id === projectId);
    if (found) return found;
    return {
      id: projectId || "proj-custom",
      name: `Project ${projectId ? `(${projectId})` : "Overview"}`,
      description:
        "Comprehensive workspace initiative tracking agile sprint deliverables, cross-functional engineering tasks, and team member assignments.",
      status: "Active",
      category: "Core Platform",
      priority: "High",
      progress: 68,
      totalTasks: 20,
      completedTasks: 14,
      deadline: "Nov 15, 2026",
      boardId: "board-1",
      team: [
        { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
        { name: "Ayan Mukherjee", role: "Fullstack Admin", avatar: "AM", color: "from-cyan-500 to-blue-600" },
        { name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
        { name: "Priya Patel", role: "UI Designer", avatar: "PP", color: "from-violet-500 to-purple-600" },
      ],
    };
  }, [projectId]);

  // Project state (allows local editing)
  const [project, setProject] = useState(matchedProject);
  const [tasks, setTasks] = useState(initialProjectTasks);
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    deadline: project.deadline,
    category: project.category,
  });

  // Add task form state
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    priority: "High",
    assignee: "Ayan Mukherjee",
    status: "To Do",
    dueDate: "Nov 10, 2026",
  });

  // Dynamic Task Stats
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed" || t.status === "Done").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const inReview = tasks.filter((t) => t.status === "In Review").length;
    const todo = tasks.filter((t) => t.status === "To Do").length;
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, inReview, todo, progressPct };
  }, [tasks]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        taskSearchQuery.trim() === "" ||
        task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(taskSearchQuery.toLowerCase());

      const matchesStatus =
        taskStatusFilter === "All" ||
        task.status === taskStatusFilter ||
        (taskStatusFilter === "Completed" && (task.status === "Completed" || task.status === "Done"));

      return matchesSearch && matchesStatus;
    });
  }, [tasks, taskSearchQuery, taskStatusFilter]);

  // Handlers
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setProject((prev) => ({
      ...prev,
      name: editFormData.name,
      description: editFormData.description,
      status: editFormData.status,
      priority: editFormData.priority,
      deadline: editFormData.deadline,
      category: editFormData.category,
    }));
    setShowEditModal(false);
  };

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTaskData.title.trim()) return;

    const assigneeColors = {
      "Devanshi Sharma": "from-blue-600 to-indigo-600",
      "Ayan Mukherjee": "from-cyan-500 to-blue-600",
      "Rouhan Siddiqui": "from-emerald-500 to-teal-600",
      "Priya Patel": "from-violet-500 to-purple-600",
    };

    const assigneeRoles = {
      "Devanshi Sharma": "Engineering Manager",
      "Ayan Mukherjee": "Fullstack Admin",
      "Rouhan Siddiqui": "Frontend Dev",
      "Priya Patel": "UI Designer",
    };

    const initials = newTaskData.assignee
      .split(" ")
      .map((w) => w[0])
      .join("");

    const createdTask = {
      id: `task-${Date.now()}`,
      title: newTaskData.title.trim(),
      status: newTaskData.status,
      priority: newTaskData.priority,
      assignee: newTaskData.assignee,
      assigneeAvatar: initials || "TM",
      assigneeRole: assigneeRoles[newTaskData.assignee] || "Member",
      assigneeColor: assigneeColors[newTaskData.assignee] || "from-slate-600 to-slate-800",
      dueDate: newTaskData.dueDate || "Nov 15, 2026",
    };

    setTasks([createdTask, ...tasks]);
    setNewTaskData({
      title: "",
      priority: "High",
      assignee: "Ayan Mukherjee",
      status: "To Do",
      dueDate: "Nov 10, 2026",
    });
    setShowAddTaskModal(false);
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    );
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Scroll-Fixed Sidebar */}
      <Sidebar activeItem="projects" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Viewport */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#0B1120]/80 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
                aria-label="Open mobile navigation menu"
              >
                <Menu size={18} />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link
                  to="/manager/projects"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition"
                >
                  <ArrowLeft size={14} />
                  <span>Projects</span>
                </Link>
                <ChevronRight size={13} className="text-slate-600" />
                <span className="font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                  {project.name}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <Link
                to={`/manager/boards/${project.boardId || "board-1"}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-850 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition shadow-sm"
              >
                <Kanban size={14} className="text-cyan-400" />
                <span className="hidden sm:inline">Open Kanban Board</span>
                <span className="sm:hidden">Board</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setEditFormData({
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    priority: project.priority,
                    deadline: project.deadline,
                    category: project.category,
                  });
                  setShowEditModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddTaskModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Details Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Project Hero Header Card */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0F172A]/80 p-5 sm:p-6 backdrop-blur-sm shadow-xl shadow-black/10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="space-y-3 flex-1">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 tracking-wider uppercase border border-slate-700/60">
                    {project.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      statusStyles[project.status] || statusStyles.Active
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                    {project.status}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                      priorityStyles[project.priority] || priorityStyles.Medium
                    }`}
                  >
                    {project.priority} Priority
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {project.name}
                  </h1>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Progress & Target Widget */}
              <div className="w-full lg:w-72 shrink-0 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Sprint Completion</span>
                  <span className="text-base font-bold text-white">{taskStats.progressPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${taskStats.progressPct}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-500" />
                    Due {project.deadline}
                  </span>
                  <span className="text-emerald-400 font-medium">
                    {taskStats.completed}/{taskStats.total} Tasks
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Metrics & Team Members Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Quick Task Status Metrics */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="rounded-xl border border-slate-800/80 bg-[#0F172A]/60 p-3.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Tasks
                </p>
                <p className="mt-1 text-2xl font-extrabold text-white">{taskStats.total}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Across sprint cycle</p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-[#0F172A]/60 p-3.5">
                <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                  In Progress
                </p>
                <p className="mt-1 text-2xl font-extrabold text-blue-400">{taskStats.inProgress}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Under active work</p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-[#0F172A]/60 p-3.5">
                <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                  In Review
                </p>
                <p className="mt-1 text-2xl font-extrabold text-purple-400">{taskStats.inReview}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Pending signoff</p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-[#0F172A]/60 p-3.5">
                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                  Completed
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-400">{taskStats.completed}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Verified & delivered</p>
              </div>
            </div>

            {/* Team Members Card */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#0F172A]/70 p-4 backdrop-blur-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-blue-400" />
                  <h3 className="text-xs font-semibold text-white">Assigned Team ({project.team.length})</h3>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {project.team.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between rounded-xl bg-slate-900/50 p-2 border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr ${member.color} text-[10px] font-bold text-white shadow-xs`}
                      >
                        {member.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-200 leading-tight">{member.name}</p>
                        <p className="text-[10px] text-slate-400">{member.role}</p>
                      </div>
                    </div>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Tasks Section */}
          <section className="rounded-2xl border border-slate-800/80 bg-[#0F172A]/80 p-5 backdrop-blur-sm space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Project Tasks</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage deliverables, update statuses, or transition to the Kanban board.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Search */}
                <div className="relative w-48 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={taskSearchQuery}
                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-1 pl-8 pr-7 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  {taskSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTaskSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800">
                  {["All", "In Progress", "To Do", "In Review", "Completed"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setTaskStatusFilter(status)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                        taskStatusFilter === status
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Items List */}
            {filteredTasks.length > 0 ? (
              <div className="space-y-2.5">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 hover:border-slate-700 hover:bg-slate-900/80 transition"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr ${task.assigneeColor} text-[10px] font-bold text-white shadow-xs`}
                      >
                        {task.assigneeAvatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200 leading-snug">
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>{task.assignee}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-500" />
                            {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      {/* Priority */}
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          priorityStyles[task.priority] || priorityStyles.Medium
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Status Selector Dropdown */}
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                        className={`rounded-xl border px-2.5 py-1 text-xs font-medium focus:outline-none bg-slate-900 ${
                          statusStyles[task.status] || statusStyles["To Do"]
                        }`}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="In Review">In Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400">No tasks found matching this criteria.</p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Modal: Edit Project */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Edit Project Details</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Project Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Priority</label>
                  <select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Target Deadline</label>
                <input
                  type="text"
                  value={editFormData.deadline}
                  onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowAddTaskModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Task to {project.name}</h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Write API integration tests"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Assignee</label>
                  <select
                    value={newTaskData.assignee}
                    onChange={(e) => setNewTaskData({ ...newTaskData, assignee: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    {project.team.map((member) => (
                      <option key={member.name} value={member.name}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Priority</label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Initial Status</label>
                  <select
                    value={newTaskData.status}
                    onChange={(e) => setNewTaskData({ ...newTaskData, status: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Due Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 15, 2026"
                    value={newTaskData.dueDate}
                    onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="rounded-xl border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
