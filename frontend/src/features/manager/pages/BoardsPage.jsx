import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Kanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock3,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  X,
  Menu,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Users,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import { initialProjects } from "./ProjectsPage.jsx";

const initialBoardTasks = [
  {
    id: "kb-1",
    title: "Implement WebSocket connection and live presence sync",
    column: "Done",
    priority: "High",
    assignee: "Ayan Mukherjee",
    assigneeAvatar: "AM",
    assigneeRole: "Fullstack Admin",
    assigneeColor: "from-cyan-500 to-blue-600",
    dueDate: "Oct 18",
    tags: ["Backend", "Sockets"],
  },
  {
    id: "kb-2",
    title: "Design dark theme SaaS workspace layout and card tokens",
    column: "Done",
    priority: "Medium",
    assignee: "Priya Patel",
    assigneeAvatar: "PP",
    assigneeRole: "UI Designer",
    assigneeColor: "from-violet-500 to-purple-600",
    dueDate: "Oct 20",
    tags: ["Design", "UI"],
  },
  {
    id: "kb-3",
    title: "Build Kanban board column state and status transition handlers",
    column: "In Progress",
    priority: "High",
    assignee: "Rouhan Siddiqui",
    assigneeAvatar: "RS",
    assigneeRole: "Frontend Dev",
    assigneeColor: "from-emerald-500 to-teal-600",
    dueDate: "Oct 28",
    tags: ["Frontend", "State"],
  },
  {
    id: "kb-4",
    title: "Configure role-based access control and manager route guards",
    column: "In Progress",
    priority: "High",
    assignee: "Devanshi Sharma",
    assigneeAvatar: "DS",
    assigneeRole: "Engineering Manager",
    assigneeColor: "from-blue-600 to-indigo-600",
    dueDate: "Oct 30",
    tags: ["Auth", "Security"],
  },
  {
    id: "kb-5",
    title: "Audit client-side bundle size and verify Vite code splitting",
    column: "In Review",
    priority: "Low",
    assignee: "Ayan Mukherjee",
    assigneeAvatar: "AM",
    assigneeRole: "Fullstack Admin",
    assigneeColor: "from-cyan-500 to-blue-600",
    dueDate: "Nov 02",
    tags: ["Performance", "Vite"],
  },
  {
    id: "kb-6",
    title: "Write integration tests for sprint burn-down calculations",
    column: "To Do",
    priority: "Medium",
    assignee: "Rouhan Siddiqui",
    assigneeAvatar: "RS",
    assigneeRole: "Frontend Dev",
    assigneeColor: "from-emerald-500 to-teal-600",
    dueDate: "Nov 08",
    tags: ["Testing", "QA"],
  },
  {
    id: "kb-7",
    title: "Deploy staging environment and configure automated CI pipeline",
    column: "To Do",
    priority: "High",
    assignee: "Devanshi Sharma",
    assigneeAvatar: "DS",
    assigneeRole: "Engineering Manager",
    assigneeColor: "from-blue-600 to-indigo-600",
    dueDate: "Nov 12",
    tags: ["DevOps", "CI/CD"],
  },
  {
    id: "kb-8",
    title: "Mobile viewport regression tests and touch target verification",
    column: "To Do",
    priority: "Medium",
    assignee: "Priya Patel",
    assigneeAvatar: "PP",
    assigneeRole: "UI Designer",
    assigneeColor: "from-violet-500 to-purple-600",
    dueDate: "Nov 14",
    tags: ["Mobile", "Responsive"],
  },
];

const COLUMNS = [
  { id: "To Do", label: "To Do", color: "border-slate-500", dot: "bg-slate-400", badge: "bg-slate-800 text-slate-300" },
  { id: "In Progress", label: "In Progress", color: "border-blue-500", dot: "bg-blue-400", badge: "bg-blue-500/10 text-blue-400" },
  { id: "In Review", label: "In Review", color: "border-purple-500", dot: "bg-purple-400", badge: "bg-purple-500/10 text-purple-400" },
  { id: "Done", label: "Done", color: "border-emerald-500", dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-400" },
];

const priorityStyles = {
  High: "bg-rose-500/10 text-rose-400 border-rose-500/25",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  Low: "bg-slate-500/10 text-slate-400 border-slate-500/25",
};

const BoardsPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tasks, setTasks] = useState(initialBoardTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Add Task Modal
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [targetColumnForNewTask, setTargetColumnForNewTask] = useState("To Do");
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "High",
    assignee: "Rouhan Siddiqui",
    column: "To Do",
    dueDate: "Nov 15",
    tags: "Sprint 4",
  });

  // Project context resolution
  const relatedProject = useMemo(() => {
    const found = initialProjects.find((p) => p.boardId === boardId || p.id === boardId);
    if (found) return found;
    return initialProjects[0] || {
      id: "proj-1",
      name: "WorkSync Web App",
      category: "Core Platform",
    };
  }, [boardId]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        selectedPriority === "All" || task.priority === selectedPriority;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, selectedPriority]);

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const groups = { "To Do": [], "In Progress": [], "In Review": [], Done: [] };
    filteredTasks.forEach((t) => {
      if (groups[t.column]) {
        groups[t.column].push(t);
      } else {
        groups["To Do"].push(t);
      }
    });
    return groups;
  }, [filteredTasks]);

  // Move task to adjacent column
  const handleMoveTask = (taskId, direction) => {
    const columnOrder = ["To Do", "In Progress", "In Review", "Done"];
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          const currentIndex = columnOrder.indexOf(t.column);
          const newIndex = direction === "right" ? currentIndex + 1 : currentIndex - 1;
          if (newIndex >= 0 && newIndex < columnOrder.length) {
            return { ...t, column: columnOrder[newIndex] };
          }
        }
        return t;
      })
    );
  };

  // Change task column directly
  const handleColumnChange = (taskId, newColumn) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, column: newColumn } : t))
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (taskId) {
      handleColumnChange(taskId, targetColumn);
    }
    setDraggedTaskId(null);
  };

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const assigneeColors = {
      "Devanshi Sharma": "from-blue-600 to-indigo-600",
      "Ayan Mukherjee": "from-cyan-500 to-blue-600",
      "Rouhan Siddiqui": "from-emerald-500 to-teal-600",
      "Priya Patel": "from-violet-500 to-purple-600",
    };

    const initials = newTask.assignee
      .split(" ")
      .map((w) => w[0])
      .join("");

    const tagsArray = newTask.tags
      ? newTask.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : ["Feature"];

    const created = {
      id: `kb-${Date.now()}`,
      title: newTask.title.trim(),
      column: newTask.column,
      priority: newTask.priority,
      assignee: newTask.assignee,
      assigneeAvatar: initials || "TM",
      assigneeRole: "Team Member",
      assigneeColor: assigneeColors[newTask.assignee] || "from-slate-600 to-slate-800",
      dueDate: newTask.dueDate || "Nov 20",
      tags: tagsArray,
    };

    setTasks([created, ...tasks]);
    setNewTask({
      title: "",
      priority: "High",
      assignee: "Rouhan Siddiqui",
      column: "To Do",
      dueDate: "Nov 15",
      tags: "Sprint 4",
    });
    setShowAddTaskModal(false);
  };

  const openAddTaskForColumn = (columnId) => {
    setNewTask((prev) => ({ ...prev, column: columnId }));
    setShowAddTaskModal(true);
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Scroll-Fixed Sidebar */}
      <Sidebar activeItem="boards" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="shrink-0 border-b border-slate-800/80 bg-[#0B1120]/80 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile Trigger & Navigation */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
                aria-label="Open mobile navigation menu"
              >
                <Menu size={18} />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link
                  to="/manager/projects"
                  className="text-slate-400 hover:text-blue-400 transition"
                >
                  Projects
                </Link>
                <ChevronRight size={13} className="text-slate-600" />
                <Link
                  to={`/manager/projects/${relatedProject.id}`}
                  className="text-slate-400 hover:text-blue-400 transition truncate max-w-[120px] sm:max-w-none"
                >
                  {relatedProject.name}
                </Link>
                <ChevronRight size={13} className="text-slate-600" />
                <span className="font-semibold text-blue-400">Kanban Board</span>
              </div>
            </div>

            {/* Right: Project Link & Add Task CTA */}
            <div className="flex items-center gap-2.5">
              <Link
                to={`/manager/projects/${relatedProject.id}`}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <span>Project Overview</span>
                <ExternalLink size={12} className="text-slate-500" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setNewTask((prev) => ({ ...prev, column: "To Do" }));
                  setShowAddTaskModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </header>

        {/* Board Context Subheader & Controls Bar */}
        <div className="shrink-0 border-b border-slate-800/80 bg-[#0B1120]/50 px-4 py-3 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Sprint 4 Kanban Board
                </h1>
                <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                  {filteredTasks.length} Active Tasks
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Connected to <span className="text-slate-200 font-medium">{relatedProject.name}</span> • Oct 15 – Nov 12 Delivery Cycle
              </p>
            </div>

            {/* Search & Priority Controls */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-44 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                <input
                  type="text"
                  placeholder="Filter cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-1 pl-8 pr-7 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-900/80 py-1 px-2.5 text-xs font-medium text-slate-300 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kanban Columns Horizontal Scrolling Board Container */}
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden p-4 sm:p-6 lg:p-8 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
          <div className="flex items-start gap-4 h-full min-w-[1000px] xl:min-w-0">
            {COLUMNS.map((column) => {
              const columnTasks = tasksByColumn[column.id] || [];

              return (
                <div
                  key={column.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className="flex-1 flex flex-col h-full rounded-2xl border border-slate-800/80 bg-[#0F172A]/60 backdrop-blur-sm p-3.5 shadow-lg shadow-black/10 min-w-[260px] max-w-[340px] xl:max-w-none"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${column.dot}`}></span>
                      <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                        {column.label}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.2 text-[10px] font-bold border border-slate-800 ${column.badge}`}
                      >
                        {columnTasks.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openAddTaskForColumn(column.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                      title={`Add task to ${column.label}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Column Task Cards Scrollable Area */}
                  <div className="flex-1 min-h-0 overflow-y-auto pt-3 space-y-3 pr-1 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
                    {columnTasks.map((task) => {
                      const columnIndex = COLUMNS.findIndex((c) => c.id === column.id);
                      const canMoveLeft = columnIndex > 0;
                      const canMoveRight = columnIndex < COLUMNS.length - 1;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="group relative rounded-xl border border-slate-800/90 bg-[#131D33]/90 p-3.5 shadow-sm hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition cursor-grab active:cursor-grabbing backdrop-blur-sm"
                        >
                          {/* Tags & Priority */}
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex flex-wrap items-center gap-1">
                              {task.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-medium text-slate-400 border border-slate-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <span
                              className={`rounded-full border px-2 py-0.2 text-[9px] font-semibold ${
                                priorityStyles[task.priority] || priorityStyles.Medium
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="mt-2 text-xs font-semibold text-slate-200 leading-snug group-hover:text-white transition">
                            {task.title}
                          </h4>

                          {/* Footer: Assignee & Due Date */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div
                                title={`${task.assignee} (${task.assigneeRole})`}
                                className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr ${task.assigneeColor} text-[8px] font-bold text-white shadow-xs`}
                              >
                                {task.assigneeAvatar}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[90px]">
                                {task.assignee}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Calendar size={11} className="text-slate-600" />
                              <span>{task.dueDate}</span>
                            </div>
                          </div>

                          {/* Quick Status Shift Controls (Always available for touch & quick click) */}
                          <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px]">
                            {canMoveLeft ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveTask(task.id, "left");
                                }}
                                className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-400 px-1.5 py-0.5 rounded hover:bg-slate-900 transition"
                                title={`Move to ${COLUMNS[columnIndex - 1].label}`}
                              >
                                <ChevronLeft size={12} />
                                <span>{COLUMNS[columnIndex - 1].label}</span>
                              </button>
                            ) : (
                              <span />
                            )}

                            {canMoveRight ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveTask(task.id, "right");
                                }}
                                className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-400 px-1.5 py-0.5 rounded hover:bg-slate-900 transition"
                                title={`Move to ${COLUMNS[columnIndex + 1].label}`}
                              >
                                <span>{COLUMNS[columnIndex + 1].label}</span>
                                <ChevronRight size={12} />
                              </button>
                            ) : (
                              <span />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {columnTasks.length === 0 && (
                      <div className="py-8 text-center border border-dashed border-slate-800/80 rounded-xl">
                        <p className="text-[11px] text-slate-500">No cards in this column</p>
                        <button
                          type="button"
                          onClick={() => openAddTaskForColumn(column.id)}
                          className="mt-1.5 text-[10px] text-blue-400 hover:text-blue-300 font-medium"
                        >
                          + Add a card
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Add Task to Board */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowAddTaskModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Card to {newTask.column}</h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit WebSocket reconnect exponential backoff"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Target Column</label>
                  <select
                    value={newTask.column}
                    onChange={(e) => setNewTask({ ...newTask, column: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Assignee</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    {["Devanshi Sharma", "Ayan Mukherjee", "Rouhan Siddiqui", "Priya Patel"].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Due Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 20"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend, Sprint 4"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="rounded-xl border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md"
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
};

export default BoardsPage;
