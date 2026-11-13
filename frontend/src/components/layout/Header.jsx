
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  ChevronRight,
  Search,
  X,
  Bell,
  Plus,
  User,
} from "lucide-react";

export const Header = ({
  setMobileOpen,
  breadcrumbs,
  pageTitle,
  searchQuery,
  onSearchChange,
  showSearch = true,
  searchPlaceholder = "Search tasks, members... (⌘K)",
}) => {
  const location = useLocation();

  const [internalSearch, setInternalSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "Ayan updated 'Design login page' to In Progress",
      time: "15m ago",
      unread: true,
    },
    {
      id: 2,
      text: "Rouhan completed 'Set up workspace'",
      time: "2h ago",
      unread: true,
    },
    {
      id: 3,
      text: "Review task assignments pending approval",
      time: "5h ago",
      unread: false,
    },
  ]);

  const activeSearch =
    searchQuery !== undefined ? searchQuery : internalSearch;

  const isManager = location.pathname.startsWith("/manager");
  const isAdmin = location.pathname.startsWith("/admin");
  const isEmployee = location.pathname.startsWith("/employee");
  const isSuperAdmin = location.pathname.startsWith("/super-admin");

  const handleSearchChange = (e) => {
    if (onSearchChange) {
      onSearchChange(e);
    } else {
      setInternalSearch(e.target.value);
    }
  };

  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange({ target: { value: "" } });
    } else {
      setInternalSearch("");
    }
  };

  const getAutoTitle = () => {
    const path = location.pathname;

    if (path.endsWith("/dashboard")) return "Dashboard";
    if (path.includes("/projects/")) return "Project Details";
    if (path.endsWith("/projects")) return "Projects";
    if (path.includes("/boards/")) return "Kanban Board";
    if (path.endsWith("/boards")) return "Boards";
    if (path.endsWith("/tasks/create")) return "Create Task";
    if (path.includes("/tasks/")) return "Task Details";
    if (path.endsWith("/tasks")) return "Tasks";
    if (path.endsWith("/assignments")) return "Task Assignments";
    if (path.endsWith("/team")) return "Team Members";
    if (path.endsWith("/workload")) return "Team Workload";
    if (path.includes("/reports")) return "Reports & Analytics";
    if (path.endsWith("/calendar")) return "Calendar";
    if (path.endsWith("/activity")) return "Activity";
    if (path.endsWith("/notifications")) return "Notifications";
    if (path.endsWith("/profile")) return "Profile";
    if (path.endsWith("/settings")) return "Settings";
    if (path.endsWith("/workspace")) return "Workspace";
    if (path.endsWith("/members")) return "Members";

    return "Workspace";
  };

  const currentTitle = pageTitle || getAutoTitle();

  const profilePath = isAdmin
    ? "/admin/profile"
    : isEmployee
      ? "/employee/profile"
      : isSuperAdmin
        ? "/super-admin/profile"
        : "/manager/profile";

  const notificationPath = isAdmin
    ? "/admin/notifications"
    : isEmployee
      ? "/employee/notifications"
      : "/manager/notifications";

  const hasUnread = notifications.some((n) => n.unread);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">

        {/* Navigation and Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">

          {setMobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Open mobile navigation"
            >
              <Menu size={18} />
            </button>
          )}

          <nav
            aria-label="Breadcrumb"
            className="hidden sm:flex items-center gap-2 text-xs text-slate-500 truncate"
          >
            <span className="font-semibold text-slate-800">
              WorkSync
            </span>

            <ChevronRight size={13} className="text-slate-400 shrink-0" />

            <span>
              {isManager
                ? "Manager"
                : isAdmin
                  ? "Admin"
                  : isEmployee
                    ? "Employee"
                    : isSuperAdmin
                      ? "Super Admin"
                      : "Workspace"}
            </span>

            <ChevronRight size={13} className="text-slate-400 shrink-0" />

            {breadcrumbs ? (
              breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <ChevronRight
                      size={13}
                      className="text-slate-400 shrink-0"
                    />
                  )}

                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className="text-slate-500 hover:text-blue-600 transition truncate max-w-[150px]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-blue-600 truncate max-w-[200px]">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))
            ) : (
              <span className="font-medium text-blue-600 truncate">
                {currentTitle}
              </span>
            )}
          </nav>
        </div>

        {/* Search, Notifications and Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {showSearch && (
            <div className="relative hidden md:block w-48 sm:w-56 lg:w-72">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />

              <input
                type="text"
                placeholder={searchPlaceholder}
                value={activeSearch}
                onChange={handleSearchChange}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition shadow-xs"
              />

              {activeSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowNotifications((previous) => !previous)
              }
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 shadow-xs"
              aria-label="View notifications"
              title="Notifications"
            >
              <Bell size={16} />

              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-900">
                    Notifications
                  </h4>

                  <button
                    type="button"
                    onClick={() =>
                      setNotifications((previous) =>
                        previous.map((n) => ({
                          ...n,
                          unread: false,
                        }))
                      )
                    }
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`rounded-xl p-2.5 text-xs transition border ${
                        notif.unread
                          ? "bg-blue-50/60 text-slate-800 border-blue-100"
                          : "bg-slate-50 text-slate-600 border-slate-100"
                      }`}
                    >
                      <p className="font-medium leading-relaxed">
                        {notif.text}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {notif.time}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 mt-2 text-center">
                  <Link
                    to={notificationPath}
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Manager Create Task Button */}
          {isManager && (
            <Link
              to="/manager/tasks/create"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98] shrink-0"
              title="Create Task"
            >
              <Plus size={15} />
              <span>Create Task</span>
            </Link>
          )}

          {/* Profile Button */}
          <Link
            to={profilePath}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-xs shrink-0"
            title="Profile"
            aria-label="Profile"
          >
            <User size={16} />
          </Link>

        </div>
      </div>
    </header>
  );
};

export default Header;