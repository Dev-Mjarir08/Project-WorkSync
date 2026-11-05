import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Layers,
  Kanban,
  List as ListIcon,
  User,
  Calendar,
  Building2,
  FolderKanban,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  UserPlus,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useSuperAdmin } from '../../../context/SuperAdminContext.jsx';
import superAdminService from '../superAdminService.js';

const STATUS_COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'from-slate-500/20 to-slate-600/10', border: 'border-slate-700/60', badge: 'bg-slate-500/20 text-slate-300' },
  { id: 'in_progress', label: 'In Progress', color: 'from-blue-500/20 to-indigo-600/10', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-300' },
  { id: 'review', label: 'In Review', color: 'from-amber-500/20 to-yellow-600/10', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300' },
  { id: 'done', label: 'Done', color: 'from-emerald-500/20 to-teal-600/10', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' }
];

const PRIORITY_BADGES = {
  urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  medium: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  low: 'bg-slate-500/15 text-slate-400 border-slate-500/30'
};

export const TasksPage = () => {
  const {
    tasksState,
    loadTasks,
    createTask,
    updateTaskStatus,
    assignTask,
    deleteTask,
    loadWorkspaces,
    loadUsers
  } = useSuperAdmin();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [search, setSearch] = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Supporting Options for Selectors
  const [workspacesList, setWorkspacesList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [boardsList, setBoardsList] = useState([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignModalTask, setAssignModalTask] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Form
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    workspaceId: '',
    boardId: '',
    projectId: '',
    assigneeId: '',
    status: 'todo',
    priority: 'medium',
    dueDate: ''
  });

  // Initial Load
  useEffect(() => {
    loadTasks();
    loadWorkspaces().then(list => {
      setWorkspacesList(list);
      if (list.length > 0 && !newTaskForm.workspaceId) {
        setNewTaskForm(prev => ({ ...prev, workspaceId: list[0].id || list[0]._id }));
      }
    });
    loadUsers().then(list => setUsersList(list));
    superAdminService.getBoards().then(res => setBoardsList(res?.boards || []));
  }, []);

  // Filter effect
  useEffect(() => {
    loadTasks({
      search,
      workspace: workspaceFilter,
      priority: priorityFilter,
      assignee: assigneeFilter
    });
  }, [search, workspaceFilter, priorityFilter, assigneeFilter]);

  // Tasks grouped by status
  const tasksByColumn = useMemo(() => {
    const grouped = { todo: [], in_progress: [], review: [], done: [] };
    tasksState.list.forEach(t => {
      const col = t.status || 'todo';
      if (grouped[col]) {
        grouped[col].push(t);
      } else {
        grouped.todo.push(t);
      }
    });
    return grouped;
  }, [tasksState.list]);

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    // Trigger instant optimistic update via SuperAdminContext!
    await updateTaskStatus(taskId, targetStatus);
    setDraggedTaskId(null);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;

    try {
      await createTask(newTaskForm);
      setShowCreateModal(false);
      setNewTaskForm({
        title: '',
        description: '',
        workspaceId: workspacesList[0]?.id || '',
        boardId: '',
        projectId: '',
        assigneeId: '',
        status: 'todo',
        priority: 'medium',
        dueDate: ''
      });
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleAssignUser = async (user) => {
    if (!assignModalTask) return;
    const taskId = assignModalTask.id || assignModalTask._id;
    await assignTask(taskId, user ? (user.id || user._id) : null, user);
    setAssignModalTask(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header with KPI cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CheckSquare className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Platform Tasks & Assignments</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor, assign and drag-and-drop organize tasks across all workspaces and teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span>List View</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{tasksState.totalCount}</p>
          </div>
          <Layers className="h-6 w-6 text-slate-500" />
        </div>
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">To Do</p>
            <p className="text-xl font-extrabold text-slate-300 mt-0.5">{tasksState.statusCounts.todo}</p>
          </div>
          <span className="h-3 w-3 rounded-full bg-slate-400"></span>
        </div>
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">In Progress</p>
            <p className="text-xl font-extrabold text-blue-300 mt-0.5">{tasksState.statusCounts.in_progress}</p>
          </div>
          <span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>
        </div>
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">In Review</p>
            <p className="text-xl font-extrabold text-amber-300 mt-0.5">{tasksState.statusCounts.review}</p>
          </div>
          <span className="h-3 w-3 rounded-full bg-amber-400"></span>
        </div>
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Completed</p>
            <p className="text-xl font-extrabold text-emerald-300 mt-0.5">{tasksState.statusCounts.done}</p>
          </div>
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title or details..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Workspace Filter */}
          <select
            value={workspaceFilter}
            onChange={(e) => setWorkspaceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Workspaces</option>
            {workspacesList.map(ws => (
              <option key={ws.id || ws._id} value={ws.id || ws._id}>{ws.name}</option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned Tasks</option>
            {usersList.map(u => (
              <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.role})</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map(col => {
            const columnTasks = tasksByColumn[col.id] || [];
            const isOver = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`bg-[#0d1322]/80 border ${isOver ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-950/10' : col.border} rounded-2xl p-4 flex flex-col min-h-[550px] transition-all duration-200`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${col.badge}`}>
                      {col.label}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">({columnTasks.length})</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Drop here</span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[650px] pr-1">
                  {columnTasks.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-xs text-slate-500 text-center p-3">
                      Drag tasks here to update status to {col.label}
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <div
                        key={task.id || task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id || task._id)}
                        className="bg-[#0f172a] hover:bg-[#131d35] border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-3.5 space-y-2.5 shadow-md hover:shadow-xl cursor-grab active:cursor-grabbing transition-all group relative"
                      >
                        {/* Top Metadata */}
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium}`}>
                            {task.priority || 'medium'}
                          </span>

                          <button
                            onClick={() => deleteTask(task.id || task._id, task.title)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                            title="Delete task"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Workspace / Project tags */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                          {task.workspace && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                              <Building2 className="h-3 w-3 text-indigo-400" />
                              <span className="truncate max-w-[100px]">{task.workspace.name}</span>
                            </span>
                          )}
                          {task.project && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                              <FolderKanban className="h-3 w-3 text-violet-400" />
                              <span className="truncate max-w-[80px]">{task.project.name}</span>
                            </span>
                          )}
                        </div>

                        {/* Bottom Bar: Assignee & Due Date */}
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                          {/* Quick Assign Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssignModalTask(task);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 transition-colors"
                            title="Click to assign user"
                          >
                            {task.assignee?.avatar ? (
                              <img src={task.assignee.avatar} alt="" className="h-4 w-4 rounded-full" />
                            ) : (
                              <User className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            <span className="text-[11px] font-medium truncate max-w-[90px]">
                              {task.assignee?.name || 'Assign User'}
                            </span>
                          </button>

                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Task</th>
                  <th className="py-3.5 px-4">Workspace</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {tasksState.list.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No tasks found matching your filters.
                    </td>
                  </tr>
                ) : (
                  tasksState.list.map(task => (
                    <tr key={task.id || task._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-slate-400 line-clamp-1">{task.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-300">
                        {task.workspace?.name || 'Platform'}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={task.status || 'todo'}
                          onChange={(e) => updateTaskStatus(task.id || task._id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">In Review</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium}`}>
                          {task.priority || 'medium'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setAssignModalTask(task)}
                          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-indigo-400 font-medium"
                        >
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{task.assignee?.name || 'Assign'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteTask(task.id || task._id, task.title)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK ASSIGN USER MODAL */}
      {assignModalTask && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Assign Task</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{assignModalTask.title}</p>
              </div>
              <button onClick={() => setAssignModalTask(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <button
                onClick={() => handleAssignUser(null)}
                className="w-full text-left px-3 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 text-xs font-semibold text-rose-400 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                <span>Unassign (Remove Assignee)</span>
              </button>

              {usersList.map(u => (
                <button
                  key={u.id || u._id}
                  onClick={() => handleAssignUser(u)}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 bg-slate-900/60 hover:bg-indigo-950/20 text-xs text-slate-200 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="h-6 w-6 rounded-full" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-bold">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-indigo-400" />
                <span>Create & Assign Task</span>
              </h3>
              <p className="text-xs text-slate-400">Add a new task across any platform workspace.</p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  placeholder="Brief details or acceptance criteria..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Target Workspace *</label>
                  <select
                    required
                    value={newTaskForm.workspaceId}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, workspaceId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {workspacesList.map(ws => (
                      <option key={ws.id || ws._id} value={ws.id || ws._id}>{ws.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Assign User</label>
                  <select
                    value={newTaskForm.assigneeId}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {usersList.map(u => (
                      <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Status</label>
                  <select
                    value={newTaskForm.status}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25"
                >
                  Create & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
