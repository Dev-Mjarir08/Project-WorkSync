import mongoose from 'mongoose';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Workspace } from '../../../models/Workspace.js';
import { User } from '../../../models/User.js';
import { Task } from '../../../models/Task.js';
import { Board } from '../../../models/Board.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getMembers = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const filter = { workspace: wsId };
  if (query.role && query.role !== 'all') filter.role = query.role.toLowerCase();
  if (query.status && query.status !== 'all') filter.status = query.status.toLowerCase();

  const members = await WorkspaceMember.find(filter)
    .populate('user', 'name email avatar role')
    .sort({ createdAt: -1 });

  // Optional in-memory search on user name/email if provided
  if (query.search) {
    const q = query.search.toLowerCase();
    return members.filter(
      m => m.user?.name?.toLowerCase().includes(q) || m.user?.email?.toLowerCase().includes(q)
    );
  }

  return members.map(m => ({
    id: m._id.toString(),
    userId: m.user?._id?.toString(),
    name: m.user?.name || 'Member',
    email: m.user?.email,
    avatar: m.user?.avatar,
    platformRole: m.user?.role,
    role: m.role,
    status: m.status,
    joinedAt: m.createdAt
  }));
};

export const addMember = async (workspaceId, { userId, email, role = 'member' }, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  let targetUser = null;
  if (userId) {
    targetUser = await User.findById(userId);
  } else if (email) {
    targetUser = await User.findOne({ email: email.toLowerCase().trim() });
  }

  if (!targetUser) {
    throw new ApiError(404, 'User not found on platform with the provided email or ID');
  }

  const existing = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: targetUser._id
  });

  if (existing) {
    throw new ApiError(409, 'User is already a member of this workspace');
  }

  const newMembership = await WorkspaceMember.create({
    workspace: workspaceId,
    user: targetUser._id,
    role: role.toLowerCase(),
    status: 'active'
  });

  // Increment workspace member count
  await Workspace.findByIdAndUpdate(workspaceId, { $inc: { membersCount: 1 } });

  // Record workspace activity
  await Activity.create({
    workspace: workspaceId,
    user: actorUser?._id,
    action: 'MEMBER_ADDED',
    entityType: 'member',
    entityName: targetUser.name,
    details: `Added ${targetUser.name} as ${newMembership.role}`
  }).catch(() => {});

  return {
    id: newMembership._id.toString(),
    userId: targetUser._id.toString(),
    name: targetUser.name,
    email: targetUser.email,
    role: newMembership.role,
    status: newMembership.status,
    joinedAt: newMembership.createdAt
  };
};

export const getMemberById = async (workspaceId, memberId) => {
  if (!workspaceId || !memberId) throw new ApiError(400, 'Workspace ID and Member ID are required');

  const member = await WorkspaceMember.findOne({
    _id: memberId,
    workspace: workspaceId
  }).populate('user', 'name email avatar role bio createdAt');

  if (!member) {
    throw new ApiError(404, 'Workspace member not found');
  }

  const [assignedTasksCount, accessibleBoardsCount] = await Promise.all([
    Task.countDocuments({ workspace: workspaceId, assignee: member.user?._id }),
    Board.countDocuments({ workspace: workspaceId, isArchived: false })
  ]);

  return {
    id: member._id.toString(),
    userId: member.user?._id?.toString(),
    name: member.user?.name,
    email: member.user?.email,
    avatar: member.user?.avatar,
    bio: member.user?.bio,
    role: member.role,
    status: member.status,
    joinedAt: member.createdAt,
    assignedTasksCount,
    accessibleBoardsCount
  };
};

export const updateMember = async (workspaceId, memberId, data, actorUser) => {
  const member = await WorkspaceMember.findOne({ _id: memberId, workspace: workspaceId });
  if (!member) throw new ApiError(404, 'Workspace member not found');

  if (data.role !== undefined) member.role = data.role.toLowerCase();
  if (data.status !== undefined) member.status = data.status.toLowerCase();

  await member.save();
  return member;
};

export const updateMemberRole = async (workspaceId, memberId, newRole, actorUser) => {
  const member = await WorkspaceMember.findOne({ _id: memberId, workspace: workspaceId }).populate('user', 'name');
  if (!member) throw new ApiError(404, 'Workspace member not found');

  // Guard against demoting workspace owner
  const ws = await Workspace.findById(workspaceId);
  if (ws.owner?.toString() === member.user?._id?.toString() && newRole !== 'owner') {
    throw new ApiError(400, 'Cannot change workspace role of primary workspace owner');
  }

  member.role = newRole.toLowerCase();
  await member.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser?._id,
    action: 'MEMBER_ROLE_UPDATED',
    entityType: 'member',
    entityName: member.user?.name,
    details: `Updated ${member.user?.name}'s role to ${newRole}`
  }).catch(() => {});

  return {
    id: member._id.toString(),
    role: member.role,
    userName: member.user?.name
  };
};

export const updateMemberStatus = async (workspaceId, memberId, newStatus, actorUser) => {
  const member = await WorkspaceMember.findOne({ _id: memberId, workspace: workspaceId }).populate('user', 'name');
  if (!member) throw new ApiError(404, 'Workspace member not found');

  member.status = newStatus.toLowerCase();
  await member.save();

  return {
    id: member._id.toString(),
    status: member.status,
    userName: member.user?.name
  };
};

export const removeMember = async (workspaceId, memberId, actorUser) => {
  const member = await WorkspaceMember.findOne({ _id: memberId, workspace: workspaceId }).populate('user', 'name');
  if (!member) throw new ApiError(404, 'Workspace member not found');

  const ws = await Workspace.findById(workspaceId);
  if (ws.owner?.toString() === member.user?._id?.toString()) {
    throw new ApiError(400, 'Cannot remove primary owner from workspace');
  }

  await WorkspaceMember.findByIdAndDelete(member._id);
  await Workspace.findByIdAndUpdate(workspaceId, { $inc: { membersCount: -1 } });

  await Activity.create({
    workspace: workspaceId,
    user: actorUser?._id,
    action: 'MEMBER_REMOVED',
    entityType: 'member',
    entityName: member.user?.name,
    details: `Removed ${member.user?.name} from workspace`
  }).catch(() => {});

  return {
    id: memberId,
    removed: true,
    userName: member.user?.name
  };
};

export const getMemberActivities = async (workspaceId, memberId, query = {}) => {
  const member = await WorkspaceMember.findOne({ _id: memberId, workspace: workspaceId });
  if (!member) throw new ApiError(404, 'Workspace member not found');

  const activities = await Activity.find({
    workspace: workspaceId,
    user: member.user
  })
    .sort({ createdAt: -1 })
    .limit(query.limit ? parseInt(query.limit, 10) : 20);

  return activities;
};

export const getMemberTasks = async (workspaceId, memberId) => {
  const member = await WorkspaceMember.findOne({ _id: memberId, workspace: workspaceId });
  if (!member) throw new ApiError(404, 'Workspace member not found');

  const tasks = await Task.find({
    workspace: workspaceId,
    assignee: member.user
  })
    .sort({ dueDate: 1, createdAt: -1 });

  return tasks;
};

export const getMemberBoards = async (workspaceId, memberId) => {
  const member = await WorkspaceMember.findOne({ _id: memberId, workspace: workspaceId });
  if (!member) throw new ApiError(404, 'Workspace member not found');

  const boards = await Board.find({
    workspace: workspaceId,
    isArchived: false
  }).sort({ createdAt: -1 });

  return boards;
};
