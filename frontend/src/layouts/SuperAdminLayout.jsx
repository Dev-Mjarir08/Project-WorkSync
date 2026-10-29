import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Activity,
  ShieldCheck,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Database
} from 'lucide-react';

export const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      name: 'Overview',
      path: '/super-admin/dashboard',
      icon: LayoutDashboard,
      badge: 'Live'
    },
    {
      name: 'Users Management',
      path: '/super-admin/users',
      icon: Users,
      badge: '1.4k'
    },
    {
      name: 'Workspaces',
      path: '/super-admin/workspaces',
      icon: Building2,
      badge: '84'
    },
    {
      name: 'System Health',
      path: '/super-admin/system-health',
      icon: Activity,
      badge: '99.9%'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    // For demo/dev, navigate to auth or reload
    navigate('/super-admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0d1322] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Top Brand Header */}
          <div>
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/70 bg-[#0d1322]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg tracking-tight text-white">WorkSync</span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      Super
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Control Center</p>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Platform Status Banner */}
            <div className="mx-4 my-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">MongoDB Atlas</p>
                  <p className="text-[11px] text-emerald-400 font-mono">Cluster Connected</p>
                </div>
              </div>
              <Database className="h-4 w-4 text-slate-500" />
            </div>

            {/* Navigation Section */}
            <div className="px-3 py-2 space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Core Administration
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                          isActive
                            ? 'bg-indigo-700/60 text-white'
                            : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Bottom Super Admin Profile & Logout */}
          <div className="p-4 border-t border-slate-800/80 bg-[#0b101c]">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop"
                    alt="Jarir Multani"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-white truncate">Jarir Multani</h4>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 text-indigo-400 bg-indigo-500/10 rounded border border-indigo-500/20">
                    Super Admin
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#090d16] overflow-y-auto">
          {/* Top Navbar */}
          <header className="sticky top-0 z-30 h-16 bg-[#0d1322]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Breadcrumb / Title preview */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                <span className="hover:text-slate-200">Super Admin</span>
                <span>/</span>
                <span className="text-white font-medium capitalize">
                  {location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard'}
                </span>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              {/* Live status badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-300 font-medium">Production v1.0.0</span>
              </div>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500"></span>
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="text-sm font-semibold text-white">System Alerts</h4>
                      <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        2 new
                      </span>
                    </div>
                    <div className="py-2 space-y-2">
                      <div className="p-2.5 rounded-xl bg-slate-800/40 text-xs space-y-1">
                        <p className="font-medium text-slate-200">MongoDB Atlas Connection</p>
                        <p className="text-slate-400">Database replica set connected and operating normally.</p>
                        <span className="text-[10px] text-slate-500">Just now</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/40 text-xs space-y-1">
                        <p className="font-medium text-slate-200">New User Registered</p>
                        <p className="text-slate-400">Jarir Multani updated platform auth keys.</p>
                        <span className="text-[10px] text-slate-500">10 mins ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Jump Link to Workspaces */}
              <button
                onClick={() => navigate('/super-admin/workspaces')}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Workspaces</span>
              </button>
            </div>
          </header>

          {/* Main Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
