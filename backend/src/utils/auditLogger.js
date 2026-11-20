/**
 * Workspace action audit logger helper
 * Provides structured activity tracking for user and administrative operations
 */

const logger = require('./logger');

/**
 * Logs an event to audit storage and console
 * @param {Object} params
 * @param {string} params.workspaceId - Target workspace ID
 * @param {string} params.actorId - User ID triggering the event
 * @param {string} params.action - Action identifier (e.g., 'TASK_CREATED', 'ROLE_UPDATED')
 * @param {string} params.targetType - Type of target entity ('Task', 'User', 'Workspace')
 * @param {string} [params.targetId] - Target entity ID
 * @param {Object} [params.details] - Arbitrary metadata or change diff
 * @param {string} [params.ipAddress] - Request IP
 */
async function logAuditEvent({
  workspaceId,
  actorId,
  action,
  targetType,
  targetId = null,
  details = {},
  ipAddress = 'unknown'
}) {
  const auditEntry = {
    workspaceId,
    actorId,
    action,
    targetType,
    targetId,
    details,
    ipAddress,
    timestamp: new Date()
  };

  try {
    // In production this can be streamed to an AuditLog Mongoose model or external sink
    logger.info(`[AUDIT] Action: ${action} by Actor: ${actorId} on ${targetType}:${targetId || 'N/A'}`);
    return auditEntry;
  } catch (error) {
    logger.error('Failed to record audit event:', error);
    return null;
  }
}

module.exports = {
  logAuditEvent
};
