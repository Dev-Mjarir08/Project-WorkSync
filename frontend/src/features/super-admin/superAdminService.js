// Super Admin Service: provides live API interaction with backend database
const API_BASE_URL = 'http://localhost:8081/api';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const superAdminService = {
  // 1. Get overview KPI stats
  getDashboardOverview: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/super-admin/dashboard`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.stats) {
          return json.data;
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard overview:', err);
    }

    // Default clean empty state for a fresh registration
    return {
      stats: {
        totalUsers: '0',
        usersGrowth: '0%',
        activeWorkspaces: '0',
        workspacesGrowth: '0%',
        totalBoards: '0',
        boardsGrowth: '0%',
        totalTasks: '0',
        tasksGrowth: '0%',
        databaseStatus: 'connected',
        apiUptime: '100%'
      },
      userGrowthChart: [],
      recentAuditLogs: [],
      topWorkspaces: [],
      rolesSummary: {
        superAdmin: 0,
        admin: 0,
        manager: 0,
        employee: 0,
        member: 0,
        viewer: 0,
        active: 0,
        inactive: 0
      }
    };
  },

  // 2. Get all platform users
  getUsers: async (query = {}) => {
    const { search = '', role = 'all', status = 'all' } = query;
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role && role !== 'all') params.append('role', role);
      if (status && status !== 'all') params.append('status', status);

      const res = await fetch(`${API_BASE_URL}/v1/super-admin/users?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }

    return {
      users: [],
      totalCount: 0,
      rolesSummary: {
        superAdmin: 0,
        admin: 0,
        manager: 0,
        employee: 0,
        member: 0,
        viewer: 0,
        active: 0,
        inactive: 0
      }
    };
  },

  // 3. Get single user details by ID
  getUserById: async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/super-admin/users/${userId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.user || json.data;
      }
    } catch (err) {
      console.error('Failed to fetch user by ID:', err);
    }
    return null;
  },

  // 4. Create new user by super admin
  createUser: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/v1/super-admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to create user');
    }
    return json.data?.user || json.data;
  },

  // 5. Toggle user active/deactivated status
  toggleUserStatus: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/v1/super-admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({})
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to update user status');
    }
    return json.data?.user || json.data;
  },

  // 6. Update user platform role
  updateUserRole: async (userId, newRole) => {
    const res = await fetch(`${API_BASE_URL}/v1/super-admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role: newRole })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to update user role');
    }
    return json.data?.user || json.data;
  },

  // 7. Delete user
  deleteUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/v1/super-admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to delete user');
    }
    return json.data;
  },

  // 8. Get all workspaces
  getWorkspaces: async (query = {}) => {
    const { search = '', status = 'all', plan = 'all' } = query;
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);
      if (plan && plan !== 'all') params.append('plan', plan);

      const res = await fetch(`${API_BASE_URL}/v1/super-admin/workspaces?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return {
          workspaces: json.data?.workspaces || [],
          totalCount: json.data?.totalCount || 0,
          metrics: json.data?.metrics || {
            total: 0,
            active: 0,
            archived: 0,
            enterprise: 0,
            pro: 0,
            starter: 0,
            totalStorage: '0 MB'
          }
        };
      }
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    }

    return {
      workspaces: [],
      totalCount: 0,
      metrics: {
        total: 0,
        active: 0,
        archived: 0,
        enterprise: 0,
        pro: 0,
        starter: 0,
        totalStorage: '0 MB'
      }
    };
  },

  // 9. Get single workspace details
  getWorkspaceById: async (workspaceId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/super-admin/workspaces/${workspaceId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.workspace || json.data;
      }
    } catch (err) {
      console.error('Failed to fetch workspace details:', err);
    }
    return null;
  },

  // 10. Create new workspace
  createWorkspace: async (wsData) => {
    const res = await fetch(`${API_BASE_URL}/v1/super-admin/workspaces`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(wsData)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to create workspace');
    }
    return json.data?.workspace || json.data;
  },

  // 11. Toggle workspace status
  toggleWorkspaceStatus: async (workspaceId) => {
    const res = await fetch(`${API_BASE_URL}/v1/super-admin/workspaces/${workspaceId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({})
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to toggle workspace status');
    }
    return json.data;
  },

  // 12. Delete workspace
  deleteWorkspace: async (workspaceId) => {
    const res = await fetch(`${API_BASE_URL}/v1/super-admin/workspaces/${workspaceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to delete workspace');
    }
    return json.data;
  },

  // 13. Get platform analytics
  getAnalytics: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/super-admin/analytics`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.error('Failed to fetch platform analytics:', err);
    }

    return {
      overview: {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        userActiveRatio: '0%',
        totalWorkspaces: 0,
        activeWorkspaces: 0,
        archivedWorkspaces: 0,
        totalBoards: 0,
        totalTasks: 0,
        totalAuditEvents: 0,
        databaseStatus: 'Connected',
        apiUptime: '100%'
      },
      roleDistribution: {
        superAdmin: 0,
        admin: 0,
        manager: 0,
        employee: 0,
        member: 0,
        viewer: 0
      },
      workspaceDistribution: {
        enterprise: 0,
        pro: 0,
        starter: 0
      },
      growthTrends: [],
      infrastructure: {
        serverUptime: '100%',
        memoryUsage: 'Healthy',
        cpuLoad: '0.1%',
        networkRequestsPerMin: 0,
        errorRate: '0%'
      }
    };
  },

  // 14. Get platform audit logs
  getAuditLogs: async (query = {}) => {
    const { search = '', category = 'all', status = 'all', page = 1, limit = 20 } = query;
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);
      params.append('page', page);
      params.append('limit', limit);

      const res = await fetch(`${API_BASE_URL}/v1/super-admin/audit-logs?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }

    return {
      logs: [],
      totalCount: 0,
      summary: {
        total: 0,
        success: 0,
        warning: 0,
        failure: 0
      }
    };
  },

  // 15. Get platform settings
  getSettings: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/super-admin/settings`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.settings || json.data;
      }
    } catch (err) {
      console.error('Failed to fetch platform settings:', err);
    }

    return {
      platformName: 'WorkSync',
      supportEmail: 'support@worksync.io',
      allowRegistration: true,
      requireEmailVerification: false,
      mfaRequiredForAdmins: false,
      sessionTimeoutMinutes: 1440,
      defaultWorkspaceStorageMB: 5120,
      maxBoardsPerWorkspace: 50,
      maintenanceMode: false
    };
  },

  // 16. Update platform settings
  updateSettings: async (settings) => {
    const res = await fetch(`${API_BASE_URL}/v1/super-admin/settings`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to update settings');
    }
    return json.data?.settings || json.data;
  },

  // =========================================================================
  // WORKSPACE MEMBERS & INVITATIONS APIS
  // =========================================================================

  // 17. GET /workspaces/:workspaceId/dashboard
  getWorkspaceDashboard: async (workspaceId) => {
    const url = workspaceId
      ? `${API_BASE_URL}/v1/workspaces/${workspaceId}/dashboard`
      : `${API_BASE_URL}/v1/dashboard`;

    const res = await fetch(url, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load workspace dashboard');
    return json.data;
  },

  // 18. GET /workspaces/:workspaceId/members
  getWorkspaceMembers: async (workspaceId, query = {}) => {
    const url = workspaceId
      ? `${API_BASE_URL}/v1/workspaces/${workspaceId}/members`
      : `${API_BASE_URL}/v1/members`;

    const params = new URLSearchParams(query);
    const res = await fetch(`${url}?${params.toString()}`, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load workspace members');
    return json.data;
  },

  // 19. POST /workspaces/:workspaceId/members - Add existing user
  addWorkspaceMember: async (workspaceId, memberData) => {
    const url = workspaceId
      ? `${API_BASE_URL}/v1/workspaces/${workspaceId}/members`
      : `${API_BASE_URL}/v1/members`;

    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(memberData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to add member to workspace');
    return json.data;
  },

  // 20. GET /workspaces/:workspaceId/members/:memberId
  getMemberDetails: async (workspaceId, memberId) => {
    const url = workspaceId
      ? `${API_BASE_URL}/v1/workspaces/${workspaceId}/members/${memberId}`
      : `${API_BASE_URL}/v1/members/${memberId}`;

    const res = await fetch(url, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch member details');
    return json.data;
  },

  // 21. PATCH /workspaces/:workspaceId/members/:memberId/role
  updateMemberRole: async (workspaceId, memberId, role) => {
    const url = workspaceId
      ? `${API_BASE_URL}/v1/workspaces/${workspaceId}/members/${memberId}/role`
      : `${API_BASE_URL}/v1/members/${memberId}/role`;

    const res = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update member role');
    return json.data;
  },

  // 22. DELETE /workspaces/:workspaceId/members/:memberId
  removeWorkspaceMember: async (workspaceId, memberId) => {
    const url = workspaceId
      ? `${API_BASE_URL}/v1/workspaces/${workspaceId}/members/${memberId}`
      : `${API_BASE_URL}/v1/members/${memberId}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to remove member from workspace');
    return json.data;
  },

  // 23. POST /workspaces/:workspaceId/invitations - Invite new member
  inviteMember: async (workspaceId, inviteData) => {
    const url = workspaceId
      ? `${API_BASE_URL}/v1/workspaces/${workspaceId}/invitations`
      : `${API_BASE_URL}/v1/invitations`;

    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(inviteData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to dispatch invitation');
    return json.data;
  },

  // 24. GET /workspaces/:workspaceId/invitations
  getWorkspaceInvitations: async (workspaceId, query = {}) => {
    const url = workspaceId
      ? `${API_BASE_URL}/v1/workspaces/${workspaceId}/invitations`
      : `${API_BASE_URL}/v1/invitations`;

    const params = new URLSearchParams(query);
    const res = await fetch(`${url}?${params.toString()}`, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load invitations');
    return json.data;
  },

  // 25. DELETE /workspaces/:workspaceId/invitations/:invitationId - Cancel invitation
  cancelInvitation: async (workspaceId, invitationId) => {
    const url = workspaceId
      ? `${API_BASE_URL}/v1/workspaces/${workspaceId}/invitations/${invitationId}`
      : `${API_BASE_URL}/v1/invitations/${invitationId}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to cancel invitation');
    return json.data;
  }
};

export default superAdminService;