import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderKanban,
  Building2,
  Calendar,
  CheckCircle2,
  Archive,
  Trash2,
  Edit3,
  Layers,
  Clock,
  RefreshCw,
  AlertCircle,
  RotateCcw,
  User,
  Plus,
  X
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

const STATUS_COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'border-slate-700/60', badge: 'bg-slate-500/20 text-slate-300' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-300' },
  { id: 'review', label: 'In Review', color: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300' },
  { id: 'done', label: 'Done', color: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' }
];

const PRIORITY_BADGES = {
  urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  medium: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  low: 'bg-slate-500/15 text-slate-400 border-slate-500/30'
};

export const BoardDetailsPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assigneeId: '',
    dueDate: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [boardData, tasksData, usersData] = await Promise.all([
        superAdminService.getBoardById(boardId),
        superAdminService.getBoardTasks(boardId),
        superAdminService.getUsers()
      ]);
      setBoard(boardData);
      setTasks(tasksData?.tasks || tasksData || []);
      setUsersList(usersData?.users || []);
      if (boardData) {
        setEditForm({
          name: boardData.name || '',
          description: boardData.description || ''
        });
      }
    } catch (err) {
      console.error('Failed to load board details:', err);
      showToast('Failed to load board details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [boardId]);

  // Tasks grouped by status
  const tasksByColumn = useMemo(() => {
    const grouped = { todo: [], in_progress: [], review: [], done: [] };
    tasks.forEach(t => {
      const col = t.status || 'todo';
      if (grouped[col]) grouped[col].push(t);
      else grouped.todo.push(t);
    });
    return grouped;
  }, [tasks]);

  // Drag & drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    // Optimistic status update
    setTasks(prev => prev.map(t => (t.id === taskId || t._id === taskId ? { ...t, status: targetStatus } : t)));

    try {
      await superAdminService.updateTaskStatus(taskId, targetStatus);
      showToast(`Task status updated to ${targetStatus}`);
    } catch (err) {
      showToast('Failed to update task status', 'error');
      loadData();
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const created = await superAdminService.createTask({
        ...newTask,
        boardId,
        workspaceId: board.workspace?._id || board.workspace?.id || board.workspace
      });
      setTasks(prev => [created, ...prev]);
      setShowAddTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', assigneeId: '', dueDate: '' });
      showToast('Task added to board successfully');
    } catch (err) {
      showToast(err.message || 'Failed to create task', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await superAdminService.updateBoard(boardId, editForm);
      showToast('Board updated successfully');
      setShowEditModal(false);
      loadData();
    } catch (err) {
      showToast('Failed to update board', 'error');
    }
  };

  const handleToggleArchive = async () => {
    try {
      const updatedStatus = !board.isArchived;
      await superAdminService.updateBoardStatus(boardId, updatedStatus);
      showToast(updatedStatus ? 'Board archived' : 'Board restored to active');
      loadData();
    } catch (err) {
      showToast('Failed to update board status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this board?')) return;
    try {
      await superAdminService.deleteBoard(boardId);
      navigate('/super-admin/boards');
    } catch (err) {
      showToast('Failed to delete board', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading board details...</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Board not found</h2>
        <button
          onClick={() => navigate('/super-admin/boards')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm"
        >
          Return to Boards
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="h-5 w-5 text-rose-400" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate('/super-admin/boards')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Boards</span>
      </button>

      {/* Board Header Card */}
      <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                board.isArchived
                  ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {board.isArchived ? 'Archived' : 'Active Board'}
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
              <Building2 className="h-3 w-3" />
              {board.workspace?.name || 'Workspace'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {board.name}
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            {board.description || 'Drag and drop task cards across columns to update workflow status in real time.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/25 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-medium transition-all"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit</span>
          </button>

          <button
            onClick={handleToggleArchive}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-medium transition-all"
          >
            {board.isArchived ? <RotateCcw className="h-4 w-4 text-emerald-400" /> : <Archive className="h-4 w-4" />}
            <span>{board.isArchived ? 'Restore' : 'Archive'}</span>
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs sm:text-sm font-medium transition-all"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* KANBAN BOARD WITH DRAG & DROP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <span>Kanban Workflow ({tasks.length} Tasks)</span>
          </h2>
          <span className="text-xs text-slate-500">Drag & drop cards to update status</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map(col => {
            const colTasks = tasksByColumn[col.id] || [];
            const isOver = dragOverCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`bg-[#0d1322]/80 border ${isOver ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-950/10' : col.color} rounded-2xl p-4 flex flex-col min-h-[500px] transition-all`}
              >
                
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${col.badge}`}>
                      {col.label}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">({colTasks.length})</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border-2 border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-xs text-slate-500 text-center p-3">
                      Drop tasks here
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <div
                        key={task._id || task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id || task.id)}
                        className="bg-[#0f172a] hover:bg-[#131d35] border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-3.5 space-y-2.5 shadow-md cursor-grab active:cursor-grabbing transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium}`}>
                            {task.priority || 'medium'}
                          </span>
                        </div>

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

                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1.5 truncate max-w-[120px]">
                            <User className="h-3.5 w-3.5 text-slate-500" />
                            <span>{task.assignee?.name || 'Unassigned'}</span>
                          </span>

                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-[11px]">
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
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setShowAddTaskModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white">Create Task on Board</h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Design responsive navbar"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Assign User</label>
                  <select
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {usersList.map(u => (
                      <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Board Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white">Edit Board Details</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Board Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-900 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDetailsPage;
