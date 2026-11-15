import { getUserItem, setUserItem, getCurrentUser } from '../../utils/userStorage.js';

const getApiBaseUrl = () => {
  if (typeof window !== "undefined" && window.__ENV__?.API_URL) {
    return `${window.__ENV__.API_URL}/api/v1/admin`;
  }
  const viteUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  if (viteUrl) {
    return `${viteUrl.replace(/\/+$/, '')}/api/v1/admin`;
  }
  return "http://localhost:8081/api/v1/admin";
};

const API_BASE_URL = getApiBaseUrl();

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = getCurrentUser();
  const workspaceId = user?.workspaceId || (typeof window !== "undefined" ? localStorage.getItem("workspaceId") : null);

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(workspaceId ? { "x-workspace-id": workspaceId } : {})
  };
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error("The Admin API returned an invalid response.");
  }

  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Request failed with status ${response.status}`);
  }

  return body.data;
};

const adminService = {
  async getDashboard() {
    try {
      return await request('/dashboard');
    } catch {
      return null;
    }
  },

  async getBoards() {
    try {
      const data = await request('/boards');
      if (Array.isArray(data?.boards)) {
        setUserItem('admin_boards', data.boards);
        return data.boards;
      }
    } catch {
      // offline fallback
    }
    return getUserItem('admin_boards', []);
  },

  async getTasks(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const data = await request(`/tasks${query ? `?${query}` : ''}`);
      if (Array.isArray(data?.tasks)) {
        return data.tasks;
      }
      if (Array.isArray(data)) return data;
    } catch {}
    return getUserItem('admin_tasks', []);
  },

  async deleteTask(taskId) {
    try {
      await request(`/tasks/${taskId}`, { method: 'DELETE' });
    } catch {}
    const tasks = getUserItem('admin_tasks', []);
    const filtered = tasks.filter((t) => t.id !== taskId && t._id !== taskId);
    setUserItem('admin_tasks', filtered);
    return { success: true };
  },

  async createBoard({ title, description, workspace, status = 'Planning', owner, members = [] }) {
    const user = getCurrentUser();
    const boards = getUserItem('admin_boards', []);
    const baseId = title
      .trim()
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'new-board';
    const id = `${baseId}-${Date.now().toString(36)}`;

    const effectiveOwner = owner || {
      id: user?.id || 'admin',
      name: user?.name || 'Workspace Admin',
      initials: (user?.name || 'A').slice(0, 2).toUpperCase(),
      color: 'bg-emerald-100 text-emerald-700'
    };

    const board = {
      id,
      title: title.trim(),
      description: (description || '').trim(),
      status,
      workspace: workspace || 'Default Workspace',
      owner: effectiveOwner,
      members: members.length > 0 ? members : [effectiveOwner],
      updatedAt: new Date().toISOString(),
      tasks: [],
    };

    try {
      await request('/boards', {
        method: 'POST',
        body: JSON.stringify({
          name: board.title,
          description: board.description,
          status: board.status
        })
      });
    } catch {
      // offline fallback
    }

    boards.unshift(board);
    setUserItem('admin_boards', boards);

    // Record activity
    const activities = getUserItem('admin_activities', []);
    activities.unshift({
      id: 'act_' + Date.now(),
      action: 'created board',
      target: board.title,
      time: 'Just now',
      actor: effectiveOwner
    });
    setUserItem('admin_activities', activities.slice(0, 50));

    return board;
  },

  getBoardById(boardId) {
    const boards = getUserItem('admin_boards', []);
    return boards.find((board) => board.id === boardId) ?? null;
  },

  getActivities() {
    return getUserItem('admin_activities', []);
  },

  // 1. GET /api/v1/admin/members – Workspace members list
  async getMembers(query = {}) {
    const queryParams = new URLSearchParams(
      Object.entries(query).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    const endpoint = `/members${queryParams ? `?${queryParams}` : ''}`;
    try {
      const data = await request(endpoint);
      if (Array.isArray(data?.members)) {
        setUserItem('admin_members', data.members);
        return data.members;
      }
    } catch (err) {
      console.warn('Live getMembers failed, checking offline storage:', err.message);
    }
    return getUserItem('admin_members', []);
  },

  // 2. POST /api/v1/admin/members/invite – Invite new member via email
  async inviteMember({ email, role = 'member', message = '' }) {
    try {
      const data = await request('/members/invite', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), role, message }),
      });
      return data?.invitation;
    } catch (err) {
      // Offline fallback: save invitation locally
      const invitations = getUserItem('admin_invitations', []);
      const newInv = {
        id: 'inv_' + Date.now(),
        email: email.trim().toLowerCase(),
        name: email.split('@')[0],
        role,
        status: 'Pending',
        invitedAt: new Date().toISOString().split('T')[0],
        workspace: 'Default Workspace',
      };
      invitations.unshift(newInv);
      setUserItem('admin_invitations', invitations);
      return newInv;
    }
  },

  // 3. PATCH /api/v1/admin/members/:id/role – Change member workspace role
  async updateMemberRole(memberId, role) {
    try {
      const data = await request(`/members/${memberId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: role.toLowerCase() }),
      });
      // Sync local members
      const members = getUserItem('admin_members', []);
      const updated = members.map((m) => (m.id === memberId ? { ...m, role: role.toLowerCase() } : m));
      setUserItem('admin_members', updated);
      return data;
    } catch (err) {
      const members = getUserItem('admin_members', []);
      const updated = members.map((m) => (m.id === memberId ? { ...m, role: role.toLowerCase() } : m));
      setUserItem('admin_members', updated);
      return { id: memberId, role };
    }
  },

  // 4. DELETE /api/v1/admin/members/:id – Remove member from workspace
  async removeMember(memberId) {
    try {
      await request(`/members/${memberId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Live removeMember failed, removing from local storage:', err.message);
    }
    const members = getUserItem('admin_members', []);
    const updated = members.filter((m) => m.id !== memberId);
    setUserItem('admin_members', updated);
    return { success: true, id: memberId };
  },

  // 5. GET /api/v1/admin/roles – Workspace roles & permission matrix
  async getRoles() {
    try {
      const data = await request('/roles');
      if (Array.isArray(data?.roles)) {
        setUserItem('admin_roles', data.roles);
        return data.roles;
      }
    } catch (err) {
      console.warn('Live getRoles failed, returning cached:', err.message);
    }
    return getUserItem('admin_roles', [
      { id: 'role-owner', name: 'Owner', slug: 'owner', description: 'Complete authority over workspace settings and billing', isSystemRole: true, permissions: ['all'] },
      { id: 'role-admin', name: 'Admin', slug: 'admin', description: 'Can manage workspace members, projects, boards and tasks', isSystemRole: true, permissions: ['manage_members', 'manage_boards', 'manage_projects', 'create_tasks'] },
      { id: 'role-manager', name: 'Manager', slug: 'manager', description: 'Can manage assigned projects, boards and assign tasks', isSystemRole: false, permissions: ['manage_boards', 'manage_projects', 'create_tasks', 'assign_tasks'] },
      { id: 'role-member', name: 'Member', slug: 'member', description: 'Can create and execute tasks on assigned boards', isSystemRole: false, permissions: ['view_boards', 'create_tasks', 'edit_own_tasks'] },
      { id: 'role-employee', name: 'Employee', slug: 'employee', description: 'Standard team contributor with task execution rights', isSystemRole: false, permissions: ['view_boards', 'edit_own_tasks'] },
    ]);
  },

  // 6. PATCH /api/v1/admin/roles/:roleId – Customize role permissions
  async updateRolePermissions(roleId, permissions) {
    try {
      const data = await request(`/roles/${roleId}`, {
        method: 'PATCH',
        body: JSON.stringify({ permissions }),
      });
      return data?.role || data;
    } catch (err) {
      const roles = getUserItem('admin_roles', []);
      const updated = roles.map((r) => (r.id === roleId ? { ...r, permissions } : r));
      setUserItem('admin_roles', updated);
      return { id: roleId, permissions };
    }
  },

  // 7. GET /api/v1/admin/invitations – Pending invitation list
  async getInvitations(query = {}) {
    const queryParams = new URLSearchParams(
      Object.entries(query).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    const endpoint = `/invitations${queryParams ? `?${queryParams}` : ''}`;
    try {
      const data = await request(endpoint);
      if (Array.isArray(data?.invitations)) {
        setUserItem('admin_invitations', data.invitations);
        return data.invitations;
      }
    } catch (err) {
      console.warn('Live getInvitations failed, returning cached:', err.message);
    }
    return getUserItem('admin_invitations', []);
  },

  // 8. DELETE /api/v1/admin/invitations/:id – Revoke invitation link
  async revokeInvitation(invitationId) {
    try {
      await request(`/invitations/${invitationId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Live revokeInvitation failed, updating offline storage:', err.message);
    }
    const invitations = getUserItem('admin_invitations', []);
    const updated = invitations.filter((inv) => (inv.id || inv._id) !== invitationId);
    setUserItem('admin_invitations', updated);
    return { success: true, id: invitationId };
  },

  // 9. GET /api/v1/admin/settings – Workspace general & branding settings
  async getSettings() {
    try {
      const data = await request('/settings');
      if (data?.settings) {
        setUserItem('admin_settings', data.settings);
        return data.settings;
      }
    } catch (err) {
      console.warn('Live getSettings failed, returning cached:', err.message);
    }
    return getUserItem('admin_settings', {
      general: {
        workspaceName: 'WorkSync Team Workspace',
        defaultRole: 'member',
        timezone: 'UTC',
        allowMemberInvites: true
      },
      privacy: {
        isPublic: false,
        inviteOnly: true
      },
      notifications: {
        emailNotifications: true,
        taskAlerts: true,
        weeklyDigest: true
      },
      permissions: {
        memberCanCreateBoards: true,
        memberCanCreateProjects: true,
        memberCanInvite: false
      }
    });
  },

  // 10. PATCH /api/v1/admin/settings – Update workspace settings
  async updateSettings(settings) {
    try {
      const data = await request('/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings),
      });
      const savedSettings = data?.settings || settings;
      setUserItem('admin_settings', savedSettings);
      return savedSettings;
    } catch (err) {
      setUserItem('admin_settings', settings);
      return settings;
    }
  },
};

export { adminService };
export default adminService;
