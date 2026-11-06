export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  MEMBER: 'member',
  VIEWER: 'viewer'
};

export const WORKSPACE_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
  VIEWER: 'viewer'
};

export const ROLE_VALUES = Object.values(ROLES);
export const WORKSPACE_ROLE_VALUES = Object.values(WORKSPACE_ROLES);

export default ROLES;
