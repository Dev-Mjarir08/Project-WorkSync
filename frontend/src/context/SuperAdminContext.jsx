import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import superAdminService from '../features/super-admin/superAdminService.js';

const SuperAdminContext = createContext(null);

export const SuperAdminProvider = ({ children }) => {
  // 1. Users State
  const [usersState, setUsersState] = useState({
    list: [],
    summary: null,
    totalCount: 0,
    loading: false,
    lastFetched: 0
  });

  // 2. Workspaces State
  const [workspacesState, setWorkspacesState] = useState({
    list: [],
    metrics: null,
    totalCount: 0,
    loading: false,
    lastFetched: 0
  });

  // 3. Boards State
  const [boardsState, setBoardsState] = useState({
    list: [],
    loading: false,
    lastFetched: 0
  });

  // 4. Tasks State
  const [tasksState, setTasksState] = useState({
    list: [],
    statusCounts: { todo: 0, in_progress: 0, review: 0, done: 0 },
    totalCount: 0,
    loading: false,
    lastFetched: 0
  });

  // 5. Global Toast Message
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // =========================================================================
  // USER METHODS
  // =========================================================================
  const loadUsers = useCallback(async (filters = {}, force = false) => {
    setUsersState(prev => ({ ...prev, loading: true }));
    try {
      const data = await superAdminService.getUsers(filters);
      const userList = Array.isArray(data?.users) ? data.users : (Array.isArray(data) ? data : []);
      setUsersState({
        list: userList,
        summary: data?.rolesSummary || null,
        totalCount: data?.totalCount || userList.length,
        loading: false,
        lastFetched: Date.now()
      });
      return userList;
    } catch (err) {
      console.error('SuperAdminContext loadUsers error:', err);
      setUsersState(prev => ({ ...prev, loading: false }));
      return [];
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    try {
      const created = await superAdminService.createUser(userData);
      showToast(`User "${created?.name || userData.name}" provisioned successfully`);
      // Reload users list
      await loadUsers({}, true);
      return created;
    } catch (err) {
      showToast(err.message || 'Failed to create user', 'error');
      throw err;
    }
  }, [loadUsers, showToast]);

  const updateUserRole = useCallback(async (userId, newRole) => {
    try {
      // Optimistic update
      setUsersState(prev => ({
        ...prev,
        list: prev.list.map(u => (u.id === userId || u._id === userId ? { ...u, role: newRole } : u))
      }));
      await superAdminService.updateUserRole(userId, newRole);
      showToast(`User role updated to ${newRole}`);
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
      await loadUsers({}, true);
    }
  }, [loadUsers, showToast]);

  const toggleUserStatus = useCallback(async (userId) => {
    try {
      // Optimistic update
      setUsersState(prev => ({
        ...prev,
        list: prev.list.map(u => (u.id === userId || u._id === userId ? { ...u, isActive: !u.isActive } : u))
      }));
      await superAdminService.toggleUserStatus(userId);
      showToast('User account status updated');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
      await loadUsers({}, true);
    }
  }, [loadUsers, showToast]);

  const deleteUser = useCallback(async (userId, name = 'User') => {
    try {
      setUsersState(prev => ({
        ...prev,
        list: prev.list.filter(u => u.id !== userId && u._id !== userId)
      }));
      await superAdminService.deleteUser(userId);
      showToast(`User "${name}" removed successfully`);
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
      await loadUsers({}, true);
    }
  }, [loadUsers, showToast]);

  // =========================================================================
  // WORKSPACE METHODS
  // =========================================================================
  const loadWorkspaces = useCallback(async (filters = {}, force = false) => {
    setWorkspacesState(prev => ({ ...prev, loading: true }));
    try {
      const data = await superAdminService.getWorkspaces(filters);
      const wsList = Array.isArray(data?.workspaces) ? data.workspaces : (Array.isArray(data) ? data : []);
      setWorkspacesState({
        list: wsList,
        metrics: data?.metrics || null,
        totalCount: data?.totalCount || wsList.length,
        loading: false,
        lastFetched: Date.now()
      });
      return wsList;
    } catch (err) {
      console.error('SuperAdminContext loadWorkspaces error:', err);
      setWorkspacesState(prev => ({ ...prev, loading: false }));
      return [];
    }
  }, []);

  const createWorkspace = useCallback(async (wsData) => {
    try {
      const created = await superAdminService.createWorkspace(wsData);
      showToast(`Workspace "${wsData.name}" provisioned successfully`);
      await loadWorkspaces({}, true);
      return created;
    } catch (err) {
      showToast(err.message || 'Failed to provision workspace', 'error');
      throw err;
    }
  }, [loadWorkspaces, showToast]);

  const toggleWorkspaceStatus = useCallback(async (workspaceId) => {
    try {
      await superAdminService.toggleWorkspaceStatus(workspaceId);
      showToast('Workspace status updated');
      await loadWorkspaces({}, true);
    } catch (err) {
      showToast(err.message || 'Failed to update workspace status', 'error');
    }
  }, [loadWorkspaces, showToast]);

  const deleteWorkspace = useCallback(async (workspaceId, name = 'Workspace') => {
    try {
      setWorkspacesState(prev => ({
        ...prev,
        list: prev.list.filter(w => w.id !== workspaceId && w._id !== workspaceId)
      }));
      await superAdminService.deleteWorkspace(workspaceId);
      showToast(`Workspace "${name}" removed`);
    } catch (err) {
      showToast(err.message || 'Failed to delete workspace', 'error');
      await loadWorkspaces({}, true);
    }
  }, [loadWorkspaces, showToast]);

  // =========================================================================
  // BOARDS METHODS
  // =========================================================================
  const loadBoards = useCallback(async (filters = {}, force = false) => {
    setBoardsState(prev => ({ ...prev, loading: true }));
    try {
      const data = await superAdminService.getBoards(filters);
      const boardsList = Array.isArray(data?.boards) ? data.boards : (Array.isArray(data) ? data : []);
      setBoardsState({
        list: boardsList,
        loading: false,
        lastFetched: Date.now()
      });
      return boardsList;
    } catch (err) {
      console.error('SuperAdminContext loadBoards error:', err);
      setBoardsState(prev => ({ ...prev, loading: false }));
      return [];
    }
  }, []);

  // =========================================================================
  // TASK METHODS (WITH OPTIMISTIC DRAG & DROP UPDATES)
  // =========================================================================
  const loadTasks = useCallback(async (filters = {}, force = false) => {
    setTasksState(prev => ({ ...prev, loading: true }));
    try {
      const data = await superAdminService.getAllTasks(filters);
      const taskList = Array.isArray(data?.tasks) ? data.tasks : [];
      setTasksState({
        list: taskList,
        statusCounts: data?.statusCounts || { todo: 0, in_progress: 0, review: 0, done: 0 },
        totalCount: data?.totalCount || taskList.length,
        loading: false,
        lastFetched: Date.now()
      });
      return taskList;
    } catch (err) {
      console.error('SuperAdminContext loadTasks error:', err);
      setTasksState(prev => ({ ...prev, loading: false }));
      return [];
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    try {
      const created = await superAdminService.createTask(taskData);
      showToast(`Task "${created.title}" created successfully`);
      await loadTasks({}, true);
      return created;
    } catch (err) {
      showToast(err.message || 'Failed to create task', 'error');
      throw err;
    }
  }, [loadTasks, showToast]);

  const updateTaskStatus = useCallback(async (taskId, newStatus) => {
    // 1. Instant Optimistic UI Update for silky smooth Drag-and-Drop!
    setTasksState(prev => {
      const updatedList = prev.list.map(t => {
        if (t.id === taskId || t._id === taskId) {
          return { ...t, status: newStatus };
        }
        return t;
      });

      const newCounts = { todo: 0, in_progress: 0, review: 0, done: 0 };
      updatedList.forEach(t => {
        if (newCounts[t.status] !== undefined) newCounts[t.status]++;
      });

      return {
        ...prev,
        list: updatedList,
        statusCounts: newCounts
      };
    });

    // 2. Perform API update in background
    try {
      await superAdminService.updateTaskStatus(taskId, newStatus);
    } catch (err) {
      showToast(err.message || 'Failed to update task status on server', 'error');
      // Rollback on failure
      await loadTasks({}, true);
    }
  }, [loadTasks, showToast]);

  const assignTask = useCallback(async (taskId, assigneeId, assigneeUser = null) => {
    // Optimistic assignment
    setTasksState(prev => ({
      ...prev,
      list: prev.list.map(t => {
        if (t.id === taskId || t._id === taskId) {
          return {
            ...t,
            assignee: assigneeUser ? {
              id: assigneeUser.id || assigneeUser._id,
              _id: assigneeUser.id || assigneeUser._id,
              name: assigneeUser.name,
              email: assigneeUser.email,
              avatar: assigneeUser.avatar,
              role: assigneeUser.role
            } : null
          };
        }
        return t;
      })
    }));

    try {
      const updated = await superAdminService.assignTask(taskId, assigneeId);
      showToast(assigneeId ? 'Task assigned successfully' : 'Task unassigned');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to assign task', 'error');
      await loadTasks({}, true);
    }
  }, [loadTasks, showToast]);

  const deleteTask = useCallback(async (taskId, title = 'Task') => {
    try {
      setTasksState(prev => ({
        ...prev,
        list: prev.list.filter(t => t.id !== taskId && t._id !== taskId)
      }));
      await superAdminService.deleteTask(taskId);
      showToast(`Task "${title}" deleted`);
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
      await loadTasks({}, true);
    }
  }, [loadTasks, showToast]);

  const value = useMemo(() => ({
    usersState,
    workspacesState,
    boardsState,
    tasksState,
    toast,
    showToast,
    loadUsers,
    createUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    loadWorkspaces,
    createWorkspace,
    toggleWorkspaceStatus,
    deleteWorkspace,
    loadBoards,
    loadTasks,
    createTask,
    updateTaskStatus,
    assignTask,
    deleteTask
  }), [
    usersState,
    workspacesState,
    boardsState,
    tasksState,
    toast,
    showToast,
    loadUsers,
    createUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    loadWorkspaces,
    createWorkspace,
    toggleWorkspaceStatus,
    deleteWorkspace,
    loadBoards,
    loadTasks,
    createTask,
    updateTaskStatus,
    assignTask,
    deleteTask
  ]);

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
};

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};

export default SuperAdminContext;
