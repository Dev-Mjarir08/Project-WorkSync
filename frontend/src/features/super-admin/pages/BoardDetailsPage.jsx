import React, { useState, useEffect } from 'react';
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
  Tag
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const BoardDetailsPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [boardData, tasksData] = await Promise.all([
        superAdminService.getBoardById(boardId),
        superAdminService.getBoardTasks(boardId)
      ]);
      setBoard(boardData);
      setTasks(tasksData?.tasks || tasksData || []);
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
            {board.description || 'No description provided.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
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

      {/* Board Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <span>Board Tasks ({tasks.length})</span>
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-10 text-center">
            <Layers className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No tasks currently assigned to this board.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tasks.map((task) => (
              <div
                key={task._id || task.id}
                className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-4 space-y-2 hover:border-slate-700/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                    {task.priority || 'Normal'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {task.status || 'To Do'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white line-clamp-1">{task.title}</h4>
                {task.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                )}

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assignee?.name || 'Unassigned'}
                  </span>
                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
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
