export const dashboardStats = [
  {
    id: 'total',
    label: 'Total Tasks',
    value: 86,
    change: '+12.5%',
    description: 'Compared with last month',
    tone: 'bg-[#EAF2FF]',
    iconTone: 'bg-white text-[#3971C6]',
    accent: 'text-[#3971C6]',
  },
  {
    id: 'overdue',
    label: 'Overdue Tasks',
    value: 25,
    change: '+4.8%',
    description: 'Need attention this week',
    tone: 'bg-[#FDEBE3]',
    iconTone: 'bg-white text-[#D8794D]',
    accent: 'text-[#C76A3F]',
  },
  {
    id: 'open',
    label: 'Open Tasks',
    value: 40,
    change: '+8.2%',
    description: 'Across active projects',
    tone: 'bg-[#F1EEFF]',
    iconTone: 'bg-white text-[#6542F5]',
    accent: 'text-[#6542F5]',
  },
  {
    id: 'completed',
    label: 'Completed Tasks',
    value: 22,
    change: '+15.3%',
    description: 'Completed this month',
    tone: 'bg-[#E2F5F3]',
    iconTone: 'bg-white text-[#278A8F]',
    accent: 'text-[#278A8F]',
  },
];

export const timelineTasks = [
  { id: 'timeline-meeting', title: 'Conduct Team Meeting', start: '07:30', end: '09:00', category: 'meeting' },
  { id: 'timeline-emails', title: 'Client Emails', start: '09:00', end: '10:00', category: 'focus' },
  { id: 'timeline-presentations', title: 'Finalize Presentations', start: '10:15', end: '12:00', category: 'design' },
  { id: 'timeline-review', title: 'Design Review', start: '14:00', end: '16:00', category: 'meeting' },
  { id: 'timeline-planning', title: 'Sprint Planning', start: '16:30', end: '17:30', category: 'focus' },
];

export const workloadStatus = [
  { id: 'progress', label: 'Work in Progress', value: 44, color: 'bg-[#6542F5]', textColor: 'text-[#6542F5]' },
  { id: 'completed', label: 'Completed', value: 46, color: 'bg-[#43B6BC]', textColor: 'text-[#278A8F]' },
];

export const dashboardTasks = [
  { id: 'dash-1', title: 'Build workspace overview', priority: 'High', startDate: '2026-10-20', dueDate: '2026-10-27', status: 'In progress', assigneeIds: ['Deevanshi', 'Jarir'], workspace: 'Product', boardId: 'atlas-web' },
  { id: 'dash-2', title: 'Review keyboard navigation', priority: 'Medium', startDate: '2026-10-21', dueDate: '2026-10-29', status: 'In progress', assigneeIds: ['Jarir'], workspace: 'Product', boardId: 'atlas-web' },
  { id: 'dash-3', title: 'Prepare release notes', priority: 'Low', startDate: '2026-10-23', dueDate: '2026-11-02', status: 'To do', assigneeIds: ['Gap'], workspace: 'Product', boardId: 'atlas-web' },
  { id: 'dash-4', title: 'Design project summary', priority: 'High', startDate: '2026-10-19', dueDate: '2026-10-28', status: 'In progress', assigneeIds: ['Jarir', 'Mohammed'], workspace: 'Customer Success', boardId: 'client-portal' },
  { id: 'dash-5', title: 'Gather customer feedback', priority: 'Medium', startDate: '2026-10-12', dueDate: '2026-10-16', status: 'Done', assigneeIds: ['Abdul Rouhan'], workspace: 'Customer Success', boardId: 'client-portal' },
  { id: 'dash-6', title: 'Prioritize offline support', priority: 'High', startDate: '2026-10-22', dueDate: '2026-11-05', status: 'To do', assigneeIds: ['Mohammed'], workspace: 'Product', boardId: 'mobile-app' },
  { id: 'dash-7', title: 'Publish help center guide', priority: 'Medium', startDate: '2026-10-13', dueDate: '2026-10-15', status: 'Done', assigneeIds: ['Gap', 'Abdul Rouhan'], workspace: 'Operations', boardId: 'launch-ops' },
  { id: 'dash-8', title: 'Define color foundations', priority: 'High', startDate: '2026-10-21', dueDate: '2026-11-07', status: 'To do', assigneeIds: ['Mohammed', 'Gap'], workspace: 'Marketing', boardId: 'brand-system' },
  { id: 'dash-9', title: 'Draft component guidelines', priority: 'Low', startDate: '2026-10-24', dueDate: '2026-11-12', status: 'To do', assigneeIds: ['Deevanshi'], workspace: 'Marketing', boardId: 'brand-system' },
];

export const sampleTimeSessions = [
  { id: 'history-1', title: 'Workspace overview', durationMs: 64 * 60 * 1000, date: 'Today' },
  { id: 'history-2', title: 'Customer feedback review', durationMs: 42 * 60 * 1000, date: 'Yesterday' },
];
