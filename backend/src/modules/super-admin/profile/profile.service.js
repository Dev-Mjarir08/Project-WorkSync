import mongoose from 'mongoose';
import { User } from '../../../models/User.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { ApiError } from '../../../utils/ApiError.js';

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

export const getAdminProfile = async (adminId) => {
  const admin = await User.findById(adminId).select('-password');
  if (!admin) {
    throw new ApiError(404, 'Admin profile not found');
  }

  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    avatar: admin.avatar || '',
    bio: admin.bio || '',
    lastLogin: admin.lastLogin,
    createdAt: admin.createdAt
  };
};

export const updateAdminProfile = async (adminId, updateData) => {
  const admin = await User.findById(adminId);
  if (!admin) {
    throw new ApiError(404, 'Admin profile not found');
  }

  if (updateData.email && updateData.email.toLowerCase() !== admin.email) {
    const existing = await User.findOne({ email: updateData.email.toLowerCase(), _id: { $ne: admin._id } });
    if (existing) {
      throw new ApiError(409, 'Email address is already in use');
    }
    admin.email = updateData.email.toLowerCase().trim();
  }

  if (updateData.name !== undefined) admin.name = updateData.name.trim();
  if (updateData.bio !== undefined) admin.bio = updateData.bio.trim();

  await admin.save();

  await recordAudit({
    action: 'Profile Updated',
    category: 'user_management',
    details: `Super Admin "${admin.name}" updated their profile details`,
    actor: admin,
    target: admin.email,
    targetId: admin._id.toString()
  });

  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    bio: admin.bio,
    avatar: admin.avatar
  };
};

export const updateAdminAvatar = async (adminId, avatarUrl) => {
  const admin = await User.findById(adminId);
  if (!admin) {
    throw new ApiError(404, 'Admin profile not found');
  }

  admin.avatar = avatarUrl.trim();
  await admin.save();

  return {
    id: admin._id.toString(),
    avatar: admin.avatar
  };
};

export const changeAdminPassword = async (adminId, { currentPassword, newPassword }) => {
  const admin = await User.findById(adminId).select('+password');
  if (!admin) {
    throw new ApiError(404, 'Admin profile not found');
  }

  const isMatch = await admin.isPasswordMatch(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password does not match');
  }

  admin.password = newPassword;
  await admin.save();

  await recordAudit({
    action: 'Admin Password Changed',
    category: 'security',
    details: `Super Admin updated their authentication password`,
    actor: admin,
    target: admin.email,
    targetId: admin._id.toString()
  });

  return {
    success: true,
    message: 'Password updated successfully'
  };
};

export const getAdminSessions = async (adminId) => {
  const admin = await User.findById(adminId);
  if (!admin) {
    throw new ApiError(404, 'Admin profile not found');
  }

  const sessions = admin.sessions || [];
  if (sessions.length === 0) {
    sessions.push({
      _id: new mongoose.Types.ObjectId(),
      ip: '127.0.0.1',
      userAgent: 'Chrome on Windows',
      device: 'Desktop',
      createdAt: admin.lastLogin || new Date(),
      lastActive: new Date(),
      isValid: true
    });
    admin.sessions = sessions;
    await admin.save();
  }

  return {
    adminId: admin._id.toString(),
    sessions: sessions.map(s => ({
      sessionId: s._id ? s._id.toString() : s.id,
      ip: s.ip || '127.0.0.1',
      userAgent: s.userAgent || 'Chrome Browser',
      device: s.device || 'Desktop',
      createdAt: s.createdAt,
      lastActive: s.lastActive || s.createdAt,
      isCurrent: true
    }))
  };
};

export const revokeAdminSession = async (adminId, sessionId) => {
  const admin = await User.findById(adminId);
  if (!admin) {
    throw new ApiError(404, 'Admin profile not found');
  }

  admin.sessions = (admin.sessions || []).filter(
    s => (s._id ? s._id.toString() : s.id) !== sessionId
  );
  await admin.save();

  await recordAudit({
    action: 'Session Terminated',
    category: 'security',
    details: `Revoked session ${sessionId}`,
    actor: admin,
    target: admin.email,
    targetId: admin._id.toString()
  });

  return {
    sessionId,
    revoked: true,
    message: 'Session revoked successfully'
  };
};

