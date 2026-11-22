/**
 * Sprint analytics and performance velocity calculations
 */

/**
 * Calculates sprint completion rate and percentage
 * @param {Array} tasks
 * @returns {{ total: number, completed: number, percentage: number }}
 */
export function calculateSprintMetrics(tasks = []) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { total: 0, completed: 0, percentage: 0 };
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'done').length;
  const percentage = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    percentage
  };
}

/**
 * Generates burndown data points from a set of tasks across a day count
 * @param {Array} tasks
 * @param {number} sprintDays
 * @returns {Array<{ day: string, ideal: number, actual: number }>}
 */
export function generateBurndownPoints(tasks = [], sprintDays = 14) {
  const totalPoints = tasks.length;
  const decrementPerDay = totalPoints / sprintDays;

  return Array.from({ length: sprintDays + 1 }, (_, index) => {
    const ideal = Math.max(0, Math.round(totalPoints - (index * decrementPerDay)));
    // Simulating actual trajectory based on currently completed tasks
    const completedSoFar = tasks.filter(
      (t) => t.status === 'done' && (!t.completedAt || new Date(t.completedAt) <= new Date(Date.now() - (sprintDays - index) * 86400000))
    ).length;

    const actual = Math.max(0, totalPoints - completedSoFar);

    return {
      day: `Day ${index}`,
      ideal,
      actual
    };
  });
}

/**
 * Computes cycle time (in hours) between creation and completion
 * @param {string|Date} createdAt
 * @param {string|Date} completedAt
 * @returns {number|null}
 */
export function computeCycleTimeHours(createdAt, completedAt) {
  if (!createdAt || !completedAt) return null;
  const start = new Date(createdAt).getTime();
  const end = new Date(completedAt).getTime();
  if (isNaN(start) || isNaN(end) || end < start) return null;
  return Math.round((end - start) / (1000 * 60 * 60) * 10) / 10;
}
