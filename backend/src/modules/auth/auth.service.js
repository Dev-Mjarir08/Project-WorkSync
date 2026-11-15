import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateAuthTokens } from '../../utils/generateToken.js';
import { ROLES } from '../../constants/roles.js';

/**
 * Register a new user account
 * Public self-registration is strictly for Super Admin.
 * All other roles (admin, manager, employee) must be created/assigned by a Super Admin.
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} - { user, token, tokens }
 */
export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists.');
  }

  // Create user - Enforce Super Admin role on public self-registration
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: ROLES.SUPER_ADMIN
  });

  // Generate tokens
  const { token, tokens } = generateAuthTokens(user);

  // Look up user's active workspace membership or ownership
  let userWorkspaceId = null;
  let workspaceRole = null;
  try {
    const { WorkspaceMember } = await import('../../models/WorkspaceMember.js');
    const { Workspace } = await import('../../models/Workspace.js');
    const member = await WorkspaceMember.findOne({ user: user._id, status: 'active' });
    if (member) {
      userWorkspaceId = member.workspace.toString();
      workspaceRole = member.role;
    } else {
      const owned = await Workspace.findOne({ owner: user._id });
      if (owned) {
        userWorkspaceId = owned._id.toString();
        workspaceRole = 'owner';
      } else if (user.createdBy) {
        const creatorWs = await Workspace.findOne({ owner: user.createdBy });
        if (creatorWs) {
          userWorkspaceId = creatorWs._id.toString();
          workspaceRole = user.role;
        }
      }
    }
  } catch (wsErr) {}

  const userData = user.toJSON();
  if (userWorkspaceId) {
    userData.workspaceId = userWorkspaceId;
    userData.workspaceRole = workspaceRole || user.role;
  }

  return {
    user: userData,
    token,
    tokens
  };
};

/**
 * Authenticate existing user with email and password
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { user, token, tokens }
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user by email and explicitly include password
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Check if user account is active
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact administrator.');
  }

  // Compare passwords
  const isMatch = await user.isPasswordMatch(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Update last login timestamp without re-validating the full schema
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const { token, tokens } = generateAuthTokens(user);

  // Look up user's active workspace membership or ownership
  let userWorkspaceId = null;
  let workspaceRole = null;
  try {
    const { WorkspaceMember } = await import('../../models/WorkspaceMember.js');
    const { Workspace } = await import('../../models/Workspace.js');
    const member = await WorkspaceMember.findOne({ user: user._id, status: 'active' });
    if (member) {
      userWorkspaceId = member.workspace.toString();
      workspaceRole = member.role;
    } else {
      const owned = await Workspace.findOne({ owner: user._id });
      if (owned) {
        userWorkspaceId = owned._id.toString();
        workspaceRole = 'owner';
      } else if (user.createdBy) {
        const creatorWs = await Workspace.findOne({ owner: user.createdBy });
        if (creatorWs) {
          userWorkspaceId = creatorWs._id.toString();
          workspaceRole = user.role;
        }
      }
    }
  } catch (wsErr) {}

  const userData = user.toJSON();
  if (userWorkspaceId) {
    userData.workspaceId = userWorkspaceId;
    userData.workspaceRole = workspaceRole || user.role;
  }

  return {
    user: userData,
    token,
    tokens
  };
};

/**
 * Retrieve user profile by ID
 * @param {string} userId - MongoDB ObjectId
 * @returns {Promise<Object>} - Sanitized user document
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }
  return user.toJSON();
};

/**
 * Update allowed fields of user profile
 * @param {string} userId - MongoDB ObjectId
 * @param {Object} updateData - { name, avatar, bio }
 * @returns {Promise<Object>} - Updated user document
 */
export const updateUserProfile = async (userId, updateData) => {
  const allowedFields = ['name', 'avatar', 'bio'];
  const filteredData = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredData[field] =
        typeof updateData[field] === 'string'
          ? updateData[field].trim()
          : updateData[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: filteredData },
    { returnDocument: 'after', runValidators: true }
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found.');
  }

  return updatedUser.toJSON();
};

/**
 * Change user password
 * @param {string} userId - MongoDB ObjectId
 * @param {Object} passwords - { currentPassword, newPassword }
 * @returns {Promise<Object>} - Confirmation message
 */
export const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const isMatch = await user.isPasswordMatch(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password does not match.');
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password cannot be the same as current password.');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully.' };
};

/**
 * Generate fresh token for already authenticated user
 * @param {Object} user - Authenticated user document
 * @returns {Promise<Object>} - { user, token, tokens }
 */
export const refreshUserToken = async (user) => {
  const { token, tokens } = generateAuthTokens(user);

  return {
    user: user.toJSON ? user.toJSON() : user,
    token,
    tokens
  };
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  refreshUserToken
};
