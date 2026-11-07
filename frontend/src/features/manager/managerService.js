const API_BASE_URL = "http://localhost:8081/api/v1/manager";

const request = async (path, options = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    throw new Error(body.message || `Request failed (${response.status})`);
  }

  return body.data;
};

const getList = (data, key, label) => {
  if (!Array.isArray(data?.[key])) {
    throw new Error(`The Manager API returned an invalid ${label} response.`);
  }
  return data[key];
};

const withBody = (method, body) => ({
  method,
  body: JSON.stringify(body),
});

export const managerService = {
  getProjects: async () => {
    const data = await request("/projects");
    return getList(data, "projects", "projects");
  },

  getProjectMembers: async (projectId) => {
    const data = await request(`/projects/${projectId}/members`);
    return getList(data, "members", "project members");
  },

  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.size ? `?${params.toString()}` : "";
    const data = await request(`/tasks${query}`);
    return getList(data, "tasks", "tasks");
  },

  createTask: async (task) => {
    const data = await request("/tasks", withBody("POST", task));
    if (!data?.task) throw new Error("The Manager API did not return the created task.");
    return data.task;
  },

  updateTaskStatus: async (taskId, status) => {
    return request(`/tasks/${taskId}/status`, withBody("PATCH", { status }));
  },

  moveTask: async (taskId, move) => {
    const data = await request(`/tasks/${taskId}/move`, withBody("PATCH", move));
    if (!data?.task) throw new Error("The Manager API did not return the moved task.");
    return data.task;
  },

  getBoard: async (boardId) => {
    const data = await request(`/boards/${boardId}`);
    if (!data?.board) throw new Error("The Manager API did not return the requested board.");
    return data.board;
  },

  getBoardLists: async (boardId) => {
    const data = await request(`/boards/${boardId}/lists`);
    return getList(data, "lists", "board lists");
  },
};

export default managerService;
