import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Trash2,
  Send,
  Eye,
  Clock,
  Radio,
  Users,
  Shield,
  RefreshCw,
  X,
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
    targetAudience: 'all',
    publishImmediately: true
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAnnouncements = async () => {
    try {
      setRefreshing(true);
      const query = {};
      if (search) query.search = search;
      if (statusFilter !== 'all') query.status = statusFilter;
      if (priorityFilter !== 'all') query.priority = priorityFilter;

      const data = await superAdminService.getAnnouncements(query);
      setAnnouncements(data?.announcements || data || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
      showToast('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [search, statusFilter, priorityFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await superAdminService.createAnnouncement(form);
      showToast('Announcement broadcasted successfully!');
      setShowCreateModal(false);
      setForm({
        title: '',
        content: '',
        priority: 'normal',
        targetAudience: 'all',
        publishImmediately: true
      });
      fetchAnnouncements();
    } catch (err) {
      showToast(err.message || 'Failed to create announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await superAdminService.publishAnnouncement(id);
      showToast('Announcement published to active users!');
      fetchAnnouncements();
    } catch (err) {
      showToast('Failed to publish announcement', 'error');
    }
  };

  const handleArchive = async (id) => {
    try {
      await superAdminService.archiveAnnouncement(id);
      showToast('Announcement moved to archive');
      fetchAnnouncements();
    } catch (err) {
      showToast('Failed to archive announcement', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await superAdminService.deleteAnnouncement(id);
      showToast('Announcement deleted permanently');
      fetchAnnouncements();
    } catch (err) {
      showToast('Failed to delete announcement', 'error');
    }
  };

  // Metrics
  const totalCount = announcements.length;
  const publishedCount = announcements.filter(a => a.status === 'published').length;
  const draftCount = announcements.filter(a => a.status === 'draft').length;
  const urgentCount = announcements.filter(a => a.priority === 'urgent' || a.priority === 'high').length;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'archived':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

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
            <Bell className="h-7 w-7 text-indigo-400" />
            <span>Platform Announcements</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Broadcast platform-wide updates, downtime alerts, and policy changes to all workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnnouncements}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Broadcasts</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalCount}</p>
        </div>

        <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Published</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{publishedCount}</p>
        </div>

        <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Drafts</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{draftCount}</p>
        </div>

        <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">High / Urgent</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{urgentCount}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-[#0d1322] border border-slate-800/80 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements by title or content..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading announcements feed...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-12 text-center">
          <Bell className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No announcements found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Create your first platform announcement to notify users about updates or maintenance windows.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            Broadcast Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann._id || ann.id}
              className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase border ${getPriorityBadge(ann.priority)}`}>
                    {ann.priority || 'normal'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase border ${getStatusBadge(ann.status)}`}>
                    {ann.status || 'draft'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                    <Users className="h-3 w-3" />
                    Target: {ann.targetAudience || 'all'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{ann.title}</h3>
                <p className="text-sm text-slate-300 line-clamp-2">{ann.content}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {ann.status !== 'published' && (
                  <button
                    onClick={() => handlePublish(ann._id || ann.id)}
                    title="Publish announcement"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Publish</span>
                  </button>
                )}

                {ann.status !== 'archived' && (
                  <button
                    onClick={() => handleArchive(ann._id || ann.id)}
                    title="Archive announcement"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(ann._id || ann.id)}
                  title="Delete announcement"
                  className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create Announcement</h3>
                  <p className="text-xs text-slate-400">Broadcast message across WorkSync workspaces</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Scheduled Maintenance Notice"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Content / Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Type full broadcast details here..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Platform Users</option>
                    <option value="admins">Admins Only</option>
                    <option value="members">Members Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="publishImmediately"
                  checked={form.publishImmediately}
                  onChange={(e) => setForm({ ...form, publishImmediately: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="publishImmediately" className="text-xs text-slate-300 select-none">
                  Publish announcement immediately upon creation
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
