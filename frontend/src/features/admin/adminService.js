import { mockActivities, mockBoards } from './adminMockData';

const adminService = {
  getBoards() {
    return mockBoards;
  },

  createBoard({ title, description, workspace, status, owner, members }) {
    const baseId = title
      .trim()
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'new-board';
    const existingIds = new Set(mockBoards.map((board) => board.id));
    let id = baseId;
    let suffix = 2;

    while (existingIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const board = {
      id,
      title: title.trim(),
      description: description.trim(),
      status,
      workspace,
      owner,
      members: [...new Map([owner, ...members].map((member) => [member.id, member])).values()],
      updatedAt: new Date().toISOString(),
      tasks: [],
    };

    mockBoards.unshift(board);
    return board;
  },

  getBoardById(boardId) {
    return mockBoards.find((board) => board.id === boardId) ?? null;
  },

  getActivities() {
    return mockActivities;
  },
};

export { adminService };

export default adminService;
