import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FolderKanban,
  Clock3,
  FileText,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import managerService from "../managerService.js";

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  done: "Completed",
};

const formatDate = (date) => date
  ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })
  : "Not set";

const toTaskView = (task) => {
  const assignee = task.assignee;
  const assigneeName = assignee?.name || "Unassigned";
  const project = task.project;
  return {
    ...task,
    id: task.id || task._id,
    projectId: project?.id || project?._id || "",
    project: project?.name || "No project",
    status: statusLabels[task.status] || task.status || "To Do",
    priority: task.priority
      ? `${task.priority[0].toUpperCase()}${task.priority.slice(1)}`
      : "Medium",
    assignee: assigneeName,
    assigneeRole: assignee?.role || "Member",
    assigneeAvatar: assignee?.avatar || assigneeName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?",
    dueDate: formatDate(task.dueDate),
  };
};

const toActivityView = (activity) => ({
  ...activity,
  id: activity.id || activity._id,
  author: activity.user?.name || "Workspace member",
  avatar: activity.user?.avatar || activity.user?.name?.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?",
  text: activity.description || activity.action || "Task activity",
  time: activity.createdAt ? new Date(activity.createdAt).toLocaleString() : "Time unavailable",
});

const priorityStyles = {
  Urgent: "bg-rose-100 text-rose-800 border-rose-300",
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

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [task, setTask] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setTask(null);
    setActivities([]);
    if (!taskId) {
      setError("A task ID is required.");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    Promise.all([
      managerService.getTask(taskId),
      managerService.getTaskActivities(taskId),
    ])
      .then(([taskData, activityData]) => {
        if (!active) return;
        setTask(toTaskView(taskData));
        setActivities(activityData.map(toActivityView));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load task details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [taskId]);

  const breadcrumbs = [
    { label: "Tasks", href: "/manager/tasks" },
    { label: task?.title || "Task Details" },
  ];

  if (loading || error || !task) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
        <Sidebar activeItem="tasks" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
        <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
          <Header setMobileOpen={setMobileMenuOpen} breadcrumbs={breadcrumbs} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
            {loading ? (
              <p role="status" className="text-sm text-slate-500">Loading task details...</p>
            ) : (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error || "Task details are unavailable."}
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar activeItem="tasks" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Consistent Top Header */}
        <Header setMobileOpen={setMobileMenuOpen} breadcrumbs={breadcrumbs} />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto">
          {/* Back Navigation & Header */}
          <div>
            <Link
              to="/manager/tasks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-3"
            >
              <ArrowLeft size={14} />
              <span>Back to Tasks</span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                    {task.project}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">#{task.id}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {task.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Details Grid: Left Content (Description + Comments) & Right Meta Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Description & Comments */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Description Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-3">
                  <FileText size={15} className="text-blue-600" />
                  <span>Task Description</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {task.description || "No description provided."}
                </p>
              </div>

              {/* Activity History Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock3 size={16} className="text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900">Activity</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {activities.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4 text-xs transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-[9px] font-bold text-white shadow-xs"
                          >
                            {activity.avatar}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800">{activity.author}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{activity.time}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-8">{activity.text}</p>
                    </div>
                  ))}
                </div>
                {activities.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">No activity recorded for this task.</p>
                )}
              </div>
            </div>

            {/* Right Meta Column: Priority, Status, Deadline, Assignee */}
            <div className="space-y-6">
              {/* Task Meta Information Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  Task Properties
                </h3>

                {/* Status */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Status</span>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      statusStyles[task.status] || statusStyles["To Do"]
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                {/* Priority */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Priority</span>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      priorityStyles[task.priority] || priorityStyles.Medium
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                </div>

                {/* Deadline */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Deadline</span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{task.dueDate}</span>
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Assignee
                  </span>
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr ${
                        "from-blue-600 to-indigo-600"
                      } text-[10px] font-bold text-white shadow-xs`}
                    >
                      {task.assigneeAvatar || "DS"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{task.assignee}</p>
                      <p className="text-[10px] text-slate-500">
                        {task.assigneeRole || "Engineering Manager"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Project Link */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Project
                  </span>
                  {task.projectId ? (
                    <Link
                      to={`/manager/projects/${task.projectId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                    >
                      <FolderKanban size={13} />
                      <span>{task.project}</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500">{task.project}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
