import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Folder,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  MoreHorizontal,
  Activity,
  Users,
  Search,
  Plus,
  Filter,
  Sun,
  Moon,
  X,
  TrendingUp,
  Briefcase,
  Check,
  ChevronRight,
  Bell,
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart2,
  Kanban,
  FolderKanban
} from "lucide-react";
import { getCurrentUser, getUserItem, setUserItem } from "../../../utils/userStorage.js";
import { employeeService } from "../employeeService.js";
import { useConfirm } from "../../../context/ConfirmContext.jsx";
import TopTaskTimelineKanban from "../../boards/components/TopTaskTimelineKanban.jsx";
import KanbanBoard from "../../boards/components/KanbanBoard.jsx";

export default function DashboardPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  
  // Current user & dynamic scoped data
  const currentUser = getCurrentUser();
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || "Team Member";

  // Dashboard Interactive States
  const [tasks, setTasks] = useState(() => getUserItem("employee_tasks", []));
  const [activities, setActivities] = useState(() => getUserItem("employee_activities", []));
  const [events, setEvents] = useState(() => getUserItem("employee_events", []));
  
  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    project: "WorkSync Platform",
    priority: "Medium",
    status: "Pending",
    dueDate: "Oct 28, 2026",
  });

  const handleTaskMove = async (taskId, newStatus) => {
    const s = String(newStatus || '').toLowerCase();
    const isTargetDone = s.includes('done') || s.includes('complete');
    const current = tasks.find(t => (t.id === taskId || t._id === taskId));

    if (current && (current.status === "Completed" || current.status === "done")) {
      return; // Locked!
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

    setTasks((prev) => prev.map((t) => ((t.id === taskId || t._id === taskId) ? { ...t, status: newStatus } : t)));
    try {
      await employeeService.updateTaskStatus(taskId, newStatus);
    } catch (e) {}
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
      await employeeService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => (t.id || t._id) !== taskId));
    } catch (e) {}
  };

  // Fetch live tasks and dashboard on mount
  useEffect(() => {
    let mounted = true;
    employeeService.getDashboard().then((dash) => {
      if (!mounted) return;
      if (Array.isArray(dash?.recentTasks) && dash.recentTasks.length > 0) {
        setTasks(dash.recentTasks);
      }
    });
    employeeService.getTasks().then((liveTasks) => {
      if (!mounted) return;
      if (Array.isArray(liveTasks) && liveTasks.length > 0) {
        setTasks(liveTasks);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Dynamic Calculated Stats based on current tasks state
  const statsComputed = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const overdue = tasks.filter((t) => t.priority === "High" && t.status !== "Completed").length;

    return [
      {
        id: "total",
        title: "Total Tasks",
        value: total,
        subtitle: "Tasks assigned to you",
        icon: Folder,
        color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900",
        badge: `${total} total`
      },
      {
        id: "completed",
        title: "Completed",
        value: completed,
        subtitle: "Tasks successfully completed",
        icon: CheckCircle2,
        color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900",
        badge: total > 0 ? `${Math.round((completed / total) * 100)}% rate` : "0% rate"
      },
      {
        id: "in-progress",
        title: "In Progress",
        value: inProgress,
        subtitle: "Currently working on",
        icon: Clock,
        color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900",
        badge: `${inProgress} active`
      },
      {
        id: "overdue",
        title: "Overdue",
        value: overdue,
        subtitle: "Need your attention",
        icon: AlertCircle,
        color: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-100 dark:border-rose-900",
        badge: `${overdue} urgent`
      },
    ];
  }, [tasks]);

  const weeklyProductivity = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      day,
      tasks: 0,
      hours: 0,
    }));
  }, []);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.project.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;
      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, searchTerm, priorityFilter, statusFilter]);

  // Handlers
  const handleMarkCompleted = async (taskId) => {
    const target = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (!target) return;
    if (target.status === "Completed" || target.status === "done") {
      return; // Already locked
    }

    const isConfirmed = await confirm({
      title: "Complete Task",
      message: "Is this task completed? Once completed, this task will be locked and cannot be edited.",
      confirmText: "Yes, Complete",
      cancelText: "Cancel"
    });
    if (!isConfirmed) return;

    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId || t._id === taskId) {
          return { ...t, status: "Completed", progress: 100 };
        }
        return t;
      });
      setUserItem("employee_tasks", updated);
      return updated;
    });

    try {
      await employeeService.updateTaskStatus(taskId, "done");
    } catch (e) {}

    setActivities((act) => {
      const updated = [
        {
          id: Date.now(),
          title: `Marked "${target.title}" as complete`,
          project: target.project,
          time: "Just now",
          icon: CheckCircle2,
          color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
        },
        ...act,
      ];
      setUserItem("employee_activities", updated);
      return updated;
    });
  };

  const handleToggleRSVP = (eventId) => {
    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === eventId ? { ...e, rsvp: !e.rsvp } : e));
      setUserItem("employee_events", updated);
      return updated;
    });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    let priorityColor = "bg-sky-50 text-sky-700 border-sky-200";
    if (newTask.priority === "High") {
      priorityColor = "bg-rose-50 text-rose-700 border-rose-200";
    } else if (newTask.priority === "Medium") {
      priorityColor = "bg-amber-50 text-amber-700 border-amber-200";
    }

    try {
      const serverTask = await employeeService.createTask({
        title: newTask.title.trim(),
        project: newTask.project,
        priority: (newTask.priority || 'medium').toLowerCase(),
        status: (newTask.status || 'todo').toLowerCase().replace(' ', '_'),
        dueDate: newTask.dueDate || null
      });

      const createdTask = {
        id: serverTask.id || serverTask._id || Date.now(),
        _id: serverTask.id || serverTask._id,
        title: serverTask.title || newTask.title,
        project: serverTask.project?.name || newTask.project,
        priority: serverTask.priority || newTask.priority,
        status: serverTask.status || newTask.status,
        color: priorityColor,
        progress: newTask.status === "Completed" ? 100 : newTask.status === "In Progress" ? 30 : 0,
      };

      const updatedTasks = [createdTask, ...tasks];
      setTasks(updatedTasks);
      setUserItem("employee_tasks", updatedTasks);
    } catch (err) {
      const fallbackTask = {
        id: Date.now(),
        ...newTask,
        color: priorityColor,
        progress: newTask.status === "Completed" ? 100 : newTask.status === "In Progress" ? 30 : 0,
      };
      const updatedTasks = [fallbackTask, ...tasks];
      setTasks(updatedTasks);
      setUserItem("employee_tasks", updatedTasks);
    }

    // Reset Form
    setNewTask({
      title: "",
      project: "WorkSync Platform",
      priority: "Medium",
      status: "Pending",
      dueDate: "Oct 28, 2026",
    });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Workspace Header */}
        <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900 shadow-xs">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide border border-slate-200 mb-3 text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>EMPLOYEE WORKSPACE</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">
                Dashboard
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl">
                Welcome back, {userName}! Here's a live overview of your assigned deliverables, board status, and throughput today.
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                New Task
              </button>

              <button
                type="button"
                onClick={() => navigate('/employee/tasks')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200 shadow-xs transition cursor-pointer"
              >
                <FolderKanban className="h-4 w-4 text-slate-600" />
                Tasks Directory
                <ArrowUpRight className="h-4 w-4 opacity-75" />
              </button>
            </div>
          </div>
        </header>

        {/* Top Task Timeline & Kanban Board */}
        <TopTaskTimelineKanban
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskDelete={handleTaskDelete}
          onTaskClick={() => navigate('/employee/tasks')}
          onAddTask={() => setIsModalOpen(true)}
          title="My Assigned Deliverables & Kanban Timeline"
          subtitle="Live sprint delivery status, personal backlog, and completion velocity."
          role="employee"
          theme="light"
        />

        {/* Dynamic Metric Cards Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsComputed.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                      {stat.value}
                    </h2>
                  </div>
                  <div className={`rounded-2xl border p-3.5 transition-transform group-hover:scale-110 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{stat.subtitle}</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md">
                    {stat.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Tab 1: Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            
            {/* Main Priority Tasks List Column */}
            <section className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2 overflow-hidden flex flex-col">
              
              {/* Header & Controls */}
              <div className="flex flex-col gap-4 border-b border-slate-100 p-6 dark:border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    Priority Tasks
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Manage and update your active work items
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[140px] sm:w-auto">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-teal-400"
                    />
                  </div>

                  {/* Priority Select */}
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <option value="All">All Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  {/* Status Select */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Task Items */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 flex-1">
                {filteredTasks.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <AlertCircle className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium">No matching tasks found</p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setPriorityFilter("All");
                        setStatusFilter("All");
                      }}
                      className="mt-2 text-xs font-semibold text-teal-600 hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isCompleted = task.status === "Completed";
                    return (
                      <div
                        key={task.id}
                        className={`group flex flex-col gap-4 p-5 transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between ${
                          isCompleted ? "opacity-60 bg-slate-50/30 dark:bg-slate-900/40" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Interactive Completion Toggle */}
                          <button
                            type="button"
                            onClick={() => !isCompleted && handleMarkCompleted(task.id)}
                            disabled={isCompleted}
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                              isCompleted
                                ? "border-emerald-600 bg-emerald-600 text-white cursor-default"
                                : "border-slate-300 hover:border-teal-600 dark:border-slate-600 cursor-pointer"
                            }`}
                          >
                            {isCompleted && <Check className="h-3.5 w-3.5" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <h3
                              className={`text-sm font-semibold ${
                                isCompleted
                                  ? "line-through text-slate-400 dark:text-slate-500"
                                  : "text-slate-800 dark:text-slate-100"
                              }`}
                            >
                              {task.title}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Briefcase className="h-3 w-3" />
                              {task.project}
                            </p>

                            {/* Badges & Progress */}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${task.color}`}
                              >
                                {task.priority === "High" && (
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                                  </span>
                                )}
                                {task.priority} Priority
                              </span>

                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {task.status}
                                {isCompleted && " (Locked)"}
                              </span>

                              {/* Progress bar */}
                              <div className="hidden sm:flex items-center gap-2 ml-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                  <div
                                    className="h-full bg-teal-600 dark:bg-teal-400 transition-all duration-300"
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-400">{task.progress}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right side due date & controls */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Due Date</p>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {task.dueDate}
                            </p>
                          </div>
                          {isCompleted ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={12} />
                              <span>Completed & Locked</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkCompleted(task.id)}
                              className="mt-1 text-xs font-semibold text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 transition cursor-pointer"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-slate-100 p-4 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {filteredTasks.length} of {tasks.length} tasks assigned to you.
                </p>
              </div>
            </section>

            {/* Upcoming Events Column */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      Upcoming Events
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Your schedule at a glance
                    </p>
                  </div>
                  <Bell className="h-5 w-5 text-slate-400 hover:text-teal-600 transition cursor-pointer" />
                </div>

                <div className="mt-5 space-y-4">
                  {events.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <CalendarDays className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-medium">No upcoming events scheduled</p>
                      <p className="text-xs text-slate-400 mt-1">Events will appear here when scheduled</p>
                    </div>
                  ) : (
                    events.map((event) => (
                      <div
                        key={event.id}
                        className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-teal-200 hover:bg-teal-50/30 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:border-teal-800"
                      >
                        {/* Date Badge */}
                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm dark:bg-teal-700">
                          <span className="text-base font-extrabold leading-tight">
                            {event.day}
                          </span>
                          <span className="text-[9px] font-bold tracking-widest uppercase">
                            {event.month}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {event.title}
                            </h3>
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {event.time}
                          </p>
                          
                          <div className="mt-2 flex items-center justify-between">
                            <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                              {event.type}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleRSVP(event.id)}
                              className={`text-[11px] font-bold transition ${
                                event.rsvp
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400 hover:text-teal-600"
                              }`}
                            >
                              {event.rsvp ? "✓ Attending" : "+ RSVP"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => navigate('/employee/calendar')}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-teal-600 hover:text-teal-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400"
                >
                  View full schedule
                </button>
              </div>
            </section>

            {/* Recent Activity Grid Span */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    Recent Activity
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Your latest updates and work logs
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/employee/activity')}
                  aria-label="More activity options"
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="mt-6 py-8 text-center text-slate-400">
                  <Activity className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-medium">No recent activity logged</p>
                  <p className="text-xs text-slate-400 mt-1">Activities will appear as you work on tasks</p>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {activities.map((act) => {
                    const Icon = act.icon;
                    return (
                      <div
                        key={act.id}
                        className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 p-4 transition-all hover:shadow-md dark:border-slate-800/60 dark:bg-slate-800/20"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${act.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {act.title}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            {act.project}
                          </p>
                          <p className="mt-2 text-[10px] font-semibold text-slate-400">
                            {act.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Tab 2: Productivity Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    Weekly Task & Hours Output
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Visual comparison of completed tasks and active work hours logged this week
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-teal-600 inline-block" />
                    <span>Tasks Done</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-emerald-400 inline-block" />
                    <span>Hours Spent</span>
                  </div>
                </div>
              </div>

              {/* CSS Visual Bar Chart */}
              <div className="mt-8 grid grid-cols-7 gap-2 sm:gap-4 items-end h-64 pt-8 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
                {weeklyProductivity.map((item) => {
                  const maxTaskVal = 10;
                  const taskHeightPercent = (item.tasks / maxTaskVal) * 100;
                  const hoursHeightPercent = (item.hours / 10) * 100;

                  return (
                    <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="flex items-end gap-1.5 h-full w-full justify-center">
                        {/* Tasks Bar */}
                        <div
                          style={{ height: `${taskHeightPercent}%` }}
                          className="w-3 sm:w-6 rounded-t-lg bg-teal-600 dark:bg-teal-500 transition-all duration-500 group-hover:bg-teal-700 relative"
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none transition">
                            {item.tasks}t
                          </span>
                        </div>

                        {/* Hours Bar */}
                        <div
                          style={{ height: `${hoursHeightPercent}%` }}
                          className="w-3 sm:w-6 rounded-t-lg bg-emerald-400 dark:bg-emerald-500/80 transition-all duration-500 group-hover:bg-emerald-500 relative"
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none transition">
                            {item.hours}h
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Summary Bottom Info */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500">Total Hours Worked</p>
                  <p className="text-xl font-bold text-teal-700 dark:text-teal-400 mt-1">
                    {tasks.filter((t) => t.status === "Completed").length * 2} hrs
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500">Avg Daily Productivity</p>
                  <p className="text-xl font-bold text-teal-700 dark:text-teal-400 mt-1">
                    {tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100) : 0}%
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500">Tasks Completed</p>
                  <p className="text-xl font-bold text-teal-700 dark:text-teal-400 mt-1">
                    {tasks.filter((t) => t.status === "Completed").length} tasks
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 3: Kanban Board */}
        {activeTab === "kanban" && (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Kanban className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    Sprint Kanban Board
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Drag or advance your tasks across delivery stages in real-time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    New Task
                  </button>
                  <button
                    onClick={() => navigate("/employee/boards")}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition"
                  >
                    Full Boards
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <KanbanBoard
                  tasks={tasks}
                  onTaskMove={handleTaskMove}
                  onTaskDelete={handleTaskDelete}
                  onTaskClick={() => navigate('/employee/tasks')}
                  onAddTask={() => setIsModalOpen(true)}
                  theme="light"
                />
              </div>
            </section>
          </div>
        )}

        {/* Modal: Add New Task Slide-over / Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-teal-600" />
                  Create New Task
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement user settings dashboard"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Project
                    </label>
                    <select
                      value={newTask.project}
                      onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="WorkSync Platform">WorkSync Platform</option>
                      <option value="Authentication Module">Authentication Module</option>
                      <option value="Employee Management">Employee Management</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Status
                    </label>
                    <select
                      value={newTask.status}
                      onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Due Date
                    </label>
                    <input
                      type="text"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-800 active:scale-95"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}