import mongoose from 'mongoose';
import { Workspace } from '../../models/Workspace.js';
import { WorkspaceMember } from '../../models/WorkspaceMember.js';
import { User } from '../../models/User.js';
import { Invitation } from '../../models/Invitation.js';
import { Board } from '../../models/Board.js';
import { Task } from '../../models/Task.js';
import { AuditLog } from '../../models/AuditLog.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Helper to resolve Workspace document by ID or slug
 */
export const resolveWorkspace = async (workspaceIdentifier) => {
  if (!workspaceIdentifier) {
    // If not passed, find the most recently created workspace
    const latest = await Workspace.findOne().sort({ createdAt: -1 });
    if (!latest) {
      throw new ApiError(404, 'No workspace found. Please provide a valid workspaceId.');
    }
    return latest;
  }

  let ws;
  if (mongoose.Types.ObjectId.isValid(workspaceIdentifier)) {
    ws = await Workspace.findById(workspaceIdentifier);
  }

  if (!ws) {
    ws = await Workspace.findOne({ slug: workspaceIdentifier.toString().toLowerCase() });
  }

  if (!ws) {
    throw new ApiError(404, `Workspace not found with identifier: ${workspaceIdentifier}`);
  }

  return ws;
};

/**
 * 1. GET /dashboard - Workspace dashboard overview
 */
export const getWorkspaceDashboard = async (workspaceId, currentUser) => {
  const workspace = await resolveWorkspace(workspaceId);

  // Parallel metrics queries
  const [
    totalMembers,
    ownerCount,
    adminCount,
    memberCount,
    viewerCount,
    totalBoards,
    totalTasks,
    pendingInvitations,
    recentMembers
  ] = await Promise.all([
    WorkspaceMember.countDocuments({ workspace: workspace._id }),
    WorkspaceMember.countDocuments({ workspace: workspace._id, role: 'owner' }),
    WorkspaceMember.countDocuments({ workspace: workspace._id, role: 'admin' }),
    WorkspaceMember.countDocuments({ workspace: workspace._id, role: 'member' }),
    WorkspaceMember.countDocuments({ workspace: workspace._id, role: 'viewer' }),
    Board.countDocuments({ workspace: workspace._id }),
    Task.countDocuments({ workspace: workspace._id }),
    Invitation.countDocuments({ workspace: workspace._id, status: 'pending' }),
    WorkspaceMember.find({ workspace: workspace._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email avatar role lastLogin')
      .lean()
  ]);

  return {
    workspace: {
      id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description || '',
      plan: workspace.plan,
      status: workspace.status,
      storageUsed: workspace.storageUsed,
      owner: workspace.ownerDetails || {}
    },
    metrics: {
      totalMembers: totalMembers || workspace.membersCount || 1,
      totalBoards: totalBoards || workspace.boardsCount || 0,
      totalTasks: totalTasks || workspace.tasksCount || 0,
      pendingInvitations
    },
    rolesSummary: {
      owner: ownerCount,
      admin: adminCount,
      member: memberCount,
      viewer: viewerCount
    },
    recentMembers: recentMembers.map(m => ({
      id: m._id.toString(),
      userId: m.user?._id?.toString() || '',
      name: m.user?.name || 'Unknown',
      email: m.user?.email || '',
      avatar: m.user?.avatar || '',
      role: m.role,
      joinedAt: m.joinedAt || m.createdAt
    }))
  };
};

/**
 * 2. GET /members - Workspace members list with search & filter
 */
export const getWorkspaceMembers = async (workspaceId, query = {}) => {
  const workspace = await resolveWorkspace(workspaceId);
  const { search = '', role = 'all', page = 1, limit = 20 } = query;

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  // Build filter for WorkspaceMember
  const memberFilter = { workspace: workspace._id };
  if (role && role !== 'all') {
    memberFilter.role = role.toLowerCase();
  }

  // If search query is provided, match users first
  if (search && search.trim()) {
    const cleanSearch = search.trim();
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: cleanSearch, $options: 'i' } },
        { email: { $regex: cleanSearch, $options: 'i' } }
      ]
    }).select('_id');

    const matchingUserIds = matchingUsers.map(u => u._id);
    memberFilter.user = { $in: matchingUserIds };
  }

  const [totalCount, rawMembers, roleCounts] = await Promise.all([
    WorkspaceMember.countDocuments(memberFilter),
    WorkspaceMember.find(memberFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .populate('user', 'name email avatar role lastLogin isActive')
      .lean(),
    WorkspaceMember.aggregate([
      { $match: { workspace: workspace._id } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ])
  ]);

  const rolesSummary = {
    owner: 0,
    admin: 0,
    member: 0,
    viewer: 0
  };

  roleCounts.forEach(r => {
    if (r._id && rolesSummary[r._id] !== undefined) {
      rolesSummary[r._id] = r.count;
    }
  });

  const formattedMembers = rawMembers.map(m => ({
    id: m._id.toString(),
    _id: m._id.toString(),
    memberId: m._id.toString(),
    userId: m.user?._id?.toString() || '',
    name: m.user?.name || 'Workspace Member',
    email: m.user?.email || '',
    avatar: m.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.user?.name || 'User')}`,
    role: m.role || 'member',
    status: m.status || 'active',
    platformRole: m.user?.role || 'member',
    isActive: m.user?.isActive ?? true,
    lastLogin: m.user?.lastLogin || 'Never',
    joinedAt: m.joinedAt ? new Date(m.joinedAt).toISOString() : new Date().toISOString()
  }));

  const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

  return {
    workspaceId: workspace._id.toString(),
    members: formattedMembers,
    totalCount,
    rolesSummary,
    pagination: {
      currentPage: parsedPage,
      limit: parsedLimit,
      totalPages,
      totalCount,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1
    }
  };
};

/**
 * 3. POST /members - Add existing platform user to workspace
 */
export const addWorkspaceMember = async (workspaceId, { email, userId, role = 'member' }, actorUser) => {
  const workspace = await resolveWorkspace(workspaceId);

  // Find user by email or userId
  let user;
  if (email) {
    user = await User.findOne({ email: email.toLowerCase().trim() });
  } else if (userId) {
    user = await User.findById(userId);
  }

  if (!user) {
    throw new ApiError(404, `User not found with ${email ? `email '${email}'` : `ID '${userId}'`}. They must register on WorkSync first.`);
  }

  // Check if user is already a member
  const existingMembership = await WorkspaceMember.findOne({
    workspace: workspace._id,
    user: user._id
  });

  if (existingMembership) {
    throw new ApiError(409, `User '${user.name}' (${user.email}) is already a member of workspace '${workspace.name}'.`);
  }

  // Create WorkspaceMember
  const newMember = await WorkspaceMember.create({
    workspace: workspace._id,
    user: user._id,
    role: role || 'member',
    status: 'active',
    joinedAt: new Date()
  });

  // Sync with Workspace model
  workspace.members.push({
    user: user._id,
    role: newMember.role,
    joinedAt: newMember.joinedAt
  });
  workspace.membersCount = await WorkspaceMember.countDocuments({ workspace: workspace._id });
  await workspace.save();

  // Audit Log
  await AuditLog.create({
    action: 'Workspace Member Added',
    category: 'workspace',
    details: `User ${user.name} (${user.email}) added to workspace "${workspace.name}" with role "${newMember.role}"`,
    actor: {
      name: actorUser?.name || 'Administrator',
      email: actorUser?.email || 'admin@worksync.io'
    },
    target: workspace.name,
    targetId: workspace._id.toString(),
    status: 'success'
  });

  return {
    id: newMember._id.toString(),
    _id: newMember._id.toString(),
    memberId: newMember._id.toString(),
    workspaceId: workspace._id.toString(),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role
    },
    role: newMember.role,
    status: newMember.status,
    joinedAt: newMember.joinedAt
  };
};

/**
 * 4. GET /members/:memberId - Member details
 */
export const getMemberDetails = async (workspaceId, memberId) => {
  const workspace = await resolveWorkspace(workspaceId);

  let member = await WorkspaceMember.findOne({
    _id: mongoose.Types.ObjectId.isValid(memberId) ? memberId : null,
    workspace: workspace._id
  }).populate('user', 'name email avatar role bio lastLogin isActive createdAt');

  // If not found by WorkspaceMember _id, try finding by user _id
  if (!member && mongoose.Types.ObjectId.isValid(memberId)) {
    member = await WorkspaceMember.findOne({
      user: memberId,
      workspace: workspace._id
    }).populate('user', 'name email avatar role bio lastLogin isActive createdAt');
  }

  if (!member) {
    throw new ApiError(404, `Workspace member not found with ID: ${memberId}`);
  }

  // Count assigned tasks in this workspace
  const assignedTasksCount = await Task.countDocuments({
    workspace: workspace._id,
    assignee: member.user?._id
  });

  return {
    id: member._id.toString(),
    _id: member._id.toString(),
    memberId: member._id.toString(),
    workspace: {
      id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug
    },
    user: {
      id: member.user?._id?.toString() || '',
      name: member.user?.name || 'Member',
      email: member.user?.email || '',
      avatar: member.user?.avatar || '',
      platformRole: member.user?.role || 'member',
      bio: member.user?.bio || '',
      lastLogin: member.user?.lastLogin || 'Never',
      isActive: member.user?.isActive ?? true
    },
    role: member.role,
    status: member.status,
    assignedTasksCount,
    joinedAt: member.joinedAt
  };
};

/**
 * 5. PATCH /members/:memberId/role - Change workspace role
 */
export const updateMemberRole = async (workspaceId, memberId, newRole, actorUser) => {
  const workspace = await resolveWorkspace(workspaceId);

  let member = await WorkspaceMember.findOne({
    _id: mongoose.Types.ObjectId.isValid(memberId) ? memberId : null,
    workspace: workspace._id
  }).populate('user', 'name email');

  if (!member && mongoose.Types.ObjectId.isValid(memberId)) {
    member = await WorkspaceMember.findOne({
      user: memberId,
      workspace: workspace._id
    }).populate('user', 'name email');
  }

  if (!member) {
    throw new ApiError(404, `Workspace member not found with ID: ${memberId}`);
  }

  // Prevent demoting the workspace owner if they are the only owner
  if (member.role === 'owner' && newRole !== 'owner') {
    const ownerCount = await WorkspaceMember.countDocuments({
      workspace: workspace._id,
      role: 'owner'
    });
    if (ownerCount <= 1) {
      throw new ApiError(400, 'Cannot demote the workspace owner without transferring ownership first.');
    }
  }

  const previousRole = member.role;
  member.role = newRole;
  await member.save();

  // Sync role inside Workspace.members array
  const wsMemberIndex = workspace.members.findIndex(
    m => m.user && m.user.toString() === member.user?._id?.toString()
  );
  if (wsMemberIndex !== -1) {
    workspace.members[wsMemberIndex].role = newRole;
    await workspace.save();
  }

  // Audit Log
  await AuditLog.create({
    action: 'Workspace Member Role Changed',
    category: 'workspace',
    details: `Member "${member.user?.name}" role updated from "${previousRole}" to "${newRole}" in workspace "${workspace.name}"`,
    actor: {
      name: actorUser?.name || 'Administrator',
      email: actorUser?.email || 'admin@worksync.io'
    },
    target: workspace.name,
    targetId: workspace._id.toString(),
    status: 'success'
  });

  return {
    id: member._id.toString(),
    memberId: member._id.toString(),
    userId: member.user?._id?.toString() || '',
    name: member.user?.name || '',
    email: member.user?.email || '',
    role: member.role,
    previousRole,
    status: member.status,
    updatedAt: member.updatedAt
  };
};

/**
 * 6. DELETE /members/:memberId - Remove member from workspace
 */
export const removeWorkspaceMember = async (workspaceId, memberId, actorUser) => {
  const workspace = await resolveWorkspace(workspaceId);

  let member = await WorkspaceMember.findOne({
    _id: mongoose.Types.ObjectId.isValid(memberId) ? memberId : null,
    workspace: workspace._id
  }).populate('user', 'name email');

  if (!member && mongoose.Types.ObjectId.isValid(memberId)) {
    member = await WorkspaceMember.findOne({
      user: memberId,
      workspace: workspace._id
    }).populate('user', 'name email');
  }

  if (!member) {
    throw new ApiError(404, `Workspace member not found with ID: ${memberId}`);
  }

  if (member.role === 'owner') {
    throw new ApiError(400, 'Cannot remove the primary workspace owner from the workspace.');
  }

  const memberName = member.user?.name || 'Member';
  const memberEmail = member.user?.email || '';

  await WorkspaceMember.deleteOne({ _id: member._id });

  // Sync workspace.members array
  workspace.members = workspace.members.filter(
    m => m.user && m.user.toString() !== member.user?._id?.toString()
  );
  workspace.membersCount = await WorkspaceMember.countDocuments({ workspace: workspace._id });
  await workspace.save();

  // Audit log
  await AuditLog.create({
    action: 'Workspace Member Removed',
    category: 'workspace',
    details: `Member "${memberName}" (${memberEmail}) removed from workspace "${workspace.name}"`,
    actor: {
      name: actorUser?.name || 'Administrator',
      email: actorUser?.email || 'admin@worksync.io'
    },
    target: workspace.name,
    targetId: workspace._id.toString(),
    status: 'warning'
  });

  return {
    removed: true,
    memberId: member._id.toString(),
    memberName,
    memberEmail,
    workspaceId: workspace._id.toString()
  };
};

/**
 * 7. POST /invitations - Invite new member by email
 */
export const inviteMember = async (workspaceId, { email, role = 'member', message }, actorUser) => {
  const workspace = await resolveWorkspace(workspaceId);
  const normalizedEmail = email.toLowerCase().trim();

  // Check if invitee is already a member
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const isAlreadyMember = await WorkspaceMember.findOne({
      workspace: workspace._id,
      user: existingUser._id
    });
    if (isAlreadyMember) {
      throw new ApiError(409, `User '${existingUser.name}' (${normalizedEmail}) is already a member of workspace '${workspace.name}'.`);
    }
  }

  // Check if an invitation is already pending
  const existingInvite = await Invitation.findOne({
    workspace: workspace._id,
    email: normalizedEmail,
    status: 'pending'
  });

  if (existingInvite) {
    throw new ApiError(409, `An invitation is already pending for '${normalizedEmail}' in workspace '${workspace.name}'.`);
  }

  const newInvitation = await Invitation.create({
    workspace: workspace._id,
    email: normalizedEmail,
    role: role || 'member',
    message: message || '',
    invitedBy: actorUser?._id || actorUser?.id,
    status: 'pending'
  });

  // Audit log
  await AuditLog.create({
    action: 'Workspace Member Invited',
    category: 'workspace',
    details: `Invitation dispatched to ${normalizedEmail} with role "${role}" for workspace "${workspace.name}"`,
    actor: {
      name: actorUser?.name || 'Administrator',
      email: actorUser?.email || 'admin@worksync.io'
    },
    target: workspace.name,
    targetId: workspace._id.toString(),
    status: 'success'
  });

  return {
    id: newInvitation._id.toString(),
    _id: newInvitation._id.toString(),
    invitationId: newInvitation._id.toString(),
    workspaceId: workspace._id.toString(),
    workspaceName: workspace.name,
    email: newInvitation.email,
    role: newInvitation.role,
    token: newInvitation.token,
    status: newInvitation.status,
    expiresAt: newInvitation.expiresAt,
    inviteUrl: `http://localhost:5173/join-workspace?token=${newInvitation.token}`
  };
};

/**
 * 8. GET /invitations - All invitations for workspace
 */
export const getWorkspaceInvitations = async (workspaceId, query = {}) => {
  const workspace = await resolveWorkspace(workspaceId);
  const { status = 'all' } = query;

  const filter = { workspace: workspace._id };
  if (status && status !== 'all') {
    filter.status = status.toLowerCase();
  }

  const invitations = await Invitation.find(filter)
    .sort({ createdAt: -1 })
    .populate('invitedBy', 'name email avatar')
    .lean();

  const formatted = invitations.map(inv => ({
    id: inv._id.toString(),
    _id: inv._id.toString(),
    invitationId: inv._id.toString(),
    workspaceId: workspace._id.toString(),
    email: inv.email,
    role: inv.role,
    status: inv.status,
    token: inv.token,
    message: inv.message || '',
    invitedBy: {
      id: inv.invitedBy?._id?.toString() || '',
      name: inv.invitedBy?.name || 'Administrator',
      email: inv.invitedBy?.email || ''
    },
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt,
    inviteUrl: `http://localhost:5173/join-workspace?token=${inv.token}`
  }));

  return {
    workspaceId: workspace._id.toString(),
    workspaceName: workspace.name,
    totalCount: formatted.length,
    invitations: formatted
  };
};

/**
 * 9. DELETE /invitations/:invitationId - Cancel invitation
 */
export const cancelInvitation = async (workspaceId, invitationId, actorUser) => {
  let query = { _id: mongoose.Types.ObjectId.isValid(invitationId) ? invitationId : null };

  if (workspaceId) {
    const workspace = await resolveWorkspace(workspaceId);
    query.workspace = workspace._id;
  }

  const invitation = await Invitation.findOne(query);
  if (!invitation) {
    throw new ApiError(404, `Invitation not found with ID: ${invitationId}`);
  }

  if (invitation.status === 'accepted') {
    throw new ApiError(400, 'Cannot cancel an invitation that has already been accepted.');
  }

  const inviteeEmail = invitation.email;
  invitation.status = 'cancelled';
  await invitation.save();

  // Audit log
  await AuditLog.create({
    action: 'Workspace Invitation Cancelled',
    category: 'workspace',
    details: `Invitation for ${inviteeEmail} was revoked/cancelled`,
    actor: {
      name: actorUser?.name || 'Administrator',
      email: actorUser?.email || 'admin@worksync.io'
    },
    target: 'Invitation',
    targetId: invitation._id.toString(),
    status: 'warning'
  });

  return {
    cancelled: true,
    invitationId: invitation._id.toString(),
    email: inviteeEmail,
    status: 'cancelled'
  };
};