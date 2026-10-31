import React, { useState } from "react";
import {
  Kanban,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  User,
  Paperclip,
  MessageSquare,
  X,
  Filter,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export default function BoardsPage() {
  // Board columns and state
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete employee dashboard UI",
      project: "WorkSync Platform",
      priority: "High",
      status: "in-progress",
      dueDate: "Oct 30, 2026",
      assignee: "Rouhan",
      comments: 3,
      attachments: 2,
    },
    {
      id: 2,
      title: "Fix authentication validation",
      project: "Auth Module",
      priority: "Medium",
      status: "todo",
      dueDate: "Nov 02, 2026",
      assignee: "Alex Rivera",
      comments: 1,
      attachments: 0,
    },
    {
      id: 3,
      title: "Update component documentation",
      project: "WorkSync Platform",
      priority: "Low",
      status: "review",
      dueDate: "Nov 05, 2026",
      assignee: "Rouhan",
      comments: 5,
      attachments: 1,
    },
    {
      id: 4,
      title: "Design Figma Dark Mode Tokens",
      project: "UI/UX Design",
      priority: "High",
      status: "completed",
      dueDate: "Oct 24, 2026",
      assignee: "Sarah Jenkins",
      comments: 2,
      attachments: 4,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("WorkSync Platform");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskColumn, setNewTaskColumn] = useState("todo");

  // Kanban Columns definitions
  const columns = [
    { id: "todo", title: "To Do", color: "bg-slate-500", badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-500", badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
    { id: "review", title: "Under Review", color: "bg-amber-500", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
    { id: "completed", title: "Completed", color: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
  ];

  // Move task to a different column
  const moveTask = (taskId, newStatus) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  // Add new task handler
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      project: newTaskProject,
      priority: newTaskPriority,
      status: newTaskColumn,
      dueDate: "Nov 10, 2026",
      assignee: "Rouhan",
      comments: 0,
      attachments: 0,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setIsModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      selectedPriority === "all" || t.priority.toLowerCase() === selectedPriority.toLowerCase();
    return matchesQuery && matchesPriority;
  });

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
            <Kanban size={13} /> SPRINT KANBAN BOARD
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Project Board
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track workflow progress and move task deliverables through completion stages.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:bg-teal-700 active:scale-95"
        >
          <Plus size={18} /> New Board Card
        </button>
      </div>

      {/* Control Bar: Search & Priority Filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Filter board items by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Sprint Completion Meter */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600 dark:text-slate-300">Board Progress Overview</span>
          <span className="text-teal-600 dark:text-teal-400">
            {completedCount} of {totalTasks} Tasks Completed ({progressPercent}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Kanban Columns Layout */}
      <div className="grid grid-cols-1 gap-6 overflow-x-auto pb-4 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="flex flex-col rounded-3xl border border-slate-200/80 bg-slate-100/60 p-4 dark:border-slate-800/80 dark:bg-slate-900/50"
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{col.title}</h3>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${col.badge}`}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Task Cards Column Body */}
              <div className="flex-1 space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-center text-xs font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-900/30">
                    No items here
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-teal-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      {/* Category & Priority Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {task.project}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            task.priority === "High"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                              : task.priority === "Medium"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                        {task.title}
                      </h4>

                      {/* Card Footer Details */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MessageSquare size={13} /> {task.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Paperclip size={13} /> {task.attachments}
                          </span>
                        </div>

                        {/* Move Column Selector */}
                        <select
                          value={task.status}
                          onChange={(e) => moveTask(task.id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-700 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating Board Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-teal-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Board Deliverable</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Card Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Update mobile bottom nav styles"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Target Column</label>
                <select
                  value={newTaskColumn}
                  onChange={(e) => setNewTaskColumn(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Under Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Priority Level</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-teal-700"
                >
                  Create Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}