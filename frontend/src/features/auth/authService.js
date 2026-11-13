
// WorkSync Authentication Service
// Backend authentication with local fallback for development/demo use.

const API_BASE_URL = "http://localhost:8081/api/v1/auth";

/**
 * Pre-configured demo accounts for development and testing.
 */
export const DEMO_ACCOUNTS = [
  {
    role: "super_admin",
    label: "Super Admin",
    email: "08mjarir@gmail.com",
    password: "password123",
    name: "Jarir Multani",
    description: "Full platform privileges, user and workspace management",
  },
  {
    role: "admin",
    label: "Workspace Admin",
    email: "sarah.c@techcorp.io",
    password: "password123",
    name: "Sarah Connor",
    description: "Workspace administration and team management",
  },
  {
    role: "manager",
    label: "Project Manager",
    email: "manager@worksync.io",
    password: "password123",
    name: "David Vance",
    description: "Project and sprint management",
  },
  {
    role: "employee",
    label: "Team Employee",
    email: "alex.rivera@devops.co",
    password: "password123",
    name: "Alex Rivera",
    description: "Task execution and collaboration",
  },
];

/**
 * Checks whether an error came from a network failure.
 * HTTP errors should not silently trigger offline authentication.
 */
const isNetworkError = (error) => {
  return (
    error instanceof TypeError ||
    error.message?.includes("Failed to fetch") ||
    error.message?.includes("NetworkError") ||
    error.message?.includes("fetch")
  );
};

/**
 * Safely reads JSON from localStorage.
 */
const getRegisteredUsers = () => {
  try {
    const users = JSON.parse(
      localStorage.getItem("worksync_registered_users") || "[]"
    );

    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

/**
 * Saves registered users to localStorage.
 */
const saveRegisteredUsers = (users) => {
  localStorage.setItem("worksync_registered_users", JSON.stringify(users));
};

/**
 * Persists authentication information.
 */
const saveAuth = (user, token) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const authService = {
  /**
   * Login user with email and password.
   */
  async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid email or password.");
      }

      const payload = data.data || data;
      const token =
        payload.token ||
        payload.tokens?.accessToken ||
        "worksync-jwt-token";

      const user = payload.user;

      if (!user) {
        throw new Error("Login response did not contain user information.");
      }

      saveAuth(user, token);

      return {
        success: true,
        user,
        token,
        message: data.message || "Logged in successfully",
      };
    } catch (error) {
      // Only use offline authentication when the backend is unreachable.
      if (!isNetworkError(error)) {
        throw error;
      }

      console.warn(
        "Backend unavailable. Attempting offline demo login:",
        normalizedEmail
      );

      const registry = getRegisteredUsers();

      const matchedRegistered = registry.find(
        (user) => user.email?.toLowerCase() === normalizedEmail
      );

      const matchedDemo = DEMO_ACCOUNTS.find(
        (account) => account.email.toLowerCase() === normalizedEmail
      );

      const activeAccount = matchedRegistered || matchedDemo;

      if (!activeAccount) {
        throw new Error(
          "Account not found. Offline login is available only for registered or demo accounts."
        );
      }

      if (
        activeAccount.password &&
        activeAccount.password !== password
      ) {
        throw new Error("Invalid password. Please check your credentials.");
      }

      const fallbackUser = {
        id: activeAccount.id || activeAccount._id || "usr-1",
        name: activeAccount.name,
        email: activeAccount.email,
        role: activeAccount.role || "employee",
        avatar:
          activeAccount.avatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
        isActive: activeAccount.isActive !== false,
        createdAt: activeAccount.createdAt || "2026-10-21",
      };

      const fallbackToken = `worksync-demo-token-${Date.now()}`;

      saveAuth(fallbackUser, fallbackToken);

      return {
        success: true,
        user: fallbackUser,
        token: fallbackToken,
        message: "Signed in successfully (Offline demo mode)",
      };
    }
  },

  /**
   * Register a new user.
   */
  async register({
    name,
    email,
    password,
    role = "employee",
  }) {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Registration failed. Please check your details."
        );
      }

      const payload = data.data || data;
      const token =
        payload.token ||
        payload.tokens?.accessToken ||
        "worksync-jwt-token";

      const user = payload.user;

      if (!user) {
        throw new Error(
          "Registration response did not contain user information."
        );
      }

      saveAuth(user, token);

      return {
        success: true,
        user,
        token,
        message: data.message || "Account created successfully",
      };
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      console.warn(
        "Backend unavailable. Using offline registration:",
        normalizedEmail
      );

      const registry = getRegisteredUsers();

      if (
        registry.some(
          (user) => user.email?.toLowerCase() === normalizedEmail
        )
      ) {
        throw new Error("An account with this email already exists.");
      }

      const newUser = {
        id: `usr-${Math.random().toString(36).substring(2, 9)}`,
        name: name.trim(),
        email: normalizedEmail,
        role: role || "employee",
        avatar: "",
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      // Local password storage is for development/demo fallback only.
      const updatedRegistry = [
        ...registry,
        { ...newUser, password },
      ];

      saveRegisteredUsers(updatedRegistry);

      const fallbackToken = `worksync-jwt-reg-${Date.now()}`;

      saveAuth(newUser, fallbackToken);

      return {
        success: true,
        user: newUser,
        token: fallbackToken,
        message: "Account registered successfully (Offline demo mode)",
      };
    }
  },

  /**
   * Fetch the currently authenticated user.
   */
  async getMe() {
    const token = this.getToken();

    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.data?.user || data.user;

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          return user;
        }
      }
    } catch {
      // Use cached user when backend is unavailable.
    }

    return this.getCurrentUser();
  },

  /**
   * Logout user and clear authentication information.
   */
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Get cached user information.
   */
  getCurrentUser() {
    try {
      const userString = localStorage.getItem("user");
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get authentication token.
   */
  getToken() {
    return localStorage.getItem("token");
  },

  /**
   * Check whether a user is authenticated.
   */
  isAuthenticated() {
    return Boolean(this.getToken());
  },

  /**
   * Change password for the authenticated user.
   */
  async changePassword({
    currentPassword,
    newPassword,
    email,
  }) {
    const token = this.getToken();
    const currentUser = this.getCurrentUser();

    const targetEmail = (
      email || currentUser?.email || ""
    ).trim().toLowerCase();

    try {
      if (token) {
        const response = await fetch(
          `${API_BASE_URL}/change-password`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              currentPassword,
              newPassword,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to change password."
          );
        }

        this.updateLocalUserPassword(targetEmail, newPassword);

        return {
          success: true,
          message: data.message || "Password changed successfully",
        };
      }
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      // Fall back to local password update only if backend is unreachable.
    }

    return this.updateLocalUserPassword(
      targetEmail,
      newPassword,
      currentPassword
    );
  },

  /**
   * Reset password for a user.
   */
  async resetPassword({ email, newPassword }) {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error("Email is required to reset password.");
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reset password."
        );
      }

      this.updateLocalUserPassword(normalizedEmail, newPassword);

      return {
        success: true,
        message: data.message || "Password reset successfully",
      };
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      // Local reset is only a development/demo fallback.
    }

    return this.updateLocalUserPassword(
      normalizedEmail,
      newPassword
    );
  },

  /**
   * Update password in local demo storage.
   */
  updateLocalUserPassword(email, newPassword, currentPassword) {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error("User email not identified.");
    }

    const registry = getRegisteredUsers();

    const userIndex = registry.findIndex(
      (user) => user.email?.toLowerCase() === normalizedEmail
    );

    if (userIndex >= 0) {
      const user = registry[userIndex];

      if (
        currentPassword &&
        user.password &&
        user.password !== currentPassword
      ) {
        throw new Error("Current password is incorrect.");
      }

      registry[userIndex] = {
        ...user,
        password: newPassword,
      };

      saveRegisteredUsers(registry);
    } else {
      const demo = DEMO_ACCOUNTS.find(
        (account) => account.email.toLowerCase() === normalizedEmail
      );

      if (!demo) {
        throw new Error(
          "Account not found in local demo storage."
        );
      }

      if (
        currentPassword &&
        demo.password &&
        demo.password !== currentPassword
      ) {
        throw new Error("Current password is incorrect.");
      }

      registry.push({
        id: `usr-${Date.now().toString(36)}`,
        name: demo.name,
        email: normalizedEmail,
        role: demo.role,
        password: newPassword,
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      saveRegisteredUsers(registry);
    }

    const cachedUser = this.getCurrentUser();

    if (
      cachedUser &&
      cachedUser.email?.toLowerCase() === normalizedEmail
    ) {
      localStorage.setItem(
        "user",
        JSON.stringify(cachedUser)
      );
    }

    return {
      success: true,
      message: "Password updated successfully",
    };
  },
};

export default authService;