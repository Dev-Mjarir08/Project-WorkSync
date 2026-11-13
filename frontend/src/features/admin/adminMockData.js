import { getUserItem, setUserItem } from '../../utils/userStorage.js';

export const getScopedBoards = () => {
  return getUserItem('admin_boards', []);
};

export const setScopedBoards = (boards) => {
  setUserItem('admin_boards', boards);
};

export const getScopedActivities = () => {
  return getUserItem('admin_activities', []);
};

export const setScopedActivities = (activities) => {
  setUserItem('admin_activities', activities);
};

export const mockBoards = getScopedBoards();
export const mockActivities = getScopedActivities();

export default {
  getScopedBoards,
  setScopedBoards,
  getScopedActivities,
  setScopedActivities,
  mockBoards,
  mockActivities
};
