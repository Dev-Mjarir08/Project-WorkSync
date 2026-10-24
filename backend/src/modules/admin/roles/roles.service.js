import mongoose from 'mongoose';
import { Role } from '../../../models/Role.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const WORKSPACE_PERMISSIONS = [
  { id: 'workspace:view', name: 'View Workspace', category: 'Workspace' },
  { id: 'workspace:edit', name: 'Edit Workspace Info', category: 'Workspace' },
  { id: 'members:view', name: 'View Members', category: 'Members' },
  { id: 'members:invite', name: 'Invite Members', category: 'Members' },
  { id: 'members:manage', name: 'Manage Member Roles', category: 'Members' },
  { id: 'boards:view', name: 'View Boards', category: 'Boards' },
  { id: 'boards:create', name: 'Create Boards', category: 'Boards' },
  { id: 'boards:edit', name: 'Edit Boards', category: 'Boards' },
  { id: 'boards:delete', name: 'Delete Boards', category: 'Boards' },
  { id: 'tasks:create', name: 'Create Tasks', category: 'Tasks' },
  { id: 'tasks:edit', name: 'Edit Tasks', category: 'Tasks' },
  { id: 'tasks:delete', name: 'Delete Tasks', category: 'Tasks' },
  { id: 'tasks:assign', name: 'Assign Tasks', category: 'Tasks' },
  { id: 'projects:manage', name: 'Manage Projects', category: 'Projects' }
];

export const getWorkspaceRoles = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  // Return workspace built-in system roles + custom roles created for this workspace
  const roles = await Role.find({
    $or: [
      { workspace: wsId },
      { workspace: null, slug: { $in: ['admin', 'manager', 'member', 'viewer'] } }
    ]
  }).sort({ isSystemRole: -1, createdAt: 1 }).lean();

  // Count active members in this workspace per role
  const memberCounts = await WorkspaceMember.aggregate([
    { $match: { workspace: wsId, status: 'active' } },
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  memberCounts.forEach(c => {
    if (c._id) countMap[c._id.toLowerCase()] = c.count;
  });

  return roles.map(r => ({
    id: r._id.toString(),
    name: r.name,
    slug: r.slug,
    description: r.description || '',
    isSystemRole: r.isSystemRole || false,
    permissions: r.permissions || [],
    membersCount: countMap[r.slug.toLowerCase()] || 0,
    isCustom: !!r.workspace,
    createdAt: r.createdAt
  }));
};

export const getWorkspaceRoleById = async (workspaceId, roleIdentifier) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  let role = null;
  if (mongoose.Types.ObjectId.isValid(roleIdentifier)) {
    role = await Role.findById(roleIdentifier);
  }
  if (!role) {
    role = await Role.findOne({
      slug: roleIdentifier.toLowerCase(),
      $or: [{ workspace: workspaceId }, { workspace: null }]
    });
  }

  if (!role || role.slug === 'super_admin') {
    throw new ApiError(404, 'Workspace role not found');
  }

  return {
    id: role._id.toString(),
    name: role.name,
    slug: role.slug,
    description: role.description || '',
    isSystemRole: role.isSystemRole || false,
    permissions: role.permissions || [],
    isCustom: !!role.workspace,
    createdAt: role.createdAt
  };
};

export const createCustomWorkspaceRole = async (workspaceId, { name, slug, description = '', permissions = [] }, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const cleanName = name.trim();
  const roleSlug = (slug || cleanName.toLowerCase().replace(/[^a-z0-9_]+/g, '_')).replace(/^_+|_+$/g, '');

  if (['super_admin', 'owner', 'admin'].includes(roleSlug)) {
    throw new ApiError(400, `Cannot create reserved system role name: ${roleSlug}`);
  }

  const existing = await Role.findOne({ slug: roleSlug, workspace: wsId });
  if (existing) {
    throw new ApiError(409, `A role with slug '${roleSlug}' already exists in this workspace`);
  }

  const newRole = await Role.create({
    name: cleanName,
    slug: roleSlug,
    description,
    workspace: wsId,
    isSystemRole: false,
    permissions,
    createdBy: actorUser?._id
  });

  await Activity.create({
    workspace: workspaceId,
    user: actorUser?._id,
    action: 'ROLE_CREATED',
    entityType: 'role',
    entityName: newRole.name,
    details: `Created custom workspace role: ${newRole.name}`
  }).catch(() => {});

  return {
    id: newRole._id.toString(),
    name: newRole.name,
    slug: newRole.slug,
    description: newRole.description,
    permissions: newRole.permissions,
    isCustom: true,
    createdAt: newRole.createdAt
  };
};

export const updateCustomWorkspaceRole = async (workspaceId, roleIdentifier, { name, description, permissions }, actorUser) => {
  let role = await Role.findOne({
    _id: mongoose.Types.ObjectId.isValid(roleIdentifier) ? roleIdentifier : null,
    workspace: workspaceId
  });

  if (!role) {
    role = await Role.findOne({ slug: roleIdentifier.toLowerCase(), workspace: workspaceId });
  }

  if (!role) {
    throw new ApiError(404, 'Custom workspace role not found or role is system-protected');
  }

  if (name !== undefined) role.name = name.trim();
  if (description !== undefined) role.description = description.trim();
  if (permissions !== undefined) role.permissions = permissions;

  await role.save();
  return role;
};

export const deleteCustomWorkspaceRole = async (workspaceId, roleIdentifier, actorUser) => {
  let role = await Role.findOne({
    _id: mongoose.Types.ObjectId.isValid(roleIdentifier) ? roleIdentifier : null,
    workspace: workspaceId
  });

  if (!role) {
    role = await Role.findOne({ slug: roleIdentifier.toLowerCase(), workspace: workspaceId });
  }

  if (!role) {
    throw new ApiError(404, 'Custom workspace role not found (protected system roles cannot be deleted)');
  }

  if (role.isSystemRole || !role.workspace) {
    throw new ApiError(400, 'Protected: System roles cannot be deleted');
  }

  const assignedCount = await WorkspaceMember.countDocuments({ workspace: workspaceId, role: role.slug });
  if (assignedCount > 0) {
    throw new ApiError(400, `Cannot delete role '${role.name}' because ${assignedCount} active member(s) hold this role`);
  }

  await Role.findByIdAndDelete(role._id);

  return {
    id: role._id.toString(),
    name: role.name,
    deleted: true
  };
};

export const getAvailablePermissions = () => {
  return {
    total: WORKSPACE_PERMISSIONS.length,
    permissions: WORKSPACE_PERMISSIONS
  };
};

export const getRolePermissions = async (workspaceId, roleIdentifier) => {
  const role = await getWorkspaceRoleById(workspaceId, roleIdentifier);
  return {
    roleId: role.id,
    roleSlug: role.slug,
    permissions: role.permissions
  };
};

export const updateRolePermissions = async (workspaceId, roleIdentifier, permissions, actorUser) => {
  const role = await getWorkspaceRoleById(workspaceId, roleIdentifier);

  if (role.slug === 'owner') {
    throw new ApiError(400, 'Owner role permissions are unrestricted and cannot be reduced');
  }

  const updatedDoc = await Role.findByIdAndUpdate(
    role.id,
    { permissions },
    { new: true }
  );

  return {
    id: updatedDoc._id.toString(),
    role: updatedDoc.slug,
    permissions: updatedDoc.permissions
  };
};
