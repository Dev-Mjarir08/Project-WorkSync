import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FolderKanban,
  User,
  Clock3,
  MessageSquare,
  FileText,
  Send,
  Flag,
  CheckCircle2,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import { initialManagerTasks } from "./TasksPage.jsx";

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

const defaultComments = [
  {
    id: 1,
    author: "Devanshi Sharma",
    role: "Engineering Manager",
    avatar: "DS",
    color: "from-blue-600 to-indigo-600",
    time: "2 hours ago",
    text: "Please verify that the optimistic UI rollback handles API dropouts gracefully and unit test coverage is maintained above 80%.",
  },
  {
    id: 2,
    author: "Ayan Mukherjee",
    role: "Fullstack Admin",
    avatar: "AM",
    color: "from-cyan-500 to-blue-600",
    time: "45 minutes ago",
    text: "Dependencies and environment configurations have been verified on the staging deployment.",
  },
];

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Match task from available initial tasks or use placeholder data
  const task = initialManagerTasks.find((t) => String(t.id) === String(taskId)) || {
    id: taskId || "task-1",
    title: "Implement WebSocket connection and live presence sync",
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
    deadline: "Oct 30, 2026",
    description:
      "Establish robust bi-directional WebSocket connections with automatic reconnection strategies and heartbeats. Implement real-time user presence indicators across active workspaces and boards to show active collaborators.",
  };

  const taskDescription =
    task.description ||
    "Establish robust bi-directional WebSocket connections with automatic reconnection strategies and heartbeats. Implement real-time user presence indicators across active workspaces and boards to show active collaborators.";

  const deadline = task.dueDate || task.deadline || "Oct 30, 2026";

  // Comments state for local interaction
  const [comments, setComments] = useState(defaultComments);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: Date.now(),
      author: "Devanshi Sharma",
      role: "Engineering Manager",
      avatar: "DS",
      color: "from-blue-600 to-indigo-600",
      time: "Just now",
      text: newComment.trim(),
    };

    setComments([...comments, commentObj]);
    setNewComment("");
  };

  const breadcrumbs = [
    { label: "Tasks", href: "/manager/tasks" },
    { label: "Task Details" },
  ];

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
                  {taskDescription}
                </p>
              </div>

              {/* Comments Section Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900">Comments</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {comments.length}
                    </span>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4 text-xs transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr ${c.color || "from-blue-600 to-indigo-600"} text-[9px] font-bold text-white shadow-xs`}
                          >
                            {c.avatar || "DS"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800">{c.author}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                              ({c.role})
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-8">{c.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment Input Form */}
                <form onSubmit={handleAddComment} className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Leave a comment
                  </label>
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      placeholder="Write an update, question, or comment for your team..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition resize-y"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer"
                      >
                        <Send size={13} />
                        <span>Post Comment</span>
                      </button>
                    </div>
                  </div>
                </form>
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
                    <span>{deadline}</span>
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
                        task.assigneeColor || "from-blue-600 to-indigo-600"
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
                  <Link
                    to={`/manager/projects/${task.projectId || "proj-1"}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                  >
                    <FolderKanban size={13} />
                    <span>{task.project}</span>
                  </Link>
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
