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
  Bell,
  Search,
  Calendar,
  Menu,
  X,
  ChevronRight,
  FolderKanban,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";

const DASHBOARD_API_URL = "http://localhost:8081/api/v1/manager/dashboard";

const summaryCardDefinitions = [
  {
    title: "Total Tasks",
    description: "Tasks across this workspace",
    icon: ClipboardList,
    color: "bg-blue-50 text-blue-600 border border-blue-100",
  },
  {
    title: "In Progress",
    description: "Currently being worked on",
    icon: Clock3,
    color: "bg-amber-50 text-amber-600 border border-amber-100",
  },
  {
    title: "Completed",
    description: "Tasks completed",
    icon: CircleCheck,
    color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    title: "Overdue / Risk",
    description: "Need your attention",
    icon: AlertCircle,
    color: "bg-rose-50 text-rose-600 border border-rose-100",
  },
];

const LOCAL_DEV_MOCK_DATA = {
  overview: {
    stats: {
      totalTasks: 12,
      totalProjects: 2,
      assignedProjects: 2,
      inProgressTasks: 4,
      completedTasks: 6,
      overdueTasks: 1,
      completionRate: 50,
    },
    myProjects: [
      {
        id: "local-project-1",
        name: "WorkSync Web App",
        key: "CORE",
        status: "active",
        completedTasks: 8,
        totalTasks: 12,
        progress: 67,
      },
      {
        id: "local-project-2",
        name: "Team Management",
        key: "TEAM",
        status: "active",
        completedTasks: 2,
        totalTasks: 6,
        progress: 33,
      },
    ],
    recentTasks: [
      {
        id: "local-task-1",
        title: "Connect manager dashboard metrics",
        status: "in_progress",
        priority: "high",
        dueDate: "2026-11-10T00:00:00.000Z",
        assignee: { name: "Alex Rivera" },
        project: { name: "WorkSync Web App" },
      },
      {
        id: "local-task-2",
        title: "Review team assignments",
        status: "review",
        priority: "medium",
        dueDate: "2026-11-12T00:00:00.000Z",
        assignee: { name: "Sam Lee" },
        project: { name: "Team Management" },
      },
      {
        id: "local-task-3",
        title: "Document API response fields",
        status: "done",
        priority: "low",
        dueDate: "2026-11-04T00:00:00.000Z",
        assignee: { name: "Jordan Kim" },
        project: { name: "WorkSync Web App" },
      },
    ],
    recentActivities: [
      {
        id: "local-activity-1",
        user: { name: "Alex Rivera" },
        description: "moved a task to In Progress",
        entityName: "Connect manager dashboard metrics",
        createdAt: "2026-11-06T09:30:00.000Z",
      },
      {
        id: "local-activity-2",
        user: { name: "Sam Lee" },
        description: "completed a task",
        entityName: "Update project documentation",
        createdAt: "2026-11-06T08:15:00.000Z",
      },
    ],
  },
  teamPerformance: [
    {
      id: "local-member-1",
      name: "Alex Rivera",
      workspaceRole: "manager",
      totalAssigned: 5,
      completed: 3,
      inProgress: 2,
      overdue: 1,
      completionRate: 60,
    },
    {
      id: "local-member-2",
      name: "Sam Lee",
      workspaceRole: "member",
      totalAssigned: 4,
      completed: 2,
      inProgress: 1,
      overdue: 0,
      completionRate: 50,
    },
  ],
};

const statusStyles = {
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "In Review": "bg-amber-50 text-amber-700 border-amber-200",
};

const priorityStyles = {
  Critical: "bg-rose-50 text-rose-700 border-rose-200",
  Urgent: "bg-rose-50 text-rose-700 border-rose-200",
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

  return knownStatuses[status] || status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Unknown";
};

const normalizePriority = (value) => {
  const priority = String(value || "Medium").toLowerCase();
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

const formatDate = (value, includeTime = false) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleString(undefined, includeTime
    ? { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", year: "numeric" });
};

const getInitials = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || "?";

const getProjectStatusColor = (status) => {
  if (["active", "in progress", "completed"].includes(status.toLowerCase())) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (["on hold", "pending", "planning"].includes(status.toLowerCase())) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const fetchDashboardData = async (endpoint, token, signal) => {
  const response = await fetch(`${DASHBOARD_API_URL}${endpoint}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok || body?.success === false) {
    const error = new Error(body?.message || `Dashboard request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return body?.data ?? body;
};

const sampleNotifications = [
  { id: 1, text: "Ayan updated 'Design login page' to In Progress", time: "15m ago", unread: true },
  { id: 2, text: "Rouhan completed 'Set up workspace'", time: "2h ago", unread: true },
  { id: 3, text: "Review task assignments pending approval", time: "5h ago", unread: false },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [projects, setProjects] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [teamMembersData, setTeamMembersData] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [teamError, setTeamError] = useState("");
  const [usingLocalMockData, setUsingLocalMockData] = useState(false);
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

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const applyOverviewData = (overview) => {
      setStats(overview?.stats || {});
      setProjects(
        (Array.isArray(overview?.myProjects) ? overview.myProjects : []).map((project) => {
          const totalTasks = Number(project.totalTasks) || 0;
          const completedTasks = Number(project.completedTasks) || 0;
          const reportedProgress = Number(project.progress);
          const status = normalizeStatus(project.status);
          const progress = Math.max(0, Math.min(100,
            Number.isFinite(reportedProgress)
              ? reportedProgress
              : totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0));

          return {
            id: project.id || project._id || project.name,
            name: project.name || "Untitled project",
            category: project.key || project.category || "Project",
            status,
            statusColor: getProjectStatusColor(status),
            completedTasks,
            totalTasks,
            progress,
          };
        })
      );
      setTasks(
        (Array.isArray(overview?.recentTasks) ? overview.recentTasks : []).map((task) => {
          const assignee = task.assignee?.name || "Unassigned";
          return {
            id: task.id || task._id || task.title,
            title: task.title || "Untitled task",
            project: task.project?.name || "No project",
            assignee,
            assigneeRole: task.assignee?.role || "Team member",
            assigneeColor: "from-blue-500 to-cyan-600",
            priority: normalizePriority(task.priority),
            status: normalizeStatus(task.status),
            dueDate: formatDate(task.dueDate),
          };
        })
      );
      setRecentActivities(
        (Array.isArray(overview?.recentActivities) ? overview.recentActivities : []).map((activity) => {
          const userName = activity.user?.name || "Unknown member";
          return {
            id: activity.id || activity._id || `${userName}-${activity.createdAt}`,
            user: userName,
            action: activity.description || activity.action || activity.type || "updated an item",
            target: typeof activity.entityName === "string" ? activity.entityName : "",
            time: formatDate(activity.createdAt, true),
            avatar: getInitials(userName),
            color: "from-cyan-500 to-blue-600",
          };
        })
      );
    };

    const applyTeamData = (result) => {
      const members = Array.isArray(result?.teamPerformance)
        ? result.teamPerformance
        : Array.isArray(result)
          ? result
          : [];
      setTeamMembersData(
        members.map((member) => ({
          id: member.id || member.memberId || member.email || member.name,
          name: member.name || "Unknown member",
          role: member.workspaceRole || "Member",
          totalAssigned: Number(member.totalAssigned) || 0,
          completed: Number(member.completed) || 0,
          inProgress: Number(member.inProgress) || 0,
          overdue: Number(member.overdue) || 0,
          completionRate: Number(member.completionRate) || 0,
          avatar: getInitials(member.name),
          color: "from-blue-600 to-indigo-600",
        }))
      );
    };

    if (!token) {
      if (import.meta.env.DEV) {
        applyOverviewData(LOCAL_DEV_MOCK_DATA.overview);
        applyTeamData({ teamPerformance: LOCAL_DEV_MOCK_DATA.teamPerformance });
        setUsingLocalMockData(true);
        setDashboardError("");
        setTeamError("");
      } else {
        setDashboardError("Please sign in to view your manager dashboard.");
        setTeamError("");
      }
      setDashboardLoading(false);
      setTeamLoading(false);
      return () => controller.abort();
    }

    setDashboardLoading(true);
    setTeamLoading(true);
    setUsingLocalMockData(false);
    setDashboardError("");
    setTeamError("");

    fetchDashboardData("/", token, controller.signal)
      .then((overview) => {
        if (!active) return;
        applyOverviewData(overview);
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") {
          if (import.meta.env.DEV && [401, 403].includes(error.status)) {
            applyOverviewData(LOCAL_DEV_MOCK_DATA.overview);
            setUsingLocalMockData(true);
            setDashboardError("");
          } else {
            setDashboardError(error.message || "Unable to load dashboard data.");
          }
        }
      })
      .finally(() => {
        if (active) setDashboardLoading(false);
      });

    fetchDashboardData("/team-performance", token, controller.signal)
      .then((result) => {
        if (!active) return;
        applyTeamData(result);
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") {
          if (import.meta.env.DEV && [401, 403].includes(error.status)) {
            applyTeamData({ teamPerformance: LOCAL_DEV_MOCK_DATA.teamPerformance });
            setUsingLocalMockData(true);
            setTeamError("");
          } else {
            setTeamError(error.message || "Unable to load team performance.");
          }
        }
      })
      .finally(() => {
        if (active) setTeamLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [token]);

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

  const summaryValues = [stats.totalTasks, stats.inProgressTasks, stats.completedTasks, stats.overdueTasks];
  const summaryChanges = [
    `${Number(stats.totalProjects) || 0} projects in workspace`,
    "",
    stats.completionRate == null ? "" : `${Number(stats.completionRate) || 0}% overall completion`,
    Number(stats.overdueTasks) > 0 ? "Needs attention" : "No overdue tasks",
  ];
  const summaryCards = summaryCardDefinitions.map((card, index) => ({
    ...card,
    value: Number(summaryValues[index]) || 0,
    change: summaryChanges[index],
  }));

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Unified Light Theme Sidebar */}
      <Sidebar activeItem="dashboard" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Unified Default Header */}
        <Header
          setMobileOpen={setMobileMenuOpen}
          searchQuery={taskSearchQuery}
          onSearchChange={(e) => setTaskSearchQuery(e.target.value)}
        />

        {/* Dashboard Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl w-full mx-auto">
          {/* Welcome Banner */}
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                Manager Workspace
              </p>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Welcome back, {user?.name || "there"}!
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Here is an overview of your team deliverables and active projects.
              </p>
            </div>

            {/* Quick Link to Projects */}
            <Link
              to="/manager/projects"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-blue-600 shadow-xs hover:bg-slate-50 hover:text-blue-700 transition"
            >
              <FolderKanban size={15} />
              <span>View All {Number(stats.assignedProjects) || 0} Projects</span>
              <ArrowUpRight size={14} />
            </Link>
          </header>

          {usingLocalMockData && (
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900" role="status">
              <span className="font-bold">LOCAL DEVELOPMENT MOCK DATA</span>{" "}
              This dashboard is showing temporary sample data. Backend authentication and authorization remain enabled.
            </p>
          )}

          {dashboardLoading && (
            <p className="text-xs text-slate-500" role="status">Loading dashboard data...</p>
          )}
          {dashboardError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700" role="alert">
              {dashboardError}
            </p>
          )}

          {/* Summary Cards Grid */}
          <section>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {card.title}
                        </p>
                        <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                          {card.value}
                        </p>
                      </div>

                      <div className={`rounded-xl p-2.5 ${card.color}`}>
                        <Icon size={20} />
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                      <span>{card.description}</span>
                      <span className="font-medium text-slate-700">{card.change}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Middle Row: Active Projects Progress & Velocity Insights */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Active Projects Progress (2 Columns) */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Project Progress Overview</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Live delivery milestones across active project initiatives.
                  </p>
                </div>
                <Link
                  to="/manager/projects"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  Manage Projects
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {projects.length > 0 ? projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 transition hover:bg-white hover:border-slate-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{proj.name}</p>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/60">
                            {proj.category}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
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
                        <span className="text-xs font-extrabold text-slate-800 min-w-[38px] text-right">
                          {proj.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${proj.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )) : (
                  <p className="py-6 text-center text-xs text-slate-500">
                    {dashboardLoading ? "Loading assigned projects..." : "No assigned projects to display."}
                  </p>
                )}
              </div>
            </div>

            {/* Sprint Velocity & Activity Insights (1 Column) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600 border border-blue-100">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Sprint 4 Velocity</h3>
                      <p className="text-[10px] text-slate-500">Oct 14 - Oct 28 cycle</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    +18%
                  </span>
                </div>

                {/* Velocity Stats */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-medium text-slate-500">Points Done</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-900">34</p>
                    <p className="mt-0.5 text-[10px] text-emerald-700 font-semibold">of 42 points</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-medium text-slate-500">Days Remaining</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-900">6</p>
                    <p className="mt-0.5 text-[10px] text-blue-700 font-semibold">On Schedule</p>
                  </div>
                </div>

                {/* Collaborative Activity Feed */}
                <div className="mt-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recent Collaborative Activity
                  </h4>
                  <div className="mt-2.5 space-y-2.5">
                    {recentActivities.length > 0 ? recentActivities.map((act) => (
                      <div key={act.id} className="flex items-start gap-2 text-xs">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${act.color} text-[8px] font-bold text-white shadow-xs`}
                        >
                          {act.avatar}
                        </div>
                        <div className="min-w-0 flex-1 leading-snug">
                          <p className="text-slate-700 text-[11px]">
                            <span className="font-semibold text-slate-900">{act.user}</span>{" "}
                            {act.action}{act.target && <>{" "}<span className="font-medium text-blue-600">{act.target}</span></>}
                          </p>
                          <span className="text-[10px] text-slate-400">{act.time}</span>
                        </div>
                      </div>
                    )) : (
                      <p className="py-3 text-[11px] text-slate-500">
                        {dashboardLoading ? "Loading activity..." : "No recent activity."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Tasks Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            {/* Table Header Controls */}
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Tasks</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  A snapshot of your team's latest deliverables and assignments.
                </p>
              </div>

              {/* Status Filter Pills for tasks */}
              <div className="flex flex-wrap items-center gap-1.5">
                {["All", "In Progress", "Completed", "Pending", "In Review"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setTaskStatusFilter(status)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      taskStatusFilter === status
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
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Task</th>
                    <th className="px-5 py-3 font-semibold">Assignee</th>
                    <th className="px-5 py-3 font-semibold">Due Date</th>
                    <th className="px-5 py-3 font-semibold">Priority</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="transition hover:bg-slate-50">
                        {/* Task Title & Project */}
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-900">{task.title}</p>
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
                              <p className="font-medium text-slate-800">{task.assignee}</p>
                              <p className="text-[10px] text-slate-500">{task.assigneeRole}</p>
                            </div>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
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
                        {dashboardLoading
                          ? "Loading recent tasks..."
                          : tasks.length === 0
                            ? "No recent tasks to display."
                            : "No tasks match your filter criteria."}
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
                className="font-medium text-blue-600 hover:text-blue-700 transition text-[11px]"
              >
                Reset task filter
              </button>
            </div>
          </section>

          {/* Team Overview */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 border border-blue-100">
                  <Users size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Team Overview</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Team assignment and completion metrics for this workspace.
                  </p>
                </div>
              </div>

            </div>

            {/* Team Members Cards */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {teamError ? (
                <p className="col-span-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700" role="alert">
                  {teamError}
                </p>
              ) : teamLoading ? (
                <p className="col-span-full py-6 text-center text-xs text-slate-500" role="status">
                  Loading team performance...
                </p>
              ) : teamMembersData.length > 0 ? teamMembersData.map((member) => (
                <div
                  key={member.id}
                  className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 transition-all hover:bg-white hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${member.color} font-bold text-white text-xs shadow-xs`}
                      >
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs leading-tight">{member.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {String(member.role).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      {member.completionRate}% complete
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-200/80 pt-3 text-[10px]">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">Assigned</dt>
                      <dd className="font-bold text-slate-800">{member.totalAssigned}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">Completed</dt>
                      <dd className="font-bold text-slate-800">{member.completed}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">In progress</dt>
                      <dd className="font-bold text-slate-800">{member.inProgress}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">Overdue</dt>
                      <dd className="font-bold text-slate-800">{member.overdue}</dd>
                    </div>
                  </dl>
                </div>
              )) : (
                <p className="col-span-full py-6 text-center text-xs text-slate-500">
                  No team performance data to display.
                </p>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Local Modal: Quick Create Task */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setShowCreateTaskModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create New Task</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Assign a deliverable to your team member.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement drag-and-drop kanban"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Project</label>
                <select
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="WorkSync Web App">WorkSync Web App</option>
                  <option value="Mobile Companion App">Mobile Companion App</option>
                  <option value="Real-Time Sync Engine">Real-Time Sync Engine</option>
                  <option value="Team Management">Team Management</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Assignee</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Devanshi">Devanshi (Manager)</option>
                    <option value="Ayan">Ayan (Admin)</option>
                    <option value="Rouhan">Rouhan (Employee)</option>
                    <option value="Jarir">Jarir (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Due Date</label>
                <input
                  type="text"
                  placeholder="e.g. Oct 30, 2026"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
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
