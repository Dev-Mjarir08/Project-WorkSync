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

const withQuery = (path, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `${path}?${query}` : path;
};

export const managerService = {
  getDashboardOverview: () => request("/dashboard"),
  getDashboardStats: () => request("/dashboard/stats"),
  getDashboardProjects: async () => {
    const data = await request("/dashboard/my-projects");
    return getList(data, "projects", "dashboard projects");
  },
  getDashboardTaskOverview: () => request("/dashboard/task-overview"),
  getDashboardRecentTasks: async (filters = {}) => {
    const data = await request(withQuery("/dashboard/recent-tasks", filters));
    return getList(data, "tasks", "dashboard tasks");
  },
  getDashboardOverdueTasks: async () => {
    const data = await request("/dashboard/overdue-tasks");
    return getList(data, "tasks", "dashboard overdue tasks");
  },
  getDashboardRecentActivities: async (filters = {}) => {
    const data = await request(withQuery("/dashboard/recent-activities", filters));
    return getList(data, "activities", "dashboard activities");
  },
  getDashboardTeamPerformance: async () => {
    const data = await request("/dashboard/team-performance");
    return getList(data, "teamPerformance", "dashboard team performance");
  },
  getDashboardUpcomingDeadlines: async (filters = {}) => {
    const data = await request(withQuery("/dashboard/upcoming-deadlines", filters));
    return getList(data, "upcomingDeadlines", "dashboard deadlines");
  },

  getProjects: async () => {
    const data = await request("/projects");
    return getList(data, "projects", "projects");
  },

  createProject: async (project) => {
    const data = await request("/projects", withBody("POST", project));
    if (!data?.project) throw new Error("The Manager API did not return the created project.");
    return data.project;
  },

  getProjectMembers: async (projectId) => {
    const data = await request(`/projects/${projectId}/members`);
    return getList(data, "members", "project members");
  },

  getProject: async (projectId) => {
    const data = await request(`/projects/${projectId}`);
    if (!data?.project) throw new Error("The Manager API did not return the requested project.");
    return data.project;
  },

  updateProject: async (projectId, updates) => {
    const data = await request(`/projects/${projectId}`, withBody("PATCH", updates));
    if (!data?.project) throw new Error("The Manager API did not return the updated project.");
    return data.project;
  },

  getProjectBoards: async (projectId) => {
    const data = await request(`/projects/${projectId}/boards`);
    return getList(data, "boards", "project boards");
  },

  getProjectActivities: async (projectId) => {
    const data = await request(`/projects/${projectId}/activities`);
    return getList(data, "activities", "project activities");
  },

  deleteProject: (projectId) => request(`/projects/${projectId}`, { method: "DELETE" }),

  updateProjectStatus: (projectId, status) =>
    request(`/projects/${projectId}/status`, withBody("PATCH", { status })),

  updateProjectPriority: (projectId, priority) =>
    request(`/projects/${projectId}/priority`, withBody("PATCH", { priority })),

  addProjectMembers: async (projectId, memberIds) => {
    const data = await request(`/projects/${projectId}/members`, withBody("POST", { memberIds }));
    return getList(data, "members", "updated project members");
  },

  removeProjectMember: (projectId, memberId) =>
    request(`/projects/${projectId}/members/${memberId}`, { method: "DELETE" }),

  getTasks: async (filters = {}) => {
    const data = await request(withQuery("/tasks", filters));
    return getList(data, "tasks", "tasks");
  },

  getOverdueTasks: async () => {
    const data = await request("/tasks/overdue");
    return getList(data, "tasks", "overdue tasks");
  },

  getUnassignedTasks: async () => {
    const data = await request("/tasks/unassigned");
    return getList(data, "tasks", "unassigned tasks");
  },

  getCompletedTasks: async () => {
    const data = await request("/tasks/completed");
    return getList(data, "tasks", "completed tasks");
  },

  createTask: async (task) => {
    const data = await request("/tasks", withBody("POST", task));
    if (!data?.task) throw new Error("The Manager API did not return the created task.");
    return data.task;
  },

  updateTaskStatus: async (taskId, status) => {
    return request(`/tasks/${taskId}/status`, withBody("PATCH", { status }));
  },

  getTask: async (taskId) => {
    const data = await request(`/tasks/${taskId}`);
    if (!data?.task) throw new Error("The Manager API did not return the requested task.");
    return data.task;
  },

  updateTask: async (taskId, updates) => {
    const data = await request(`/tasks/${taskId}`, withBody("PATCH", updates));
    if (!data?.task) throw new Error("The Manager API did not return the updated task.");
    return data.task;
  },

  deleteTask: (taskId) => request(`/tasks/${taskId}`, { method: "DELETE" }),

  updateTaskPriority: (taskId, priority) =>
    request(`/tasks/${taskId}/priority`, withBody("PATCH", { priority })),

  updateTaskDueDate: (taskId, dueDate) =>
    request(`/tasks/${taskId}/due-date`, withBody("PATCH", { dueDate })),

  getTaskActivities: async (taskId) => {
    const data = await request(`/tasks/${taskId}/activities`);
    return getList(data, "activities", "task activities");
  },

  getTaskComments: (taskId, filters = {}) =>
    request(withQuery(`/tasks/${taskId}/comments`, filters)),

  addTaskComment: async (taskId, content) => {
    const data = await request(`/tasks/${taskId}/comments`, withBody("POST", { content }));
    if (!data?.comment) throw new Error("The Manager API did not return the created comment.");
    return data.comment;
  },

  getComment: async (commentId) => {
    const data = await request(`/comments/${commentId}`);
    if (!data?.comment) throw new Error("The Manager API did not return the requested comment.");
    return data.comment;
  },

  updateComment: async (commentId, content) => {
    const data = await request(`/comments/${commentId}`, withBody("PATCH", { content }));
    if (!data?.comment) throw new Error("The Manager API did not return the updated comment.");
    return data.comment;
  },

  deleteComment: (commentId) => request(`/comments/${commentId}`, { method: "DELETE" }),

  addCommentReply: async (commentId, content) => {
    const data = await request(`/comments/${commentId}/replies`, withBody("POST", { content }));
    if (!data?.reply) throw new Error("The Manager API did not return the created reply.");
    return data.reply;
  },

  getCommentReplies: (commentId) => request(`/comments/${commentId}/replies`),

  addTaskCommentReply: async (taskId, commentId, content) => {
    const data = await request(
      `/tasks/${taskId}/comments/${commentId}/replies`,
      withBody("POST", { content })
    );
    if (!data?.reply) throw new Error("The Manager API did not return the created reply.");
    return data.reply;
  },

  getTaskCommentReplies: (taskId, commentId) =>
    request(`/tasks/${taskId}/comments/${commentId}/replies`),

  moveTask: async (taskId, move) => {
    const data = await request(`/tasks/${taskId}/move`, withBody("PATCH", move));
    if (!data?.task) throw new Error("The Manager API did not return the moved task.");
    return data.task;
  },

  getBoards: async (filters = {}) => {
    const data = await request(withQuery("/boards", filters));
    return getList(data, "boards", "boards");
  },

  createBoard: async (board) => {
    const data = await request("/boards", withBody("POST", board));
    if (!data?.board) throw new Error("The Manager API did not return the created board.");
    return data.board;
  },

  getBoard: async (boardId) => {
    const data = await request(`/boards/${boardId}`);
    if (!data?.board) throw new Error("The Manager API did not return the requested board.");
    return data.board;
  },

  updateBoard: async (boardId, updates) => {
    const data = await request(`/boards/${boardId}`, withBody("PATCH", updates));
    if (!data?.board) throw new Error("The Manager API did not return the updated board.");
    return data.board;
  },

  deleteBoard: (boardId) => request(`/boards/${boardId}`, { method: "DELETE" }),

  updateBoardStatus: (boardId, isArchived) =>
    request(`/boards/${boardId}/status`, withBody("PATCH", { isArchived })),

  getBoardMembers: async (boardId) => {
    const data = await request(`/boards/${boardId}/members`);
    return getList(data, "members", "board members");
  },

  addBoardMember: async (boardId, member) => {
    const data = await request(`/boards/${boardId}/members`, withBody("POST", member));
    return getList(data, "members", "updated board members");
  },

  removeBoardMember: (boardId, memberId) =>
    request(`/boards/${boardId}/members/${memberId}`, { method: "DELETE" }),

  getBoardActivities: async (boardId) => {
    const data = await request(`/boards/${boardId}/activities`);
    return getList(data, "activities", "board activities");
  },

  getBoardLists: async (boardId) => {
    const data = await request(`/boards/${boardId}/lists`);
    return getList(data, "lists", "board lists");
  },

  createBoardList: async (boardId, list) => {
    const data = await request(`/boards/${boardId}/lists`, withBody("POST", list));
    if (!data?.list) throw new Error("The Manager API did not return the created list.");
    return data.list;
  },

  getList: async (listId) => {
    const data = await request(`/lists/${listId}`);
    if (!data?.list) throw new Error("The Manager API did not return the requested list.");
    return data.list;
  },

  updateList: async (listId, updates) => {
    const data = await request(`/lists/${listId}`, withBody("PATCH", updates));
    if (!data?.list) throw new Error("The Manager API did not return the updated list.");
    return data.list;
  },

  deleteList: (listId) => request(`/lists/${listId}`, { method: "DELETE" }),

  updateListPosition: async (listId, position) => {
    const data = await request(`/lists/${listId}/position`, withBody("PATCH", { position }));
    if (!data?.list) throw new Error("The Manager API did not return the updated list position.");
    return data.list;
  },

  getListTasks: async (listId) => {
    const data = await request(`/lists/${listId}/tasks`);
    return getList(data, "tasks", "list tasks");
  },

  getTeamMembers: (filters = {}) => request(withQuery("/team", filters)),
  getTeamWorkload: () => request("/team/workload"),
  getTeamPerformance: () => request("/team/performance"),
  getTeamAvailability: () => request("/team/availability"),

  getTeamMember: async (memberId) => {
    const data = await request(`/team/${memberId}`);
    if (!data?.member) throw new Error("The Manager API did not return the requested member.");
    return data.member;
  },

  getTeamMemberTasks: (memberId, filters = {}) =>
    request(withQuery(`/team/${memberId}/tasks`, filters)),
  getTeamMemberProjects: (memberId) => request(`/team/${memberId}/projects`),
  getTeamMemberActivities: (memberId, filters = {}) =>
    request(withQuery(`/team/${memberId}/activities`, filters)),
  getTeamMemberWorkload: async (memberId) => {
    const data = await request(`/team/${memberId}/workload`);
    if (!data?.workload) throw new Error("The Manager API did not return member workload.");
    return data.workload;
  },

  getActivities: (filters = {}) => request(withQuery("/activities", filters)),
  getActivity: async (activityId) => {
    const data = await request(`/activities/${activityId}`);
    if (!data?.activity) throw new Error("The Manager API did not return the requested activity.");
    return data.activity;
  },
  getProjectActivitiesFeed: (projectId, filters = {}) =>
    request(withQuery(`/activities/projects/${projectId}`, filters)),
  getBoardActivitiesFeed: (boardId, filters = {}) =>
    request(withQuery(`/activities/boards/${boardId}`, filters)),
  getTaskActivitiesFeed: (taskId, filters = {}) =>
    request(withQuery(`/activities/tasks/${taskId}`, filters)),
  getMemberActivitiesFeed: (memberId, filters = {}) =>
    request(withQuery(`/activities/members/${memberId}`, filters)),

  getNotifications: (filters = {}) => request(withQuery("/notifications", filters)),
  getUnreadNotifications: (filters = {}) =>
    request(withQuery("/notifications/unread", filters)),
  markNotificationAsRead: (notificationId) =>
    request(`/notifications/${notificationId}/read`, { method: "PATCH" }),
  markAllNotificationsAsRead: () =>
    request("/notifications/read-all", { method: "PATCH" }),
  deleteNotification: (notificationId) =>
    request(`/notifications/${notificationId}`, { method: "DELETE" }),
  getNotificationSettings: async () => {
    const data = await request("/notifications/settings");
    if (!data?.settings) throw new Error("The Manager API did not return notification settings.");
    return data.settings;
  },
  updateNotificationSettings: async (settings) => {
    const data = await request("/notifications/settings", withBody("PATCH", settings));
    if (!data?.settings) throw new Error("The Manager API did not return updated notification settings.");
    return data.settings;
  },
  getTopLevelNotificationSettings: async () => {
    const data = await request("/notification-settings");
    if (!data?.settings) throw new Error("The Manager API did not return notification settings.");
    return data.settings;
  },
  updateTopLevelNotificationSettings: async (settings) => {
    const data = await request("/notification-settings", withBody("PATCH", settings));
    if (!data?.settings) throw new Error("The Manager API did not return updated notification settings.");
    return data.settings;
  },

  getProfile: async () => {
    const data = await request("/profile");
    if (!data?.profile) throw new Error("The Manager API did not return the profile.");
    return data.profile;
  },
  updateProfile: async (updates) => {
    const data = await request("/profile", withBody("PATCH", updates));
    if (!data?.profile) throw new Error("The Manager API did not return the updated profile.");
    return data.profile;
  },
  updateAvatar: (avatar) =>
    request("/profile/avatar", withBody("PATCH", { avatar })),
  changePassword: (passwordData) =>
    request("/profile/change-password", withBody("PATCH", passwordData)),
  getSessions: () => request("/profile/sessions"),
  revokeSession: (sessionId) =>
    request(`/profile/sessions/${sessionId}`, { method: "DELETE" }),

  getReportsOverview: () => request("/reports/overview"),

  getProjectReports: async (filters = {}) => {
    const data = await request(withQuery("/reports/projects", filters));
    return getList(data, "projects", "project reports");
  },

  getTaskReports: (filters = {}) =>
    request(withQuery("/reports/tasks", filters)),

  getCompletedTaskReports: (filters = {}) =>
    request(withQuery("/reports/completed-tasks", filters)),

  getOverdueTaskReports: (filters = {}) =>
    request(withQuery("/reports/overdue-tasks", filters)),

  getTeamPerformanceReports: async () => {
    const data = await request("/reports/team-performance");
    return getList(data, "performance", "team performance reports");
  },

  getWorkloadReports: () => request("/reports/workload"),

  getProductivityReports: async (filters = {}) => {
    const data = await request(withQuery("/reports/productivity", filters));
    return getList(data, "productivityTrends", "productivity reports");
  },

  getActivityReports: (filters = {}) =>
    request(withQuery("/reports/activity", filters)),

  getBurndownReports: (filters = {}) =>
    request(withQuery("/reports/burndown", filters)),

  getReportsExport: (filters = {}) =>
    request(withQuery("/reports/export", filters)),
};

export default managerService;
