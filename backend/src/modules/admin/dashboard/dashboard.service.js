import { Workspace } from '../../../models/Workspace.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';

export const getAdminDashboardMetrics = async (workspaceId) => {
  if (!workspaceId) {
    return {
      membersCount: 0,
      boardsCount: 0,
      tasksCount: 0
    };
  }

  const [membersCount, boardsCount, tasksCount] = await Promise.all([
    WorkspaceMember.countDocuments({ workspace: workspaceId, status: 'active' }),
    Board.countDocuments({ workspace: workspaceId, isArchived: false }),
    Task.countDocuments({ workspace: workspaceId })
  ]);

  return {
    membersCount,
    boardsCount,
    tasksCount
  };
};

