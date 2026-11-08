import { getUserItem, setUserItem } from '../../utils/userStorage.js';

export const getDashboardTasks = () => {
  return getUserItem('admin_tasks', []);
};

export const setDashboardTasks = (tasks) => {
  setUserItem('admin_tasks', tasks);
};

export const getDashboardStats = () => {
  const tasks = getDashboardTasks();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Done' || t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'In progress' || t.status === 'in_progress').length;
  const open = total - completed;

  return [
    {
      id: 'total',
      label: 'Total Tasks',
      value: total,
      change: total > 0 ? '+100%' : '0%',
      description: 'In your active workspace',
      tone: 'bg-[#EAF2FF]',
      iconTone: 'bg-white text-[#3971C6]',
      accent: 'text-[#3971C6]',
    },
    {
      id: 'overdue',
      label: 'In Progress',
      value: inProgress,
      change: inProgress > 0 ? '+100%' : '0%',
      description: 'Currently being executed',
      tone: 'bg-[#FDEBE3]',
      iconTone: 'bg-white text-[#D8794D]',
      accent: 'text-[#C76A3F]',
    },
    {
      id: 'open',
      label: 'Open Tasks',
      value: open,
      change: open > 0 ? '+100%' : '0%',
      description: 'Pending completion',
      tone: 'bg-[#F1EEFF]',
      iconTone: 'bg-white text-[#6542F5]',
      accent: 'text-[#6542F5]',
    },
    {
      id: 'completed',
      label: 'Completed Tasks',
      value: completed,
      change: completed > 0 ? '+100%' : '0%',
      description: 'Successfully finished',
      tone: 'bg-[#E2F5F3]',
      iconTone: 'bg-white text-[#278A8F]',
      accent: 'text-[#278A8F]',
    },
  ];
};

export const dashboardTasks = getDashboardTasks();
export const dashboardStats = getDashboardStats();
export const timelineTasks = [];
export const workloadStatus = [
  { id: 'progress', label: 'Work in Progress', value: 0, color: 'bg-[#6542F5]', textColor: 'text-[#6542F5]' },
  { id: 'completed', label: 'Completed', value: 0, color: 'bg-[#43B6BC]', textColor: 'text-[#278A8F]' },
];
export const sampleTimeSessions = [];

export default {
  getDashboardTasks,
  setDashboardTasks,
  getDashboardStats,
  dashboardTasks,
  dashboardStats,
  timelineTasks,
  workloadStatus,
  sampleTimeSessions,
};
