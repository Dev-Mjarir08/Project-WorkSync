import mongoose from 'mongoose';
import { Role } from '../../../models/Role.js';
import { User } from '../../../models/User.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { ApiError } from '../../../utils/ApiError.js';
import { PERMISSION_LIST } from '../../../constants/permissions.js';

export const AVAILABLE_PERMISSIONS = [
  { id: 'users.view', name: 'View Users', description: 'Can view platform users list and profiles', category: 'User Management' },
  { id: 'users.create', name: 'Create Users', description: 'Can create new users directly', category: 'User Management' },
  { id: 'users.edit', name: 'Edit Users', description: 'Can update user profiles and status', category: 'User Management' },
  { id: 'users.delete', name: 'Delete Users', description: 'Can permanently remove users', category: 'User Management' },
  { id: 'users.roles', name: 'Manage Roles', description: 'Can change user platform roles', category: 'User Management' },

  { id: 'workspaces.view', name: 'View Workspaces', description: 'Can view all workspaces', category: 'Workspace Management' },
  { id: 'workspaces.create', name: 'Create Workspaces', description: 'Can provision new workspaces', category: 'Workspace Management' },
  { id: 'workspaces.edit', name: 'Edit Workspaces', description: 'Can update workspace properties', category: 'Workspace Management' },
  { id: 'workspaces.delete', name: 'Delete Workspaces', description: 'Can decommission workspaces', category: 'Workspace Management' },
  { id: 'workspaces.members', name: 'Manage Members', description: 'Can assign or remove workspace members', category: 'Workspace Management' },

  { id: 'boards.view', name: 'View Boards', description: 'Can inspect boards across workspaces', category: 'Board Management' },
  { id: 'boards.edit', name: 'Edit Boards', description: 'Can update and archive boards', category: 'Board Management' },
  { id: 'boards.delete', name: 'Delete Boards', description: 'Can delete boards and contents', category: 'Board Management' },

  { id: 'announcements.manage', name: 'Manage Announcements', description: 'Can draft, publish and archive announcements', category: 'Communications' },
  { id: 'audit.view', name: 'View Audit Logs', description: 'Can review platform security logs', category: 'Security' },
  { id: 'settings.manage', name: 'Manage Settings', description: 'Can adjust platform configuration', category: 'System' },
  { id: 'system.view', name: 'System Diagnostics', description: 'Can view system metrics and health', category: 'System' }
];

const recordAudit = async ({ action, category = 'security', details, actor, target = '', targetId = '', status = 'success' }) => {
  try {
    await AuditLog.create({
      action,
      category,
      details,
      actor: {
        user: actor?._id || actor?.id,
        name: actor?.name || 'Super Admin',
        email: actor?.email || 'admin@worksync.io'
      },
      target,
      targetId: targetId ? targetId.toString() : '',
      status
    });
  } catch (err) {
    console.error('AuditLog error:', err.message);
  }
};

export const ensureSystemRoles = async () => {
  const count = await Role.countDocuments();
  if (count > 0) return;

  const defaultRoles = [
    {
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Platform owner with unrestricted privileges across all organizations',
      isSystemRole: true,
      permissions: AVAILABLE_PERMISSIONS.map(p => p.id)
    },
    {
      name: 'Admin',
      slug: 'admin',
      description: 'Platform administrator with user and workspace management capabilities',
      isSystemRole: true,
      permissions: [
        'users.view', 'users.create', 'users.edit', 'users.roles',
        'workspaces.view', 'workspaces.create', 'workspaces.edit', 'workspaces.members',
        'boards.view', 'boards.edit', 'announcements.manage', 'audit.view', 'system.view'
      ]
    },
    {
      name: 'Manager',
      slug: 'manager',
      description: 'Workspace supervisor managing teams, boards and active deliverables',
      isSystemRole: true,
      permissions: ['workspaces.view', 'workspaces.members', 'boards.view', 'boards.edit']
    },
    {
      name: 'Employee',
      slug: 'employee',
      description: 'Core team member collaborating on project boards and tasks',
      isSystemRole: true,
      permissions: ['workspaces.view', 'boards.view']
    },
    {
      name: 'Member',
      slug: 'member',
      description: 'Standard platform contributor',
      isSystemRole: true,
      permissions: ['workspaces.view', 'boards.view']
    },
    {
      name: 'Viewer',
      slug: 'viewer',
      description: 'Read-only access across platform resources',
      isSystemRole: true,
      permissions: ['workspaces.view']
    }
  ];

  await Role.insertMany(defaultRoles);
};

export const getAllRoles = async () => {
  await ensureSystemRoles();

  const roles = await Role.find().sort({ isSystemRole: -1, createdAt: 1 }).lean();

  const userCounts = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  userCounts.forEach(c => {
    if (c._id) countMap[c._id.toLowerCase()] = c.count;
  });

  return roles.map(r => ({
    id: r._id.toString(),
    name: r.name,
    slug: r.slug,
    description: r.description || '',
    isSystemRole: r.isSystemRole || false,
    permissionsCount: r.permissions ? r.permissions.length : 0,
    permissions: r.permissions || [],
    usersCount: countMap[r.slug.toLowerCase()] || 0,
    createdAt: r.createdAt
  }));
};

export const getRoleById = async (roleIdentifier) => {
  await ensureSystemRoles();

  let role = null;
  if (mongoose.Types.ObjectId.isValid(roleIdentifier)) {
    role = await Role.findById(roleIdentifier);
  }
  if (!role) {
    role = await Role.findOne({ slug: roleIdentifier.toLowerCase() });
  }

  if (!role) {
    throw new ApiError(404, `Platform role not found with identifier: ${roleIdentifier}`);
  }

  const usersCount = await User.countDocuments({ role: role.slug });

  return {
    id: role._id.toString(),
    name: role.name,
    slug: role.slug,
    description: role.description || '',
    isSystemRole: role.isSystemRole || false,
    permissions: role.permissions || [],
    usersCount,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt
  };
};

export const createCustomRole = async ({ name, slug, description = '', permissions = [] }, actorAdmin) => {
  await ensureSystemRoles();

  const cleanName = name.trim();
  const roleSlug = (slug || cleanName.toLowerCase().replace(/[^a-z0-9_]+/g, '_')).replace(/^_+|_+$/g, '');

  const existing = await Role.findOne({ slug: roleSlug });
  if (existing) {
    throw new ApiError(409, `A platform role with slug '${roleSlug}' already exists`);
  }

  const newRole = await Role.create({
    name: cleanName,
    slug: roleSlug,
    description,
    permissions,
    isSystemRole: false,
    createdBy: actorAdmin?._id
  });

  await recordAudit({
    action: 'Platform Role Created',
    details: `Created new custom platform role "${newRole.name}" (${newRole.slug})`,
    actor: actorAdmin,
    target: newRole.slug,
    targetId: newRole._id.toString()
  });

  return {
    id: newRole._id.toString(),
    name: newRole.name,
    slug: newRole.slug,
    description: newRole.description,
    isSystemRole: newRole.isSystemRole,
    permissions: newRole.permissions,
    createdAt: newRole.createdAt
  };
};

export const updateRole = async (roleIdentifier, { name, description, permissions }, actorAdmin) => {
  await ensureSystemRoles();

  let role = null;
  if (mongoose.Types.ObjectId.isValid(roleIdentifier)) {
    role = await Role.findById(roleIdentifier);
  }
  if (!role) {
    role = await Role.findOne({ slug: roleIdentifier.toLowerCase() });
  }

  if (!role) {
    throw new ApiError(404, `Role not found with identifier: ${roleIdentifier}`);
  }

  if (name !== undefined) role.name = name.trim();
  if (description !== undefined) role.description = description.trim();
  if (permissions !== undefined) role.permissions = permissions;

  await role.save();

  await recordAudit({
    action: 'Platform Role Updated',
    details: `Updated role configuration for "${role.name}" (${role.slug})`,
    actor: actorAdmin,
    target: role.slug,
    targetId: role._id.toString()
  });

  return {
    id: role._id.toString(),
    name: role.name,
    slug: role.slug,
    description: role.description,
    isSystemRole: role.isSystemRole,
    permissions: role.permissions,
    updatedAt: role.updatedAt
  };
};

export const deleteCustomRole = async (roleIdentifier, actorAdmin) => {
  await ensureSystemRoles();

  let role = null;
  if (mongoose.Types.ObjectId.isValid(roleIdentifier)) {
    role = await Role.findById(roleIdentifier);
  }
  if (!role) {
    role = await Role.findOne({ slug: roleIdentifier.toLowerCase() });
  }

  if (!role) {
    throw new ApiError(404, `Role not found with identifier: ${roleIdentifier}`);
  }

  if (role.isSystemRole || role.slug === 'super_admin' || role.slug === 'admin') {
    throw new ApiError(400, `Protected Role: System role '${role.name}' cannot be deleted.`);
  }

  const assignedUsers = await User.countDocuments({ role: role.slug });
  if (assignedUsers > 0) {
    throw new ApiError(400, `Cannot delete role '${role.name}' because ${assignedUsers} user(s) currently have this role.`);
  }

  await Role.findByIdAndDelete(role._id);

  await recordAudit({
    action: 'Platform Role Deleted',
    details: `Custom role "${role.name}" was permanently removed`,
    actor: actorAdmin,
    target: role.slug,
    targetId: role._id.toString(),
    status: 'warning'
  });

  return {
    id: role._id.toString(),
    name: role.name,
    slug: role.slug,
    deleted: true
  };
};

export const getAllPermissions = () => {
  return {
    totalPermissions: AVAILABLE_PERMISSIONS.length,
    permissions: AVAILABLE_PERMISSIONS
  };
};

export const updateRolePermissions = async (roleIdentifier, permissions, actorAdmin) => {
  await ensureSystemRoles();

  let role = null;
  if (mongoose.Types.ObjectId.isValid(roleIdentifier)) {
    role = await Role.findById(roleIdentifier);
  }
  if (!role) {
    role = await Role.findOne({ slug: roleIdentifier.toLowerCase() });
  }

  if (!role) {
    throw new ApiError(404, `Role not found with identifier: ${roleIdentifier}`);
  }

  role.permissions = permissions;
  await role.save();

  await recordAudit({
    action: 'Role Permissions Modified',
    details: `Updated permissions array for role "${role.name}" (${permissions.length} active permissions)`,
    actor: actorAdmin,
    target: role.slug,
    targetId: role._id.toString()
  });

  return {
    id: role._id.toString(),
    name: role.name,
    slug: role.slug,
    permissions: role.permissions,
    updatedAt: role.updatedAt
  };
};

