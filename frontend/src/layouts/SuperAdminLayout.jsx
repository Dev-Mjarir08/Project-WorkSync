import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { SuperAdminProvider } from '../context/SuperAdminContext.jsx';
import notificationService from '../features/notifications/notificationService.js';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  CheckSquare,
  Bell,
  Activity,
  ShieldCheck,
  Search,
  Menu,
  X,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Database,
  FileText,
  Sliders,
  TrendingUp,
  User
} from 'lucide-react';

export const SuperAdminLayout = () => {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchNotifs = async () => {
      try {
        const res = await notificationService.getNotifications();
        if (isMounted && res?.notifications) {
          setNotifications(res.notifications);
          setUnreadCount(res.unreadCount ?? res.notifications.filter(n => !n.isRead && !n.read).length);
        }
      } catch (e) {}
    };
    fetchNotifs();
    const timer = setInterval(fetchNotifs, 15000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (e) {}
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    setUnreadCount(0);
  };

  const navItems = [
    {
      name: 'Overview',
      path: '/super-admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Users Management',
      path: '/super-admin/users',
      icon: Users
    },
    {
      name: 'Workspaces',
      path: '/super-admin/workspaces',
      icon: Building2
    },
    {
      name: 'Platform Boards',
      path: '/super-admin/boards',
      icon: FolderKanban
    },
    {
      name: 'Tasks & Assignments',
      path: '/super-admin/tasks',
      icon: CheckSquare
    },
    {
      name: 'Announcements',
      path: '/super-admin/announcements',
      icon: Bell
    },
    {
      name: 'Platform Analytics',
      path: '/super-admin/analytics',
      icon: TrendingUp
    },
    {
      name: 'System Health',
      path: '/super-admin/system-health',
      icon: Activity
    },
    {
      name: 'Roles & Permissions',
      path: '/super-admin/roles',
      icon: ShieldCheck
    },
    {
      name: 'Audit Logs',
      path: '/super-admin/audit-logs',
      icon: FileText
    },
    {
      name: 'Platform Settings',
      path: '/super-admin/settings',
      icon: Sliders
    },
    {
      name: 'Admin Profile',
      path: '/super-admin/profile',
      icon: User
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SuperAdminProvider>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased">
      
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0d1322] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          
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

              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-3 py-3 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Core Administration
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all group ${
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
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-slate-800/80 bg-[#0b101c]">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <button
                onClick={() => navigate('/super-admin/profile')}
                className="flex items-center gap-3 text-left hover:opacity-85 transition-opacity overflow-hidden"
              >
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-indigo-500/30">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-white truncate">{user?.name || "Super Admin"}</h4>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 text-indigo-400 bg-indigo-500/10 rounded border border-indigo-500/20 capitalize">
                    {user?.role ? user.role.replace('_', ' ') : 'Super Admin'}
                  </span>
                </div>
              </button>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 bg-[#090d16] overflow-y-auto">
          
          <header className="sticky top-0 z-30 h-16 bg-[#0d1322]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-950"></span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold text-white">System Alerts</h4>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 6).map((notif) => {
                          const isUnread = !notif.isRead && !notif.read;
                          return (
                            <div
                              key={notif.id || notif._id}
                              className={`p-2.5 rounded-xl border text-xs transition ${
                                isUnread
                                  ? 'bg-indigo-950/40 border-indigo-500/30 text-slate-200'
                                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
                              }`}
                            >
                              <p className="font-semibold text-white leading-snug">{notif.title}</p>
                              {notif.message && (
                                <p className="mt-0.5 text-slate-300 text-[11px] leading-relaxed">{notif.message}</p>
                              )}
                              <p className="mt-1 text-[10px] text-slate-500">
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-4 text-center">
                          <p className="text-xs text-slate-400">No unread alerts or notifications.</p>
                          <p className="text-[10px] text-slate-500 mt-1">Platform services operating normally.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/super-admin/workspaces')}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Workspaces</span>
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  </SuperAdminProvider>
);
};

export default SuperAdminLayout;
