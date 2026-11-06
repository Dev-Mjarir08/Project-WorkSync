import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  Filter,
  CheckCircle2,
  Archive,
  RotateCcw,
  Trash2,
  ExternalLink,
  Building2,
  Layers,
  Clock,
  RefreshCw,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const BoardsPage = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, archived
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBoards = async () => {
    try {
      setRefreshing(true);
      const query = {};
      if (search) query.search = search;
      if (statusFilter === 'active') query.isArchived = 'false';
      if (statusFilter === 'archived') query.isArchived = 'true';

      const data = await superAdminService.getBoards(query);
      setBoards(data?.boards || data || []);
    } catch (err) {
      console.error('Failed to load boards:', err);
      showToast('Failed to load platform boards', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [search, statusFilter]);

  const handleToggleArchive = async (board) => {
    try {
      const updatedStatus = !board.isArchived;
      await superAdminService.updateBoardStatus(board._id || board.id, updatedStatus);
      showToast(updatedStatus ? 'Board archived successfully' : 'Board restored to active');
      fetchBoards();
    } catch (err) {
      showToast('Failed to update board status', 'error');
    }
  };

  const handleDelete = async (boardId) => {
    if (!window.confirm('Are you sure you want to permanently delete this board? This cannot be undone.')) return;
    try {
      await superAdminService.deleteBoard(boardId);
      showToast('Board deleted successfully');
      fetchBoards();
    } catch (err) {
      showToast('Failed to delete board', 'error');
    }
  };

  // Metrics
  const totalCount = boards.length;
  const activeCount = boards.filter(b => !b.isArchived).length;
  const archivedCount = boards.filter(b => b.isArchived).length;
  const totalTasksCount = boards.reduce((acc, b) => acc + (b.tasksCount || b.taskCount || 0), 0);

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FolderKanban className="h-7 w-7 text-indigo-400" />
            <span>Platform Boards</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global monitoring of kanban boards, tasks backlog, and workspace project activities.
          </p>
        </div>

        <button
          onClick={fetchBoards}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Boards</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalCount}</p>
        </div>

        <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Active Boards</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{activeCount}</p>
        </div>

        <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Archived</span>
            <div className="p-2 rounded-xl bg-slate-500/10 text-slate-400">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-300 mt-2">{archivedCount}</p>
        </div>

        <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Tasks Backlog</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2">{totalTasksCount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0d1322] border border-slate-800/80 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search boards by name or workspace..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Boards</option>
          <option value="active">Active Only</option>
          <option value="archived">Archived Only</option>
        </select>
      </div>

      {/* Boards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading platform boards...</p>
        </div>
      ) : boards.length === 0 ? (
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-12 text-center">
          <FolderKanban className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No boards found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            No boards match the current search filters or none have been created yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => {
            const boardId = board._id || board.id;
            const wsName = board.workspace?.name || board.workspaceName || 'Global Workspace';

            return (
              <div
                key={boardId}
                className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                      <Building2 className="h-3 w-3" />
                      {wsName}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        board.isArchived
                          ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {board.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white hover:text-indigo-400 transition-colors">
                      {board.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {board.description || 'No board description provided.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-indigo-400" />
                      {board.tasksCount || board.taskCount || 0} tasks
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {board.createdAt ? new Date(board.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/super-admin/boards/${boardId}`)}
                      title="Inspect board & tasks"
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleToggleArchive(board)}
                      title={board.isArchived ? 'Restore board' : 'Archive board'}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                    >
                      {board.isArchived ? <RotateCcw className="h-4 w-4 text-emerald-400" /> : <Archive className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => handleDelete(boardId)}
                      title="Delete board"
                      className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BoardsPage;
