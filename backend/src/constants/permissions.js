export const PERMISSIONS = {
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_ROLES: 'users.roles',

  WORKSPACES_VIEW: 'workspaces.view',
  WORKSPACES_CREATE: 'workspaces.create',
  WORKSPACES_EDIT: 'workspaces.edit',
  WORKSPACES_DELETE: 'workspaces.delete',
  WORKSPACES_MEMBERS: 'workspaces.members',

  BOARDS_VIEW: 'boards.view',
  BOARDS_EDIT: 'boards.edit',
  BOARDS_DELETE: 'boards.delete',

  ANNOUNCEMENTS_MANAGE: 'announcements.manage',
  AUDIT_VIEW: 'audit.view',
  SETTINGS_MANAGE: 'settings.manage',
  SYSTEM_VIEW: 'system.view'
};

export const PERMISSION_LIST = Object.values(PERMISSIONS);
export default PERMISSIONS;

