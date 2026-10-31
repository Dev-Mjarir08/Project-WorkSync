import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Download,
  FileArchive,
  FileText,
  Flag,
  FolderKanban,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
  CircleCheck,
  ListChecks,
} from "lucide-react";

export default function TaskDetailsPage({ onBack }) {
  const [task, setTask] = useState({
    id: 1,
    title: "Complete employee dashboard UI",
    project: "WorkSync Platform",
    priority: "High",
    status: "In Progress",
    dueDate: "Oct 30, 2026",
    assignedBy: "Sarah Jenkins",
    assignee: "Rouhan",
    description:
      "Implement the responsive employee dashboard UI using Tailwind CSS and Lucide icons. Ensure full mobile support, consistent dark mode colors, and interactive dashboard components.",
    subtasks: [
      { id: 101, title: "Create stats cards grid layout", completed: true },
      { id: 102, title: "Build priority deliverables component", completed: true },
      { id: 103, title: "Add schedule widget and quick notes", completed: false },
      { id: 104, title: "Test responsive layouts on mobile", completed: false },
    ],
    attachments: [
      {
        id: 1,
        name: "Dashboard_Wireframe_v2.pdf",
        size: "2.4 MB",
        type: "pdf",
      },
      {
        id: 2,
        name: "Design_Tokens_Figma.zip",
        size: "4.1 MB",
        type: "zip",
      },
    ],
  });

  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Sarah Jenkins",
      role: "UI/UX Designer",
      avatar: "SJ",
      time: "2 hours ago",
      text: "Looks great so far, Rouhan! Make sure the dark mode colors are consistent across all components.",
    },
    {
      id: 2,
      author: "Rouhan",
      role: "Frontend Developer",
      avatar: "R",
      time: "30 mins ago",
      text: "Thanks Sarah! I've finished the dark mode tokens and sticky header. Working on the schedule widget now.",
    },
  ]);

  const [newComment, setNewComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [showMenu, setShowMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const completedSubtasks = task.subtasks.filter(
    (subtask) => subtask.completed
  ).length;

  const totalSubtasks = task.subtasks.length;

  const progressPercent =
    totalSubtasks > 0
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : 0;

  const toggleSubtask = (subtaskId) => {
    setTask((current) => {
      const subtasks = current.subtasks.map((subtask) =>
        subtask.id === subtaskId
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      );

      const allCompleted =
        subtasks.length > 0 && subtasks.every((subtask) => subtask.completed);

      return {
        ...current,
        subtasks,
        status: allCompleted ? "Completed" : "In Progress",
      };
    });
  };

  const handleAddComment = (event) => {
    event.preventDefault();

    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      author: "Rouhan",
      role: "Frontend Developer",
      avatar: "R",
      time: "Just now",
      text: newComment.trim(),
    };

    setComments((current) => [...current, comment]);
    setNewComment("");
    setShowCommentInput(false);
  };

  const saveTaskChanges = (event) => {
    event.preventDefault();

    if (!editTitle.trim()) return;

    setTask((current) => ({
      ...current,
      title: editTitle.trim(),
      description: editDescription.trim(),
    }));

    setEditing(false);
  };

  const markTaskComplete = () => {
    const completed = task.status !== "Completed";

    setTask((current) => ({
      ...current,
      status: completed ? "Completed" : "In Progress",
      subtasks: current.subtasks.map((subtask) => ({
        ...subtask,
        completed,
      })),
    }));
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (confirmed) {
      setDeleted(true);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (deleted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 dark:bg-[#0b1120]">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <Trash2 size={25} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
            Task deleted
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            This task has been removed from the current page.
          </p>

          <button
            onClick={handleBack}
            className="mt-6 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Back to tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 px-4 py-5 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 pb-24">
        {/* Breadcrumb and top actions */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
            <button
              onClick={handleBack}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-semibold text-slate-600 transition hover:border-teal-300 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-teal-400"
            >
              <ArrowLeft size={16} />
              <span>Tasks</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">/</span>

            <span className="truncate font-medium text-slate-500 dark:text-slate-400">
              Task details
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditTitle(task.title);
                setEditDescription(task.description);
                setEditing(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-teal-400 sm:text-sm"
            >
              <Pencil size={15} />
              Edit task
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu((current) => !current)}
                aria-label="More task options"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <MoreHorizontal size={19} />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 size={15} />
                    Delete task
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main task heading */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500" />

          <div className="p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-[11px] font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    <FolderKanban size={13} />
                    {task.project}
                  </span>

                  <StatusBadge status={task.status} />

                  <PriorityBadge priority={task.priority} />
                </div>

                <h1 className="mt-5 max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                  {task.title}
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                  {task.description}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      {task.assignedBy
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Assigned by
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        {task.assignedBy}
                      </p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                      <CalendarDays size={17} />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Due date
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        {task.dueDate}
                      </p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-xs font-extrabold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                      R
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Assigned to
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        {task.assignee}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:flex-col">
                <button
                  onClick={markTaskComplete}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                    task.status === "Completed"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700"
                  }`}
                >
                  <CheckCircle2 size={17} />
                  {task.status === "Completed"
                    ? "Reopen task"
                    : "Mark complete"}
                </button>

                <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <Users size={15} />
                  Team workspace
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progress overview */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <OverviewCard
            label="Task progress"
            value={`${progressPercent}%`}
            detail={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}
            icon={ListChecks}
            color="teal"
          />

          <OverviewCard
            label="Remaining work"
            value={totalSubtasks - completedSubtasks}
            detail="Subtasks left to complete"
            icon={Clock3}
            color="amber"
          />

          <OverviewCard
            label="Discussion"
            value={comments.length}
            detail="Comments and updates"
            icon={MessageSquare}
            color="blue"
          />
        </section>

        {/* Main content and sidebar */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="min-w-0 space-y-6 lg:col-span-2">
            {/* Checklist */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                    <ListChecks size={20} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Subtasks checklist
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Break down the task into smaller steps
                    </p>
                  </div>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="mb-6">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Overall completion
                    </span>

                    <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400">
                      {progressPercent}%
                    </span>
                  </div>

                  <div
                    className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                    role="progressbar"
                    aria-label="Task progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progressPercent}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {task.subtasks.map((subtask, index) => (
                    <button
                      type="button"
                      key={subtask.id}
                      onClick={() => toggleSubtask(subtask.id)}
                      className={`flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition ${
                        subtask.completed
                          ? "border-teal-100 bg-teal-50/50 dark:border-teal-500/15 dark:bg-teal-500/[0.04]"
                          : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-500/30 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                          subtask.completed
                            ? "border-teal-600 bg-teal-600 text-white"
                            : "border-slate-300 text-transparent dark:border-slate-600"
                        }`}
                      >
                        {subtask.completed && <Check size={12} />}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-sm font-semibold ${
                            subtask.completed
                              ? "text-slate-400 line-through dark:text-slate-500"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {subtask.title}
                        </span>

                        <span className="mt-1 block text-[10px] text-slate-400">
                          Step {index + 1}
                        </span>
                      </span>

                      <span
                        className={`shrink-0 text-[10px] font-bold ${
                          subtask.completed
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-slate-400"
                        }`}
                      >
                        {subtask.completed ? "Completed" : "Pending"}
                      </span>
                    </button>
                  ))}
                </div>

                {progressPercent === 100 && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CircleCheck size={16} />
                    All subtasks are complete. Great work!
                  </div>
                )}
              </div>
            </section>

            {/* Attachments */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                    <Paperclip size={19} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Attachments
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Files related to this task
                    </p>
                  </div>
                </div>

                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {task.attachments.length} files
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:p-6">
                {task.attachments.map((attachment) => (
                  <AttachmentCard
                    key={attachment.id}
                    attachment={attachment}
                  />
                ))}
              </div>
            </section>

            {/* Comments */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <MessageSquare size={19} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Activity & comments
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Updates from your team
                    </p>
                  </div>
                </div>

                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {comments.length}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                {comments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
                    <MessageSquare
                      size={24}
                      className="mx-auto text-slate-300 dark:text-slate-600"
                    />
                    <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      No comments yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Start a conversation about this task.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3.5">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                            comment.author === "Rouhan"
                              ? "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300"
                              : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                          }`}
                        >
                          {comment.avatar}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                              {comment.author}
                            </h3>

                            <span className="text-[10px] text-slate-400">
                              {comment.role}
                            </span>

                            <span className="text-[10px] text-slate-400">
                              · {comment.time}
                            </span>
                          </div>

                          <div className="mt-2 rounded-xl rounded-tl-sm border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                            <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showCommentInput ? (
                  <form
                    onSubmit={handleAddComment}
                    className="mt-6 rounded-2xl border border-teal-200 bg-teal-50/30 p-3 dark:border-teal-500/20 dark:bg-teal-500/[0.04] sm:p-4"
                  >
                    <textarea
                      autoFocus
                      rows={3}
                      value={newComment}
                      onChange={(event) => setNewComment(event.target.value)}
                      placeholder="Share an update or ask a question..."
                      className="w-full resize-y bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                    />

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCommentInput(false);
                          setNewComment("");
                        }}
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send size={14} />
                        Post comment
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowCommentInput(true)}
                    className="mt-6 flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3.5 text-left text-xs font-medium text-slate-400 transition hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-700 dark:border-slate-700 dark:hover:bg-teal-500/[0.04] dark:hover:text-teal-400"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      <MessageSquare size={15} />
                    </div>
                    Add a comment or share an update...
                    <ArrowUpRight size={15} className="ml-auto" />
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="min-w-0 space-y-6">
            {/* Task information */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Task information
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Details and ownership
                </p>
              </div>

              <div className="space-y-5 p-5">
                <MetadataRow
                  icon={FolderKanban}
                  label="Project"
                  value={task.project}
                  color="teal"
                />

                <MetadataRow
                  icon={UserRound}
                  label="Assigned by"
                  value={task.assignedBy}
                  color="blue"
                />

                <MetadataRow
                  icon={Users}
                  label="Assigned to"
                  value={task.assignee}
                  color="violet"
                />

                <MetadataRow
                  icon={CalendarDays}
                  label="Due date"
                  value={task.dueDate}
                  color="amber"
                />

                <MetadataRow
                  icon={Flag}
                  label="Priority"
                  value={task.priority}
                  color="rose"
                />

                <MetadataRow
                  icon={Circle}
                  label="Status"
                  value={task.status}
                  color="emerald"
                />
              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/30">
                <button
                  onClick={markTaskComplete}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition ${
                    task.status === "Completed"
                      ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      : "bg-teal-600 text-white shadow-md shadow-teal-600/15 hover:bg-teal-700"
                  }`}
                >
                  {task.status === "Completed" ? (
                    <>
                      <Circle size={15} />
                      Reopen task
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Mark as complete
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Progress card */}
            <section className="overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-5 dark:border-teal-500/20 dark:from-teal-500/[0.09] dark:via-slate-900 dark:to-emerald-500/[0.04]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm dark:bg-slate-800 dark:text-teal-400">
                  <Sparkles size={19} />
                </div>

                <span className="rounded-lg bg-white/80 px-2.5 py-1.5 text-[10px] font-bold text-teal-700 dark:bg-slate-800 dark:text-teal-300">
                  {progressPercent === 100 ? "Completed" : "In progress"}
                </span>
              </div>

              <h3 className="mt-5 text-base font-extrabold text-slate-900 dark:text-white">
                {progressPercent === 100
                  ? "Excellent work!"
                  : "Keep up the momentum"}
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-400">
                {progressPercent === 100
                  ? "All checklist items have been completed."
                  : "Complete the remaining checklist items to move this task forward."}
              </p>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Task completion
                  </span>
                  <span className="text-xs font-extrabold text-teal-700 dark:text-teal-400">
                    {progressPercent}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Quick details */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Clock3 size={17} />
                </div>

                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Quick summary
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <QuickSummaryRow
                  label="Checklist"
                  value={`${completedSubtasks}/${totalSubtasks} completed`}
                />

                <QuickSummaryRow
                  label="Attachments"
                  value={`${task.attachments.length} files`}
                />

                <QuickSummaryRow
                  label="Comments"
                  value={`${comments.length} updates`}
                />

                <QuickSummaryRow
                  label="Priority"
                  value={task.priority}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Edit task modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveTaskChanges}
            className="my-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Edit task
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Update the task title and description.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Close edit form"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Task title
                </label>

                <input
                  id="task-title"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="task-description"
                  className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Description
                </label>

                <textarea
                  id="task-description"
                  rows={5}
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(event.target.value)
                  }
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* Status badge */
function StatusBadge({ status }) {
  const completed = status === "Completed";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
        completed
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
      }`}
    >
      {completed ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
      {status}
    </span>
  );
}

/* Priority badge */
function PriorityBadge({ priority }) {
  const styles = {
    High: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    Medium:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    Low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
        styles[priority] || styles.Medium
      }`}
    >
      <Flag size={12} />
      {priority} priority
    </span>
  );
}

/* Overview card */
function OverviewCard({ label, value, detail, icon: Icon, color }) {
  const styles = {
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-2 text-[11px] text-slate-400">{detail}</p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[color]}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

/* Metadata row */
function MetadataRow({ icon: Icon, label, value, color }) {
  const iconStyles = {
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconStyles[color]}`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-slate-400">{label}</p>
        <p className="mt-1 break-words text-xs font-bold text-slate-800 dark:text-slate-200">
          {value}
        </p>
      </div>
    </div>
  );
}

/* Attachment card */
function AttachmentCard({ attachment }) {
  const isZip = attachment.type === "zip";

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-teal-200 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:border-teal-500/20 dark:hover:bg-slate-800/50">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          isZip
            ? "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
            : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        }`}
      >
        {isZip ? <FileArchive size={20} /> : <FileText size={20} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
          {attachment.name}
        </p>

        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {attachment.type} · {attachment.size}
        </p>
      </div>

      <button
        type="button"
        disabled
        title="Connect this attachment to a real file URL to enable downloading"
        aria-label={`Download ${attachment.name} (not configured)`}
        className="flex h-9 w-9 shrink-0 cursor-not-allowed items-center justify-center rounded-lg text-slate-300 dark:text-slate-600"
      >
        <Download size={16} />
      </button>
    </div>
  );
}

/* Quick summary row */
function QuickSummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className="text-right text-xs font-bold text-slate-800 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}