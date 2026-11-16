import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import notificationService from './notificationService.js';

export const NotificationBell = ({ className = '' }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  const fetchNotifs = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res?.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount ?? res.notifications.filter(n => !n.isRead && !n.read).length);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (e) {}
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    setUnreadCount(0);
  };

  const getTargetLink = () => {
    if (location.pathname.startsWith('/admin')) return '/admin/notifications';
    if (location.pathname.startsWith('/employee')) return '/employee/notifications';
    return '/manager/notifications';
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none shadow-xs cursor-pointer"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-slate-900">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Mark all as read
            </button>
          </div>

          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notif) => {
                const isUnread = !notif.isRead && !notif.read;
                return (
                  <div
                    key={notif.id || notif._id}
                    className={`rounded-xl p-2.5 text-xs transition border ${
                      isUnread
                        ? 'bg-blue-50/70 text-slate-800 border-blue-100'
                        : 'bg-slate-50 text-slate-600 border-slate-100'
                    }`}
                  >
                    <p className="font-semibold text-slate-900 leading-snug">{notif.title}</p>
                    {notif.message && (
                      <p className="mt-0.5 text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
                    )}
                    <p className="mt-1 text-[10px] text-slate-400">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                No notifications right now
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 mt-2 text-center">
            <Link
              to={getTargetLink()}
              onClick={() => setOpen(false)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
