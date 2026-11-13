
import React, { useMemo, useState } from "react";
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
import { getUserItem, setUserItem } from "../../../utils/userStorage.js";

const initialNotifications = [
  {
    id: 1,
    title: "New task assigned to you",
    message: "Rahul Sharma assigned you a new task: Create dashboard UI.",
    type: "Task",
    time: "10 minutes ago",
    date: "Today",
    unread: true,
  },
  {
    id: 2,
    title: "Project deadline approaching",
    message: "The Client Portal project deadline is approaching. Please review pending tasks.",
    type: "Deadline",
    time: "30 minutes ago",
    date: "Today",
    unread: true,
  },
  {
    id: 3,
    title: "Project updated",
    message: "The WorkSync project details have been updated by the manager.",
    type: "Project",
    time: "2 hours ago",
    date: "Today",
    unread: true,
  },
  {
    id: 4,
    title: "Task marked as completed",
    message: "Priya Patel completed the task: Design mobile screens.",
    type: "Task",
    time: "5 hours ago",
    date: "Today",
    unread: false,
  },
  {
    id: 5,
    title: "New team discussion",
    message: "A new comment was added to the project discussion.",
    type: "Discussion",
    time: "Yesterday",
    date: "Yesterday",
    unread: false,
  },
  {
    id: 6,
    title: "Upcoming task deadline",
    message: "The task API documentation is due soon.",
    type: "Deadline",
    time: "Yesterday",
    date: "Yesterday",
    unread: false,
  },
  {
    id: 7,
    title: "Project status changed",
    message: "The Mobile App project status has been updated.",
    type: "Project",
    time: "2 days ago",
    date: "Earlier",
    unread: false,
  },
];

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
};

const NotificationsPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(() =>
    getUserItem("manager_notifications", initialNotifications)
  );
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(search.toLowerCase()) ||
        notification.message.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Unread" && notification.unread) ||
        (activeFilter === "Read" && !notification.unread) ||
        notification.type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, activeFilter]);

  const markAsRead = (id) => {
    setNotifications((previous) => {
      const updated = previous.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      );
      setUserItem("manager_notifications", updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((previous) => {
      const updated = previous.map((notification) => ({
        ...notification,
        unread: false,
      }));
      setUserItem("manager_notifications", updated);
      return updated;
    });
  };

  const deleteNotification = (id) => {
    setNotifications((previous) => {
      const updated = previous.filter((notification) => notification.id !== id);
      setUserItem("manager_notifications", updated);
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUserItem("manager_notifications", []);
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
                disabled={unreadCount === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>

              <button
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
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
              value={notifications.length}
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
              value={notifications.length - unreadCount}
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

              {filteredNotifications.length === 0 && (
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