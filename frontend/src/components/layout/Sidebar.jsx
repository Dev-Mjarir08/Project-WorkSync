import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  ChevronRight,
} from "lucide-react";

export const managerNavSections = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/manager/dashboard", viewKey: "dashboard" },
      { name: "Projects", icon: FolderKanban, path: "/manager/projects", viewKey: "projects", badge: "6" },
      { name: "Task Management", icon: ListTodo, path: "/manager/dashboard#tasks", viewKey: "tasks", badge: "24" },
      { name: "Kanban Boards", icon: Kanban, path: "/manager/boards/board-1", viewKey: "boards" },
    ],
  },
  {
    title: "TEAM & WORKLOAD",
    items: [
      { name: "Team Members", icon: Users, path: "/manager/dashboard#team", viewKey: "team", badge: "3" },
      { name: "Assignments", icon: UserPlus, path: "/manager/dashboard#assignments", viewKey: "assignments" },
      { name: "Team Workload", icon: BarChart3, path: "/manager/dashboard#workload", viewKey: "workload" },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { name: "Reports & Analytics", icon: TrendingUp, path: "/manager/dashboard#reports", viewKey: "reports" },
      { name: "Activity", icon: Activity, path: "/manager/dashboard#activity", viewKey: "activity" },
      { name: "Notifications", icon: Bell, path: "/manager/dashboard#notifications", viewKey: "notifications", badge: "3" },
    ],
  },
];

const Sidebar = ({ activeItem = "projects", mobileOpen = false, setMobileOpen = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isItemActive = (item) => {
    if (activeItem === item.viewKey) return true;
    if (location.pathname === item.path) return true;
    if (item.viewKey === "projects" && location.pathname.startsWith("/manager/projects")) return true;
    if (item.viewKey === "boards" && location.pathname.startsWith("/manager/boards")) return true;
    return false;
  };

  const handleItemClick = (item) => {
    setMobileOpen(false);
    if (item.path.startsWith("/manager/dashboard#")) {
      navigate("/manager/dashboard");
      return;
    }
    navigate(item.path);
  };

  const renderContent = () => (
    <div className="flex h-full flex-col justify-between overflow-hidden bg-[#0B1120] text-slate-200">
      {/* 1. TOP FIXED HEADER: Brand Logo & Workspace Sprint Status */}
      <div className="shrink-0 p-5 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">WorkSync</span>
              <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/25">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Manager Workspace</p>
          </div>
        </div>

        {/* Workspace Quick Sprint Indicator */}
        <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Sprint 4 Active</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              On Track
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{ width: "74%" }}
            ></div>
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
            <span>Velocity: 34 pts</span>
            <span>74% done</span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE INDEPENDENTLY SCROLLABLE NAVIGATION */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3.5 py-4 space-y-6 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
        {managerNavSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {section.title}
            </p>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                      active
                        ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-md shadow-blue-500/20 border border-blue-400/30"
                        : "text-slate-400 hover:bg-slate-850 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={16}
                        className={active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.2 text-[10px] font-semibold ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300 border border-slate-700/60"
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

      {/* 3. BOTTOM FIXED ACCOUNT & USER PROFILE */}
      <div className="shrink-0 p-3.5 border-t border-slate-800/80 bg-[#0B1120]/80">
        <div className="flex items-center justify-between rounded-xl p-1.5 transition hover:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-blue-500/20">
                DS
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B1120] bg-emerald-500"></span>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">Devanshi Sharma</p>
              <p className="text-[10px] text-slate-400">Engineering Manager</p>
            </div>
          </div>
          <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
            Admin
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col fixed inset-y-0 left-0 z-30 border-r border-slate-800/80 bg-[#0B1120] h-screen shadow-xl shadow-black/20">
        {renderContent()}
      </aside>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu backdrop"
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0B1120] shadow-2xl flex flex-col h-screen border-r border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 shrink-0 bg-[#0B1120]">
              <span className="text-xs font-semibold text-slate-300">Workspace Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{renderContent()}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
