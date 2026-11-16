import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ClipboardList,
  Clock3,
  CircleCheck,
  AlertCircle,
  Plus,
  Users,
  ArrowUpRight,
  TrendingUp,
  Search,
  Calendar,
  X,
  ChevronRight,
  FolderKanban,
  Kanban,
  CheckCircle2,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  BarChart2,
  Table,
  LayoutGrid,
  Lock
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import { getUserItem, setUserItem, getCurrentUser } from "../../../utils/userStorage.js";
import { managerService } from "../managerService.js";
import { useConfirm } from "../../../context/ConfirmContext.jsx";
import TopTaskTimelineKanban from "../../boards/components/TopTaskTimelineKanban.jsx";

const DASHBOARD_API_URL = "http://localhost:8081/api/v1/manager/dashboard";

const statusStyles = {
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "In Review": "bg-purple-50 text-purple-700 border-purple-200",
};

const priorityStyles = {
  Critical: "bg-rose-50 text-rose-700 border-rose-200",
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const normalizeStatus = (value) => {
  const status = String(value || "").toLowerCase().replace(/[\s-]+/g, "_");
  const knownStatuses = {
    todo: "Pending",
    pending: "Pending",
    in_progress: "In Progress",
    review: "In Review",
    in_review: "In Review",
    done: "Completed",
    completed: "Completed",
  };
  return knownStatuses[status] || "In Progress";
};

const normalizePriority = (value) => {
  const priority = String(value || "Medium").toLowerCase();
  if (priority.includes("high") || priority.includes("crit")) return "High";
  if (priority.includes("low")) return "Low";
  return "Medium";
};

const formatDate = (value) => {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getInitials = (name) =>
  String(name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase() || "U";

const getAssigneeGradient = (name) => {
  const gradients = [
    "from-blue-600 to-indigo-600",
    "from-cyan-500 to-blue-600",
    "from-purple-600 to-indigo-600",
    "from-emerald-600 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-indigo-600 to-purple-600"
  ];
  const str = String(name || "U");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

const getAssigneeName = (assignee) => {
  if (!assignee) return "Unassigned";
  if (typeof assignee === "string") return assignee;
  return assignee.name || assignee.email || "Unassigned";
};

const getProjectName = (project) => {
  if (!project) return "General Initiative";
  if (typeof project === "string") return project;
  return project.name || "General Initiative";
};

const normalizeTask = (t) => {
  const aName = getAssigneeName(t.assignee);
  const pName = getProjectName(t.project);
  return {
    ...t,
    id: t.id || t._id,
    _id: t._id || t.id,
    title: t.title || "Untitled Deliverable",
    project: pName,
    assignee: aName,
    assigneeColor: t.assigneeColor || getAssigneeGradient(aName),
    status: normalizeStatus(t.status),
    priority: normalizePriority(t.priority),
    dueDate: t.dueDate || null,
  };
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { user: authUser, token } = useSelector((state) => state.auth);
  const currentUser = authUser || getCurrentUser();
  const userName = currentUser?.name || "Manager";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");
  const [tasksViewMode, setTasksViewMode] = useState("kanban");
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  // Scoped Data Initialization - starts empty for new users
  const [projects, setProjects] = useState(() => getUserItem("manager_projects", []));
  const [tasks, setTasks] = useState(() => {
    const raw = getUserItem("manager_tasks", []);
    return Array.isArray(raw) ? raw.map(normalizeTask) : [];
  });
  const [teamMembersData, setTeamMembersData] = useState(() => getUserItem("manager_team", []));
  const [recentActivities, setRecentActivities] = useState(() => getUserItem("manager_activities", []));

  // Modal form state
  const [newTask, setNewTask] = useState({
    title: "",
    project: "",
    assignee: "",
    priority: "High",
    dueDate: "",
  });

  const loadLiveDashboard = useCallback(async () => {
    try {
      const [dashData, liveTasks, tm] = await Promise.all([
        managerService.getDashboard().catch(() => null),
        managerService.getTasks().catch(() => null),
        managerService.getTeamMembers().catch(() => null)
      ]);

      if (dashData?.myProjects && Array.isArray(dashData.myProjects)) {
        setProjects(dashData.myProjects);
        setUserItem("manager_projects", dashData.myProjects);
      }

      if (Array.isArray(liveTasks) && liveTasks.length > 0) {
        const norm = liveTasks.map(normalizeTask);
        setTasks(norm);
        setUserItem("manager_tasks", norm);
      } else if (dashData?.recentTasks && Array.isArray(dashData.recentTasks)) {
        const norm = dashData.recentTasks.map(normalizeTask);
        setTasks(norm);
        setUserItem("manager_tasks", norm);
      } else if (Array.isArray(liveTasks)) {
        setTasks([]);
        setUserItem("manager_tasks", []);
      }

      if (dashData?.recentActivities && Array.isArray(dashData.recentActivities)) {
        setRecentActivities(dashData.recentActivities);
        setUserItem("manager_activities", dashData.recentActivities);
      }

      if (Array.isArray(tm) && tm.length > 0) {
        setTeamMembersData(tm);
        setUserItem("manager_team", tm);
      }
    } catch (e) {
      console.error("Dashboard refresh error:", e);
    }
  }, []);

  const handleTaskMove = async (taskId, newStatus) => {
    const s = String(newStatus || '').toLowerCase();
    const isTargetDone = s.includes('done') || s.includes('complete');
    const current = tasks.find(t => (t.id === taskId || t._id === taskId));

    if (current && normalizeStatus(current.status) === "Completed") {
      return; // Locked! Cannot edit or move backwards
    }

    if (isTargetDone) {
      const isConfirmed = await confirm({
        title: "Complete Task",
        message: "Is this task completed? Once completed, this task will be locked and cannot be edited.",
        confirmText: "Yes, Complete",
        cancelText: "Cancel"
      });
      if (!isConfirmed) return;
    }

    setTasks((prev) => {
      const updated = prev.map((t) => ((t.id === taskId || t._id === taskId) ? { ...t, status: newStatus } : t));
      setUserItem("manager_tasks", updated);
      return updated;
    });
    try {
      await managerService.updateTaskStatus(taskId, newStatus);
    } catch (e) {}

    await loadLiveDashboard();
  };

  const handleTaskDelete = async (taskId, taskTitle) => {
    const isConfirmed = await confirm({
      title: "Delete Task",
      message: `Are you sure you want to permanently delete "${taskTitle || 'this task'}"? This action cannot be undone.`,
      confirmText: "Delete Task",
      cancelText: "Cancel",
      type: "danger"
    });
    if (!isConfirmed) return;

    try {
      await managerService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => (t.id || t._id) !== taskId));
    } catch (e) {}

    await loadLiveDashboard();
  };

  // Live Backend API Fetch with Graceful Local Fallback
  useEffect(() => {
    loadLiveDashboard();
  }, [token, loadLiveDashboard]);

  // Derived Metrics
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter((t) => normalizeStatus(t.status) === "In Progress").length;
    const completedTasks = tasks.filter((t) => normalizeStatus(t.status) === "Completed").length;
    const overdueTasks = tasks.filter((t) => {
      const isPast = t.dueDate && new Date(t.dueDate) < new Date();
      return isPast && normalizeStatus(t.status) !== "Completed";
    }).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalProjects = projects.length;

    return {
      totalTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      completionRate,
      totalProjects,
    };
  }, [tasks, projects]);

  // Filtered Tasks for table
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const q = taskSearchQuery.trim().toLowerCase();
      const taskAssignee = typeof task.assignee === 'string' ? task.assignee : (task.assignee?.name || task.assigneeName || '');
      const taskProj = typeof task.project === 'string' ? task.project : (task.project?.name || task.projectName || '');
      const matchesSearch =
        !q ||
        task.title?.toLowerCase().includes(q) ||
        taskProj.toLowerCase().includes(q) ||
        taskAssignee.toLowerCase().includes(q);

      const matchesStatus =
        taskStatusFilter === "All" || normalizeStatus(task.status) === taskStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, taskSearchQuery, taskStatusFilter]);

  // Handle Create Task Form Submit
  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const assigneeName = newTask.assignee || "Unassigned";
    const projectName = newTask.project || (projects[0]?.name || "General Initiative");

    try {
      const serverTask = await managerService.createTask({
        title: newTask.title.trim(),
        project: projectName,
        assignee: assigneeName,
        priority: (newTask.priority || 'medium').toLowerCase(),
        status: 'in_progress',
        dueDate: newTask.dueDate || null
      });

      const created = normalizeTask({
        id: serverTask.id || serverTask._id || ("task-" + Date.now()),
        _id: serverTask.id || serverTask._id,
        title: serverTask.title || newTask.title.trim(),
        project: projectName,
        assignee: assigneeName,
        priority: newTask.priority,
        status: "In Progress",
        dueDate: newTask.dueDate || null,
      });

      const updatedTasks = [created, ...tasks];
      setTasks(updatedTasks);
      setUserItem("manager_tasks", updatedTasks);
    } catch (err) {
      const created = normalizeTask({
        id: "task-" + Date.now(),
        title: newTask.title.trim(),
        project: projectName,
        assignee: assigneeName,
        priority: newTask.priority,
        status: "In Progress",
        dueDate: newTask.dueDate || null,
      });

      const updatedTasks = [created, ...tasks];
      setTasks(updatedTasks);
      setUserItem("manager_tasks", updatedTasks);
    }

    // Record activity
    const newActivity = {
      id: "act-" + Date.now(),
      user: userName,
      action: "created deliverable",
      target: newTask.title.trim(),
      time: "Just now",
      avatar: getInitials(userName),
      color: "from-blue-600 to-indigo-600",
    };
    const updatedActivities = [newActivity, ...recentActivities];
    setRecentActivities(updatedActivities);
    setUserItem("manager_activities", updatedActivities);

    await loadLiveDashboard();

    setNewTask({
      title: "",
      project: projects[0]?.name || "",
      assignee: teamMembersData[0]?.name || "",
      priority: "Medium",
      dueDate: "",
    });
    setShowCreateTaskModal(false);
  };

  const metricCards = [
    {
      title: "Total Deliverables",
      value: stats.totalTasks,
      subtitle: `${stats.totalProjects} active initiatives`,
      badge: `${stats.totalProjects} Projects`,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: ClipboardList,
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
    },
    {
      title: "In Progress",
      value: stats.inProgressTasks,
      subtitle: "Active in current sprint",
      badge: "Sprint Active",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      subtitle: `${stats.completionRate}% workspace velocity`,
      badge: `${stats.completionRate}% Done`,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CircleCheck,
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    {
      title: "Overdue / At Risk",
      value: stats.overdueTasks,
      subtitle: stats.overdueTasks > 0 ? "Items need priority review" : "All deliverables on schedule",
      badge: stats.overdueTasks > 0 ? "Attention" : "On Track",
      badgeColor: stats.overdueTasks > 0 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: AlertCircle,
      iconBg: stats.overdueTasks > 0 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex antialiased">
      {/* Navigation Sidebar */}
      <Sidebar activeItem="dashboard" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        <Header
          setMobileOpen={setMobileMenuOpen}
          searchQuery={taskSearchQuery}
          onSearchChange={(e) => setTaskSearchQuery(e.target.value)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl w-full mx-auto">
          {/* Executive Header Banner */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 border border-blue-200">
                  Manager Workspace
                </span>
                <span className="text-xs text-slate-400 font-medium">·</span>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {userName}!
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Live delivery status across your team deliverables, active boards, and project velocity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                to="/manager/boards/board-1"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 transition"
              >
                <Kanban size={15} className="text-blue-600" />
                <span>Kanban Board</span>
              </Link>

              <Link
                to="/manager/projects"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 transition"
              >
                <FolderKanban size={15} className="text-blue-600" />
                <span>Projects ({stats.totalProjects})</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowCreateTaskModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-[0.98] cursor-pointer"
              >
                <Plus size={15} />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Top Task Timeline & Kanban Board */}
          <TopTaskTimelineKanban
            tasks={tasks}
            onTaskMove={handleTaskMove}
            onTaskDelete={handleTaskDelete}
            onTaskClick={() => navigate('/manager/tasks')}
            onAddTask={() => setShowCreateTaskModal(true)}
            title="Team Deliverables & Kanban Lifecycle"
            subtitle="Real-time delivery progress, sprint throughput, and active workflow lanes."
            role="manager"
            theme="light"
          />

          {/* Middle Row: Active Projects Progress & Velocity Insights */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Active Projects Progress (8 Columns) */}
            <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600 border border-blue-100">
                      <FolderKanban size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Project Progress Overview</h3>
                      <p className="text-xs text-slate-500">
                        Live delivery milestones across active project initiatives.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/manager/projects"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    <span>Manage Projects</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="mt-4 space-y-3.5">
                  {projects.length > 0 ? (
                    projects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => navigate(`/manager/projects/${proj.id}`)}
                        className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all hover:bg-slate-100/80 hover:border-slate-300 cursor-pointer"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900">{proj.name}</p>
                              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                                {proj.category || proj.key}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {proj.completedTasks} of {proj.totalTasks} deliverables completed
                            </p>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${proj.statusColor || "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                              {proj.status}
                            </span>
                            <span className="text-xs font-bold text-slate-700 min-w-[38px] text-right">
                              {proj.progress}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center space-y-2">
                      <FolderKanban size={32} className="mx-auto text-slate-400" />
                      <p className="text-xs font-semibold text-slate-700">No active projects</p>
                      <p className="text-[11px] text-slate-500">Initialize a project to start tracking team delivery milestones.</p>
                      <Link
                        to="/manager/projects"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2"
                      >
                        <Plus size={14} />
                        <span>Create Project</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {projects.length} workspace projects</span>
                <Link to="/manager/projects" className="text-blue-600 font-semibold hover:underline text-[11px]">
                  Explore Project Roadmaps &rarr;
                </Link>
              </div>
            </div>

            {/* Sprint Velocity & Activity Insights (4 Columns) */}
            <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600 border border-blue-100">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Delivery Velocity</h3>
                      <p className="text-[10px] text-slate-500">Live Workspace Throughput</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    {stats.completionRate}% Delivered
                  </span>
                </div>

                {/* Velocity Stat Tiles */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tasks Done</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">{stats.completedTasks}</p>
                    <p className="mt-0.5 text-[10px] text-emerald-600 font-semibold">of {stats.totalTasks} deliverables</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Schedule</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                      {stats.overdueTasks > 0 ? stats.overdueTasks : (stats.inProgressTasks > 0 ? stats.inProgressTasks : "0")}
                    </p>
                    <p className={`mt-0.5 text-[10px] font-semibold ${stats.overdueTasks > 0 ? "text-rose-600" : "text-blue-600"}`}>
                      {stats.overdueTasks > 0 ? "Overdue Tasks" : (stats.inProgressTasks > 0 ? "In Progress" : "On Target")}
                    </p>
                  </div>
                </div>

                {/* Collaborative Activity Feed */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Recent Activity
                    </h4>
                    <Link to="/manager/activity" className="text-[10px] font-semibold text-blue-600 hover:underline">
                      View all
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {recentActivities.length > 0 ? (
                      recentActivities.slice(0, 4).map((act) => (
                        <div key={act.id} className="flex items-start gap-2.5 text-xs">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${act.color || "from-blue-600 to-indigo-600"} text-[9px] font-bold text-white shadow-xs`}
                          >
                            {act.avatar || "U"}
                          </div>
                          <div className="min-w-0 flex-1 leading-snug">
                            <p className="text-slate-600 text-[11px]">
                              <span className="font-semibold text-slate-900">{act.user}</span>{" "}
                              {act.action}{" "}
                              {act.target && <span className="font-semibold text-blue-600">{act.target}</span>}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">{act.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500 py-3 text-center">No recent team activities yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 text-center">
                <Link to="/manager/workload" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                  <span>View Team Capacity & Workload</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </section>

          {/* Interactive Tasks Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            {/* Table Header Controls */}
            <div className="flex flex-col gap-3.5 border-b border-slate-100 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Recent Deliverables & Tasks</h3>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                    {filteredTasks.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Comprehensive task status and workload distribution across active initiatives.
                </p>
              </div>

              {/* View Switcher & Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 border border-slate-200 bg-slate-100/80 p-0.5 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setTasksViewMode("kanban")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      tasksViewMode === "kanban"
                        ? "bg-white text-blue-600 shadow-xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Kanban size={13} />
                    <span>Kanban Board</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTasksViewMode("table")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      tasksViewMode === "table"
                        ? "bg-white text-blue-600 shadow-xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Table size={13} />
                    <span>Table View</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {["All", "In Progress", "Completed", "Pending", "In Review"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setTaskStatusFilter(status)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${taskStatusFilter === status
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Kanban or Table View */}
            {tasksViewMode === "kanban" ? (
              <div className="p-4 sm:p-5 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: "todo", label: "To Do / Pending", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-700 border-slate-200" },
                    { id: "in_progress", label: "In Progress", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
                    { id: "review", label: "In Review", dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
                    { id: "completed", label: "Completed", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  ].map((col) => {
                    const colTasks = filteredTasks.filter((t) => {
                      const s = (t.status || "").toLowerCase();
                      if (col.id === "todo") return s === "pending" || s === "todo" || s === "to do";
                      if (col.id === "in_progress") return s === "in progress" || s === "in_progress";
                      if (col.id === "review") return s === "in review" || s === "review" || s === "in_review";
                      if (col.id === "completed") return s === "completed" || s === "done";
                      return false;
                    });

                    return (
                      <div key={col.id} className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                            <h4 className="text-xs font-bold text-slate-800">{col.label}</h4>
                          </div>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${col.badge}`}>
                            {colTasks.length}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-col gap-2.5 min-h-[140px]">
                          {colTasks.length > 0 ? (
                            colTasks.map((task) => (
                              <div
                                key={task.id}
                                className="group relative rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs hover:shadow-sm hover:border-blue-300 transition"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${priorityStyles[task.priority] || priorityStyles.Medium}`}>
                                    <span className="h-1 w-1 rounded-full bg-current" />
                                    {task.priority}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Calendar size={10} />
                                    {formatDate(task.dueDate)}
                                  </span>
                                </div>

                                <h5 className="mt-2 text-xs font-semibold text-slate-900 leading-snug group-hover:text-blue-600 transition">
                                  {task.title}
                                </h5>

                                <p className="mt-1 text-[10px] text-slate-400 truncate flex items-center gap-1">
                                  <FolderKanban size={11} className="text-slate-400 shrink-0" />
                                  {getProjectName(task.project)}
                                </p>

                                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr ${task.assigneeColor || getAssigneeGradient(getAssigneeName(task.assignee))} text-[8px] font-bold text-white shrink-0`}>
                                      {getInitials(getAssigneeName(task.assignee))}
                                    </div>
                                    <span className="truncate text-slate-600 font-medium">{getAssigneeName(task.assignee)}</span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {col.id === "completed" ? (
                                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                        <Lock size={10} />
                                        <span>Locked</span>
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        title="Advance status"
                                        onClick={async () => {
                                          const nextStatus = col.id === "todo" ? "In Progress" : col.id === "in_progress" ? "In Review" : "Completed";
                                          if (nextStatus === "Completed") {
                                            const isConfirmed = await confirm({
                                              title: "Complete Task",
                                              message: "Is this task completed? Once completed, this task will be locked and cannot be edited.",
                                              confirmText: "Yes, Complete",
                                              cancelText: "Cancel"
                                            });
                                            if (!isConfirmed) return;
                                          }
                                          await handleTaskMove(task.id, nextStatus);
                                        }}
                                        className="rounded-md p-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 cursor-pointer transition"
                                      >
                                        <ArrowRight size={11} />
                                      </button>
                                    )}
                                    <Link
                                      to={`/manager/tasks/${task.id}`}
                                      className="rounded-md p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
                                      title="View Details"
                                    >
                                      <ChevronRight size={11} />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-slate-200 text-center p-3 text-[11px] text-slate-400">
                              <span>No tasks in this column</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-bold">Task & Project</th>
                    <th className="px-5 py-3 font-bold">Assignee</th>
                    <th className="px-5 py-3 font-bold">Due Date</th>
                    <th className="px-5 py-3 font-bold">Priority</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="transition-colors hover:bg-slate-50/80">
                        {/* Task Title & Project */}
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-900 leading-snug">{task.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">{getProjectName(task.project)}</p>
                        </td>

                        {/* Assignee */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr ${task.assigneeColor || getAssigneeGradient(getAssigneeName(task.assignee))} text-[9px] font-bold text-white shadow-xs shrink-0`}
                            >
                              {getInitials(getAssigneeName(task.assignee))}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 text-xs truncate">{getAssigneeName(task.assignee)}</p>
                              <p className="text-[10px] text-slate-400">{task.assigneeRole || "Contributor"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        </td>

                        {/* Priority Badge */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${priorityStyles[task.priority] || priorityStyles.Medium
                              }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                            {task.priority}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusStyles[task.status] || statusStyles["In Progress"]
                              }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                            {task.status}
                            {normalizeStatus(task.status) === "Completed" && " (Locked)"}
                          </span>
                        </td>

                        {/* Action Link */}
                        <td className="px-5 py-3.5 text-right">
                          {normalizeStatus(task.status) === "Completed" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                              <Lock size={11} />
                              <span>Locked</span>
                            </span>
                          ) : (
                            <Link
                              to="/manager/tasks"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <span>Inspect</span>
                              <ArrowRight size={12} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-500">
                        <ClipboardList size={30} className="mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">No deliverables match filter criteria</p>
                        <p className="text-[11px] text-slate-400 mt-1">Try switching tabs or resetting your search query.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setTaskStatusFilter("All");
                            setTaskSearchQuery("");
                          }}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              <span>Showing {filteredTasks.length} of {tasks.length} total tasks</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTaskStatusFilter("All");
                    setTaskSearchQuery("");
                  }}
                  className="font-medium text-slate-600 hover:text-slate-900 transition text-[11px] cursor-pointer"
                >
                  Reset Filter
                </button>
                <Link
                  to="/manager/boards"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition text-[11px] inline-flex items-center gap-1"
                >
                  <span>Open Full Kanban Board</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
            </>
          )}
        </section>

          {/* Team Overview Section */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs text-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600 border border-blue-100">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Team Workload & Delivery Performance</h3>
                  <p className="text-xs text-slate-500">
                    Individual throughput, completion rate, and active assignments across this workspace.
                  </p>
                </div>
              </div>

              <Link
                to="/manager/team"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                <span>Manage Team</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Team Members Grid */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembersData.map((member) => (
                <div
                  key={member.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:bg-slate-50 hover:border-blue-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${member.color || getAssigneeGradient(member.name)} font-bold text-white text-xs shadow-xs`}
                        >
                          {member.avatar || (member.name ? member.name.slice(0, 2).toUpperCase() : "U")}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs leading-tight">{member.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{member.role || member.workspaceRole || "Member"}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {member.completionRate || 100}%
                      </span>
                    </div>

                    {/* Completion Progress Bar */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${member.completionRate}%` }}
                      />
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2 border-t border-slate-200/80 pt-3 text-[10px]">
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded-md border border-slate-200/60">
                      <dt className="text-slate-500">Assigned</dt>
                      <dd className="font-bold text-slate-800">{member.totalAssigned || 0}</dd>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded-md border border-slate-200/60">
                      <dt className="text-slate-500">Done</dt>
                      <dd className="font-bold text-emerald-700">{member.completed || 0}</dd>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded-md border border-slate-200/60">
                      <dt className="text-slate-500">In Progress</dt>
                      <dd className="font-bold text-blue-700">{member.inProgress || 0}</dd>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded-md border border-slate-200/60">
                      <dt className="text-slate-500">Overdue</dt>
                      <dd className={`font-bold ${member.overdue > 0 ? "text-rose-600" : "text-slate-800"}`}>
                        {member.overdue || 0}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Quick Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowCreateTaskModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create New Deliverable</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Assign a deliverable to your team member.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Deliverable Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement drag-and-drop kanban"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Project Initiative</label>
                <select
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id || p._id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assignee</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                  >
                    <option value="">Unassigned</option>
                    {teamMembersData.map((m) => (
                      <option key={m.id || m._id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create Deliverable</span>
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
