import { getUserItem, setUserItem, getCurrentUser } from "../../utils/userStorage.js";

const getApiBaseUrl = () => {
  if (typeof window !== "undefined" && window.__ENV__?.API_URL) {
    return `${window.__ENV__.API_URL}/api/v1/employee`;
  }
  const viteUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  if (viteUrl) {
    return `${viteUrl.replace(/\/+$/, '')}/api/v1/employee`;
  }
  return "http://localhost:8081/api/v1/employee";
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
    throw new Error("The Employee API returned an invalid response.");
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

export const employeeService = {
  // 1. Dashboard
  getDashboard: async () => {
    try {
      return await request("/dashboard");
    } catch {
      return {
        myProjects: getUserItem("employee_projects", []),
        recentTasks: getUserItem("employee_tasks", []),
        stats: {
          totalTasks: getUserItem("employee_tasks", []).length,
          completedTasks: getUserItem("employee_tasks", []).filter(t => t.status === "Completed" || t.status === "done").length,
          inProgressTasks: getUserItem("employee_tasks", []).filter(t => t.status === "In Progress" || t.status === "in_progress").length,
        }
      };
    }
  },

  // 2. Projects
  getProjects: async () => {
    try {
      const data = await request("/projects");
      return Array.isArray(data?.projects) ? data.projects : (data || []);
    } catch {
      return getUserItem("employee_projects", []);
    }
  },

  getProjectById: async (projectId) => {
    try {
      const data = await request(`/projects/${projectId}`);
      return data?.project || data;
    } catch {
      const projects = getUserItem("employee_projects", []);
      return projects.find((p) => p.id === projectId || p._id === projectId) || null;
    }
  },

  // 3. Boards & Kanban
  getBoards: async () => {
    try {
      const data = await request("/boards");
      return Array.isArray(data?.boards) ? data.boards : (data || []);
    } catch {
      return getUserItem("employee_boards", [
        { id: "emp-board-1", name: "Engineering Kanban", description: "Active Sprint Board" }
      ]);
    }
  },

  getBoardLists: async (boardId) => {
    try {
      const data = await request(`/boards/${boardId}/lists`);
      return Array.isArray(data?.lists) ? data.lists : (data || []);
    } catch {
      return [
        { id: "todo", name: "To Do", position: 0 },
        { id: "in_progress", name: "In Progress", position: 1 },
        { id: "review", name: "In Review", position: 2 },
        { id: "done", name: "Completed", position: 3 }
      ];
    }
  },

  // 4. Tasks & Assignments
  getTasks: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const q = params.size ? `?${params.toString()}` : "";
      const data = await request(`/tasks${q}`);
      return Array.isArray(data?.tasks) ? data.tasks : (data || []);
    } catch {
      return getUserItem("employee_tasks", []);
    }
  },

  createTask: async (task) => {
    try {
      const data = await request("/tasks", withBody("POST", task));
      return data?.task || data;
    } catch {
      const tasks = getUserItem("employee_tasks", []);
      const newTask = {
        id: `emp_task_${Date.now()}`,
        title: task.title,
        status: task.status || "todo",
        priority: task.priority || "Medium",
        dueDate: task.dueDate || null,
        ...task
      };
      tasks.unshift(newTask);
      setUserItem("employee_tasks", tasks);
      return newTask;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      return await request(`/tasks/${taskId}/status`, withBody("PATCH", { status }));
    } catch {
      const tasks = getUserItem("employee_tasks", []);
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
      setUserItem("employee_tasks", updated);
      return { success: true };
    }
  },

  moveTask: async (taskId, move) => {
    try {
      const data = await request(`/tasks/${taskId}/move`, withBody("PATCH", move));
      return data?.task || data;
    } catch {
      const tasks = getUserItem("employee_tasks", []);
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...move } : t));
      setUserItem("employee_tasks", updated);
      return updated.find((t) => t.id === taskId);
    }
  },

  deleteTask: async (taskId) => {
    try {
      await request(`/tasks/${taskId}`, { method: "DELETE" });
    } catch {}
    const tasks = getUserItem("employee_tasks", []);
    const filtered = tasks.filter((t) => t.id !== taskId && t._id !== taskId);
    setUserItem("employee_tasks", filtered);
    return { success: true };
  },

  // 5. Activities
  getActivities: async () => {
    try {
      const data = await request("/activities");
      return Array.isArray(data?.activities) ? data.activities : [];
    } catch {
      return getUserItem("employee_activities", []);
    }
  },

  // 6. Notifications
  getNotifications: async () => {
    try {
      const data = await request("/notifications");
      return Array.isArray(data?.notifications) ? data.notifications : [];
    } catch {
      return getUserItem("employee_notifications", []);
    }
  },

  markAllAsRead: async () => {
    try {
      return await request("/notifications/read-all", withBody("PATCH", {}));
    } catch {
      const notifications = getUserItem("employee_notifications", []);
      const updated = notifications.map(n => ({ ...n, unread: false, isRead: true }));
      setUserItem("employee_notifications", updated);
      return { success: true };
    }
  }
};

export default employeeService;
