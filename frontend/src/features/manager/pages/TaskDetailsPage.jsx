import React, { useState, useEffect } from "react";
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
  Trash2,
  Edit3,
  CornerDownRight,
  Check,
  X,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import { initialManagerTasks } from "./TasksPage.jsx";
import managerService from "../managerService.js";
import { getCurrentUser } from "../../../utils/userStorage.js";

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

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = getCurrentUser();

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

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const loadComments = () => {
    if (!taskId) return;
    managerService.getTaskComments(taskId).then((data) => {
      setComments(Array.isArray(data) ? data : []);
    });
  };

  useEffect(() => {
    loadComments();
  }, [taskId]);

  // 1. Add Comment (POST /api/v1/manager/tasks/:taskId/comments)
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const added = await managerService.addTaskComment(taskId, { content: newComment.trim() });
      setComments((prev) => [...prev, added]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Add Reply (POST /api/v1/manager/tasks/:taskId/comments/:commentId/replies)
  const handleAddReply = async (commentId) => {
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const reply = await managerService.addCommentReply(taskId, commentId, { content: replyContent.trim() });
      setComments((prev) =>
        prev.map((c) => {
          const cId = c.id || c._id;
          if (cId === commentId) {
            return { ...c, replies: [...(c.replies || []), reply] };
          }
          return c;
        })
      );
      setReplyingCommentId(null);
      setReplyContent("");
    } catch (err) {
      console.error("Failed to reply to comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Edit Comment (PATCH /api/v1/manager/comments/:commentId)
  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      await managerService.updateComment(commentId, { content: editContent.trim() });
      setComments((prev) =>
        prev.map((c) => {
          const cId = c.id || c._id;
          if (cId === commentId) {
            return { ...c, content: editContent.trim(), text: editContent.trim() };
          }
          return c;
        })
      );
      setEditingCommentId(null);
      setEditContent("");
    } catch (err) {
      console.error("Failed to edit comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Delete Comment (DELETE /api/v1/manager/comments/:commentId)
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await managerService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => (c.id || c._id) !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
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
                    <h2 className="text-sm font-bold text-slate-900">Task Discussion & Comments</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {comments.length}
                    </span>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((c) => {
                      const commentId = c.id || c._id;
                      const authorName = c.author?.name || c.author || "Team Member";
                      const authorAvatar = (authorName || "M").slice(0, 2).toUpperCase();
                      const commentText = c.content || c.text || "";
                      const isEditing = editingCommentId === commentId;
                      const isReplying = replyingCommentId === commentId;

                      return (
                        <div
                          key={commentId}
                          className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4 text-xs transition space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-[9px] font-bold text-white shadow-xs">
                                {authorAvatar}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-800">{authorName}</span>
                                <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                                  {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : c.time || "Recently"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingCommentId(isReplying ? null : commentId);
                                  setReplyContent("");
                                }}
                                className="text-[11px] font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
                              >
                                <CornerDownRight size={11} />
                                <span>Reply</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCommentId(isEditing ? null : commentId);
                                  setEditContent(commentText);
                                }}
                                className="text-slate-400 hover:text-slate-700"
                                title="Edit comment"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(commentId)}
                                className="text-slate-400 hover:text-rose-600"
                                title="Delete comment"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Comment Body / Edit View */}
                          {isEditing ? (
                            <div className="space-y-2 pt-1 pl-8">
                              <textarea
                                rows={2}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingCommentId(null)}
                                  className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() => handleSaveEdit(commentId)}
                                  className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                                >
                                  Save Edit
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-700 leading-relaxed pl-8">{commentText}</p>
                          )}

                          {/* Nested Replies */}
                          {Array.isArray(c.replies) && c.replies.length > 0 && (
                            <div className="mt-2 pl-8 space-y-2 border-l-2 border-slate-200 ml-3">
                              {c.replies.map((r) => {
                                const rAuthor = r.author?.name || r.author || "Team Member";
                                return (
                                  <div key={r.id || r._id} className="rounded-lg bg-white p-2.5 border border-slate-100 text-xs">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-semibold text-slate-800 text-[11px]">{rAuthor}</span>
                                      <span className="text-[10px] text-slate-400">
                                        {r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                                      </span>
                                    </div>
                                    <p className="text-slate-600 text-[11px]">{r.content || r.text}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Inline Reply Input */}
                          {isReplying && (
                            <div className="mt-2 pl-8 space-y-2">
                              <textarea
                                rows={2}
                                placeholder={`Reply to ${authorName}...`}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setReplyingCommentId(null)}
                                  className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() => handleAddReply(commentId)}
                                  className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                                >
                                  Post Reply
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No comments on this deliverable yet. Start the conversation below.
                    </div>
                  )}
                </div>

                {/* Add Comment Input Form */}
                <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100">
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
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                      >
                        <Send size={13} />
                        <span>{submitting ? "Posting..." : "Post Comment"}</span>
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
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      statusStyles[task.status] || statusStyles["In Progress"]
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                    {task.status}
                  </span>
                </div>

                {/* Priority */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Priority</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      priorityStyles[task.priority] || priorityStyles.Medium
                    }`}
                  >
                    <Flag size={12} />
                    {task.priority} Priority
                  </span>
                </div>

                {/* Due Date */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Target Due Date</span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{deadline}</span>
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Assignee</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr ${
                        task.assigneeColor || "from-blue-600 to-indigo-600"
                      } text-[10px] font-bold text-white shadow-xs`}
                    >
                      {task.assigneeAvatar || "DS"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{task.assignee}</p>
                      <p className="text-[10px] text-slate-400">{task.assigneeRole || "Contributor"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Back link */}
              <div className="text-center">
                <Link
                  to="/manager/tasks"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  &larr; Back to Task List
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
