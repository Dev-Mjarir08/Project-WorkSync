
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Search,
  Menu,
  ChevronRight,
  CheckCheck,
  ClipboardList,
  CalendarClock,
  FolderKanban,
  MessageSquare,
  Check,
  Clock,
  X,
  Trash2,
  Filter,
} from "lucide-react";

import Sidebar from "../../../components/layout/Sidebar.jsx";
import managerService from "../managerService.js";

const categoryStyles = {
  Task: {
    icon: ClipboardList,
    color: "bg-blue-50 text-blue-600",
  },
  Deadline: {
    icon: CalendarClock,
    color: "bg-amber-50 text-amber-600",
  },
  Project: {
    icon: FolderKanban,
    color: "bg-purple-50 text-purple-600",
  },
  Discussion: {
    icon: MessageSquare,
    color: "bg-emerald-50 text-emerald-600",
  },
  Other: {
    icon: Bell,
    color: "bg-slate-100 text-slate-600",
  },
};

const normalizeNotification = (notification) => {
  const createdAt = notification.createdAt ? new Date(notification.createdAt) : null;
  const ageInDays = createdAt && !Number.isNaN(createdAt.getTime())
    ? Math.floor((Date.now() - createdAt.getTime()) / 86400000)
    : Infinity;
  const rawType = String(notification.type || "").toLowerCase();
  const type = rawType === "task" ? "Task"
    : rawType === "deadline" ? "Deadline"
      : rawType === "project" ? "Project"
        : ["comment", "discussion"].includes(rawType) ? "Discussion" : "Other";

  return {
    id: notification._id || notification.id,
    title: notification.title || "Notification",
    message: notification.message || "",
    type,
    time: createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleString()
      : "Date unavailable",
    date: ageInDays < 1 ? "Today" : ageInDays < 2 ? "Yesterday" : "Earlier",
    unread: !notification.isRead,
  };
};

const NotificationsPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const loadNotifications = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError("");
    try {
      const filters = { page, limit: 20 };
      if (activeFilter === "Unread") filters.isRead = false;
      if (activeFilter === "Read") filters.isRead = true;
      const result = await managerService.getNotifications(filters);
      if (!Array.isArray(result?.notifications) || !result?.pagination) {
        throw new Error("The Manager API returned an invalid notifications response.");
      }
      const next = result.notifications.map(normalizeNotification);
      setNotifications((current) => append ? [...current, ...next] : next);
      setUnreadCount(Number(result.unreadCount) || 0);
      setPagination(result.pagination);
    } catch (loadError) {
      setError(loadError.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(search.toLowerCase()) ||
        notification.message.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;
      if (activeFilter === "Unread") matchesFilter = notification.unread;
      else if (activeFilter === "Read") matchesFilter = !notification.unread;
      else if (["Task", "Deadline", "Project", "Discussion"].includes(activeFilter)) {
        matchesFilter = notification.type === activeFilter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, activeFilter]);

  const markAsRead = async (id) => {
    setBusy(true);
    setError("");
    try {
      await managerService.markNotificationAsRead(id);
      await loadNotifications(pagination.page);
    } catch (actionError) {
      setError(actionError.message || "Unable to mark the notification as read.");
    } finally {
      setBusy(false);
    }
  };

  const markAllAsRead = async () => {
    setBusy(true);
    setError("");
    try {
      await managerService.markAllNotificationsAsRead();
      await loadNotifications(1);
    } catch (actionError) {
      setError(actionError.message || "Unable to mark notifications as read.");
    } finally {
      setBusy(false);
    }
  };

  const deleteNotification = async (id) => {
    setBusy(true);
    setError("");
    try {
      await managerService.deleteNotification(id);
      await loadNotifications(pagination.page);
    } catch (actionError) {
      setError(actionError.message || "Unable to delete the notification.");
    } finally {
      setBusy(false);
    }
  };

  const clearAllNotifications = async () => {
    setBusy(true);
    setError("");
    try {
      const firstPage = await managerService.getNotifications({ page: 1, limit: 100 });
      if (!Array.isArray(firstPage?.notifications) || !firstPage?.pagination) {
        throw new Error("The Manager API returned an invalid notifications response.");
      }
      const allNotifications = [...firstPage.notifications];
      for (let page = 2; page <= firstPage.pagination.pages; page += 1) {
        const nextPage = await managerService.getNotifications({ page, limit: 100 });
        if (!Array.isArray(nextPage?.notifications)) {
          throw new Error("The Manager API returned an invalid notifications page.");
        }
        allNotifications.push(...nextPage.notifications);
      }
      await Promise.all(allNotifications.map((notification) =>
        managerService.deleteNotification(notification._id || notification.id)
      ));
      await loadNotifications(1);
    } catch (actionError) {
      setError(actionError.message || "Unable to clear notifications.");
      await loadNotifications(1);
    } finally {
      setBusy(false);
    }
  };

  const filters = ["All", "Unread", "Read", "Task", "Deadline", "Project", "Discussion"];

  const groupedNotifications = ["Today", "Yesterday", "Earlier"].map((date) => ({
    date,
    items: filteredNotifications.filter(
      (notification) => notification.date === date
    ),
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased">
      <Sidebar
        activeItem="notifications"
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Home</span>
                <ChevronRight size={14} />
                <span className="text-blue-600 font-medium">
                  Notifications
                </span>
              </div>

              <h1 className="text-xl font-bold text-slate-800 mt-1">
                Notifications
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Task assignments, deadlines aur project updates
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {error && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {/* Overview */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Your Notifications
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Stay updated with your team's latest activities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0 || busy}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>

              <button
                onClick={clearAllNotifications}
                disabled={pagination.total === 0 || busy}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
              >
                <Trash2 size={16} />
                Clear all
              </button>
            </div>
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Notifications"
              value={pagination.total}
              icon={<Bell size={21} />}
              color="blue"
            />
            <StatCard
              title="Unread Notifications"
              value={unreadCount}
              icon={<Clock size={21} />}
              color="amber"
            />
            <StatCard
              title="Read Notifications"
              value={Math.max(0, pagination.total - unreadCount)}
              icon={<CheckCircleIcon />}
              color="emerald"
            />
          </section>

          {/* Notification List */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-800">
                    Recent Activity
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {unreadCount} unread notification(s)
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search notifications..."
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Filter size={16} className="text-slate-400 shrink-0" />

                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${activeFilter === filter
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {filter}
                    {filter === "Unread" && unreadCount > 0 && (
                      <span className="ml-1.5">
                        ({unreadCount})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Grouped notifications */}
            <div className="p-4 sm:p-6">
              {groupedNotifications.map(
                (group) =>
                  group.items.length > 0 && (
                    <div key={group.date} className="mb-7 last:mb-0">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        {group.date}
                      </h3>

                      <div className="space-y-3">
                        {group.items.map((notification) => {
                          const category =
                            categoryStyles[notification.type] ||
                            categoryStyles.Task;

                          const Icon = category.icon;

                          return (
                            <div
                              key={notification.id}
                              className={`group flex gap-3 sm:gap-4 p-4 rounded-xl border transition ${notification.unread
                                  ? "bg-blue-50/40 border-blue-100"
                                  : "bg-white border-slate-100 hover:bg-slate-50"
                                }`}
                            >
                              <div
                                className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${category.color}`}
                              >
                                <Icon size={20} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-sm font-semibold text-slate-800">
                                    {notification.title}
                                  </h4>

                                  {notification.unread && (
                                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                                  )}
                                </div>

                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                  {notification.message}
                                </p>

                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                  <span className="text-xs text-slate-400">
                                    {notification.time}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-500">
                                    {notification.type}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-start gap-1">
                                {notification.unread && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    disabled={busy}
                                    title="Mark as read"
                                    aria-label="Mark as read"
                                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                  >
                                    <Check size={17} />
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  disabled={busy}
                                  title="Delete notification"
                                  aria-label="Delete notification"
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <X size={17} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
              )}

              {loading && notifications.length === 0 && (
                <div className="py-16 text-center text-sm text-slate-500">
                  Loading notifications...
                </div>
              )}

              {!loading && filteredNotifications.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Bell size={25} className="text-slate-400" />
                  </div>

                  <h3 className="font-semibold text-slate-700">
                    No notifications found
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Try another search or filter.
                  </p>

                  <button
                    onClick={() => {
                      setSearch("");
                      setActiveFilter("All");
                    }}
                    className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
            {pagination.page < pagination.pages && (
              <div className="border-t border-slate-100 p-4 text-center">
                <button
                  type="button"
                  disabled={loading || busy}
                  onClick={() => loadNotifications(pagination.page + 1, true)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mt-3">{value}</h3>
    </div>
  );
};

const CheckCircleIcon = () => (
  <CheckCheck size={21} />
);

export default NotificationsPage;