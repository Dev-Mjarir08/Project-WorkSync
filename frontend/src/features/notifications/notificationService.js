import { getUserItem, setUserItem, getCurrentUser } from '../../utils/userStorage.js';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.__ENV__?.API_URL) {
    return `${window.__ENV__.API_URL}/api/v1/notifications`;
  }
  const viteUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL;
  if (viteUrl) {
    return `${viteUrl.replace(/\/+$/, '')}/api/v1/notifications`;
  }
  return 'http://localhost:8081/api/v1/notifications';
};

const API_BASE_URL = getApiBaseUrl();

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem('workspaceId') : null;
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(workspaceId ? { 'x-workspace-id': workspaceId } : {})
  };
};

export const notificationService = {
  getNotifications: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.unreadOnly) params.set('unreadOnly', 'true');
      if (filters.type && filters.type !== 'all' && filters.type !== 'All') params.set('type', filters.type);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await fetch(`${API_BASE_URL}${query}`, {
        headers: getAuthHeaders()
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        if (data && Array.isArray(data.notifications)) {
          setUserItem('cached_notifications', data.notifications);
          return {
            notifications: data.notifications,
            unreadCount: data.unreadCount ?? data.notifications.filter(n => !n.isRead && !n.read).length
          };
        }
      }
    } catch (err) {
      // Offline fallback
    }

    const fallback = getUserItem('cached_notifications', [
      {
        id: 'notif_welcome',
        title: 'Welcome to WorkSync',
        message: 'Your dashboard, team, and workspace are fully active.',
        type: 'system',
        time: 'Just now',
        isRead: false,
        read: false,
        createdAt: new Date().toISOString()
      }
    ]);

    return {
      notifications: fallback,
      unreadCount: fallback.filter(n => !n.isRead && !n.read).length
    };
  },

  getUnreadCount: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/unread-count`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.unreadCount || 0;
      }
    } catch (e) {}

    const cached = getUserItem('cached_notifications', []);
    return cached.filter(n => !n.isRead && !n.read).length;
  },

  markAsRead: async (notificationId) => {
    try {
      await fetch(`${API_BASE_URL}/${notificationId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
    } catch (e) {}

    const cached = getUserItem('cached_notifications', []);
    const updated = cached.map(n => (n.id === notificationId || n._id === notificationId ? { ...n, isRead: true, read: true } : n));
    setUserItem('cached_notifications', updated);
    return { success: true };
  },

  markAllAsRead: async () => {
    try {
      await fetch(`${API_BASE_URL}/read-all`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
    } catch (e) {}

    const cached = getUserItem('cached_notifications', []);
    const updated = cached.map(n => ({ ...n, isRead: true, read: true }));
    setUserItem('cached_notifications', updated);
    return { success: true };
  },

  deleteNotification: async (notificationId) => {
    try {
      await fetch(`${API_BASE_URL}/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (e) {}

    const cached = getUserItem('cached_notifications', []);
    const updated = cached.filter(n => n.id !== notificationId && n._id !== notificationId);
    setUserItem('cached_notifications', updated);
    return { success: true };
  },

  clearAll: async () => {
    try {
      await fetch(`${API_BASE_URL}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (e) {}

    setUserItem('cached_notifications', []);
    return { success: true };
  }
};

export default notificationService;
