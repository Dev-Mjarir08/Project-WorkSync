import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  ChevronRight,
  Search,
  X,
  Bell,
  Plus,
  Settings,
} from "lucide-react";

/**
 * Shared Manager Header component
 * - Consistent across Manager pages
 * - Removed 'DS' logo/text
 * - Create Task button navigating to /manager/tasks/create
 * - Visual-only, non-functional Settings button immediately after Create Task
 */
const Header = ({
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
    { id: 1, text: "Ayan updated 'Design login page' to In Progress", time: "15m ago", unread: true },
    { id: 2, text: "Rouhan completed 'Set up workspace'", time: "2h ago", unread: true },
    { id: 3, text: "Review task assignments pending approval", time: "5h ago", unread: false },
  ]);

  const activeSearch = searchQuery !== undefined ? searchQuery : internalSearch;
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

  // Determine breadcrumb title based on path
  const getAutoTitle = () => {
    const path = location.pathname;
    if (path === "/manager/dashboard") return "Dashboard";
    if (path === "/manager/projects") return "Projects";
    if (path.startsWith("/manager/projects/")) return "Project Details";
    if (path.startsWith("/manager/boards/")) return "Kanban Board";
    if (path === "/manager/tasks/create") return "Create Task";
    if (path === "/manager/tasks") return "Tasks";
    if (path.startsWith("/manager/tasks/")) return "Task Details";
    return pageTitle || "Manager";
  };

  const hasUnread = notifications.some((n) => n.unread);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Trigger & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen && setMobileOpen(true)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden shrink-0"
            aria-label="Open mobile navigation menu"
          >
            <Menu size={18} />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 truncate">
            <span className="font-semibold text-slate-700">WorkSync</span>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <span>Manager</span>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            {breadcrumbs ? (
              breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight size={13} className="text-slate-400 shrink-0" />}
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
              <span className="font-medium text-blue-600 truncate">{pageTitle || getAutoTitle()}</span>
            )}
          </div>
        </div>

        {/* Right: Search, Notifications, Create Task, Settings */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search bar */}
          {showSearch && (
            <div className="relative hidden md:block w-52 lg:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={activeSearch}
                onChange={handleSearchChange}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              />
              {activeSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none shadow-xs"
              aria-label="View notifications"
            >
              <Bell size={16} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-900">Notifications</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setNotifications(notifications.map((n) => ({ ...n, unread: false })))
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
                      <p className="font-medium leading-relaxed">{notif.text}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Create Task Button */}
          <Link
            to="/manager/tasks/create"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98]"
          >
            <Plus size={15} />
            <span>Create Task</span>
          </Link>

          {/* Settings Button: Visual-only, non-functional, immediately following Create Task */}
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-[0.98]"
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={15} className="text-slate-500" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
