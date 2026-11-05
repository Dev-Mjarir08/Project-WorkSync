import mongoose from 'mongoose';
import { User } from '../../../models/User.js';
import { Session } from '../../../models/Session.js';
import { Activity } from '../../../models/Activity.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getProfile = async (userId, workspaceId) => {
  if (!userId) throw new ApiError(400, 'User ID is required');

  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '',
    bio: user.bio || '',
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

export const updateProfile = async (userId, data, actorUser, workspaceId) => {
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
      description: `Admin profile updated: ${user.name}`,
      details: `Admin profile updated for ${user.email}`,
      entityType: 'user',
      entityId: user._id,
      entityName: user.name
    }).catch(() => {});
  }

  await AuditLog.create({
    action: 'Admin Profile Updated',
    category: 'user_management',
    details: `Admin "${user.name}" updated their profile`,
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

export const updateAvatar = async (userId, avatarUrl, actorUser, workspaceId) => {
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
      description: `Updated profile avatar`,
      details: `Profile avatar updated for ${user.email}`,
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

export const changePassword = async (userId, { currentPassword, newPassword }, actorUser, workspaceId) => {
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
    throw new ApiError(400, 'Current password does not match');
  }

  user.password = newPassword;
  await user.save();

  if (workspaceId) {
    await Activity.create({
      workspace: workspaceId,
      user: user._id,
      action: 'PASSWORD_CHANGED',
      type: 'auth',
      description: `Password changed successfully`,
      details: `Admin changed account password`,
      entityType: 'user',
      entityId: user._id,
      entityName: user.name
    }).catch(() => {});
  }

  await AuditLog.create({
    action: 'Admin Password Changed',
    category: 'security',
    details: `Admin changed their account password`,
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

export const getSessions = async (userId, req = {}) => {
  if (!userId) throw new ApiError(400, 'User ID is required');

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  let sessions = user.sessions || [];

  if (sessions.length === 0) {
    const defaultSession = {
      _id: new mongoose.Types.ObjectId(),
      ip: req.ip || '127.0.0.1',
      userAgent: req.headers?.['user-agent'] || 'Chrome / Windows',
      device: 'Desktop',
      createdAt: user.lastLogin || new Date(),
      lastActive: new Date(),
      isValid: true
    };
    user.sessions = [defaultSession];
    await user.save();
    sessions = user.sessions;
  }

  return {
    userId: user._id.toString(),
    sessions: sessions.map(s => ({
      sessionId: s._id ? s._id.toString() : s.id,
      ip: s.ip || '127.0.0.1',
      userAgent: s.userAgent || 'Chrome / Desktop',
      device: s.device || 'Desktop',
      createdAt: s.createdAt,
      lastActive: s.lastActive || s.createdAt,
      isValid: s.isValid !== false,
      isCurrent: true
    }))
  };
};

export const revokeSession = async (userId, sessionId, actorUser, workspaceId) => {
  if (!userId) throw new ApiError(400, 'User ID is required');
  if (!sessionId) throw new ApiError(400, 'Session ID is required');

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  user.sessions = (user.sessions || []).filter(
    s => (s._id ? s._id.toString() : s.id) !== sessionId
  );
  await user.save();

  await Session.findOneAndUpdate(
    { _id: sessionId, user: userId },
    { $set: { isValid: false } }
  ).catch(() => {});

  if (workspaceId) {
    await Activity.create({
      workspace: workspaceId,
      user: user._id,
      action: 'SESSION_REVOKED',
      type: 'auth',
      description: `Revoked session: ${sessionId}`,
      details: `Revoked session: ${sessionId}`,
      entityType: 'session',
      entityName: sessionId
    }).catch(() => {});
  }

  return {
    sessionId,
    revoked: true,
    message: 'Session revoked successfully'
  };
};

