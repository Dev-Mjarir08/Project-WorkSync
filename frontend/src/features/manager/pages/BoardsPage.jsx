import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Kanban,
  Plus,
  Search,
  Calendar,
  X,
  Menu,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import { initialProjects } from "./ProjectsPage.jsx";

export const initialBoardTasks = [
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
    title: "Design light theme SaaS workspace layout and card tokens",
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
  { id: "To Do", label: "To Do", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: "In Progress", label: "In Progress", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "In Review", label: "In Review", dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "Done", label: "Done", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

const priorityStyles = {
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased w-full max-w-full overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Scroll-Fixed Sidebar */}
      <Sidebar activeItem="boards" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area — Constrained Viewport to Prevent Page Overflow */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0 w-full max-w-full h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile Trigger & Navigation */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                aria-label="Open mobile navigation menu"
              >
                <Menu size={18} />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Link
                  to="/manager/projects"
                  className="text-slate-500 hover:text-blue-600 transition"
                >
                  Projects
                </Link>
                <ChevronRight size={13} className="text-slate-400" />
                <Link
                  to={`/manager/projects/${relatedProject.id}`}
                  className="text-slate-500 hover:text-blue-600 transition truncate max-w-[120px] sm:max-w-none"
                >
                  {relatedProject.name}
                </Link>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="font-semibold text-blue-600">Kanban Board</span>
              </div>
            </div>

            {/* Right: Project Link & Add Task CTA */}
            <div className="flex items-center gap-2.5">
              <Link
                to={`/manager/projects/${relatedProject.id}`}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
              >
                <span>Project Overview</span>
                <ExternalLink size={12} className="text-slate-400" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setNewTask((prev) => ({ ...prev, column: "To Do" }));
                  setShowAddTaskModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98]"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </header>

        {/* Board Context Subheader & Controls Bar */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Sprint 4 Kanban Board
                </h1>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/80">
                  {filteredTasks.length} Active Tasks
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Connected to <span className="text-slate-800 font-medium">{relatedProject.name}</span> • Oct 15 – Nov 12 Delivery Cycle
              </p>
            </div>

            {/* Search & Priority Controls */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-44 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Filter cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-1 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-1 px-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kanban Columns Horizontal Scrolling Board Container — Scoped to this container only */}
        <div className="flex-1 min-h-0 min-w-0 w-full max-w-full overflow-x-auto overflow-y-hidden p-4 sm:p-6 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
          <div className="flex items-stretch gap-4 h-full min-w-min pb-2">
            {COLUMNS.map((column) => {
              const columnTasks = tasksByColumn[column.id] || [];

              return (
                <div
                  key={column.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className="w-72 sm:w-80 shrink-0 flex flex-col h-full rounded-2xl border border-slate-200/90 bg-slate-100/70 p-3.5 shadow-xs"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${column.dot}`}></span>
                      <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                        {column.label}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${column.badge}`}
                      >
                        {columnTasks.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openAddTaskForColumn(column.id)}
                      className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-slate-800 transition"
                      title={`Add task to ${column.label}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Column Task Cards Scrollable Area */}
                  <div className="flex-1 min-h-0 overflow-y-auto pt-3 space-y-3 pr-1 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
                    {columnTasks.map((task) => {
                      const columnIndex = COLUMNS.findIndex((c) => c.id === column.id);
                      const canMoveLeft = columnIndex > 0;
                      const canMoveRight = columnIndex < COLUMNS.length - 1;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="group relative rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs hover:border-blue-300 hover:shadow-sm transition cursor-grab active:cursor-grabbing"
                        >
                          {/* Tags & Priority */}
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex flex-wrap items-center gap-1">
                              {task.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 border border-slate-200/60"
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
                          <h4 className="mt-2 text-xs font-semibold text-slate-800 leading-snug group-hover:text-blue-600 transition break-words">
                            {task.title}
                          </h4>

                          {/* Footer: Assignee & Due Date */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div
                                title={`${task.assignee} (${task.assigneeRole})`}
                                className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr ${task.assigneeColor} text-[8px] font-bold text-white shadow-xs`}
                              >
                                {task.assigneeAvatar}
                              </div>
                              <span className="text-[10px] text-slate-600 font-medium truncate max-w-[100px]">
                                {task.assignee}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Calendar size={11} className="text-slate-400" />
                              <span>{task.dueDate}</span>
                            </div>
                          </div>

                          {/* Quick Status Shift Controls */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            {canMoveLeft ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveTask(task.id, "left");
                                }}
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 px-1.5 py-0.5 rounded hover:bg-slate-50 transition"
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
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 px-1.5 py-0.5 rounded hover:bg-slate-50 transition"
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
                      <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-white/60">
                        <p className="text-[11px] text-slate-400">No cards in this column</p>
                        <button
                          type="button"
                          onClick={() => openAddTaskForColumn(column.id)}
                          className="mt-1.5 text-[10px] text-blue-600 hover:text-blue-700 font-medium"
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setShowAddTaskModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Card to {newTask.column}</h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design user verification prompt"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Column</label>
                  <select
                    value={newTask.column}
                    onChange={(e) => setNewTask({ ...newTask, column: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Assignee</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Rouhan Siddiqui">Rouhan Siddiqui</option>
                    <option value="Ayan Mukherjee">Ayan Mukherjee</option>
                    <option value="Devanshi Sharma">Devanshi Sharma</option>
                    <option value="Priya Patel">Priya Patel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Due Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 20"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Sockets, Realtime"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                >
                  Add Card
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
