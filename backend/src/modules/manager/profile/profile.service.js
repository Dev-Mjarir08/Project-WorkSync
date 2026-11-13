import mongoose from 'mongoose';
import { User } from '../../../models/User.js';
import { Session } from '../../../models/Session.js';
import { Activity } from '../../../models/Activity.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getProfile = async (userId, workspaceId) => {
  if (!userId) throw new ApiError(400, 'User ID is required');

  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  let workspaceRole = user.role;
  if (workspaceId) {
    const membership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: user._id
    });
    if (membership) workspaceRole = membership.role;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    workspaceRole,
    avatar: user.avatar || '',
    bio: user.bio || '',
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

export const updateProfile = async (userId, data, workspaceId) => {
  if (!userId) throw new ApiError(400, 'User ID is required');

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  if (data.email && data.email.toLowerCase() !== user.email) {
    const existing = await User.findOne({
      email: data.email.toLowerCase().trim(),
      _id: { $ne: user._id }
    });
    if (existing) {
      throw new ApiError(409, 'Email address is already in use');
    }
    user.email = data.email.toLowerCase().trim();
  }

  if (data.name !== undefined) user.name = data.name.trim();
  if (data.bio !== undefined) user.bio = data.bio.trim();

  await user.save();

  if (workspaceId) {
    await Activity.create({
      workspace: workspaceId,
      user: user._id,
      action: 'PROFILE_UPDATED',
      type: 'user',
      description: `Manager profile updated: ${user.name}`,
      details: `Profile updated for ${user.email}`,
      entityType: 'user',
      entityId: user._id,
      entityName: user.name
    }).catch(() => {});
  }

  await AuditLog.create({
    action: 'Manager Profile Updated',
    category: 'user_management',
    details: `Manager "${user.name}" updated their profile`,
    workspace: workspaceId || null,
    actor: {
      user: user._id,
      name: user.name,
      email: user.email
    },
    target: user.email,
    targetId: user._id.toString(),
    status: 'success'
  }).catch(() => {});

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar
  };
};

export const updateAvatar = async (userId, avatarUrl, workspaceId) => {
  if (!userId) throw new ApiError(400, 'User ID is required');
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    throw new ApiError(400, 'Avatar URL is required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  user.avatar = avatarUrl.trim();
  await user.save();

  if (workspaceId) {
    await Activity.create({
      workspace: workspaceId,
      user: user._id,
      action: 'AVATAR_UPDATED',
      type: 'user',
      description: `Manager updated their profile avatar`,
      entityType: 'user',
      entityId: user._id,
      entityName: user.name
    }).catch(() => {});
  }

  return {
    id: user._id.toString(),
    avatar: user.avatar
  };
};

export const changePassword = async (userId, { currentPassword, newPassword }, workspaceId) => {
  if (!userId) throw new ApiError(400, 'User ID is required');
  if (!currentPassword) throw new ApiError(400, 'Current password is required');
  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  const isMatch = await user.isPasswordMatch(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  if (workspaceId) {
    await Activity.create({
      workspace: workspaceId,
      user: user._id,
      action: 'PASSWORD_CHANGED',
      type: 'user',
      description: `Manager changed account password`,
      entityType: 'user',
      entityId: user._id,
      entityName: user.name
    }).catch(() => {});
  }

  await AuditLog.create({
    action: 'Manager Password Changed',
    category: 'auth',
    details: `Password changed for account "${user.email}"`,
    workspace: workspaceId || null,
    actor: {
      user: user._id,
      name: user.name,
      email: user.email
    },
    target: user.email,
    targetId: user._id.toString(),
    status: 'success'
  }).catch(() => {});

  return {
    success: true,
    message: 'Password changed successfully'
  };
};

export const getSessions = async (userId) => {
  if (!userId) throw new ApiError(400, 'User ID is required');

  let sessions = await Session.find({ user: userId, isValid: true })
    .sort({ lastActive: -1 })
    .lean();

  if (!sessions || sessions.length === 0) {
    const user = await User.findById(userId).select('sessions');
    if (user?.sessions?.length) {
      sessions = user.sessions
        .filter((s) => s.isValid !== false)
        .map((s) => ({
          id: s._id ? s._id.toString() : 'sess_default',
          ip: s.ip || '127.0.0.1',
          userAgent: s.userAgent || 'Desktop',
          device: s.device || 'Desktop',
          createdAt: s.createdAt,
          lastActive: s.lastActive,
          isValid: s.isValid !== false
        }));
    } else {
      // Default active current session representation
      sessions = [
        {
          id: 'sess_' + userId.toString().substring(0, 8),
          ip: '127.0.0.1',
          userAgent: 'Current Browser Session',
          device: 'Desktop',
          createdAt: new Date(),
          lastActive: new Date(),
          isValid: true,
          isCurrent: true
        }
      ];
    }
  }

  return {
    sessions,
    total: sessions.length
  };
};

export const revokeSession = async (userId, sessionId) => {
  if (!sessionId) throw new ApiError(400, 'Session ID is required');

  if (mongoose.Types.ObjectId.isValid(sessionId)) {
    await Session.findOneAndDelete({ _id: sessionId, user: userId });
  }

  await User.updateOne(
    { _id: userId },
    { $pull: { sessions: { _id: sessionId } } }
  );

  return {
    sessionId,
    revoked: true,
    message: 'Session revoked successfully'
  };
};
