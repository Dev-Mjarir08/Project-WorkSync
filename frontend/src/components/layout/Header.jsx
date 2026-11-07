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

  const getAutoTitle = () => {
    const path = location.pathname;
    if (path.includes("/dashboard")) return "Dashboard";
    if (path.includes("/projects")) return "Projects";
    if (path.includes("/tasks")) return "Tasks";
    if (path.includes("/boards")) return "Boards";
    if (path.includes("/team")) return "Team";
    if (path.includes("/workspaces")) return "Workspaces";
    if (path.includes("/members")) return "Members";
    if (path.includes("/activity")) return "Activity";
    if (path.includes("/notifications")) return "Notifications";
    if (path.includes("/reports")) return "Reports";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/profile")) return "Profile";
    return pageTitle || "Workspace";
  };

  const currentTitle = pageTitle || getAutoTitle();
  const hasUnread = notifications.some((n) => n.unread);

  const profilePath = location.pathname.startsWith('/admin')
    ? '/admin/profile'
    : location.pathname.startsWith('/employee')
    ? '/employee/profile'
    : location.pathname.startsWith('/super-admin')
    ? '/super-admin/profile'
    : '/manager/profile';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 py-2.5 transition">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {setMobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          )}

          <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 font-medium truncate">
            <span className="font-semibold text-slate-800">WorkSync</span>
            <ChevronRight size={14} className="mx-1.5 text-slate-400 shrink-0" />
            {breadcrumbs ? (
              breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight size={14} className="mx-1.5 text-slate-400 shrink-0" />}
                  {crumb.href ? (
                    <Link to={crumb.href} className="hover:text-slate-800 transition truncate">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-900 font-semibold truncate">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))
            ) : (
              <span className="text-slate-900 font-semibold truncate">{currentTitle}</span>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {showSearch && (
            <div className="relative hidden md:block w-48 sm:w-56 lg:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
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
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none shadow-xs"
              aria-label="View notifications"
              title="Notifications"
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
                <div className="pt-2 border-t border-slate-100 mt-2 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {location.pathname.startsWith('/manager') && (
            <Link
              to="/manager/tasks/create"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98] shrink-0"
              title="Create Task"
            >
              <Plus size={15} />
              <span>Create Task</span>
            </Link>
          )}

          <Link
            to={profilePath}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 focus:outline-none shadow-xs shrink-0"
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
