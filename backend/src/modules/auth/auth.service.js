import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateAuthTokens } from '../../utils/generateToken.js';

/**
 * Register a new user account
 * @param {Object} userData - { name, email, password, role }
 * @returns {Promise<Object>} - { user, token, tokens }
 */
export const registerUser = async ({ name, email, password, role }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists.');
  }

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    ...(role && { role })
  });

  // Generate tokens
  const { token, tokens } = generateAuthTokens(user);

  return {
    user: user.toJSON(),
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

  return {
    user: user.toJSON(),
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
