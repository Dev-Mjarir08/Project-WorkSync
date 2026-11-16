import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Bell, CheckCheck, Trash2, Check, Clock, Filter, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import notificationService from '../../notifications/notificationService.js';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, task, system

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res?.notifications || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => ((n.id === id || n._id === id) ? { ...n, isRead: true, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
  };

  const handleDelete = async (id) => {
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
  };

  const handleClearAll = async () => {
    await notificationService.clearAll();
    setNotifications([]);
  };

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.isRead && !n.read);
    if (filter === 'task') return notifications.filter((n) => n.type === 'task');
    if (filter === 'system') return notifications.filter((n) => n.type === 'system');
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold tracking-wider uppercase text-blue-600">Workspace Updates</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time activity alerts, task updates, and workspace announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-xl transition cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'task', label: 'Tasks', count: notifications.filter((n) => n.type === 'task').length },
          { id: 'system', label: 'System', count: notifications.filter((n) => n.type === 'system').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filter === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Loading notifications...
        </div>
      ) : filtered.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-xs">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <Bell className="size-5" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            No notifications found
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {filter === 'unread'
              ? 'You have caught up with all updates! There are no unread notifications.'
              : 'New notifications will appear here when tasks or projects are updated.'}
          </p>
          <Link
            to="/admin/dashboard"
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Go to Dashboard
          </Link>
        </section>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const isUnread = !item.isRead && !item.read;
            return (
              <div
                key={item.id || item._id}
                className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition ${
                  isUnread
                    ? 'bg-white border-blue-200 shadow-xs ring-1 ring-blue-50'
                    : 'bg-white border-slate-200/80 shadow-xs opacity-90'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'task'
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : item.type === 'system'
                        ? 'bg-purple-50 text-purple-600 border border-purple-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}
                  >
                    <Bell size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {item.title}
                      </h3>
                      {isUnread && (
                        <span className="size-2 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}
                      </span>
                      {item.link && (
                        <Link to={item.link} className="font-medium text-blue-600 hover:underline">
                          View details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(item.id || item._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id || item._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
