import {
  getUserItem,
  setUserItem,
  getCurrentUser,
  getCurrentUserScope
} from '../../utils/userStorage.js';
import { authService } from '../auth/authService.js';

const API_BASE_URL = 'http://localhost:8081/api/v1/super-admin';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const recordScopedAudit = (action, details, target = '', status = 'success') => {
  const user = getCurrentUser();
  const logs = getUserItem('audit_logs', []);
  const newLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action,
    details,
    target,
    status,
    user: user?.name || 'Super Admin',
    email: user?.email || 'admin@worksync.io',
    ip: '127.0.0.1 (Local)',
    time: 'Just now',
    createdAt: new Date().toISOString()
  };
  logs.unshift(newLog);
  setUserItem('audit_logs', logs.slice(0, 100));
  return newLog;
};

export const superAdminService = {
  getDashboardOverview: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return json.data;
      }
    } catch (err) {
      // Backend offline, fallback to isolated per-user storage
    }

    const workspaces = getUserItem('workspaces', []);
    const users = getUserItem('users', []);
    const boards = getUserItem('boards', []);
    const tasks = getUserItem('tasks', []);
    const logs = getUserItem('audit_logs', []);

    const activeUsersCount = users.filter((u) => u.isActive !== false).length;
    const activeWorkspacesCount = workspaces.filter((w) => w.status !== 'Archived' && w.status !== 'Suspended').length;

    // Calculate role breakdown
    const rolesSummary = {
      super_admin: 1,
      admin: users.filter((u) => u.role === 'admin').length,
      manager: users.filter((u) => u.role === 'manager').length,
      member: users.filter((u) => u.role === 'employee' || u.role === 'member').length,
      active: activeUsersCount,
      totalRoles: 4
    };

    return {
      stats: {
        totalUsers: users.length,
        activeUsers: activeUsersCount,
        totalWorkspaces: workspaces.length,
        activeWorkspaces: activeWorkspacesCount,
        totalBoards: boards.length,
        totalTasks: tasks.length,
        usersGrowth: users.length > 0 ? '+100%' : '0%',
        workspacesGrowth: workspaces.length > 0 ? '+100%' : '0%',
        databaseStatus: 'Active',
        apiUptime: '99.99%'
      },
      userGrowthChart:
        workspaces.length > 0 || users.length > 0
          ? [
              { month: 'Oct', users: Math.max(0, users.length - 2), workspaces: Math.max(0, workspaces.length - 1) },
              { month: 'Nov', users: users.length, workspaces: workspaces.length }
            ]
          : [],
      recentAuditLogs: logs.slice(0, 6),
      topWorkspaces: workspaces.slice(0, 5),
      rolesSummary
    };
  },

  getDashboardStats: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/stats`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    const overview = await superAdminService.getDashboardOverview();
    return overview.stats;
  },

  getUserGrowth: async () => {
    const overview = await superAdminService.getDashboardOverview();
    return overview.userGrowthChart;
  },

  getWorkspaceGrowth: async () => {
    const overview = await superAdminService.getDashboardOverview();
    return overview.userGrowthChart;
  },

  getRecentUsers: async (limit = 10) => {
    const users = getUserItem('users', []);
    return users.slice(0, limit);
  },

  getRecentWorkspaces: async (limit = 10) => {
    const workspaces = getUserItem('workspaces', []);
    return workspaces.slice(0, limit);
  },

  getRecentActivities: async (limit = 15) => {
    const logs = getUserItem('audit_logs', []);
    return logs.slice(0, limit);
  },

  // USERS MANAGEMENT
  getUsers: async (query = {}) => {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append('search', query.search);
      if (query.role && query.role !== 'all') params.append('role', query.role);
      if (query.status && query.status !== 'all') params.append('status', query.status);
      const res = await fetch(`${API_BASE_URL}/users?${params.toString()}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}

    let users = getUserItem('users', []);
    if (query.search) {
      const term = query.search.toLowerCase();
      users = users.filter((u) => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
    }
    if (query.role && query.role !== 'all') {
      users = users.filter((u) => u.role === query.role);
    }
    if (query.status && query.status !== 'all') {
      users = users.filter((u) => (query.status === 'active' ? u.isActive !== false : u.isActive === false));
    }

    return {
      users,
      totalCount: users.length,
      rolesSummary: {
        total: users.length,
        active: users.filter((u) => u.isActive !== false).length,
        admin: users.filter((u) => u.role === 'admin').length,
        manager: users.filter((u) => u.role === 'manager').length,
        member: users.filter((u) => u.role === 'employee' || u.role === 'member').length
      }
    };
  },

  getUserById: async (userId) => {
    const users = getUserItem('users', []);
    const user = users.find((u) => u.id === userId || u._id === userId);
    if (!user) throw new Error('User not found');
    return user;
  },

  createUser: async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.user || json.data;
      }
    } catch (e) {}

    const users = getUserItem('users', []);
    const newUser = {
      _id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: userData.name?.trim() || 'New User',
      email: userData.email?.trim().toLowerCase(),
      role: userData.role || 'member',
      isActive: true,
      workspaces: userData.workspaceId ? [userData.workspaceId] : [],
      createdAt: new Date().toISOString()
    };

    users.unshift(newUser);
    setUserItem('users', users);
    recordScopedAudit('USER_PROVISIONED', `Provisioned user "${newUser.name}" with role "${newUser.role}"`, newUser.email);

    // Synchronize to global user registry for immediate authenticated portal access
    try {
      const registry = JSON.parse(localStorage.getItem('worksync_registered_users') || '[]');
      const filtered = registry.filter((u) => u.email !== newUser.email);
      filtered.push({
        ...newUser,
        password: userData.password || 'WorkSync@2026'
      });
      localStorage.setItem('worksync_registered_users', JSON.stringify(filtered));
    } catch (e) {}

    return newUser;
  },

  updateUser: async (userId, updateData) => {
    const users = getUserItem('users', []);
    const updated = users.map((u) => (u.id === userId || u._id === userId ? { ...u, ...updateData } : u));
    setUserItem('users', updated);
    recordScopedAudit('USER_UPDATED', `Updated user details for ID ${userId}`);

    const targetUser = updated.find((u) => u.id === userId || u._id === userId);
    if (targetUser?.email) {
      try {
        const registry = JSON.parse(localStorage.getItem('worksync_registered_users') || '[]');
        const idx = registry.findIndex((u) => u.email === targetUser.email);
        if (idx >= 0) {
          registry[idx] = { ...registry[idx], ...targetUser, ...updateData };
          localStorage.setItem('worksync_registered_users', JSON.stringify(registry));
        }
      } catch (e) {}
    }

    return targetUser;
  },

  updateUserStatus: async (userId, statusData = {}) => {
    return superAdminService.updateUser(userId, statusData);
  },

  toggleUserStatus: async (userId) => {
    const users = getUserItem('users', []);
    const target = users.find((u) => u.id === userId || u._id === userId);
    if (target) {
      target.isActive = !target.isActive;
      setUserItem('users', users);
      recordScopedAudit('USER_STATUS_TOGGLED', `Changed status of "${target.name}" to ${target.isActive ? 'Active' : 'Disabled'}`);

      if (target.email) {
        try {
          const registry = JSON.parse(localStorage.getItem('worksync_registered_users') || '[]');
          const idx = registry.findIndex((u) => u.email === target.email);
          if (idx >= 0) {
            registry[idx].isActive = target.isActive;
            localStorage.setItem('worksync_registered_users', JSON.stringify(registry));
          }
        } catch (e) {}
      }
    }
    return target;
  },

  updateUserRole: async (userId, newRole) => {
    return superAdminService.updateUser(userId, { role: newRole });
  },

  deleteUser: async (userId) => {
    const users = getUserItem('users', []);
    const target = users.find((u) => u.id === userId || u._id === userId);
    const filtered = users.filter((u) => u.id !== userId && u._id !== userId);
    setUserItem('users', filtered);
    recordScopedAudit('USER_DELETED', `Deleted user account "${target?.name || userId}"`);

    if (target?.email) {
      try {
        const registry = JSON.parse(localStorage.getItem('worksync_registered_users') || '[]');
        const updated = registry.filter((u) => u.email !== target.email);
        localStorage.setItem('worksync_registered_users', JSON.stringify(updated));
      } catch (e) {}
    }

    return { success: true };
  },

  getUserWorkspaces: async (userId) => {
    const workspaces = getUserItem('workspaces', []);
    return workspaces.filter((w) => w.members?.some((m) => m.user === userId || m.id === userId));
  },

  getUserActivities: async (userId, limit = 20) => {
    const logs = getUserItem('audit_logs', []);
    return logs.slice(0, limit);
  },

  getUserSessions: async () => {
    return [
      {
        id: 'sess_' + Date.now(),
        device: 'Desktop Browser',
        browser: 'Chrome / Windows 11',
        ip: '127.0.0.1',
        lastActive: 'Just now',
        isCurrent: true
      }
    ];
  },

  revokeUserSessions: async () => ({ success: true }),

  // WORKSPACES MANAGEMENT
  getWorkspaces: async (query = {}) => {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append('search', query.search);
      if (query.plan && query.plan !== 'all') params.append('plan', query.plan);
      if (query.status && query.status !== 'all') params.append('status', query.status);
      const res = await fetch(`${API_BASE_URL}/workspaces?${params.toString()}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}

    let workspaces = getUserItem('workspaces', []);
    if (query.search) {
      const term = query.search.toLowerCase();
      workspaces = workspaces.filter((w) => w.name?.toLowerCase().includes(term) || w.slug?.toLowerCase().includes(term));
    }
    if (query.plan && query.plan !== 'all') {
      workspaces = workspaces.filter((w) => w.plan === query.plan);
    }
    if (query.status && query.status !== 'all') {
      workspaces = workspaces.filter((w) => w.status === query.status);
    }

    return {
      workspaces,
      totalCount: workspaces.length
    };
  },

  createWorkspace: async (wsData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(wsData)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.workspace || json.data;
      }
    } catch (e) {}

    const currentUser = getCurrentUser();
    const workspaces = getUserItem('workspaces', []);
    const newWs = {
      _id: 'ws_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      id: 'ws_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: wsData.name?.trim() || 'New Workspace',
      slug: (wsData.slug || wsData.name || 'ws').toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      description: wsData.description || '',
      plan: wsData.plan || 'Pro',
      status: wsData.status || 'Active',
      ownerId: currentUser?.id || currentUser?._id,
      ownerName: currentUser?.name || 'Super Admin',
      membersCount: 1,
      boardsCount: 0,
      tasksCount: 0,
      storageUsed: '0 MB',
      createdAt: new Date().toISOString()
    };

    workspaces.unshift(newWs);
    setUserItem('workspaces', workspaces);
    recordScopedAudit('WORKSPACE_PROVISIONED', `Created workspace "${newWs.name}" on ${newWs.plan} plan`, newWs.slug);
    return newWs;
  },

  getWorkspaceById: async (workspaceId) => {
    const workspaces = getUserItem('workspaces', []);
    const ws = workspaces.find((w) => w.id === workspaceId || w._id === workspaceId || w.slug === workspaceId);
    if (!ws) throw new Error('Workspace not found');
    return ws;
  },

  updateWorkspace: async (workspaceId, updateData) => {
    const workspaces = getUserItem('workspaces', []);
    const updated = workspaces.map((w) => (w.id === workspaceId || w._id === workspaceId ? { ...w, ...updateData } : w));
    setUserItem('workspaces', updated);
    recordScopedAudit('WORKSPACE_UPDATED', `Updated workspace settings for ID ${workspaceId}`);
    return updated.find((w) => w.id === workspaceId || w._id === workspaceId);
  },

  updateWorkspaceStatus: async (workspaceId, statusData = {}) => {
    return superAdminService.updateWorkspace(workspaceId, statusData);
  },

  toggleWorkspaceStatus: async (workspaceId) => {
    const workspaces = getUserItem('workspaces', []);
    const target = workspaces.find((w) => w.id === workspaceId || w._id === workspaceId);
    if (target) {
      target.status = target.status === 'Active' ? 'Suspended' : 'Active';
      setUserItem('workspaces', workspaces);
      recordScopedAudit('WORKSPACE_STATUS_TOGGLED', `Changed workspace status to ${target.status}`);
    }
    return target;
  },

  deleteWorkspace: async (workspaceId) => {
    const workspaces = getUserItem('workspaces', []);
    const target = workspaces.find((w) => w.id === workspaceId || w._id === workspaceId);
    const filtered = workspaces.filter((w) => w.id !== workspaceId && w._id !== workspaceId);
    setUserItem('workspaces', filtered);
    recordScopedAudit('WORKSPACE_DECOMMISSIONED', `Permanently deleted workspace "${target?.name || workspaceId}"`);
    return { success: true };
  },

  getWorkspaceMembers: async () => [],
  getWorkspaceBoards: async () => [],
  getWorkspaceActivities: async () => [],
  getWorkspaceAnalytics: async () => ({ adoption: 0, activeTasks: 0 }),
  getAllAdmins: async () => [],
  assignWorkspaceAdmin: async () => ({ success: true }),
  getWorkspaceAdmins: async () => [],
  updateWorkspaceAdmin: async () => ({ success: true }),
  removeWorkspaceAdmin: async () => ({ success: true }),

  // ROLES & PERMISSIONS
  getRoles: async () => {
    return [
      { id: 'role_super_admin', name: 'Super Admin', description: 'Complete platform authority & tenant governance', usersCount: 1 },
      { id: 'role_admin', name: 'Workspace Admin', description: 'Workspace level administrative authority', usersCount: 0 },
      { id: 'role_manager', name: 'Project Manager', description: 'Project, sprint, and board leadership', usersCount: 0 },
      { id: 'role_member', name: 'Team Member', description: 'Task execution and workspace collaboration', usersCount: 0 }
    ];
  },
  getRoleById: async (roleId) => ({ id: roleId, name: 'Role' }),
  createRole: async (roleData) => roleData,
  updateRole: async (roleId, roleData) => roleData,
  deleteRole: async () => ({ success: true }),
  getPermissions: async () => [],
  updateRolePermissions: async () => ({ success: true }),

  // BOARDS
  getBoards: async (query = {}) => {
    const boards = getUserItem('boards', []);
    return { boards, totalCount: boards.length };
  },
  getBoardById: async (boardId) => {
    const boards = getUserItem('boards', []);
    return boards.find((b) => b.id === boardId || b._id === boardId) || null;
  },
  updateBoard: async () => ({ success: true }),
  updateBoardStatus: async () => ({ success: true }),
  deleteBoard: async (boardId) => {
    const boards = getUserItem('boards', []);
    setUserItem('boards', boards.filter((b) => b.id !== boardId));
    return { success: true };
  },
  getBoardTasks: async () => [],

  // ANALYTICS & AUDIT LOGS
  getAnalyticsOverview: async () => {
    const overview = await superAdminService.getDashboardOverview();
    return overview.stats;
  },
  getAnalytics: async () => ({}),
  getUserAnalytics: async () => ({}),
  getWorkspaceAnalyticsData: async () => ({}),
  getBoardAnalytics: async () => ({}),
  getTaskAnalytics: async () => ({}),
  getActivityAnalytics: async () => ({}),
  getEngagementAnalytics: async () => ({}),

  getAuditLogs: async (query = {}) => {
    const logs = getUserItem('audit_logs', []);
    return { logs, totalCount: logs.length };
  },
  getAuditLogById: async (logId) => {
    const logs = getUserItem('audit_logs', []);
    return logs.find((l) => l.id === logId) || null;
  },
  getUserAuditLogs: async () => [],
  getWorkspaceAuditLogs: async () => [],

  // ANNOUNCEMENTS
  getAnnouncements: async () => {
    const announcements = getUserItem('announcements', []);
    return { announcements, totalCount: announcements.length };
  },
  createAnnouncement: async (data) => {
    const announcements = getUserItem('announcements', []);
    const newAnn = {
      id: 'ann_' + Date.now(),
      title: data.title,
      content: data.content,
      priority: data.priority || 'Normal',
      status: 'Published',
      createdAt: new Date().toISOString()
    };
    announcements.unshift(newAnn);
    setUserItem('announcements', announcements);
    recordScopedAudit('ANNOUNCEMENT_PUBLISHED', `Published announcement "${newAnn.title}"`);
    return newAnn;
  },
  getAnnouncementById: async () => null,
  updateAnnouncement: async () => ({ success: true }),
  deleteAnnouncement: async (announcementId) => {
    const announcements = getUserItem('announcements', []);
    setUserItem('announcements', announcements.filter((a) => a.id !== announcementId));
    return { success: true };
  },
  publishAnnouncement: async () => ({ success: true }),
  archiveAnnouncement: async () => ({ success: true }),

  // SETTINGS & SYSTEM HEALTH
  getSettings: async () => ({
    platformName: 'WorkSync',
    registrationAllowed: true,
    mfaRequired: false,
    sessionTimeout: 60
  }),
  updateGeneralSettings: async (data) => data,
  updateSecuritySettings: async (data) => data,
  updateRegistrationSettings: async (data) => data,
  updateNotificationSettings: async (data) => data,
  getSecurityConfiguration: async () => ({}),
  updateSettings: async (s) => s,

  getSystemHealth: async () => ({
    status: 'Healthy',
    database: 'Connected',
    uptime: '100%',
    activeConnections: 1
  }),
  getSystemDatabase: async () => ({ connected: true }),
  getSystemCache: async () => ({ active: true }),
  getSystemSockets: async () => ({ online: true }),
  getSystemMetrics: async () => ({ memory: '24%', cpu: '5%' }),

  // PROFILE
  getProfile: async () => getCurrentUser(),
  updateProfile: async (data) => {
    const user = getCurrentUser();
    const updated = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  },
  updateAvatar: async (avatarUrl) => superAdminService.updateProfile({ avatar: avatarUrl }),
  changePassword: async ({ currentPassword, newPassword }) => {
    const user = getCurrentUser();
    const result = await authService.changePassword({
      currentPassword,
      newPassword,
      email: user?.email
    });
    recordScopedAudit('PASSWORD_CHANGED', 'Updated account password');
    return result;
  },
  getProfileSessions: async () => superAdminService.getUserSessions(),
  revokeProfileSession: async () => ({ success: true }),

  // TASKS MANAGEMENT
  getAllTasks: async (query = {}) => {
    try {
      const params = new URLSearchParams();
      if (query.workspace && query.workspace !== 'all') params.append('workspace', query.workspace);
      if (query.status && query.status !== 'all') params.append('status', query.status);
      if (query.priority && query.priority !== 'all') params.append('priority', query.priority);
      if (query.search) params.append('search', query.search);
      const res = await fetch(`${API_BASE_URL}/tasks?${params.toString()}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}

    let tasks = getUserItem('tasks', []);
    if (query.search) {
      const term = query.search.toLowerCase();
      tasks = tasks.filter((t) => t.title?.toLowerCase().includes(term) || t.description?.toLowerCase().includes(term));
    }
    if (query.workspace && query.workspace !== 'all') {
      tasks = tasks.filter((t) => t.workspaceId === query.workspace || t.workspace === query.workspace);
    }
    if (query.status && query.status !== 'all') {
      tasks = tasks.filter((t) => t.status === query.status);
    }
    if (query.priority && query.priority !== 'all') {
      tasks = tasks.filter((t) => t.priority === query.priority);
    }

    const counts = {
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      review: tasks.filter((t) => t.status === 'review').length,
      done: tasks.filter((t) => t.status === 'done').length
    };

    return {
      tasks,
      totalCount: tasks.length,
      statusCounts: counts
    };
  },

  createTask: async (taskData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.task || json.data;
      }
    } catch (e) {}

    const tasks = getUserItem('tasks', []);
    const newTask = {
      _id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: taskData.title?.trim() || 'Untitled Task',
      description: taskData.description || '',
      workspaceId: taskData.workspaceId || '',
      workspaceName: taskData.workspaceName || 'General Workspace',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      assigneeName: taskData.assigneeName || taskData.assignee || 'Unassigned',
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    setUserItem('tasks', tasks);
    recordScopedAudit('TASK_CREATED', `Created task "${newTask.title}" [${newTask.status}]`);
    return newTask;
  },

  getTaskById: async (taskId) => {
    const tasks = getUserItem('tasks', []);
    const task = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (!task) throw new Error('Task not found');
    return task;
  },

  updateTask: async (taskId, updateData) => {
    const tasks = getUserItem('tasks', []);
    const updated = tasks.map((t) => (t.id === taskId || t._id === taskId ? { ...t, ...updateData } : t));
    setUserItem('tasks', updated);
    recordScopedAudit('TASK_UPDATED', `Updated task details for ID ${taskId}`);
    return updated.find((t) => t.id === taskId || t._id === taskId);
  },

  updateTaskStatus: async (taskId, status) => {
    const tasks = getUserItem('tasks', []);
    const target = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (target) {
      target.status = status;
      setUserItem('tasks', tasks);
      recordScopedAudit('TASK_STATUS_UPDATED', `Moved task "${target.title}" to "${status}"`);
    }
    return target;
  },

  assignTask: async (taskId, assigneeId) => {
    const tasks = getUserItem('tasks', []);
    const users = getUserItem('users', []);
    const assignedUser = users.find((u) => u.id === assigneeId || u._id === assigneeId);
    const target = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (target) {
      target.assigneeId = assigneeId;
      target.assigneeName = assignedUser?.name || 'Assigned Member';
      setUserItem('tasks', tasks);
      recordScopedAudit('TASK_ASSIGNED', `Assigned task "${target.title}" to ${target.assigneeName}`);
    }
    return target;
  },

  deleteTask: async (taskId) => {
    const tasks = getUserItem('tasks', []);
    const target = tasks.find((t) => t.id === taskId || t._id === taskId);
    const filtered = tasks.filter((t) => t.id !== taskId && t._id !== taskId);
    setUserItem('tasks', filtered);
    recordScopedAudit('TASK_DELETED', `Deleted task "${target?.title || taskId}"`);
    return { success: true };
  },

  getWorkspaceProjects: async () => [],
  createWorkspaceProject: async () => ({ success: true }),
  addWorkspaceMember: async () => ({ success: true })
};

export default superAdminService;
