import React, { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Check,
  Clock3,
  MessageSquare,
  CalendarDays,
  ShieldAlert,
  Search,
  Trash2,
  ArrowUpRight,
  Inbox,
  Sparkles,
  CircleDot,
  Layers3,
  X,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

const initialNotifications = [
  {
    id: 1,
    type: "task",
    title: "New task assigned",
    message:
      "Sarah Jenkins assigned you to Fix authentication validation in the Auth Module.",
    time: "10 min ago",
    group: "today",
    read: false,
    icon: CheckCircle2,
    color: "blue",
    actionText: "View task",
    link: "/mytaskpage",
  },
  {
    id: 2,
    type: "mention",
    title: "You were mentioned",
    message:
      "Alex Rivera mentioned you in #dev: Hey Rouhan, can you check PR #148 contrast?",
    time: "1 hour ago",
    group: "today",
    read: false,
    icon: MessageSquare,
    color: "teal",
    actionText: "Open discussion",
    link: "/discussionpage",
  },
  {
    id: 3,
    type: "system",
    title: "Leave request approved",
    message:
      "Your casual leave request for November 12, 2026 has been approved by HR.",
    time: "3 hours ago",
    group: "today",
    read: true,
    icon: CalendarDays,
    color: "emerald",
    actionText: "View leave",
    link: "/attendance",
  },
  {
    id: 4,
    type: "task",
    title: "Task due soon",
    message:
      "Complete the employee dashboard UI before tomorrow at 5:00 PM.",
    time: "Yesterday",
    group: "earlier",
    read: true,
    icon: Clock3,
    color: "amber",
    actionText: "Review task",
    link: "/mytaskpage",
  },
  {
    id: 5,
    type: "system",
    title: "Scheduled maintenance",
    message:
      "The staging API server will undergo maintenance tonight at 11:00 PM IST.",
    time: "2 days ago",
    group: "earlier",
    read: true,
    icon: ShieldAlert,
    color: "rose",
    actionText: "System status",
    link: "/activitypage",
  },
];

const filters = [
  { id: "all", label: "All activity" },
  { id: "unread", label: "Unread" },
  { id: "task", label: "Tasks" },
  { id: "mention", label: "Mentions" },
  { id: "system", label: "System" },
];

const colorStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
    badge:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  teal: {
    icon: "bg-teal-50 text-teal-600 ring-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:ring-teal-500/20",
    badge:
      "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
    dot: "bg-teal-500",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20",
    badge:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};

const typeLabels = {
  task: "Task update",
  mention: "Mention",
  system: "System",
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const readCount = notifications.filter((item) => item.read).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && !notification.read) ||
        notification.type === filter;

      const matchesSearch =
        notification.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.message
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesUnread = !showUnreadOnly || !notification.read;

      return matchesFilter && matchesSearch && matchesUnread;
    });
  }, [notifications, filter, searchQuery, showUnreadOnly]);

  const todayList = filteredNotifications.filter(
    (item) => item.group === "today"
  );

  const earlierList = filteredNotifications.filter(
    (item) => item.group === "earlier"
  );

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const toggleRead = (id) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: !item.read } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const clearReadNotifications = () => {
    setNotifications((current) => current.filter((item) => !item.read));
  };

  const getFilterCount = (filterId) => {
    if (filterId === "all") return notifications.length;

    if (filterId === "unread") return unreadCount;

    return notifications.filter((item) => item.type === filterId).length;
  };

  return (
    <div className="min-h-screen bg-slate-50/80 px-4 py-6 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7 pb-24">
        {/* Page header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300">
              <Sparkles size={13} />
              WorkSync workspace
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Notifications
              </h1>

              {unreadCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  {unreadCount} new
                </span>
              )}
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Keep track of task updates, team conversations, and important
              workspace activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/15 transition hover:bg-teal-700 active:scale-[0.98]"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            )}
          </div>
        </header>

        {/* Overview cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total notifications"
            value={notifications.length}
            description="Across your workspace"
            icon={Layers3}
            color="teal"
          />

          <SummaryCard
            title="Unread notifications"
            value={unreadCount}
            description={
              unreadCount > 0
                ? "Waiting for your attention"
                : "You're all caught up"
            }
            icon={Bell}
            color="blue"
          />

          <SummaryCard
            title="Read notifications"
            value={readCount}
            description="Already checked"
            icon={CheckCheck}
            color="emerald"
          />
        </section>

        {/* Main content */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          {/* Activity heading */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                  <Inbox size={18} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Your activity
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {filteredNotifications.length} notification
                    {filteredNotifications.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search notifications..."
                aria-label="Search notifications"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-6 xl:flex-row xl:items-center">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map((tab) => {
                const active = filter === tab.id;
                const count = getFilterCount(tab.id);

                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                      active
                        ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                        : "border border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}

                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowUnreadOnly((current) => !current)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  showUnreadOnly
                    ? "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <SlidersHorizontal size={14} />
                Unread only
                {showUnreadOnly && <Check size={13} />}
              </button>

              {readCount > 0 && (
                <button
                  onClick={clearReadNotifications}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                >
                  <Trash2 size={14} />
                  Clear read
                </button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          {filteredNotifications.length === 0 ? (
            <EmptyState
              searchQuery={searchQuery}
              onReset={() => {
                setSearchQuery("");
                setFilter("all");
                setShowUnreadOnly(false);
              }}
            />
          ) : (
            <div className="p-4 sm:p-6">
              <div className="space-y-7">
                {todayList.length > 0 && (
                  <NotificationGroup
                    title="Today"
                    count={todayList.length}
                    notifications={todayList}
                    toggleRead={toggleRead}
                    deleteNotification={deleteNotification}
                    markAsRead={markAsRead}
                  />
                )}

                {earlierList.length > 0 && (
                  <NotificationGroup
                    title="Earlier"
                    count={earlierList.length}
                    notifications={earlierList}
                    toggleRead={toggleRead}
                    deleteNotification={deleteNotification}
                    markAsRead={markAsRead}
                  />
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="flex flex-col justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30 sm:flex-row sm:items-center sm:px-6">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {filteredNotifications.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {notifications.length}
                </span>{" "}
                notifications
              </p>

              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldAlert size={13} />
                Your workspace activity at a glance
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* Summary card */
function SummaryCard({ title, value, description, icon: Icon, color }) {
  const styles = {
    teal: {
      icon: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
      accent: "bg-teal-500",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      accent: "bg-blue-500",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      accent: "bg-emerald-500",
    },
  };

  const style = styles[color];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <div
        className={`absolute inset-y-0 left-0 w-1 ${style.accent} opacity-70`}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* Notification group */
function NotificationGroup({
  title,
  count,
  notifications,
  toggleRead,
  deleteNotification,
  markAsRead,
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h3>

          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {count}
          </span>
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Recent activity
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            toggleRead={toggleRead}
            deleteNotification={deleteNotification}
            markAsRead={markAsRead}
          />
        ))}
      </div>
    </section>
  );
}

/* Individual notification card */
function NotificationCard({
  notification,
  toggleRead,
  deleteNotification,
  markAsRead,
}) {
  const Icon = notification.icon;
  const styles = colorStyles[notification.color] || colorStyles.teal;

  return (
    <article
      className={`group relative rounded-2xl border transition-all duration-200 hover:shadow-md ${
        notification.read
          ? "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          : "border-teal-200 bg-teal-50/40 shadow-sm shadow-teal-900/[0.02] hover:border-teal-300 dark:border-teal-500/20 dark:bg-teal-500/[0.035] dark:hover:border-teal-500/40"
      }`}
    >
      {!notification.read && (
        <div className="absolute bottom-4 left-0 top-4 w-[3px] rounded-r-full bg-teal-500" />
      )}

      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start">
        {/* Icon and content */}
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${styles.icon}`}
          >
            <Icon size={20} strokeWidth={1.8} />

            {!notification.read && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-teal-500 dark:border-slate-900" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h4
                className={`text-sm leading-5 ${
                  notification.read
                    ? "font-semibold text-slate-800 dark:text-slate-200"
                    : "font-bold text-slate-900 dark:text-white"
                }`}
              >
                {notification.title}
              </h4>

              {!notification.read && (
                <span className="rounded-md bg-teal-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                  New
                </span>
              )}
            </div>

            <p className="mt-1.5 max-w-3xl text-xs leading-6 text-slate-600 dark:text-slate-400 sm:text-[13px]">
              {notification.message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold ${styles.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                {typeLabels[notification.type] || "Notification"}
              </span>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Clock3 size={12} />
                {notification.time}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 dark:border-slate-800 lg:w-auto lg:shrink-0 lg:justify-end lg:border-t-0 lg:pt-1">
          <a
            href={notification.link}
            onClick={() => markAsRead(notification.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-teal-500/10 dark:hover:text-teal-300"
          >
            {notification.actionText}
            <ArrowUpRight size={14} />
          </a>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleRead(notification.id)}
              title={notification.read ? "Mark as unread" : "Mark as read"}
              aria-label={
                notification.read ? "Mark as unread" : "Mark as read"
              }
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                notification.read
                  ? "text-slate-400 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-500/10 dark:hover:text-teal-400"
                  : "bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20"
              }`}
            >
              <Check size={16} />
            </button>

            <button
              onClick={() => deleteNotification(notification.id)}
              title="Delete notification"
              aria-label="Delete notification"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* Empty state */
function EmptyState({ searchQuery, onReset }) {
  return (
    <div className="px-5 py-16 text-center sm:py-20">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-500">
        {searchQuery ? <Search size={27} /> : <Inbox size={27} />}
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-800 dark:text-white">
        {searchQuery ? "No matching notifications" : "You're all caught up"}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        {searchQuery
          ? "Try a different keyword or reset your filters to find what you're looking for."
          : "There are no notifications in this view right now. New workspace updates will appear here."}
      </p>

      <button
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700"
      >
        <CircleDot size={14} />
        Reset filters
      </button>
    </div>
  );
}