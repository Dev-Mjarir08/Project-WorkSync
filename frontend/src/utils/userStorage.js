/**
 * User & Tenant Isolated Storage Helper
 * Ensures every user and every super admin has an isolated dashboard and data store.
 * One user's or super admin's data is never visible to another.
 */

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

export const getCurrentUserScope = () => {
  const user = getCurrentUser();
  if (!user) return 'anonymous';
  const id = user.id || user._id || user.email;
  return id ? String(id).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') : 'anonymous';
};

export const getUserScopedKey = (baseKey) => {
  const scope = getCurrentUserScope();
  return `worksync_${scope}_${baseKey}`;
};

export const getUserItem = (baseKey, defaultValue = null) => {
  try {
    const key = getUserScopedKey(baseKey);
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${baseKey} from user storage:`, err);
    return defaultValue;
  }
};

export const setUserItem = (baseKey, value) => {
  try {
    const key = getUserScopedKey(baseKey);
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${baseKey} to user storage:`, err);
  }
};

export const removeUserItem = (baseKey) => {
  try {
    const key = getUserScopedKey(baseKey);
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Error removing ${baseKey} from user storage:`, err);
  }
};

export default {
  getCurrentUser,
  getCurrentUserScope,
  getUserScopedKey,
  getUserItem,
  setUserItem,
  removeUserItem
};

