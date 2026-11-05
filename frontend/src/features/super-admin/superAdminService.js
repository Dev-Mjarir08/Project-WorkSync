// Super Admin Service: provides live API interaction with backend database
const API_BASE_URL = 'http://localhost:8081/api/v1/super-admin';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const superAdminService = {
  // ==========================================
  // 1. DASHBOARD OVERVIEW & METRICS
  // ==========================================
  getDashboardOverview: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.error('Failed to fetch dashboard overview:', err);
    }
    return {
      stats: { totalUsers: 0, activeUsers: 0, totalWorkspaces: 0, activeWorkspaces: 0, totalBoards: 0, totalTasks: 0 },
      recentUsers: [],
      recentWorkspaces: [],
      recentActivities: []
    };
  },

  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getUserGrowth: async (days = 30) => {
    const res = await fetch(`${API_BASE_URL}/dashboard/user-growth?days=${days}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getWorkspaceGrowth: async (days = 30) => {
    const res = await fetch(`${API_BASE_URL}/dashboard/workspace-growth?days=${days}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getRecentUsers: async (limit = 10) => {
    const res = await fetch(`${API_BASE_URL}/dashboard/recent-users?limit=${limit}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data?.users || json.data || [];
  },

  getRecentWorkspaces: async (limit = 10) => {
    const res = await fetch(`${API_BASE_URL}/dashboard/recent-workspaces?limit=${limit}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data?.workspaces || json.data || [];
  },

  getRecentActivities: async (limit = 15) => {
    const res = await fetch(`${API_BASE_URL}/dashboard/recent-activities?limit=${limit}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data?.activities || json.data || [];
  },

  // ==========================================
  // 2. USER MANAGEMENT
  // ==========================================
  getUsers: async (query = {}) => {
    const { search = '', role = 'all', status = 'all', page = 1, limit = 20 } = query;
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role && role !== 'all') params.append('role', role);
      if (status && status !== 'all') params.append('status', status);
      params.append('page', page);
      params.append('limit', limit);

      const res = await fetch(`${API_BASE_URL}/users?${params.toString()}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
    return { users: [], totalCount: 0 };
  },

  getUserById: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch user');
    return json.data?.user || json.data;
  },

  createUser: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create user');
    return json.data?.user || json.data;
  },

  updateUser: async (userId, updateData) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update user');
    return json.data?.user || json.data;
  },

  updateUserStatus: async (userId, statusData = {}) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(statusData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update user status');
    return json.data?.user || json.data;
  },

  toggleUserStatus: async (userId) => {
    return superAdminService.updateUserStatus(userId, {});
  },

  updateUserRole: async (userId, newRole) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role: newRole })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update user role');
    return json.data?.user || json.data;
  },

  deleteUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete user');
    return json.data;
  },

  getUserWorkspaces: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/workspaces`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getUserActivities: async (userId, limit = 20) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/activities?limit=${limit}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getUserSessions: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/sessions`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  revokeUserSessions: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/sessions`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    return json.data;
  },

  // ==========================================
  // 3. WORKSPACE MANAGEMENT
  // ==========================================
  getWorkspaces: async (query = {}) => {
    const { search = '', status = 'all', plan = 'all', page = 1, limit = 20 } = query;
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);
      if (plan && plan !== 'all') params.append('plan', plan);
      params.append('page', page);
      params.append('limit', limit);

      const res = await fetch(`${API_BASE_URL}/workspaces?${params.toString()}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    }
    return { workspaces: [], totalCount: 0 };
  },

  createWorkspace: async (wsData) => {
    const res = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(wsData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create workspace');
    return json.data?.workspace || json.data;
  },

  getWorkspaceById: async (workspaceId) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Workspace not found');
    return json.data?.workspace || json.data;
  },

  updateWorkspace: async (workspaceId, updateData) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update workspace');
    return json.data?.workspace || json.data;
  },

  updateWorkspaceStatus: async (workspaceId, statusData = {}) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(statusData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update workspace status');
    return json.data?.workspace || json.data;
  },

  toggleWorkspaceStatus: async (workspaceId) => {
    return superAdminService.updateWorkspaceStatus(workspaceId, {});
  },

  deleteWorkspace: async (workspaceId) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete workspace');
    return json.data;
  },

  getWorkspaceMembers: async (workspaceId, query = {}) => {
    const params = new URLSearchParams(query);
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    return json.data;
  },

  getWorkspaceBoards: async (workspaceId) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/boards`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getWorkspaceActivities: async (workspaceId, limit = 20) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/activities?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    return json.data;
  },

  getWorkspaceAnalytics: async (workspaceId) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/analytics`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  // ==========================================
  // 4. WORKSPACE ADMIN MANAGEMENT
  // ==========================================
  getAllAdmins: async (query = {}) => {
    const res = await fetch(`${API_BASE_URL}/admins`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  assignWorkspaceAdmin: async (workspaceId, adminData) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/admins`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to assign admin');
    return json.data;
  },

  getWorkspaceAdmins: async (workspaceId) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/admins`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  updateWorkspaceAdmin: async (workspaceId, adminId, data) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/admins/${adminId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update admin assignment');
    return json.data;
  },

  removeWorkspaceAdmin: async (workspaceId, adminId) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/admins/${adminId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to remove admin assignment');
    return json.data;
  },

  // ==========================================
  // 5. PLATFORM ROLES & PERMISSIONS
  // ==========================================
  getRoles: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/roles`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data?.roles || json.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
    return [];
  },

  getRoleById: async (roleId) => {
    const res = await fetch(`${API_BASE_URL}/roles/${roleId}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data?.role || json.data;
  },

  createRole: async (roleData) => {
    const res = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roleData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create role');
    return json.data?.role || json.data;
  },

  updateRole: async (roleId, roleData) => {
    const res = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(roleData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update role');
    return json.data?.role || json.data;
  },

  deleteRole: async (roleId) => {
    const res = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete role');
    return json.data;
  },

  getPermissions: async () => {
    const res = await fetch(`${API_BASE_URL}/permissions`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  updateRolePermissions: async (roleId, permissions) => {
    const res = await fetch(`${API_BASE_URL}/roles/${roleId}/permissions`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissions })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update permissions');
    return json.data?.role || json.data;
  },

  // ==========================================
  // 6. BOARD MANAGEMENT
  // ==========================================
  getBoards: async (query = {}) => {
    const params = new URLSearchParams(query);
    const res = await fetch(`${API_BASE_URL}/boards?${params.toString()}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getBoardById: async (boardId) => {
    const res = await fetch(`${API_BASE_URL}/boards/${boardId}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data?.board || json.data;
  },

  updateBoard: async (boardId, data) => {
    const res = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data?.board || json.data;
  },

  updateBoardStatus: async (boardId, isArchived) => {
    const res = await fetch(`${API_BASE_URL}/boards/${boardId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isArchived })
    });
    const json = await res.json();
    return json.data?.board || json.data;
  },

  deleteBoard: async (boardId) => {
    const res = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    return json.data;
  },

  getBoardTasks: async (boardId) => {
    const res = await fetch(`${API_BASE_URL}/boards/${boardId}/tasks`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  // ==========================================
  // 7. PLATFORM ANALYTICS
  // ==========================================
  getAnalyticsOverview: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/overview`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
    return { overview: { totalUsers: 0, activeUsers: 0, totalWorkspaces: 0, activeWorkspaces: 0, totalBoards: 0, totalTasks: 0 } };
  },

  getAnalytics: async () => {
    return superAdminService.getAnalyticsOverview();
  },

  getUserAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/users`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getWorkspaceAnalyticsData: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/workspaces`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getBoardAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/boards`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getTaskAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/tasks`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getActivityAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/activity`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getEngagementAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/engagement`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  // ==========================================
  // 8. AUDIT LOGS
  // ==========================================
  getAuditLogs: async (query = {}) => {
    const params = new URLSearchParams(query);
    const res = await fetch(`${API_BASE_URL}/audit-logs?${params.toString()}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getAuditLogById: async (logId) => {
    const res = await fetch(`${API_BASE_URL}/audit-logs/${logId}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data?.log || json.data;
  },

  getUserAuditLogs: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/audit-logs/users/${userId}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getWorkspaceAuditLogs: async (workspaceId) => {
    const res = await fetch(`${API_BASE_URL}/audit-logs/workspaces/${workspaceId}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  // ==========================================
  // 9. ANNOUNCEMENTS
  // ==========================================
  getAnnouncements: async (query = {}) => {
    const params = new URLSearchParams(query);
    const res = await fetch(`${API_BASE_URL}/announcements?${params.toString()}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  createAnnouncement: async (data) => {
    const res = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data?.announcement || json.data;
  },

  getAnnouncementById: async (announcementId) => {
    const res = await fetch(`${API_BASE_URL}/announcements/${announcementId}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data?.announcement || json.data;
  },

  updateAnnouncement: async (announcementId, data) => {
    const res = await fetch(`${API_BASE_URL}/announcements/${announcementId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data?.announcement || json.data;
  },

  deleteAnnouncement: async (announcementId) => {
    const res = await fetch(`${API_BASE_URL}/announcements/${announcementId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    return json.data;
  },

  publishAnnouncement: async (announcementId) => {
    const res = await fetch(`${API_BASE_URL}/announcements/${announcementId}/publish`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({})
    });
    const json = await res.json();
    return json.data?.announcement || json.data;
  },

  archiveAnnouncement: async (announcementId) => {
    const res = await fetch(`${API_BASE_URL}/announcements/${announcementId}/archive`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({})
    });
    const json = await res.json();
    return json.data?.announcement || json.data;
  },

  // ==========================================
  // 10. PLATFORM SETTINGS
  // ==========================================
  getSettings: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data?.settings || json.data;
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
    return {
      general: { platformName: 'WorkSync', supportEmail: 'support@worksync.io' },
      security: { enforceMfa: false }
    };
  },

  updateGeneralSettings: async (data) => {
    const res = await fetch(`${API_BASE_URL}/settings/general`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data?.general || json.data;
  },

  updateSecuritySettings: async (data) => {
    const res = await fetch(`${API_BASE_URL}/settings/security`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data?.security || json.data;
  },

  updateRegistrationSettings: async (data) => {
    const res = await fetch(`${API_BASE_URL}/settings/registration`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data?.registration || json.data;
  },

  updateNotificationSettings: async (data) => {
    const res = await fetch(`${API_BASE_URL}/settings/notifications`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data?.notifications || json.data;
  },

  getSecurityConfiguration: async () => {
    const res = await fetch(`${API_BASE_URL}/settings/security`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  updateSettings: async (settings) => {
    return superAdminService.updateGeneralSettings(settings);
  },

  // ==========================================
  // 11. SYSTEM HEALTH & MONITORING
  // ==========================================
  getSystemHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/system/health`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    }
    return { status: 'healthy', uptime: '100%', database: { connected: true, name: 'worksync' } };
  },

  getSystemDatabase: async () => {
    const res = await fetch(`${API_BASE_URL}/system/database`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getSystemCache: async () => {
    const res = await fetch(`${API_BASE_URL}/system/cache`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getSystemSockets: async () => {
    const res = await fetch(`${API_BASE_URL}/system/sockets`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  getSystemMetrics: async () => {
    const res = await fetch(`${API_BASE_URL}/system/metrics`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  // ==========================================
  // 12. SUPER ADMIN PROFILE
  // ==========================================
  getProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/profile`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data?.profile || json.data;
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data?.profile || json.data;
  },

  updateAvatar: async (avatarUrl) => {
    const res = await fetch(`${API_BASE_URL}/profile/avatar`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ avatar: avatarUrl })
    });
    const json = await res.json();
    return json.data;
  },

  changePassword: async (passwordData) => {
    const res = await fetch(`${API_BASE_URL}/profile/change-password`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData)
    });
    const json = await res.json();
    return json.data;
  },

  getProfileSessions: async () => {
    const res = await fetch(`${API_BASE_URL}/profile/sessions`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  revokeProfileSession: async (sessionId) => {
    const res = await fetch(`${API_BASE_URL}/profile/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    return json.data;
  },

  // ==========================================
  // 12. TASK MANAGEMENT & ASSIGNMENTS
  // ==========================================
  getAllTasks: async (query = {}) => {
    try {
      const params = new URLSearchParams();
      if (query.workspace && query.workspace !== 'all') params.append('workspace', query.workspace);
      if (query.project && query.project !== 'all') params.append('project', query.project);
      if (query.board && query.board !== 'all') params.append('board', query.board);
      if (query.assignee && query.assignee !== 'all') params.append('assignee', query.assignee);
      if (query.status && query.status !== 'all') params.append('status', query.status);
      if (query.priority && query.priority !== 'all') params.append('priority', query.priority);
      if (query.search) params.append('search', query.search);
      if (query.page) params.append('page', query.page);
      if (query.limit) params.append('limit', query.limit);

      const res = await fetch(`${API_BASE_URL}/tasks?${params.toString()}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
    return { tasks: [], totalCount: 0, statusCounts: { todo: 0, in_progress: 0, review: 0, done: 0 } };
  },

  createTask: async (taskData) => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create task');
    return json.data?.task || json.data;
  },

  getTaskById: async (taskId) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch task');
    return json.data?.task || json.data;
  },

  updateTask: async (taskId, updateData) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update task');
    return json.data?.task || json.data;
  },

  updateTaskStatus: async (taskId, status) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update task status');
    return json.data;
  },

  assignTask: async (taskId, assigneeId) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/assign`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ assigneeId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to assign task');
    return json.data?.task || json.data;
  },

  deleteTask: async (taskId) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete task');
    return json.data;
  },

  // ==========================================
  // 13. WORKSPACE PROJECTS & MEMBERS ASSIGNMENT
  // ==========================================
  getWorkspaceProjects: async (workspaceId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/projects`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data?.projects || json.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch workspace projects:', err);
    }
    return [];
  },

  createWorkspaceProject: async (workspaceId, projectData) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create workspace project');
    return json.data?.project || json.data;
  },

  addWorkspaceMember: async (workspaceId, memberData) => {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(memberData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to add workspace member');
    return json.data?.member || json.data;
  }
};

export default superAdminService;
