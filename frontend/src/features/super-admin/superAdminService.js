import {
  getUserItem,
  setUserItem,
  getCurrentUser,
  getCurrentUserScope
} from '../../utils/userStorage.js';
import { authService } from '../auth/authService.js';

const API_BASE_URL = 'http://localhost:8081/api/v1/super-admin';

const isObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

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
    let backendData = null;
    try {
      const params = new URLSearchParams();
      if (query.search) params.append('search', query.search);
      if (query.role && query.role !== 'all') params.append('role', query.role);
      if (query.status && query.status !== 'all') params.append('status', query.status);
      const res = await fetch(`${API_BASE_URL}/users?${params.toString()}`, { headers: getAuthHeaders() });
      if (res.ok) {
        backendData = await res.json();
      }
    } catch (e) {}

    const localUsers = getUserItem('users', []);

    if (backendData?.data) {
      const beList = Array.isArray(backendData.data.users)
        ? backendData.data.users
        : (Array.isArray(backendData.data) ? backendData.data : []);

      // Keep local users cache cleanly in sync with backend MongoDB
      setUserItem('users', beList);

      // Only preserve non-server temporary local users if any exist
      const merged = [...beList];
      for (const lu of localUsers) {
        const luid = lu.id || lu._id;
        // If it's a 24-character ObjectId and absent from beList, it was deleted on the server; do NOT resurrect!
        if (isObjectId(luid)) continue;
        const exists = merged.some((bu) => (bu.id || bu._id) === luid || bu.email?.toLowerCase() === lu.email?.toLowerCase());
        if (!exists) {
          merged.unshift(lu);
        }
      }

      let filtered = merged;
      if (query.search) {
        const term = query.search.toLowerCase();
        filtered = filtered.filter((u) => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
      }
      if (query.role && query.role !== 'all') {
        filtered = filtered.filter((u) => u.role === query.role);
      }
      if (query.status && query.status !== 'all') {
        filtered = filtered.filter((u) => (query.status === 'active' ? u.isActive !== false : u.isActive === false));
      }

      return {
        users: filtered,
        totalCount: filtered.length,
        rolesSummary: backendData.data.rolesSummary || {
          total: filtered.length,
          active: filtered.filter((u) => u.isActive !== false).length,
          admin: filtered.filter((u) => u.role === 'admin').length,
          manager: filtered.filter((u) => u.role === 'manager').length,
          member: filtered.filter((u) => u.role === 'employee' || u.role === 'member').length
        }
      };
    }

    let users = localUsers;
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
    let createdUser = null;
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const json = await res.json();
        createdUser = json.data?.user || json.data;
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to create user on server');
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) {
        throw e;
      }
    }

    const newUser = createdUser
      ? {
          _id: createdUser.id || createdUser._id,
          id: createdUser.id || createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          isActive: createdUser.isActive !== false,
          workspaces: createdUser.workspaces || (userData.workspaceId ? [userData.workspaceId] : []),
          createdAt: createdUser.createdAt || new Date().toISOString()
        }
      : {
          _id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: userData.name?.trim() || 'New User',
          email: userData.email?.trim().toLowerCase(),
          role: userData.role || 'member',
          isActive: true,
          workspaces: userData.workspaceId ? [userData.workspaceId] : [],
          createdAt: new Date().toISOString()
        };

    const users = getUserItem('users', []);
    const filtered = users.filter((u) => (u.id || u._id) !== newUser.id && u.email !== newUser.email);
    filtered.unshift(newUser);
    setUserItem('users', filtered);
    recordScopedAudit('USER_PROVISIONED', `Provisioned user "${newUser.name}" with role "${newUser.role}"`, newUser.email);

    // Synchronize to global user registry for immediate authenticated portal access
    try {
      const registry = JSON.parse(localStorage.getItem('worksync_registered_users') || '[]');
      const filteredReg = registry.filter((u) => u.email !== newUser.email);
      filteredReg.push({
        ...newUser,
        password: userData.password || 'WorkSync@2026'
      });
      localStorage.setItem('worksync_registered_users', JSON.stringify(filteredReg));
    } catch (e) {}

    return newUser;
  },

  updateUser: async (userId, updateData) => {
    let serverUpdated = null;
    if (isObjectId(userId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(updateData)
        });
        if (res.ok) {
          const json = await res.json();
          serverUpdated = json.data?.user || json.data;
        } else {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || 'Failed to update user on server');
        }
      } catch (e) {
        if (e.message && !e.message.includes('fetch')) throw e;
      }
    }

    const users = getUserItem('users', []);
    const updated = users.map((u) => (u.id === userId || u._id === userId ? { ...u, ...updateData, ...(serverUpdated || {}) } : u));
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
    if (isObjectId(userId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(statusData)
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || 'Failed to update user status on server');
        }
      } catch (e) {
        if (e.message && !e.message.includes('fetch')) throw e;
      }
    }
    return superAdminService.updateUser(userId, statusData);
  },

  toggleUserStatus: async (userId) => {
    const users = getUserItem('users', []);
    const target = users.find((u) => u.id === userId || u._id === userId);
    const newActiveState = target ? !target.isActive : true;

    if (isObjectId(userId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ isActive: newActiveState, status: newActiveState ? 'active' : 'suspended' })
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || 'Failed to update user status on server');
        }
      } catch (e) {
        if (e.message && !e.message.includes('fetch')) throw e;
      }
    }

    if (target) {
      target.isActive = newActiveState;
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
    if (isObjectId(userId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ role: newRole })
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || 'Failed to update user role on server');
        }
      } catch (e) {
        if (e.message && !e.message.includes('fetch')) throw e;
      }
    }
    return superAdminService.updateUser(userId, { role: newRole });
  },

  deleteUser: async (userId) => {
    if (isObjectId(userId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || 'Failed to delete user on server');
        }
      } catch (e) {
        if (e.message && !e.message.includes('fetch')) throw e;
      }
    }

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
        const beList = Array.isArray(json.data?.workspaces) ? json.data.workspaces : [];
        if (beList.length > 0) {
          const normalized = beList.map(w => ({ ...w, id: w.id || w._id, _id: w._id || w.id }));
          setUserItem('workspaces', normalized);
          return {
            workspaces: normalized,
            totalCount: json.data?.totalCount || normalized.length
          };
        }
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
        const created = json.data?.workspace || json.data;
        if (created) {
          const workspaces = getUserItem('workspaces', []);
          const normalized = {
            ...created,
            id: created.id || created._id,
            _id: created._id || created.id
          };
          workspaces.unshift(normalized);
          setUserItem('workspaces', workspaces);
          recordScopedAudit('WORKSPACE_PROVISIONED', `Created workspace "${normalized.name}" on ${normalized.plan} plan`, normalized.slug);
          return normalized;
        }
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
    if (isObjectId(workspaceId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const json = await res.json();
          const ws = json.data?.workspace || json.data;
          if (ws) {
            return {
              ...ws,
              id: ws.id || ws._id,
              _id: ws._id || ws.id
            };
          }
        }
      } catch (e) {}
    }

    const workspaces = getUserItem('workspaces', []);
    const ws = workspaces.find((w) => w.id === workspaceId || w._id === workspaceId || w.slug === workspaceId);
    if (!ws) throw new Error('Workspace not found');
    return ws;
  },

  updateWorkspace: async (workspaceId, updateData) => {
    let serverWs = null;
    if (isObjectId(workspaceId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(updateData)
        });
        if (res.ok) {
          const json = await res.json();
          serverWs = json.data?.workspace || json.data;
        }
      } catch (e) {}
    }

    const workspaces = getUserItem('workspaces', []);
    const updated = workspaces.map((w) => (w.id === workspaceId || w._id === workspaceId ? { ...w, ...updateData, ...(serverWs || {}) } : w));
    setUserItem('workspaces', updated);
    recordScopedAudit('WORKSPACE_UPDATED', `Updated workspace settings for ID ${workspaceId}`);
    return serverWs || updated.find((w) => w.id === workspaceId || w._id === workspaceId);
  },

  updateWorkspaceStatus: async (workspaceId, statusData = {}) => {
    return superAdminService.updateWorkspace(workspaceId, statusData);
  },

  toggleWorkspaceStatus: async (workspaceId) => {
    const workspaces = getUserItem('workspaces', []);
    const target = workspaces.find((w) => w.id === workspaceId || w._id === workspaceId);
    const newStatus = target?.status === 'Active' ? 'Archived' : 'Active';

    if (isObjectId(workspaceId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/status`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: newStatus, isActive: newStatus === 'Active' })
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || 'Failed to update workspace status');
        }
      } catch (e) {
        if (e.message && !e.message.includes('fetch')) throw e;
      }
    }

    if (target) {
      target.status = newStatus;
      target.isActive = newStatus === 'Active';
      setUserItem('workspaces', workspaces);
      recordScopedAudit('WORKSPACE_STATUS_TOGGLED', `Changed workspace status to ${target.status}`);
    }
    return target;
  },

  deleteWorkspace: async (workspaceId) => {
    if (isObjectId(workspaceId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || 'Failed to delete workspace on server');
        }
      } catch (e) {
        if (e.message && !e.message.includes('fetch')) throw e;
      }
    }

    const workspaces = getUserItem('workspaces', []);
    const target = workspaces.find((w) => w.id === workspaceId || w._id === workspaceId);
    const filtered = workspaces.filter((w) => w.id !== workspaceId && w._id !== workspaceId);
    setUserItem('workspaces', filtered);
    recordScopedAudit('WORKSPACE_DECOMMISSIONED', `Permanently deleted workspace "${target?.name || workspaceId}"`);
    return { success: true };
  },

  getWorkspaceMembers: async (workspaceId) => {
    if (isObjectId(workspaceId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, { headers: getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          return json.data?.members || json.data || [];
        }
      } catch (e) {}
    }
    return [];
  },

  getWorkspaceBoards: async (workspaceId) => {
    if (isObjectId(workspaceId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/boards`, { headers: getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          return json.data || { boards: [] };
        }
      } catch (e) {}
    }
    return { boards: [] };
  },

  getWorkspaceActivities: async (workspaceId, limit = 20) => {
    if (isObjectId(workspaceId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/activities?limit=${limit}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          return json.data || [];
        }
      } catch (e) {}
    }
    return [];
  },

  getWorkspaceAnalytics: async (workspaceId) => {
    if (isObjectId(workspaceId)) {
      try {
        const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/analytics`, { headers: getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          return json.data || { adoption: 0, activeTasks: 0 };
        }
      } catch (e) {}
    }
    return { adoption: 0, activeTasks: 0 };
  },

  addWorkspaceMember: async (workspaceId, memberData) => {
    if (isObjectId(workspaceId)) {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(memberData)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.member || json.data;
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to add member to workspace');
    }
    return { success: true };
  },

  createWorkspaceProject: async (workspaceId, projectData) => {
    if (isObjectId(workspaceId)) {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.project || json.data;
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create project in workspace');
    }
    return { success: true };
  },

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
  getBoardTasks: async (boardId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks?board=${boardId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data?.tasks || json.data || [];
      }
    } catch (e) {}
    const all = getUserItem('tasks', []);
    return all.filter((t) => t.boardId === boardId || t.board === boardId);
  },

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
        const serverData = json.data;
        if (serverData) {
          const serverTasks = serverData.tasks || (Array.isArray(serverData) ? serverData : []);
          setUserItem('tasks', serverTasks);
          return serverData;
        }
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
        const created = json.data?.task || json.data;
        if (created) {
          const tasks = getUserItem('tasks', []);
          const normalized = {
            id: created.id || created._id,
            _id: created.id || created._id,
            title: created.title,
            description: created.description || '',
            status: created.status || 'todo',
            priority: created.priority || 'medium',
            dueDate: created.dueDate || '',
            assignee: created.assignee || null,
            assigneeName: created.assignee?.name || 'Unassigned',
            boardId: created.board?.id || created.board?._id || taskData.boardId,
            workspaceId: created.workspace?.id || created.workspace?._id || taskData.workspaceId,
            createdAt: created.createdAt || new Date().toISOString()
          };
          tasks.unshift(normalized);
          setUserItem('tasks', tasks);
          recordScopedAudit('TASK_CREATED', `Created task "${created.title}" [${created.status || 'todo'}]`);
          return normalized;
        }
      }
    } catch (e) {}

    const tasks = getUserItem('tasks', []);
    const newTask = {
      _id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: taskData.title?.trim() || 'Untitled Task',
      description: taskData.description || '',
      workspaceId: taskData.workspaceId || '',
      boardId: taskData.boardId || '',
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
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data?.task || json.data;
      }
    } catch (e) {}
    const tasks = getUserItem('tasks', []);
    const task = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (!task) throw new Error('Task not found');
    return task;
  },

  updateTask: async (taskId, updateData) => {
    try {
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
    } catch (e) {}
    const tasks = getUserItem('tasks', []);
    const updated = tasks.map((t) => (t.id === taskId || t._id === taskId ? { ...t, ...updateData } : t));
    setUserItem('tasks', updated);
    recordScopedAudit('TASK_UPDATED', `Updated task details for ID ${taskId}`);
    return updated.find((t) => t.id === taskId || t._id === taskId);
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
    } catch (e) {}
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
    try {
      await fetch(`${API_BASE_URL}/tasks/${taskId}/assign`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ assigneeId })
      });
    } catch (e) {}
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
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to delete task on server');
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) throw e;
    }
    const tasks = getUserItem('tasks', []);
    const target = tasks.find((t) => t.id === taskId || t._id === taskId);
    const filtered = tasks.filter((t) => t.id !== taskId && t._id !== taskId);
    setUserItem('tasks', filtered);
    recordScopedAudit('TASK_DELETED', `Deleted task "${target?.title || taskId}"`);
    return { success: true, id: taskId };
  },

  getWorkspaceProjects: async (workspaceId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/projects`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data?.projects || json.data || [];
      }
    } catch (e) {}
    return [];
  },
  createWorkspaceProject: async (workspaceId, data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.project || json.data;
      }
    } catch (e) {}
    return { success: true };
  },
  addWorkspaceMember: async (workspaceId, memberData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(memberData)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (e) {}
    return { success: true };
  },

  getNotifications: async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/v1/notifications`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data?.notifications || json.data || [];
      }
    } catch (e) {}
    return getUserItem('superadmin_notifications', []);
  },
  markNotificationAsRead: async (notifId) => {
    try {
      await fetch(`http://localhost:8081/api/v1/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
    } catch (e) {}
    return { success: true };
  },
  clearNotifications: async () => {
    try {
      await fetch(`http://localhost:8081/api/v1/notifications`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (e) {}
    setUserItem('superadmin_notifications', []);
    return { success: true };
  }
};

export default superAdminService;
