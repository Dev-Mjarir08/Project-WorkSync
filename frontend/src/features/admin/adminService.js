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
      if (Array.isArray(data?.boards) && data.boards.length > 0) {
        return data.boards;
      }
    } catch {
      // fallback
    }
    return getUserItem('admin_boards', []);
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
};

export { adminService };
export default adminService;
