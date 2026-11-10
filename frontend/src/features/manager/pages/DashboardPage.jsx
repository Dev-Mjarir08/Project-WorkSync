import React, { useState, useMemo, useEffect } from "react";
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
  BarChart2
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import { getUserItem, setUserItem, getCurrentUser } from "../../../utils/userStorage.js";

const DASHBOARD_API_URL = "http://localhost:8081/api/v1/manager/dashboard";

const defaultInitialProjects = [
  {
    id: "proj-1",
    name: "WorkSync Web Platform",
    category: "Core SaaS",
    key: "WS-WEB",
    status: "Active",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completedTasks: 18,
    totalTasks: 24,
    progress: 75,
  },
  {
    id: "proj-2",
    name: "Real-Time Sync Engine",
    category: "Infrastructure",
    key: "WS-SYNC",
    status: "Active",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completedTasks: 12,
    totalTasks: 16,
    progress: 75,
  },
  {
    id: "proj-3",
    name: "Mobile Companion App",
    category: "Mobile",
    key: "WS-MOB",
    status: "Planning",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    completedTasks: 4,
    totalTasks: 12,
    progress: 33,
  },
];

const defaultInitialTasks = [
  {
    id: "task-1",
    title: "Implement real-time Kanban board drag-and-drop",
    project: "WorkSync Web Platform",
    assignee: "Rouhan Siddiqui",
    assigneeRole: "Frontend Dev",
    assigneeColor: "from-blue-600 to-indigo-600",
    priority: "High",
    status: "In Progress",
    dueDate: "Nov 15, 2026",
  },
  {
    id: "task-2",
    title: "Refactor Role-Based Access Control and Route Guards",
    project: "WorkSync Web Platform",
    assignee: "Jarir Multani",
    assigneeRole: "Lead Architect",
    assigneeColor: "from-purple-600 to-indigo-600",
    priority: "High",
    status: "Completed",
    dueDate: "Nov 12, 2026",
  },
  {
    id: "task-3",
    title: "Configure isolated multi-tenant team workspaces",
    project: "Real-Time Sync Engine",
    assignee: "Ayan Mukherjee",
    assigneeRole: "Backend Admin",
    assigneeColor: "from-cyan-500 to-blue-600",
    priority: "Medium",
    status: "In Progress",
    dueDate: "Nov 18, 2026",
  },
  {
    id: "task-4",
    title: "Design light theme dashboard layouts & metric tokens",
    project: "WorkSync Web Platform",
    assignee: "Priya Patel",
    assigneeRole: "Product Designer",
    assigneeColor: "from-amber-500 to-orange-600",
    priority: "Medium",
    status: "Completed",
    dueDate: "Nov 10, 2026",
  },
  {
    id: "task-5",
    title: "Setup automated CI/CD build & telemetry alerts",
    project: "Real-Time Sync Engine",
    assignee: "Sarah Connor",
    assigneeRole: "DevOps Engineer",
    assigneeColor: "from-emerald-500 to-teal-600",
    priority: "Low",
    status: "Pending",
    dueDate: "Nov 22, 2026",
  },
];

const defaultInitialTeam = [
  {
    id: "tm-1",
    name: "Rouhan Siddiqui",
    role: "Frontend Dev",
    totalAssigned: 8,
    completed: 6,
    inProgress: 2,
    overdue: 0,
    completionRate: 75,
    avatar: "RS",
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "tm-2",
    name: "Ayan Mukherjee",
    role: "Backend Lead",
    totalAssigned: 9,
    completed: 7,
    inProgress: 2,
    overdue: 0,
    completionRate: 78,
    avatar: "AM",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "tm-3",
    name: "Priya Patel",
    role: "UI/UX Designer",
    totalAssigned: 6,
    completed: 5,
    inProgress: 1,
    overdue: 0,
    completionRate: 83,
    avatar: "PP",
    color: "from-purple-600 to-indigo-600",
  },
  {
    id: "tm-4",
    name: "Sarah Connor",
    role: "DevOps Admin",
    totalAssigned: 5,
    completed: 4,
    inProgress: 1,
    overdue: 0,
    completionRate: 80,
    avatar: "SC",
    color: "from-emerald-500 to-teal-600",
  },
];

const defaultInitialActivities = [
  {
    id: "act-1",
    user: "Rouhan Siddiqui",
    action: "updated deliverable status to In Progress",
    target: "Kanban drag-and-drop",
    time: "15m ago",
    avatar: "RS",
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "act-2",
    user: "Jarir Multani",
    action: "completed security audit for",
    target: "RBAC Route Guards",
    time: "1h ago",
    avatar: "JM",
    color: "from-purple-600 to-indigo-600",
  },
  {
    id: "act-3",
    user: "Ayan Mukherjee",
    action: "updated board target for",
    target: "Real-Time Sync Engine",
    time: "3h ago",
    avatar: "AM",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "act-4",
    user: "Priya Patel",
    action: "attached prototype specs to",
    target: "WorkSync Web Platform",
    time: "5h ago",
    avatar: "PP",
    color: "from-amber-500 to-orange-600",
  },
];

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
  if (!value) return "Nov 15, 2026";
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

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user: authUser, token } = useSelector((state) => state.auth);
  const currentUser = authUser || getCurrentUser();
  const userName = currentUser?.name || "Manager";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  // Scoped Data Initialization
  const [projects, setProjects] = useState(() => {
    const saved = getUserItem("manager_projects");
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    setUserItem("manager_projects", defaultInitialProjects);
    return defaultInitialProjects;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = getUserItem("manager_tasks");
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    setUserItem("manager_tasks", defaultInitialTasks);
    return defaultInitialTasks;
  });

  const [teamMembersData, setTeamMembersData] = useState(() => {
    const saved = getUserItem("manager_team");
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    setUserItem("manager_team", defaultInitialTeam);
    return defaultInitialTeam;
  });

  const [recentActivities, setRecentActivities] = useState(() => {
    const saved = getUserItem("manager_activities");
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    setUserItem("manager_activities", defaultInitialActivities);
    return defaultInitialActivities;
  });

  // Modal form state
  const [newTask, setNewTask] = useState({
    title: "",
    project: "WorkSync Web Platform",
    assignee: "Rouhan Siddiqui",
    priority: "High",
    dueDate: "Nov 25, 2026",
  });

  // Live Backend API Fetch with Graceful Local Fallback
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    let isMounted = true;

    fetch(`${DASHBOARD_API_URL}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.data) return;
        const apiData = data.data;
        if (Array.isArray(apiData.myProjects) && apiData.myProjects.length > 0) {
          setProjects(apiData.myProjects);
        }
        if (Array.isArray(apiData.recentTasks) && apiData.recentTasks.length > 0) {
          setTasks(apiData.recentTasks);
        }
      })
      .catch(() => { });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token]);

  // Derived Metrics
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    const overdueTasks = tasks.filter((t) => t.status === "Overdue").length;
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
      const matchesSearch =
        !q ||
        task.title?.toLowerCase().includes(q) ||
        task.project?.toLowerCase().includes(q) ||
        task.assignee?.toLowerCase().includes(q);

      const matchesStatus =
        taskStatusFilter === "All" || task.status === taskStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, taskSearchQuery, taskStatusFilter]);

  // Handle Create Task Form Submit
  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const assigneeColors = {
      "Rouhan Siddiqui": "from-blue-600 to-indigo-600",
      "Ayan Mukherjee": "from-cyan-500 to-blue-600",
      "Priya Patel": "from-purple-600 to-indigo-600",
      "Sarah Connor": "from-emerald-500 to-teal-600",
      "Jarir Multani": "from-indigo-600 to-purple-600",
    };

    const created = {
      id: "task-" + Date.now(),
      title: newTask.title.trim(),
      project: newTask.project,
      assignee: newTask.assignee,
      assigneeRole: "Contributor",
      assigneeColor: assigneeColors[newTask.assignee] || "from-blue-600 to-indigo-600",
      priority: newTask.priority,
      status: "In Progress",
      dueDate: newTask.dueDate || "Nov 25, 2026",
    };

    const updatedTasks = [created, ...tasks];
    setTasks(updatedTasks);
    setUserItem("manager_tasks", updatedTasks);

    // Record activity
    const newActivity = {
      id: "act-" + Date.now(),
      user: userName,
      action: "created deliverable",
      target: created.title,
      time: "Just now",
      avatar: getInitials(userName),
      color: "from-blue-600 to-indigo-600",
    };
    const updatedActivities = [newActivity, ...recentActivities];
    setRecentActivities(updatedActivities);
    setUserItem("manager_activities", updatedActivities);

    setNewTask({
      title: "",
      project: "WorkSync Web Platform",
      assignee: "Rouhan Siddiqui",
      priority: "High",
      dueDate: "Nov 25, 2026",
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Light Theme Manager Navigation Sidebar */}
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
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 border border-blue-200">
                  Manager Workspace
                </span>
                <span className="text-xs text-slate-400 font-medium">·</span>
                <span className="text-xs text-slate-500 font-medium">Sprint 4 Active</span>
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
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition"
              >
                <Kanban size={15} className="text-slate-500" />
                <span>Kanban Board</span>
              </Link>

              <Link
                to="/manager/projects"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition"
              >
                <FolderKanban size={15} className="text-slate-500" />
                <span>Projects ({stats.totalProjects})</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowCreateTaskModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer"
              >
                <Plus size={15} />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Top Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-sm hover:border-slate-300 flex flex-col justify-between h-full"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {card.title}
                      </p>
                      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        {card.value}
                      </p>
                    </div>
                    <div className={`rounded-xl p-3 ${card.iconBg}`}>
                      <Icon size={20} />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] truncate">{card.subtitle}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border shrink-0 ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Middle Row: Active Projects Progress & Velocity Insights */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Active Projects Progress (8 Columns) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
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
                        className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs cursor-pointer"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900">{proj.name}</p>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
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
                            <span className="text-xs font-extrabold text-slate-800 min-w-[38px] text-right">
                              {proj.progress}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center space-y-2">
                      <FolderKanban size={32} className="mx-auto text-slate-300" />
                      <p className="text-xs font-semibold text-slate-700">No active projects</p>
                      <p className="text-[11px] text-slate-400">Initialize a project to start tracking team delivery milestones.</p>
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
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600 border border-blue-100">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Sprint 4 Velocity</h3>
                      <p className="text-[10px] text-slate-500">Oct 14 - Oct 28 cycle</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    +18% Velocity
                  </span>
                </div>

                {/* Velocity Stat Tiles */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Points Done</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">34</p>
                    <p className="mt-0.5 text-[10px] text-emerald-700 font-semibold">of 42 points</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Schedule</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">6 Days</p>
                    <p className="mt-0.5 text-[10px] text-blue-700 font-semibold">On Target</p>
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
                    {recentActivities.slice(0, 4).map((act) => (
                      <div key={act.id} className="flex items-start gap-2.5 text-xs">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${act.color} text-[9px] font-bold text-white shadow-xs`}
                        >
                          {act.avatar}
                        </div>
                        <div className="min-w-0 flex-1 leading-snug">
                          <p className="text-slate-700 text-[11px]">
                            <span className="font-semibold text-slate-900">{act.user}</span>{" "}
                            {act.action}{" "}
                            {act.target && <span className="font-semibold text-blue-600">{act.target}</span>}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{act.time}</span>
                        </div>
                      </div>
                    ))}
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

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
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

            {/* Table */}
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
                          <p className="mt-0.5 text-[11px] text-slate-500">{task.project}</p>
                        </td>

                        {/* Assignee */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr ${task.assigneeColor} text-[9px] font-bold text-white shadow-xs shrink-0`}
                            >
                              {getInitials(task.assignee)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 text-xs truncate">{task.assignee}</p>
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
                          </span>
                        </td>

                        {/* Action Link */}
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to="/manager/tasks"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <span>Inspect</span>
                            <ArrowRight size={12} />
                          </Link>
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
                  to="/manager/boards/board-1"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition text-[11px] inline-flex items-center gap-1"
                >
                  <span>Open Kanban Board</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </section>

          {/* Team Overview Section */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
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
                  className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${member.color} font-bold text-white text-xs shadow-xs`}
                        >
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs leading-tight">{member.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{member.role}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {member.completionRate}%
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
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded-md border border-slate-100">
                      <dt className="text-slate-500">Assigned</dt>
                      <dd className="font-bold text-slate-800">{member.totalAssigned}</dd>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded-md border border-slate-100">
                      <dt className="text-slate-500">Done</dt>
                      <dd className="font-bold text-emerald-700">{member.completed}</dd>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded-md border border-slate-100">
                      <dt className="text-slate-500">In Progress</dt>
                      <dd className="font-bold text-blue-700">{member.inProgress}</dd>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded-md border border-slate-100">
                      <dt className="text-slate-500">Overdue</dt>
                      <dd className={`font-bold ${member.overdue > 0 ? "text-rose-600" : "text-slate-800"}`}>
                        {member.overdue}
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
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
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
                    {teamMembersData.map((m) => (
                      <option key={m.id} value={m.name}>
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
                  type="text"
                  placeholder="e.g. Nov 25, 2026"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-xs"
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
