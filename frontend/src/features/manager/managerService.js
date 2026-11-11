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

  // 7. Reports
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

  // 8. Activities & Comments
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
  }
};

export default managerService;
