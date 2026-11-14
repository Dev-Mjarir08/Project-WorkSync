import { getUserItem, setUserItem, getCurrentUser } from "../../utils/userStorage.js";

const getApiBaseUrl = () => {
  if (typeof window !== "undefined" && window.__ENV__?.API_URL) {
    return `${window.__ENV__.API_URL}/api/v1/manager`;
  }
  const viteUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  if (viteUrl) {
    return `${viteUrl.replace(/\/+$/, '')}/api/v1/manager`;
  }
  return "http://localhost:8081/api/v1/manager";
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
    throw new Error("The Manager API returned an invalid response.");
  }

  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Request failed with status ${response.status}`);
  }

  return body.data;
};

const withBody = (method, body) => ({
  method,
  body: JSON.stringify(body),
});

export const managerService = {
  // 1. Dashboard
  getDashboard: async () => {
    try {
      const data = await request("/dashboard");
      return data;
    } catch {
      return {
        myProjects: getUserItem("manager_projects", []),
        recentTasks: getUserItem("manager_tasks", []),
        stats: {
          totalProjects: getUserItem("manager_projects", []).length,
          totalTasks: getUserItem("manager_tasks", []).length,
          teamMembers: getUserItem("manager_team", []).length,
        }
      };
    }
  },

  getStats: async () => {
    try {
      return await request("/dashboard/stats");
    } catch {
      return {
        totalProjects: getUserItem("manager_projects", []).length,
        totalTasks: getUserItem("manager_tasks", []).length,
        teamMembers: getUserItem("manager_team", []).length,
      };
    }
  },

  // 2. Projects
  getProjects: async () => {
    try {
      const data = await request("/projects");
      return Array.isArray(data?.projects) ? data.projects : (data || []);
    } catch {
      return getUserItem("manager_projects", []);
    }
  },

  getProjectById: async (projectId) => {
    try {
      const data = await request(`/projects/${projectId}`);
      return data?.project || data;
    } catch {
      const projects = getUserItem("manager_projects", []);
      return projects.find((p) => p.id === projectId || p._id === projectId) || null;
    }
  },

  createProject: async (projectData) => {
    try {
      const data = await request("/projects", withBody("POST", projectData));
      return data?.project || data;
    } catch {
      const projects = getUserItem("manager_projects", []);
      const newProject = {
        id: `proj_${Date.now()}`,
        name: projectData.name || "Untitled Project",
        category: projectData.category || "General",
        status: projectData.status || "Active",
        progress: 0,
        ...projectData,
      };
      projects.unshift(newProject);
      setUserItem("manager_projects", projects);
      return newProject;
    }
  },

  getProjectMembers: async (projectId) => {
    try {
      const data = await request(`/projects/${projectId}/members`);
      return Array.isArray(data?.members) ? data.members : [];
    } catch {
      return getUserItem("manager_team", []);
    }
  },

  // 3. Boards
  getBoards: async () => {
    try {
      const data = await request("/boards");
      return Array.isArray(data?.boards) ? data.boards : (data || []);
    } catch {
      return getUserItem("manager_boards", [
        { id: "board-1", name: "Core Engineering Sprint", description: "Default Kanban Board" }
      ]);
    }
  },

  getBoard: async (boardId) => {
    try {
      const data = await request(`/boards/${boardId}`);
      return data?.board || data;
    } catch {
      const boards = getUserItem("manager_boards", []);
      return boards.find((b) => b.id === boardId || b._id === boardId) || {
        id: boardId || "board-1",
        name: "Sprint Delivery Board",
        description: "Agile Kanban delivery board"
      };
    }
  },

  createBoard: async (boardData) => {
    try {
      const data = await request("/boards", withBody("POST", boardData));
      return data?.board || data;
    } catch {
      const boards = getUserItem("manager_boards", []);
      const newBoard = {
        id: `board_${Date.now()}`,
        name: boardData.name || "New Board",
        description: boardData.description || "",
        ...boardData
      };
      boards.push(newBoard);
      setUserItem("manager_boards", boards);
      return newBoard;
    }
  },

  getBoardLists: async (boardId) => {
    try {
      const data = await request(`/boards/${boardId}/lists`);
      return Array.isArray(data?.lists) ? data.lists : (data || []);
    } catch {
      return [
        { id: "list-todo", name: "To Do", position: 0 },
        { id: "list-in-progress", name: "In Progress", position: 1 },
        { id: "list-review", name: "In Review", position: 2 },
        { id: "list-done", name: "Done", position: 3 }
      ];
    }
  },

  // 4. Tasks
  getTasks: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const query = params.size ? `?${params.toString()}` : "";
      const data = await request(`/tasks${query}`);
      return Array.isArray(data?.tasks) ? data.tasks : (data || []);
    } catch {
      let tasks = getUserItem("manager_tasks", []);
      if (filters.status && filters.status !== "all" && filters.status !== "All") {
        tasks = tasks.filter((t) => t.status?.toLowerCase() === filters.status.toLowerCase());
      }
      return tasks;
    }
  },

  createTask: async (task) => {
    try {
      const data = await request("/tasks", withBody("POST", task));
      return data?.task || data;
    } catch {
      const tasks = getUserItem("manager_tasks", []);
      const newTask = {
        id: `task_${Date.now()}`,
        title: task.title,
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate || null,
        assignee: task.assignee || "Unassigned",
        project: task.project || "WorkSync Web Platform",
        ...task
      };
      tasks.unshift(newTask);
      setUserItem("manager_tasks", tasks);
      return newTask;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      return await request(`/tasks/${taskId}/status`, withBody("PATCH", { status }));
    } catch {
      const tasks = getUserItem("manager_tasks", []);
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
      setUserItem("manager_tasks", updated);
      return { success: true };
    }
  },

  moveTask: async (taskId, move) => {
    try {
      const data = await request(`/tasks/${taskId}/move`, withBody("PATCH", move));
      return data?.task || data;
    } catch {
      const tasks = getUserItem("manager_tasks", []);
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...move } : t));
      setUserItem("manager_tasks", updated);
      return updated.find((t) => t.id === taskId);
    }
  },

  // 5. Assignments
  getAssignments: async (query = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => { if (v) params.set(k, v); });
      const q = params.size ? `?${params.toString()}` : "";
      const data = await request(`/assignments${q}`);
      return Array.isArray(data?.assignments) ? data.assignments : [];
    } catch {
      return getUserItem("manager_assignments", []);
    }
  },

  assignTask: async (taskId, memberData) => {
    try {
      const data = await request(`/tasks/${taskId}/assign`, withBody("PATCH", memberData));
      return data?.task || data;
    } catch {
      const tasks = getUserItem("manager_tasks", []);
      const assigneeName = memberData.assignee || memberData.name || "Assigned Member";
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, assignee: assigneeName } : t));
      setUserItem("manager_tasks", updated);
      return updated.find((t) => t.id === taskId);
    }
  },

  unassignTask: async (taskId) => {
    try {
      return await request(`/tasks/${taskId}/unassign`, withBody("PATCH", {}));
    } catch {
      const tasks = getUserItem("manager_tasks", []);
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, assignee: "Unassigned" } : t));
      setUserItem("manager_tasks", updated);
      return { success: true };
    }
  },

  // 6. Team & Workload
  getTeamMembers: async () => {
    try {
      const data = await request("/team");
      return Array.isArray(data?.members) ? data.members : [];
    } catch {
      return getUserItem("manager_team", []);
    }
  },

  getTeamWorkload: async () => {
    try {
      return await request("/team/workload");
    } catch {
      return { workload: [], teamCapacity: 100 };
    }
  },

  // 7. Reports & Analytics
  getReports: async () => {
    try {
      return await request("/reports/overview");
    } catch {
      return {
        completionRate: 85,
        totalResolved: 42,
        velocity: 18,
      };
    }
  },

  getBurndownReports: async (query = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => { if (v) params.set(k, v); });
      const q = params.size ? `?${params.toString()}` : "";
      return await request(`/reports/burndown${q}`);
    } catch {
      return {
        totalScope: 42,
        remainingTasks: 18,
        burndown: [
          { day: "Day 1", ideal: 42, actual: 42 },
          { day: "Day 2", ideal: 37.8, actual: 41 },
          { day: "Day 3", ideal: 33.6, actual: 38 },
          { day: "Day 4", ideal: 29.4, actual: 32 },
          { day: "Day 5", ideal: 25.2, actual: 26 },
          { day: "Day 6", ideal: 21.0, actual: 21 },
          { day: "Day 7", ideal: 16.8, actual: 17 },
          { day: "Day 8", ideal: 12.6, actual: 12 },
          { day: "Day 9", ideal: 8.4, actual: 8 },
          { day: "Day 10", ideal: 0, actual: null },
        ]
      };
    }
  },

  getProductivityReports: async (query = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => { if (v) params.set(k, v); });
      const q = params.size ? `?${params.toString()}` : "";
      return await request(`/reports/productivity${q}`);
    } catch {
      return {
        averageThroughput: 8.5,
        weeks: [
          { label: "Week 1", created: 12, completed: 10, throughputRate: 83 },
          { label: "Week 2", created: 15, completed: 14, throughputRate: 93 },
          { label: "Week 3", created: 11, completed: 9, throughputRate: 82 },
          { label: "Week 4", created: 14, completed: 12, throughputRate: 86 },
        ]
      };
    }
  },

  exportReports: async (query = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => { if (v) params.set(k, v); });
    const q = params.size ? `?${params.toString()}` : "";
    return await request(`/reports/export${q}`);
  },

  downloadExportCSV: async (query = {}) => {
    const params = new URLSearchParams();
    params.set("format", "csv");
    Object.entries(query).forEach(([k, v]) => { if (v && k !== "format") params.set(k, v); });
    const endpoint = `${API_BASE_URL}/reports/export?${params.toString()}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        Accept: "text/csv, application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to export report CSV.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `worksync_manager_reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  },

  // 8. Comments & Discussions
  getTaskComments: async (taskId) => {
    try {
      const data = await request(`/tasks/${taskId}/comments`);
      return Array.isArray(data?.comments) ? data.comments : (Array.isArray(data) ? data : []);
    } catch {
      return getUserItem(`task_comments_${taskId}`, []);
    }
  },

  addTaskComment: async (taskId, { content }) => {
    const user = getCurrentUser();
    const localComment = {
      id: "comm_" + Date.now(),
      task: taskId,
      author: {
        id: user?.id || user?._id || "user",
        name: user?.name || "Manager",
        email: user?.email || "",
        avatar: user?.avatar || "",
      },
      content: content.trim(),
      createdAt: new Date().toISOString(),
      replies: [],
    };

    try {
      const data = await request(`/tasks/${taskId}/comments`, withBody("POST", { content: content.trim() }));
      const savedComment = data?.comment || localComment;
      const cached = getUserItem(`task_comments_${taskId}`, []);
      setUserItem(`task_comments_${taskId}`, [...cached, savedComment]);
      return savedComment;
    } catch {
      const cached = getUserItem(`task_comments_${taskId}`, []);
      setUserItem(`task_comments_${taskId}`, [...cached, localComment]);
      return localComment;
    }
  },

  addCommentReply: async (taskId, commentId, { content }) => {
    const user = getCurrentUser();
    const localReply = {
      id: "reply_" + Date.now(),
      parentComment: commentId,
      task: taskId,
      author: {
        id: user?.id || user?._id || "user",
        name: user?.name || "Manager",
        email: user?.email || "",
        avatar: user?.avatar || "",
      },
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const data = await request(`/tasks/${taskId}/comments/${commentId}/replies`, withBody("POST", { content: content.trim() }));
      const savedReply = data?.reply || localReply;
      const cached = getUserItem(`task_comments_${taskId}`, []);
      const updated = cached.map((c) => {
        if (c.id === commentId || c._id === commentId) {
          return { ...c, replies: [...(c.replies || []), savedReply] };
        }
        return c;
      });
      setUserItem(`task_comments_${taskId}`, updated);
      return savedReply;
    } catch {
      const cached = getUserItem(`task_comments_${taskId}`, []);
      const updated = cached.map((c) => {
        if (c.id === commentId || c._id === commentId) {
          return { ...c, replies: [...(c.replies || []), localReply] };
        }
        return c;
      });
      setUserItem(`task_comments_${taskId}`, updated);
      return localReply;
    }
  },

  updateComment: async (commentId, { content }) => {
    try {
      const data = await request(`/comments/${commentId}`, withBody("PATCH", { content: content.trim() }));
      return data?.comment || data;
    } catch {
      return { id: commentId, content, isEdited: true, editedAt: new Date().toISOString() };
    }
  },

  deleteComment: async (commentId) => {
    try {
      return await request(`/comments/${commentId}`, { method: "DELETE" });
    } catch {
      return { id: commentId, deleted: true };
    }
  },

  // 9. Activities
  getActivities: async () => {
    try {
      const data = await request("/activities");
      return Array.isArray(data?.activities) ? data.activities : [];
    } catch {
      return getUserItem("manager_activities", []);
    }
  },

  // 9. Notifications
  getNotifications: async () => {
    try {
      const data = await request("/notifications");
      return Array.isArray(data?.notifications) ? data.notifications : [];
    } catch {
      return getUserItem("manager_notifications", []);
    }
  },

  // 10. Profile
  getProfile: async () => {
    try {
      const data = await request("/profile");
      return data?.user || data;
    } catch {
      return getCurrentUser();
    }
  },

  updateProfile: async (profileData) => {
    try {
      const data = await request("/profile", withBody("PATCH", profileData));
      return data?.user || data;
    } catch {
      const current = getCurrentUser();
      const updated = { ...current, ...profileData };
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updated));
      }
      return updated;
    }
  },

  // 11. Profile Sessions Management
  getSessions: async () => {
    try {
      const data = await request("/profile/sessions");
      return Array.isArray(data?.sessions) ? data.sessions : (Array.isArray(data) ? data : []);
    } catch {
      return getUserItem("manager_sessions", [
        {
          id: "sess_current",
          device: "Desktop - Chrome Browser",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
          ip: "127.0.0.1 (Local)",
          isCurrent: true,
          isValid: true,
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ]);
    }
  },

  revokeSession: async (sessionId) => {
    try {
      const data = await request(`/profile/sessions/${sessionId}`, { method: "DELETE" });
      const sessions = getUserItem("manager_sessions", []);
      const updated = sessions.filter((s) => (s.id || s._id) !== sessionId);
      setUserItem("manager_sessions", updated);
      return data;
    } catch {
      const sessions = getUserItem("manager_sessions", []);
      const updated = sessions.filter((s) => (s.id || s._id) !== sessionId);
      setUserItem("manager_sessions", updated);
      return { sessionId, revoked: true };
    }
  }
};

export default managerService;
