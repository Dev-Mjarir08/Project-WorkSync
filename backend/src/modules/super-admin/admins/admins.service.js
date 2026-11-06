import mongoose from 'mongoose';
import { Workspace } from '../../../models/Workspace.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { User } from '../../../models/User.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { ApiError } from '../../../utils/ApiError.js';
import { resolveWorkspaceDoc } from '../workspaces/workspaces.service.js';

const recordAudit = async ({ action, category = 'workspace', details, actor, target = '', targetId = '', status = 'success' }) => {
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

export const getAllWorkspaceAdmins = async () => {
  const admins = await WorkspaceMember.find({ role: { $in: ['admin', 'owner'] } })
    .populate('user', 'name email avatar role lastLogin')
    .populate('workspace', 'name slug plan status')
    .sort({ createdAt: -1 })
    .lean();

  const formatted = admins
    .filter(m => m.user && m.workspace)
    .map(m => ({
      assignmentId: m._id.toString(),
      adminId: m.user._id.toString(),
      name: m.user.name,
      email: m.user.email,
      avatar: m.user.avatar || '',
      workspaceRole: m.role,
      status: m.status || 'active',
      workspace: {
        id: m.workspace._id.toString(),
        name: m.workspace.name,
        slug: m.workspace.slug,
        plan: m.workspace.plan
      },
      assignedAt: m.joinedAt || m.createdAt
    }));

  return {
    totalAdmins: formatted.length,
    admins: formatted
  };
};

export const assignWorkspaceAdmin = async (workspaceIdentifier, { userId, email, role = 'admin' }, actorAdmin) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);

  let targetUser = null;
  if (userId) {
    targetUser = await User.findById(userId);
  } else if (email) {
    targetUser = await User.findOne({ email: email.toLowerCase().trim() });
  }

  if (!targetUser) {
    throw new ApiError(404, `Target user not found to assign as admin`);
  }

  let membership = await WorkspaceMember.findOne({ workspace: ws._id, user: targetUser._id });

  if (membership) {
    membership.role = role;
    await membership.save();
  } else {
    membership = await WorkspaceMember.create({
      workspace: ws._id,
      user: targetUser._id,
      role,
      status: 'active'
    });
  }

  const memberIndex = ws.members.findIndex(m => m.user && m.user.toString() === targetUser._id.toString());
  if (memberIndex !== -1) {
    ws.members[memberIndex].role = role;
  } else {
    ws.members.push({ user: targetUser._id, role, joinedAt: new Date() });
  }
  ws.membersCount = await WorkspaceMember.countDocuments({ workspace: ws._id });
  await ws.save();

  await recordAudit({
    action: 'Workspace Admin Assigned',
    details: `User ${targetUser.name} (${targetUser.email}) assigned as "${role}" in workspace "${ws.name}"`,
    actor: actorAdmin,
    target: ws.name,
    targetId: ws._id.toString()
  });

  return {
    assignmentId: membership._id.toString(),
    workspaceId: ws._id.toString(),
    workspaceName: ws.name,
    user: {
      id: targetUser._id.toString(),
      name: targetUser.name,
      email: targetUser.email
    },
    role: membership.role,
    status: membership.status
  };
};

export const getWorkspaceAdminsList = async (workspaceIdentifier) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);

  const admins = await WorkspaceMember.find({
    workspace: ws._id,
    role: { $in: ['admin', 'owner'] }
  })
    .populate('user', 'name email avatar role lastLogin')
    .sort({ createdAt: -1 })
    .lean();

  return {
    workspaceId: ws._id.toString(),
    workspaceName: ws.name,
    totalAdmins: admins.length,
    admins: admins.map(m => ({
      assignmentId: m._id.toString(),
      memberId: m._id.toString(),
      userId: m.user?._id?.toString() || '',
      name: m.user?.name || 'Workspace Admin',
      email: m.user?.email || '',
      avatar: m.user?.avatar || '',
      role: m.role,
      status: m.status || 'active',
      joinedAt: m.joinedAt || m.createdAt
    }))
  };
};

export const updateWorkspaceAdminAssignment = async (workspaceIdentifier, adminId, { role = 'admin', status }, actorAdmin) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);

  let membership = await WorkspaceMember.findOne({
    workspace: ws._id,
    $or: [
      { _id: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null },
      { user: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null }
    ]
  }).populate('user', 'name email');

  if (!membership) {
    throw new ApiError(404, `Workspace admin assignment not found with ID: ${adminId}`);
  }

  if (role) membership.role = role;
  if (status) membership.status = status;
  await membership.save();

  await recordAudit({
    action: 'Workspace Admin Assignment Updated',
    details: `Admin ${membership.user?.name} role set to ${membership.role} in workspace "${ws.name}"`,
    actor: actorAdmin,
    target: ws.name,
    targetId: ws._id.toString()
  });

  return {
    assignmentId: membership._id.toString(),
    role: membership.role,
    status: membership.status,
    userName: membership.user?.name
  };
};

export const removeWorkspaceAdminAssignment = async (workspaceIdentifier, adminId, actorAdmin) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);

  let membership = await WorkspaceMember.findOne({
    workspace: ws._id,
    $or: [
      { _id: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null },
      { user: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null }
    ]
  }).populate('user', 'name email');

  if (!membership) {
    throw new ApiError(404, `Workspace admin assignment not found with ID: ${adminId}`);
  }

  const adminName = membership.user?.name || 'Administrator';
  membership.role = 'member';
  await membership.save();

  await recordAudit({
    action: 'Workspace Admin Demoted',
    details: `Admin privileges removed for ${adminName} in workspace "${ws.name}" (demoted to member)`,
    actor: actorAdmin,
    target: ws.name,
    targetId: ws._id.toString()
  });

  return {
    assignmentId: membership._id.toString(),
    demoted: true,
    newRole: 'member',
    message: `${adminName} has been demoted to standard workspace member`
  };
};

