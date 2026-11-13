import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Calendar,
  X,
  ChevronRight,
  FolderKanban,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import managerService from "../managerService.js";

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

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [projects, setProjects] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [teamMembersData, setTeamMembersData] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [teamError, setTeamError] = useState("");
  const [taskFormError, setTaskFormError] = useState("");
  const [savingTask, setSavingTask] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  // Form state for Create Task Modal
  const [newTask, setNewTask] = useState({
    title: "",
    projectId: "",
    assigneeId: "",
    priority: "high",
    dueDate: "",
  });

  useEffect(() => {
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

    setDashboardLoading(true);
    setTeamLoading(true);
    setDashboardError("");
    setTeamError("");

    managerService.getDashboardOverview()
      .then((overview) => {
        if (!active) return;
        applyOverviewData(overview);
      })
      .catch((error) => {
        if (active) setDashboardError(error.message || "Unable to load dashboard data.");
      })
      .finally(() => {
        if (active) setDashboardLoading(false);
      });

    managerService.getDashboardTeamPerformance()
      .then((result) => {
        if (!active) return;
        applyTeamData(result);
      })
      .catch((error) => {
        if (active) setTeamError(error.message || "Unable to load team performance.");
      })
      .finally(() => {
        if (active) setTeamLoading(false);
      });

    managerService.getProjects()
      .then((projectData) => {
        if (!active) return;
        setProjectOptions(projectData);
        setNewTask((current) => ({
          ...current,
          projectId: current.projectId || projectData[0]?.id || projectData[0]?._id || "",
        }));
      })
      .catch((error) => {
        if (active) setTaskFormError(error.message || "Unable to load project options.");
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    let active = true;
    if (!newTask.projectId) {
      setProjectMembers([]);
      return () => {
        active = false;
      };
    }
    managerService.getProjectMembers(newTask.projectId)
      .then((members) => {
        if (!active) return;
        setProjectMembers(members);
        setNewTask((current) => ({
          ...current,
          assigneeId: members.some((member) =>
            String(member.id || member.userId || member._id) === String(current.assigneeId)
          )
            ? current.assigneeId
            : "",
        }));
      })
      .catch((error) => {
        if (active) setTaskFormError(error.message || "Unable to load project members.");
      });
    return () => {
      active = false;
    };
  }, [newTask.projectId]);

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

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setSavingTask(true);
    setTaskFormError("");
    try {
      await managerService.createTask({
        title: newTask.title.trim(),
        ...(newTask.projectId ? { projectId: newTask.projectId } : {}),
        ...(newTask.assigneeId ? { assigneeId: newTask.assigneeId } : {}),
        priority: newTask.priority,
        status: "todo",
        ...(newTask.dueDate ? { dueDate: newTask.dueDate } : {}),
      });
      setNewTask((current) => ({ ...current, title: "", assigneeId: "", dueDate: "" }));
      setShowCreateTaskModal(false);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setTaskFormError(error.message || "Unable to create the task.");
    } finally {
      setSavingTask(false);
    }
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

            {/* Workspace Task Snapshot & Activity */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600 border border-blue-100">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Workspace Task Snapshot</h3>
                      <p className="text-[10px] text-slate-500">
                        {Number(stats.totalTasks) || 0} tasks across the workspace
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    {Number(stats.completionRate) || 0}% complete
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-medium text-slate-500">Completed Tasks</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-900">{Number(stats.completedTasks) || 0}</p>
                    <p className="mt-0.5 text-[10px] text-emerald-700 font-semibold">Current workspace total</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-medium text-slate-500">Overdue Tasks</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-900">{Number(stats.overdueTasks) || 0}</p>
                    <p className="mt-0.5 text-[10px] text-rose-700 font-semibold">Require attention</p>
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
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value, assigneeId: "" })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  {projectOptions.length === 0 && <option value="">No projects available</option>}
                  {projectOptions.map((project) => (
                    <option key={project.id || project._id} value={project.id || project._id}>
                      {project.name || project.title || "Untitled project"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Assignee</label>
                  <select
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.map((member) => (
                      <option key={member.id || member.userId || member._id} value={member.id || member.userId || member._id}>
                        {member.name || member.email || "Team member"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {taskFormError && <p role="alert" className="text-xs text-rose-700">{taskFormError}</p>}

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
                  disabled={savingTask || !newTask.title.trim() || !newTask.projectId}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>{savingTask ? "Saving..." : "Add Task"}</span>
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
