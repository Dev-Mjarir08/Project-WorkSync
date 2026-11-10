import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  Plus,
  Edit3,
  Kanban,
  Search,
  X,
  Menu,
  ChevronRight,
  FolderKanban,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import managerService from "../managerService.js";

const statusLabels = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived",
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  done: "Completed",
};

const statusValues = {
  Planning: "planning",
  Active: "active",
  "On Hold": "on_hold",
  Completed: "completed",
  Archived: "archived",
};

const taskStatusValues = {
  "To Do": "todo",
  "In Progress": "in_progress",
  "In Review": "review",
  Completed: "done",
};

const formatDate = (date) => date
  ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })
  : "Not set";

const toProjectView = (project) => ({
  ...project,
  id: project.id || project._id,
  status: statusLabels[project.status] || project.status || "Planning",
  priority: project.priority
    ? `${project.priority[0].toUpperCase()}${project.priority.slice(1)}`
    : "Medium",
  category: project.key || "Project",
  deadline: formatDate(project.dueDate),
  team: (project.members || []).map((member) => ({
    ...member,
    avatar: member.avatar || member.name?.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?",
    role: member.role || "Member",
    color: "from-blue-600 to-indigo-600",
  })),
});

const toTaskView = (task) => {
  const assignee = task.assignee;
  const assigneeName = typeof assignee === "string" ? assignee : assignee?.name || "Unassigned";
  return {
    ...task,
    id: task.id || task._id,
    status: statusLabels[task.status] || task.status || "To Do",
    priority: task.priority
      ? `${task.priority[0].toUpperCase()}${task.priority.slice(1)}`
      : "Medium",
    assigneeId: assignee?.id || assignee?._id || "",
    assignee: assigneeName,
    assigneeAvatar: assignee?.avatar || assigneeName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?",
    assigneeRole: assignee?.role || "Member",
    assigneeColor: "from-blue-600 to-indigo-600",
    dueDate: formatDate(task.dueDate),
  };
};

const priorityStyles = {
  Urgent: "bg-rose-100 text-rose-800 border-rose-300",
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusStyles = {
  Planning: "bg-slate-100 text-slate-700 border-slate-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed: "bg-blue-50 text-blue-700 border-blue-200",
  "On Hold": "bg-amber-50 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  "To Do": "bg-slate-100 text-slate-700 border-slate-200",
  "In Review": "bg-purple-50 text-purple-700 border-purple-200",
  Done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Archived: "bg-slate-100 text-slate-600 border-slate-200",
};

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    priority: "Medium",
    deadline: "",
    category: "",
  });

  // Add task form state
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    priority: "High",
    assigneeId: "",
    status: "To Do",
    dueDate: "",
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setProject(null);
    if (!projectId) {
      setError("A project ID is required.");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    Promise.all([
      managerService.getProject(projectId),
      managerService.getTasks({ projectId }),
      managerService.getProjectBoards(projectId),
    ])
      .then(([projectData, taskData, boardData]) => {
        if (!active) return;
        const mappedProject = toProjectView(projectData);
        setProject(mappedProject);
        setTasks(taskData.map(toTaskView));
        setBoards(boardData);
        setEditFormData({
          name: mappedProject.name || "",
          description: mappedProject.description || "",
          status: mappedProject.status,
          priority: mappedProject.priority,
          deadline: projectData.dueDate ? new Date(projectData.dueDate).toISOString().slice(0, 10) : "",
          category: mappedProject.category,
        });
        setNewTaskData((current) => ({
          ...current,
          assigneeId: mappedProject.team[0]?.id || "",
        }));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load project details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  // Calculate clean overview metrics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed" || t.status === "Done").length;
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, progressPct };
  }, [tasks]);

  // Filter tasks
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
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const updated = await managerService.updateProject(projectId, {
        name: editFormData.name,
        description: editFormData.description,
        key: editFormData.category,
        status: statusValues[editFormData.status],
        priority: editFormData.priority.toLowerCase(),
        dueDate: editFormData.deadline || null,
      });
      setProject((current) => toProjectView({ ...current, ...updated }));
      setShowEditModal(false);
    } catch (requestError) {
      setError(requestError.message || "Unable to update project.");
    }
  };

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskData.title.trim()) return;
    setError("");
    try {
      const created = await managerService.createTask({
        title: newTaskData.title.trim(),
        projectId,
        ...(boards[0]?.id ? { boardId: boards[0].id } : {}),
        ...(newTaskData.assigneeId ? { assigneeId: newTaskData.assigneeId } : {}),
        status: taskStatusValues[newTaskData.status],
        priority: newTaskData.priority.toLowerCase(),
        ...(newTaskData.dueDate ? { dueDate: newTaskData.dueDate } : {}),
      });
      setTasks((current) => [toTaskView(created), ...current]);
      setNewTaskData({
        title: "",
        priority: "High",
        assigneeId: project.team[0]?.id || "",
        status: "To Do",
        dueDate: "",
      });
      setShowAddTaskModal(false);
    } catch (requestError) {
      setError(requestError.message || "Unable to create task.");
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    setError("");
    try {
      await managerService.updateTaskStatus(taskId, taskStatusValues[newStatus]);
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to update task status.");
    }
  };

  if (loading || error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
        <Sidebar activeItem="projects" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
        <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
          <Header setMobileOpen={setMobileMenuOpen} breadcrumbs={[{ label: "Projects", href: "/manager/projects" }, { label: project?.name || "Project Details" }]} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {loading ? (
              <p role="status" className="text-sm text-slate-500">Loading project details...</p>
            ) : (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error || "Project details are unavailable."}
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Scroll-Fixed Sidebar */}
      <Sidebar activeItem="projects" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Viewport */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Unified Default Header */}
        <Header
          setMobileOpen={setMobileMenuOpen}
          breadcrumbs={[
            { label: "Projects", href: "/manager/projects" },
            { label: project.name },
          ]}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {error && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Back link */}
          <div>
            <Link
              to="/manager/projects"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
            >
              <ArrowLeft size={13} />
              <span>Back to Projects</span>
            </Link>
          </div>

          {/* Project Title & Status Header with Project Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {project.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    statusStyles[project.status] || statusStyles.Active
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  {project.status}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Project Specific Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {boards[0]?.id && (
                <Link
                  to={`/manager/boards/${boards[0].id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
                >
                  <Kanban size={14} className="text-blue-600" />
                  <span className="hidden sm:inline">Kanban Board</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setEditFormData({
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    priority: project.priority,
                    deadline: project.dueDate ? new Date(project.dueDate).toISOString().slice(0, 10) : "",
                    category: project.category,
                  });
                  setShowEditModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddTaskModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Project Overview: Simple Equal-Sized Metric Cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Progress</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{taskStats.progressPct}%</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${taskStats.progressPct}%` }}
                ></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Total Tasks</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{taskStats.total}</p>
              <p className="mt-1 text-[11px] text-slate-400">In this project</p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Completed Tasks</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{taskStats.completed}</p>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">Delivered</p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Target Deadline</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{project.deadline}</p>
              <p className="mt-1 text-[11px] text-slate-400">Sprint cycle</p>
            </div>
          </section>

          {/* Two-Column Layout: Primary Tasks + Secondary Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Main Content: Tasks List (2 Columns) */}
            <div className="lg:col-span-2 space-y-4">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
                {/* Tasks Header & Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">Tasks</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[11px] font-semibold text-slate-600">
                      {filteredTasks.length}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {/* Search */}
                    <div className="relative w-full sm:w-44">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={taskSearchQuery}
                        onChange={(e) => setTaskSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-1 pl-7 pr-6 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                      {taskSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setTaskSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-1">
                      {["All", "In Progress", "To Do", "In Review", "Completed"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setTaskStatusFilter(status)}
                          className={`rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                            taskStatusFilter === status
                              ? "bg-slate-100 text-slate-900 font-semibold"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tasks List */}
                {filteredTasks.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/70 rounded-xl px-2.5 transition"
                      >
                        <div className="flex items-start sm:items-center gap-2.5">
                          <div>
                            <p className="text-xs font-semibold text-slate-800 leading-snug">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span>{task.assignee}</span>
                              <span>•</span>
                              <span>Due {task.dueDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* Priority */}
                          <span
                            className={`rounded-full border px-2 py-0.2 text-[10px] font-medium ${
                              priorityStyles[task.priority] || priorityStyles.Medium
                            }`}
                          >
                            {task.priority}
                          </span>

                          {/* Status Dropdown */}
                          <select
                            value={task.status}
                            onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                            className={`rounded-lg border px-2 py-0.5 text-[11px] font-medium focus:outline-none bg-white cursor-pointer ${
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
                  <div className="py-8 text-center text-xs text-slate-400">
                    {tasks.length === 0
                      ? "No tasks have been added to this project."
                      : "No tasks found matching your filter."}
                  </div>
                )}
              </section>
            </div>

            {/* Secondary Panel: Project Info & Team Members (1 Column) */}
            <div className="lg:col-span-1 space-y-4">
              {/* Project Info Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Project Details
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Category</span>
                    <span className="font-medium text-slate-800">{project.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Priority</span>
                    <span className="font-medium text-slate-800">{project.priority}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Deadline</span>
                    <span className="font-medium text-slate-800">{project.deadline}</span>
                  </div>
                  {boards[0]?.id && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Board</span>
                      <Link
                        to={`/manager/boards/${boards[0].id}`}
                        className="font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {boards[0].name} →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Members Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Team Members ({project.team.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {project.team.map((member) => (
                    <div key={member.name} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr ${member.color} text-[9px] font-bold text-white shrink-0`}
                      >
                        {member.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-800 truncate">{member.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal: Edit Project */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit Project Details</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              {error && (
                <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Project Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Priority</label>
                  <select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Project Key</label>
                  <input
                    type="text"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Deadline</label>
                  <input
                    type="date"
                    value={editFormData.deadline}
                    onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setShowAddTaskModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Project Task</h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-3.5">
              {error && (
                <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit dependencies"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Assignee</label>
                  <select
                    value={newTaskData.assigneeId}
                    onChange={(e) => setNewTaskData({ ...newTaskData, assigneeId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {project.team.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Priority</label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Status</label>
                  <select
                    value={newTaskData.status}
                    onChange={(e) => setNewTaskData({ ...newTaskData, status: e.target.value })}
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
                    type="date"
                    value={newTaskData.dueDate}
                    onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
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
