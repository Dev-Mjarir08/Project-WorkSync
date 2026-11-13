
import React from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Kanban,
  Users,
  UserPlus,
  BarChart3,
  TrendingUp,
  Activity,
  Bell,
  Sparkles,
  X,
  CalendarDays,
  BriefcaseBusiness,
  PanelsTopLeft,
  Send,
  Shield,
  Settings,
  ChevronRight,
  Search,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getUserItem } from "../../utils/userStorage.js";

export const managerNavSections = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/manager/dashboard", viewKey: "dashboard" },
      { name: "Projects", icon: FolderKanban, path: "/manager/projects", viewKey: "projects", badge: "6" },
      { name: "Tasks", icon: ListTodo, path: "/manager/tasks", viewKey: "tasks", badge: "24" },
      { name: "Kanban Boards", icon: Kanban, path: "/manager/boards/board-1", viewKey: "boards" },
      { name: "Calendar", icon: CalendarDays, path: "/manager/calendar", viewKey: "calendar" },
    ],
  },
  {
    title: "TEAM & WORKLOAD",
    items: [
      { name: "Team Members", icon: Users, path: "/manager/team", viewKey: "team", badge: "3" },
      { name: "Assignments", icon: UserPlus, path: "/manager/assignments", viewKey: "assignments" },
      { name: "Team Workload", icon: BarChart3, path: "/manager/workload", viewKey: "workload" },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { name: "Reports & Analytics", icon: TrendingUp, path: "/manager/reports", viewKey: "reports" },
      { name: "Activity", icon: Activity, path: "/manager/activity", viewKey: "activity" },
      { name: "Notifications", icon: Bell, path: "/manager/notifications", viewKey: "notifications", badge: "3" },
    ],
  },
];

export const employeeNavSections = [
  {
    title: "MY WORK",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard", viewKey: "dashboard" },
      { name: "My Tasks", icon: ListTodo, path: "/employee/tasks", viewKey: "tasks" },
      { name: "Projects", icon: FolderKanban, path: "/employee/projects", viewKey: "projects" },
      { name: "Kanban Boards", icon: Kanban, path: "/employee/boards", viewKey: "boards" },
      { name: "Calendar", icon: CalendarDays, path: "/employee/calendar", viewKey: "calendar" },
    ],
  },
  {
    title: "COLLABORATION",
    items: [
      { name: "Discussions", icon: Send, path: "/employee/discussions", viewKey: "discussions" },
      { name: "Activity", icon: Activity, path: "/employee/activity", viewKey: "activity" },
      { name: "Notifications", icon: Bell, path: "/employee/notifications", viewKey: "notifications" },
      { name: "Global Search", icon: Search, path: "/employee/search", viewKey: "search" },
    ],
  },
];

const adminLinks = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Workspace", to: "/admin/workspace", icon: BriefcaseBusiness },
  { label: "Members", to: "/admin/members", icon: Users },
  { label: "Tasks", to: "/admin/tasks", icon: ListTodo },
  { label: "Boards", to: "/admin/boards", icon: PanelsTopLeft },
  { label: "Invitations", to: "/admin/invitations", icon: Send },
  { label: "Activity", to: "/admin/activity", icon: Activity },
  { label: "Notifications", to: "/admin/notifications", icon: Bell },
  { label: "Roles", to: "/admin/roles", icon: Shield },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

const Sidebar = ({
  activeItem = "dashboard",
  mobileOpen = false,
  setMobileOpen = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = location.pathname.startsWith("/admin");
  const isEmployee = location.pathname.startsWith("/employee");

  const displayName =
    user?.name ||
    (isEmployee ? "Team Employee" : isAdmin ? "Workspace Admin" : "Project Manager");

  const displayEmail =
    user?.email ||
    (isEmployee
      ? "employee@worksync.io"
      : isAdmin
        ? "admin@worksync.io"
        : "manager@worksync.io");

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "WS";

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  // Admin sidebar
  if (isAdmin) {
    const adminContent = (
      <div className="flex h-full flex-col justify-between bg-[#1F1B2A] text-white">
        <div>
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-[#6542F5] text-sm font-bold shadow-xs">
                W
              </span>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white">WorkSync</p>
                <p className="text-xs text-white/55">Admin Workspace</p>
              </div>
            </div>

            {mobileOpen && (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1 text-white/60 hover:text-white md:hidden"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <nav aria-label="Admin navigation" className="space-y-1 p-3">
            {adminLinks.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 font-semibold text-white shadow-xs"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon aria-hidden="true" className="size-4.5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              navigate("/admin/profile");
            }}
            className="flex items-center justify-between rounded-xl p-2 text-left transition hover:bg-white/5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/20 text-xs font-bold text-purple-300">
                {initials}
              </div>
              <div className="min-w-0 truncate">
                <p className="truncate text-xs font-semibold text-white">{displayName}</p>
                <p className="truncate text-[10px] text-slate-400">{displayEmail}</p>
              </div>
            </div>
            <ChevronRight size={14} className="shrink-0 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-rose-400 transition hover:border-rose-500/20 hover:bg-rose-500/10"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );

    return (
      <>
        <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-[#1F1B2A] md:flex">
          {adminContent}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col bg-[#1F1B2A] shadow-2xl">
              {adminContent}
            </div>
          </div>
        )}
      </>
    );
  }

  // Manager and Employee navigation
  const navSections = isEmployee ? employeeNavSections : managerNavSections;

  const isItemActive = (item) => {
    const path = location.pathname;

    if (activeItem === item.viewKey) return true;
    if (path === item.path) return true;

    if (item.viewKey === "projects" && path.includes("/projects")) return true;
    if (item.viewKey === "boards" && path.includes("/boards")) return true;
    if (item.viewKey === "tasks" && path.includes("/tasks")) return true;
    if (item.viewKey === "reports" && path.includes("/reports")) return true;
    if (item.viewKey === "calendar" && path.includes("/calendar")) return true;
    if (item.viewKey === "discussions" && path.includes("/discussions")) return true;

    if (
      item.viewKey === "dashboard" &&
      (path === "/manager/dashboard" || path === "/employee/dashboard")
    ) {
      return true;
    }

    return false;
  };

  const handleItemClick = (item) => {
    setMobileOpen(false);
    navigate(item.path);
  };

  const sprintTasks = isEmployee
    ? getUserItem("employee_tasks", [])
    : getUserItem("manager_tasks", []);

  const totalSprintTasks =
    Array.isArray(sprintTasks) && sprintTasks.length > 0
      ? sprintTasks.length
      : isEmployee
        ? 21
        : 30;

  const completedSprintTasks =
    Array.isArray(sprintTasks) && sprintTasks.length > 0
      ? sprintTasks.filter(
          (task) => task.status === "Completed" || task.status === "done"
        ).length
      : isEmployee
        ? 18
        : 22;

  const sprintPercent = Math.round(
    (completedSprintTasks / totalSprintTasks) * 100
  );

  const renderContent = () => (
    <div className="flex h-full flex-col justify-between overflow-hidden bg-white text-slate-700">
      <div className="shrink-0 border-b border-slate-100 p-5 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isEmployee ? "bg-teal-600" : "bg-blue-600"
            } text-white shadow-xs`}
          >
            <Sparkles size={18} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900">
                WorkSync
              </span>
              <span
                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${
                  isEmployee
                    ? "border-teal-200 bg-teal-50 text-teal-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {isEmployee ? "MEMBER" : "PRO"}
              </span>
            </div>

            <p className="text-[11px] font-medium text-slate-500">
              {isEmployee ? "Employee Workspace" : "Manager Workspace"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">
              {isEmployee ? "My Sprint Tasks" : "Sprint 4 Active"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              On Track
            </span>
          </div>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isEmployee ? "bg-teal-600" : "bg-blue-600"
              }`}
              style={{ width: `${sprintPercent}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {completedSprintTasks} of {totalSprintTasks} Done
            </span>
            <span className="font-semibold text-slate-700">
              {sprintPercent}%
            </span>
          </div>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3.5 py-4 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>

            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? isEmployee
                          ? "border border-teal-100 bg-teal-50 font-semibold text-teal-700"
                          : "border border-blue-100 bg-blue-50 font-semibold text-blue-700 shadow-xs"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={16}
                        className={
                          active
                            ? isEmployee
                              ? "text-teal-600"
                              : "text-blue-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        }
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          active
                            ? isEmployee
                              ? "bg-teal-100 text-teal-700"
                              : "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/70 group-hover:text-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-200/80 bg-white p-3.5">
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            navigate(isEmployee ? "/employee/profile" : "/manager/profile");
          }}
          className="flex w-full items-center justify-between rounded-xl p-1.5 text-left transition hover:bg-slate-50"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                isEmployee
                  ? "bg-teal-600 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              {initials}
            </div>
            <div className="min-w-0 truncate">
              <p className="truncate text-xs font-semibold leading-tight text-slate-800">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-slate-500">
                {displayEmail}
              </p>
            </div>
          </div>
          <ChevronRight size={14} className="shrink-0 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:border-rose-100 hover:bg-rose-50"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-xs lg:flex xl:w-72">
        {renderContent()}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu backdrop"
          />

          <div className="fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
              <span className="text-xs font-semibold text-slate-800">
                Workspace Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;