import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import Header from "../../../components/layout/Header.jsx";
import managerService from "../managerService.js";

const COLUMN_STYLES = [
  { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

const priorityStyles = {
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const normalizeStatus = (status) => {
  const normalized = (status || "").toLowerCase().replace(/[\s-]/g, "_");
  if (normalized.includes("progress")) return "in_progress";
  if (normalized.includes("review")) return "review";
  if (normalized.includes("done") || normalized.includes("complete")) return "done";
  return "todo";
};

const toTaskView = (task, lists) => {
  const assignee = task.assignee;
  const list = task.list || lists.find((candidate) => normalizeStatus(candidate.name) === normalizeStatus(task.status));
  const name = typeof assignee === "string" ? assignee : assignee?.name || "Unassigned";
  const initials = name === "Unassigned"
    ? "—"
    : name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return {
    ...task,
    id: task.id || task._id,
    columnId: list?.id || list?._id || task.listId || "",
    column: list?.name || "To Do",
    priority: task.priority ? `${task.priority[0].toUpperCase()}${task.priority.slice(1)}` : "Medium",
    assigneeId: assignee?.id || assignee?._id || "",
    assignee: name,
    assigneeAvatar: initials,
    assigneeRole: "",
    assigneeColor: "from-blue-600 to-indigo-600",
    dueDate: task.dueDate
      ? new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "2-digit" })
      : "No due date",
    tags: [],
  };
};

const BoardsPage = () => {
  const { boardId } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Add Task Modal
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "High",
    assigneeId: "",
    columnId: "",
    dueDate: "",
    tags: "",
  });

  useEffect(() => {
    let active = true;
    if (!boardId) {
      setError("A board ID is required to load this board.");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    Promise.all([
      managerService.getBoard(boardId),
      managerService.getBoardLists(boardId),
      managerService.getTasks({ boardId }),
    ])
      .then(([boardData, listData, taskData]) => {
        if (!active) return;
        const sortedLists = [...listData].sort((a, b) => a.position - b.position);
        setBoard(boardData);
        setColumns(sortedLists.map((list, index) => ({
          id: list.id,
          label: list.name,
          status: normalizeStatus(list.name),
          ...COLUMN_STYLES[index % COLUMN_STYLES.length],
        })));
        setTasks(taskData.map((task) => toTaskView(task, sortedLists)));
        setNewTask((current) => ({ ...current, columnId: current.columnId || sortedLists[0]?.id || "" }));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load this board.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [boardId]);

  const relatedProject = board?.project
    ? { ...board.project, id: board.project.id || board.project._id || "" }
    : { id: "", name: "Project" };

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
    const groups = Object.fromEntries(columns.map((column) => [column.id, []]));
    filteredTasks.forEach((t) => {
      if (groups[t.columnId]) {
        groups[t.columnId].push(t);
      } else {
        const fallback = columns.find((column) => column.status === normalizeStatus(t.column));
        if (fallback) groups[fallback.id].push(t);
      }
    });
    return groups;
  }, [filteredTasks, columns]);

  // Move task to adjacent column
  const handleMoveTask = async (taskId, targetColumnId) => {
    setError("");
    try {
      await managerService.moveTask(taskId, { listId: targetColumnId });
      const target = columns.find((column) => column.id === targetColumnId);
      setTasks((previous) => previous.map((task) =>
        task.id === taskId ? { ...task, columnId: targetColumnId, column: target?.label || task.column } : task
      ));
    } catch (requestError) {
      setError(requestError.message || "Unable to move task.");
    }
  };

  // Change task column directly
  const handleColumnChange = (taskId, newColumnId) => {
    handleMoveTask(taskId, newColumnId);
  };

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (taskId) {
      handleColumnChange(taskId, targetColumnId);
    }
    setDraggedTaskId(null);
  };

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setError("");
    try {
      const created = await managerService.createTask({
        title: newTask.title.trim(),
        boardId,
        ...(board?.project?.id ? { projectId: board.project.id } : {}),
        ...(newTask.columnId ? { listId: newTask.columnId } : {}),
        ...(newTask.assigneeId ? { assigneeId: newTask.assigneeId } : {}),
        ...(newTask.dueDate ? { dueDate: newTask.dueDate } : {}),
        priority: newTask.priority.toLowerCase(),
      });
      let availableColumns = columns;
      if (availableColumns.length === 0) {
        const lists = await managerService.getBoardLists(boardId);
        availableColumns = lists.map((list, index) => ({
          id: list.id,
          label: list.name,
          status: normalizeStatus(list.name),
          ...COLUMN_STYLES[index % COLUMN_STYLES.length],
        }));
        setColumns(availableColumns);
      }
      setTasks((current) => [{
        ...toTaskView(created, availableColumns),
        tags: newTask.tags ? newTask.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      }, ...current]);
      setNewTask({
        title: "",
        priority: "High",
        assigneeId: "",
        columnId: availableColumns[0]?.id || "",
        dueDate: "",
        tags: "",
      });
      setShowAddTaskModal(false);
    } catch (requestError) {
      setError(requestError.message || "Unable to add this task.");
    }
  };

  const openAddTaskForColumn = (columnId) => {
    setNewTask((prev) => ({ ...prev, columnId }));
    setShowAddTaskModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased w-full max-w-full overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Scroll-Fixed Sidebar */}
      <Sidebar activeItem="boards" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area — Constrained Viewport to Prevent Page Overflow */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0 w-full max-w-full h-screen overflow-hidden">
        {/* Unified Default Header */}
        <Header
          setMobileOpen={setMobileMenuOpen}
          breadcrumbs={[
            { label: "Projects", href: "/manager/projects" },
            { label: relatedProject.name, href: relatedProject.id ? `/manager/projects/${relatedProject.id}` : "/manager/projects" },
            { label: "Kanban Board" },
          ]}
        />

        {error && (
          <div role="alert" className="shrink-0 border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 sm:px-6 lg:px-8">
            {error}
          </div>
        )}

        {/* Board Context Subheader & Controls Bar */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {board?.name || "Kanban Board"}
                </h1>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/80">
                  {filteredTasks.length} Tasks
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {relatedProject.id ? <>Connected to <span className="text-slate-800 font-medium">{relatedProject.name}</span></> : board?.description || "Board tasks and lists"}
              </p>
            </div>

            {/* Board Context Actions, Search & Priority Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to={relatedProject.id ? `/manager/projects/${relatedProject.id}` : "/manager/projects"}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <span>Project Overview</span>
                <ExternalLink size={12} className="text-slate-400" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setNewTask((prev) => ({ ...prev, columnId: columns[0]?.id || "" }));
                  setShowAddTaskModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98]"
              >
                <Plus size={13} />
                <span>Add Card</span>
              </button>

              <div className="relative w-40 sm:w-48">
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
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Loading board...
            </div>
          ) : !error && columns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              This board has no lists yet.
            </div>
          ) : !error && (
          <div className="flex items-stretch gap-4 h-full min-w-min pb-2">
            {columns.map((column, columnIndex) => {
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
                      const canMoveLeft = columnIndex > 0;
                      const canMoveRight = columnIndex < columns.length - 1;

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
                                  handleMoveTask(task.id, columns[columnIndex - 1].id);
                                }}
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 px-1.5 py-0.5 rounded hover:bg-slate-50 transition"
                                title={`Move to ${columns[columnIndex - 1].label}`}
                              >
                                <ChevronLeft size={12} />
                                <span>{columns[columnIndex - 1].label}</span>
                              </button>
                            ) : (
                              <span />
                            )}

                            {canMoveRight ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveTask(task.id, columns[columnIndex + 1].id);
                                }}
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 px-1.5 py-0.5 rounded hover:bg-slate-50 transition"
                                title={`Move to ${columns[columnIndex + 1].label}`}
                              >
                                <span>{columns[columnIndex + 1].label}</span>
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
          )}
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
              <h3 className="text-sm font-bold text-slate-900">
                Add Card to {columns.find((column) => column.id === newTask.columnId)?.label || "Board"}
              </h3>
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
                    value={newTask.columnId}
                    onChange={(e) => setNewTask({ ...newTask, columnId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    {columns.map((col) => (
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
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {(board?.members || []).filter((member) => member.user).map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
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
                  <p className="mt-1 text-[10px] text-slate-400">
                    Tags are not stored by the current task API.
                  </p>
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
