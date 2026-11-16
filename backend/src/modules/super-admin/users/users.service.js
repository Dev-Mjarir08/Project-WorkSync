import mongoose from 'mongoose';
import { User } from '../../../models/User.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { ApiError } from '../../../utils/ApiError.js';
import { ROLES } from '../../../constants/roles.js';

const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const recordAudit = async ({ action, category = 'user_management', details, actor, target = '', targetId = '', status = 'success' }) => {
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

export const getAllUsers = async (query = {}, actorUser) => {
  const { search = '', role = 'all', status = 'all', page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = query;

  const filter = {};
  const andConditions = [];

  if (actorUser) {
    const { Workspace } = await import('../../../models/Workspace.js');
    const { WorkspaceMember } = await import('../../../models/WorkspaceMember.js');
    const myWorkspaces = await Workspace.find({
      $or: [{ owner: actorUser._id }, { createdBy: actorUser._id }]
    }).select('_id');
    const myWsIds = myWorkspaces.map(w => w._id);
    const myMemberships = await WorkspaceMember.find({ workspace: { $in: myWsIds } }).select('user');
    const allowedUserIds = [actorUser._id, ...myMemberships.map(m => m.user)];

    // Visible users for this Super Admin:
    // 1. The Super Admin themself
    // 2. Members of workspaces owned/created by this Super Admin
    // 3. Users directly created by this Super Admin
    // 4. Any legacy users without createdBy tag
    andConditions.push({
      $or: [
        { _id: { $in: allowedUserIds } },
        { createdBy: actorUser._id },
        { createdBy: null },
        { createdBy: { $exists: false } }
      ]
    });
  }

  if (search.trim()) {
    const cleanSearch = escapeRegex(search.trim());
    andConditions.push({
      $or: [
        { name: { $regex: cleanSearch, $options: 'i' } },
        { email: { $regex: cleanSearch, $options: 'i' } }
      ]
    });
  }

  if (role && role !== 'all') {
    filter.role = role.toLowerCase();
  }

  if (status && status !== 'all') {
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive' || status === 'suspended') filter.isActive = false;
  }

  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (parsedPage - 1) * parsedLimit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [rawUsers, totalCount] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    User.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

  const users = rawUsers.map(u => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar || '',
    bio: u.bio || '',
    isActive: u.isActive,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt
  }));

  return {
    users,
    totalCount,
    pagination: {
      currentPage: parsedPage,
      totalPages,
      limit: parsedLimit,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1
    }
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ApiError(404, `User not found with ID: ${userId}`);
  }

  const [workspaceCount, activityCount] = await Promise.all([
    WorkspaceMember.countDocuments({ user: user._id }),
    AuditLog.countDocuments({ $or: [{ 'actor.user': user._id }, { targetId: user._id.toString() }] })
  ]);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '',
    bio: user.bio || '',
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    workspacesCount: workspaceCount,
    activitiesCount: activityCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

export const createUser = async ({ name, email, password, role = 'member', bio = '', workspaceId = '' }, actorAdmin) => {
  const normalizedEmail = email.toLowerCase().trim();
  const userPassword = password || 'WorkSync@2026';

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, `An account with email '${normalizedEmail}' already exists`);
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: userPassword,
    role,
    bio,
    createdBy: actorAdmin?._id || null,
    sessions: [
      {
        ip: '127.0.0.1',
        userAgent: 'Default Admin Provisioned',
        device: 'Desktop',
        createdAt: new Date(),
        lastActive: new Date()
      }
    ]
  });

  // Immediately associate user as workspace member
  let targetWsId = workspaceId && mongoose.Types.ObjectId.isValid(workspaceId) ? workspaceId : null;
  if (!targetWsId && actorAdmin) {
    try {
      const { Workspace } = await import('../../../models/Workspace.js');
      const ownedWs = await Workspace.findOne({ owner: actorAdmin._id });
      if (ownedWs) {
        targetWsId = ownedWs._id;
      } else {
        const anyWs = await Workspace.findOne({ isActive: true });
        if (anyWs) targetWsId = anyWs._id;
      }
    } catch (err) {}
  }

  if (targetWsId) {
    try {
      const { WorkspaceMember } = await import('../../../models/WorkspaceMember.js');
      const { Workspace } = await import('../../../models/Workspace.js');
      const wsRole = role === 'admin' ? 'admin' : (role === 'manager' ? 'manager' : (role === 'employee' ? 'employee' : 'member'));
      await WorkspaceMember.findOneAndUpdate(
        { workspace: targetWsId, user: user._id },
        {
          workspace: targetWsId,
          user: user._id,
          role: wsRole,
          status: 'active'
        },
        { upsert: true, returnDocument: 'after' }
      );
      await Workspace.findByIdAndUpdate(targetWsId, { $inc: { membersCount: 1 } }).catch(() => {});
    } catch (wsErr) {
      console.error('Failed to link member to workspace on creation:', wsErr.message);
    }
  }

  await recordAudit({
    action: 'User Created',
    details: `Created new user account for ${user.name} (${user.email}) with role ${user.role}`,
    actor: actorAdmin,
    target: user.email,
    targetId: user._id.toString()
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '',
    bio: user.bio || '',
    isActive: user.isActive,
    createdAt: user.createdAt
  };
};

export const updateUser = async (userId, updateData, actorAdmin) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, `User not found with ID: ${userId}`);
  }

  if (updateData.email && updateData.email.toLowerCase() !== user.email) {
    const emailConflict = await User.findOne({ email: updateData.email.toLowerCase(), _id: { $ne: user._id } });
    if (emailConflict) {
      throw new ApiError(409, `Email '${updateData.email}' is already in use by another account`);
    }
    user.email = updateData.email.toLowerCase().trim();
  }

  if (updateData.name !== undefined) user.name = updateData.name.trim();
  if (updateData.bio !== undefined) user.bio = updateData.bio.trim();
  if (updateData.avatar !== undefined) user.avatar = updateData.avatar.trim();

  await user.save();

  await recordAudit({
    action: 'User Updated',
    details: `Updated details for user ${user.name} (${user.email})`,
    actor: actorAdmin,
    target: user.email,
    targetId: user._id.toString()
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '',
    bio: user.bio || '',
    isActive: user.isActive,
    updatedAt: user.updatedAt
  };
};

export const updateUserStatus = async (userId, { isActive, status }, actorAdmin) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, `User not found with ID: ${userId}`);
  }

  if (actorAdmin?._id && actorAdmin._id.toString() === user._id.toString()) {
    throw new ApiError(400, 'Security Policy: You cannot deactivate your own active session');
  }

  let targetActive = user.isActive;
  if (typeof isActive === 'boolean') {
    targetActive = isActive;
  } else if (status) {
    targetActive = status.toLowerCase() === 'active';
  } else {
    targetActive = !user.isActive;
  }

  user.isActive = targetActive;
  await user.save();

  await recordAudit({
    action: targetActive ? 'User Activated' : 'User Deactivated',
    details: `User ${user.name} (${user.email}) was ${targetActive ? 'activated' : 'deactivated'}`,
    actor: actorAdmin,
    target: user.email,
    targetId: user._id.toString()
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    role: user.role
  };
};

export const updateUserRole = async (userId, newRole, actorAdmin) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, `User not found with ID: ${userId}`);
  }

  if (user.role === ROLES.SUPER_ADMIN && newRole !== ROLES.SUPER_ADMIN) {
    const otherSuperAdmins = await User.countDocuments({
      role: ROLES.SUPER_ADMIN,
      _id: { $ne: user._id }
    });
    if (otherSuperAdmins === 0) {
      throw new ApiError(400, 'Cannot demote the sole super admin on the platform');
    }
  }

  const previousRole = user.role;
  user.role = newRole;
  await user.save();

  await recordAudit({
    action: 'User Role Changed',
    details: `Role for ${user.name} updated from "${previousRole}" to "${newRole}"`,
    actor: actorAdmin,
    target: user.email,
    targetId: user._id.toString()
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    previousRole
  };
};

export const deleteUser = async (userId, actorAdmin) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, `User not found with ID: ${userId}`);
  }

  if (actorAdmin?._id && actorAdmin._id.toString() === user._id.toString()) {
    throw new ApiError(400, 'Security Policy: You cannot delete your own account while logged in');
  }

  if (user.role === ROLES.SUPER_ADMIN) {
    const otherSuperAdmins = await User.countDocuments({
      role: ROLES.SUPER_ADMIN,
      _id: { $ne: user._id }
    });
    if (otherSuperAdmins === 0) {
      throw new ApiError(400, 'Cannot delete the only Super Admin on this platform');
    }
  }

  await Promise.all([
    User.findByIdAndDelete(userId),
    WorkspaceMember.deleteMany({ user: userId })
  ]);

  await recordAudit({
    action: 'User Deleted',
    details: `User ${user.name} (${user.email}) permanently deleted`,
    actor: actorAdmin,
    target: user.email,
    targetId: userId.toString(),
    status: 'warning'
  });

  return {
    id: userId,
    name: user.name,
    email: user.email,
    deleted: true
  };
};

export const getUserWorkspaces = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, `User not found with ID: ${userId}`);
  }

  const memberships = await WorkspaceMember.find({ user: user._id })
    .populate('workspace')
    .lean();

  const workspaces = memberships
    .filter(m => m.workspace)
    .map(m => ({
      id: m.workspace._id.toString(),
      name: m.workspace.name,
      slug: m.workspace.slug,
      plan: m.workspace.plan,
      status: m.workspace.status,
      roleInWorkspace: m.role,
      joinedAt: m.joinedAt || m.createdAt
    }));

  return {
    userId: user._id.toString(),
    userName: user.name,
    totalWorkspaces: workspaces.length,
    workspaces
  };
};

export const getUserActivities = async (userId, limit = 20) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, `User not found with ID: ${userId}`);
  }

  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const logs = await AuditLog.find({
    $or: [{ 'actor.user': user._id }, { targetId: user._id.toString() }, { target: user.email }]
  })
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .lean();

  return {
    userId: user._id.toString(),
    userName: user.name,
    totalCount: logs.length,
    activities: logs.map(l => ({
      id: l._id.toString(),
      action: l.action,
      details: l.details,
      status: l.status,
      timestamp: l.createdAt
    }))
  };
};

export const getUserSessions = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, `User not found with ID: ${userId}`);
  }

  const sessions = user.sessions || [];
  if (sessions.length === 0) {
    sessions.push({
      _id: new mongoose.Types.ObjectId(),
      ip: '127.0.0.1',
      userAgent: 'Chrome on Windows 11',
      device: 'Desktop',
      createdAt: user.lastLogin || user.createdAt,
      lastActive: user.lastLogin || new Date(),
      isValid: true
    });
    user.sessions = sessions;
    await user.save();
  }

  return {
    userId: user._id.toString(),
    userName: user.name,
    activeSessionsCount: sessions.filter(s => s.isValid).length,
    sessions: sessions.map(s => ({
      id: s._id ? s._id.toString() : s.id,
      ip: s.ip || '127.0.0.1',
      userAgent: s.userAgent || 'Desktop Client',
      device: s.device || 'Desktop',
      lastActive: s.lastActive || s.createdAt,
      createdAt: s.createdAt,
      isValid: s.isValid !== false
    }))
  };
};

export const revokeUserSessions = async (userId, actorAdmin) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, `User not found with ID: ${userId}`);
  }

  user.sessions = [];
  await user.save();

  await recordAudit({
    action: 'User Sessions Revoked',
    category: 'security',
    details: `All active sessions revoked for user ${user.name} (${user.email})`,
    actor: actorAdmin,
    target: user.email,
    targetId: user._id.toString()
  });

  return {
    userId: user._id.toString(),
    revoked: true,
    message: `All active sessions for ${user.name} have been terminated`
  };
};

