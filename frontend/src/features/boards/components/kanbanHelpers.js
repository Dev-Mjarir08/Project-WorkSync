/**
 * Helper utilities for Kanban board presentation, grouping, and styling
 */

export const KANBAN_LANES = [
  { id: 'todo', title: 'To Do', accent: 'border-slate-500', badge: 'bg-slate-500/10 text-slate-400' },
  { id: 'in_progress', title: 'In Progress', accent: 'border-blue-500', badge: 'bg-blue-500/10 text-blue-400' },
  { id: 'review', title: 'In Review', accent: 'border-amber-500', badge: 'bg-amber-500/10 text-amber-400' },
  { id: 'done', title: 'Completed', accent: 'border-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400' }
];

/**
 * Groups an array of tasks into lane buckets
 * @param {Array} tasks
 * @returns {Record<string, Array>}
 */
export function groupTasksByLane(tasks = []) {
  const lanes = {
    todo: [],
    in_progress: [],
    review: [],
    done: []
  };

  tasks.forEach((task) => {
    const status = task.status || 'todo';
    if (lanes[status]) {
      lanes[status].push(task);
    } else {
      lanes.todo.push(task);
    }
  });

  return lanes;
}

/**
 * Returns Tailwind color classes corresponding to task priority
 * @param {string} priority
 * @returns {string}
 */
export function getPriorityBadgeClass(priority = 'medium') {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    case 'high':
      return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
    case 'medium':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'low':
    default:
      return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
  }
}

/**
 * Reorders items in a list after drag-and-drop
 * @param {Array} list
 * @param {number} startIndex
 * @param {number} endIndex
 * @returns {Array}
 */
export function reorderList(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
