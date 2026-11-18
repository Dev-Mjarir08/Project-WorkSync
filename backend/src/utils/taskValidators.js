/**
 * Task validation and sanitization utilities
 * Provides schema validation for task creation and lifecycle transitions
 */

const VALID_STATUSES = ['todo', 'in_progress', 'review', 'done', 'cancelled'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

/**
 * Validates task payload for creation and updates
 * @param {Object} taskData 
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateTaskPayload(taskData = {}) {
  const errors = [];

  if (!taskData.title || typeof taskData.title !== 'string' || taskData.title.trim().length === 0) {
    errors.push('Task title is required and cannot be empty.');
  } else if (taskData.title.trim().length > 200) {
    errors.push('Task title cannot exceed 200 characters.');
  }

  if (taskData.status && !VALID_STATUSES.includes(taskData.status)) {
    errors.push(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`);
  }

  if (taskData.priority && !VALID_PRIORITIES.includes(taskData.priority)) {
    errors.push(`Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (taskData.dueDate) {
    const parsedDate = new Date(taskData.dueDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Due date must be a valid ISO date format.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates if a state transition is permitted in the workflow
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
function isValidTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  
  const allowedTransitions = {
    todo: ['in_progress', 'cancelled'],
    in_progress: ['review', 'todo', 'cancelled'],
    review: ['done', 'in_progress'],
    done: ['review', 'in_progress'],
    cancelled: ['todo']
  };

  const targets = allowedTransitions[currentStatus] || [];
  return targets.includes(nextStatus);
}

module.exports = {
  VALID_STATUSES,
  VALID_PRIORITIES,
  validateTaskPayload,
  isValidTransition
};
