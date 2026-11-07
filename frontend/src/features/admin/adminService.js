import { getUserItem, setUserItem, getCurrentUser } from '../../utils/userStorage.js';

const adminService = {
  getBoards() {
    return getUserItem('admin_boards', []);
  },

  createBoard({ title, description, workspace, status = 'Planning', owner, members = [] }) {
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
