
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "http://localhost:8081/api/v1/auth";
const API_FALLBACK_URL = "http://localhost:8081/api/auth";

/**
 * Demo accounts for local development.
 */
const DEMO_ACCOUNTS = [
  {
    email: "08mjarir@gmail.com",
    name: "Jarir Multani",
    role: "super_admin",
    password: "password123",
  },
  {
    email: "sarah.c@techcorp.io",
    name: "Sarah Connor",
    role: "admin",
    password: "password123",
  },
  {
    email: "manager@worksync.io",
    name: "David Vance",
    role: "manager",
    password: "password123",
  },
  {
    email: "alex.rivera@devops.co",
    name: "Alex Rivera",
    role: "employee",
    password: "password123",
  },
];

/**
 * Safely read the stored user.
 */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Safely read locally registered users.
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
 * Save authentication information.
 */
const saveAuth = (user, token) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

/**
 * Detect actual network failures.
 * HTTP errors should not trigger offline login.
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
 * Try the primary API endpoint, then the fallback endpoint
 * only when the primary endpoint returns 404.
 */
const requestAuthEndpoint = async (endpoint, options) => {
  let response = await fetch(`${API_BASE_URL}/${endpoint}`, options);

  if (response.status === 404) {
    response = await fetch(`${API_FALLBACK_URL}/${endpoint}`, options);
  }

  return response;
};

/**
 * Extract a useful API error message.
 */
const getApiError = (data, fallback) => {
  return (
    data?.message ||
    data?.error ||
    data?.errors?.[0]?.message ||
    fallback
  );
};

/**
 * 1. Register User
 */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    { name, email, password, role = "employee" },
    { rejectWithValue }
  ) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName =
      (name && name.trim()) || normalizedEmail.split("@")[0];

    try {
      const response = await requestAuthEndpoint("register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(
          getApiError(data, "Registration failed")
        );
      }

      const payload = data.data || data;
      const token =
        payload.token ||
        payload.tokens?.accessToken ||
        "worksync-jwt-token";

      const user = payload.user;

      if (!user) {
        return rejectWithValue(
          "Registration response did not contain user information."
        );
      }

      saveAuth(user, token);

      return {
        user,
        token,
        message:
          data.message ||
          `Account created successfully with role ${user.role || role}`,
      };
    } catch (error) {
      if (!isNetworkError(error)) {
        return rejectWithValue(
          error.message || "Registration failed"
        );
      }

      // Offline registration fallback for development.
      const registry = getRegisteredUsers();

      const existingUser = registry.find(
        (user) => user.email?.toLowerCase() === normalizedEmail
      );

      const existingDemo = DEMO_ACCOUNTS.find(
        (account) => account.email.toLowerCase() === normalizedEmail
      );

      if (existingUser || existingDemo) {
        return rejectWithValue(
          "An account with this email already exists."
        );
      }

      const id =
        "usr_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 6);

      const newUser = {
        _id: id,
        id,
        name: normalizedName,
        email: normalizedEmail,
        role: role || "employee",
        avatar: null,
        workspaceId: null,
        status: "active",
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      try {
        registry.push({
          ...newUser,
          password,
        });

        localStorage.setItem(
          "worksync_registered_users",
          JSON.stringify(registry)
        );
      } catch {
        return rejectWithValue(
          "Unable to save offline registration."
        );
      }

      const token = `jwt_${newUser.id}`;

      saveAuth(newUser, token);

      return {
        user: newUser,
        token,
        message: "Account created successfully (Offline demo mode)",
      };
    }
  }
);

/**
 * 2. Login User
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { email, password },
    { rejectWithValue }
  ) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await requestAuthEndpoint("login", {
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
        return rejectWithValue(
          getApiError(data, "Invalid credentials")
        );
      }

      const payload = data.data || data;
      const token =
        payload.token ||
        payload.tokens?.accessToken ||
        "worksync-jwt-token";

      const user = payload.user;

      if (!user) {
        return rejectWithValue(
          "Login response did not contain user information."
        );
      }

      saveAuth(user, token);

      return {
        user,
        token,
        message: data.message || "Logged in successfully",
      };
    } catch (error) {
      if (!isNetworkError(error)) {
        return rejectWithValue(
          error.message || "Unable to log in."
        );
      }

      // Offline login fallback.
      const registry = getRegisteredUsers();

      let matchedUser = registry.find(
        (user) => user.email?.toLowerCase() === normalizedEmail
      );

      if (!matchedUser) {
        matchedUser = DEMO_ACCOUNTS.find(
          (account) => account.email.toLowerCase() === normalizedEmail
        );
      }

      if (!matchedUser) {
        return rejectWithValue(
          "Account not found. Offline login is available only for registered or demo accounts."
        );
      }

      if (
        !matchedUser.password ||
        matchedUser.password !== password
      ) {
        return rejectWithValue(
          "Invalid password. Please check your credentials."
        );
      }

      const loggedUser = {
        _id: matchedUser._id || matchedUser.id,
        id: matchedUser.id || matchedUser._id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role || "employee",
        avatar: matchedUser.avatar || null,
        status: matchedUser.status || "active",
        isActive: matchedUser.isActive !== false,
        createdAt: matchedUser.createdAt,
      };

      const token = `jwt_${loggedUser.id}`;

      saveAuth(loggedUser, token);

      return {
        user: loggedUser,
        token,
        message: "Signed in successfully (Offline demo mode)",
      };
    }
  }
);

/**
 * 3. Fetch Current User Profile (/me)
 */
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return rejectWithValue("No token found");
    }

    try {
      const response = await requestAuthEndpoint("me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(
          getApiError(data, "Failed to authenticate current user")
        );
      }

      const user = data.data?.user || data.user;

      if (!user) {
        return rejectWithValue(
          "Current user information was not returned."
        );
      }

      localStorage.setItem("user", JSON.stringify(user));

      return { user };
    } catch (error) {
      if (isNetworkError(error)) {
        // Restore cached user only when the backend is unreachable.
        const stored = getStoredUser();

        if (stored) {
          return { user: stored };
        }
      }

      return rejectWithValue(
        error.message || "Failed to fetch current user profile"
      );
    }
  }
);

/**
 * Initial State
 */
const initialToken =
  typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

const initialUser =
  typeof window !== "undefined"
    ? getStoredUser()
    : null;

const initialState = {
  user: initialUser,
  token: initialToken,
  role: initialUser?.role || null,
  isAuthenticated: Boolean(initialToken && initialUser),
  loading: false,
  error: null,
  successMessage: null,
};

/**
 * Authentication Redux Slice
 */
export const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    resetAuthStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },

    logoutUser: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },

    syncFromLocalStorage: (state) => {
      const storedToken = localStorage.getItem("token");
      const storedUser = getStoredUser();

      state.token = storedToken;
      state.user = storedUser;
      state.role = storedUser?.role || null;
      state.isAuthenticated = Boolean(storedToken && storedUser);
    },
  },

  extraReducers: (builder) => {
    // Registration
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user?.role || null;
        state.isAuthenticated = true;
        state.error = null;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
        state.successMessage = null;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user?.role || null;
        state.isAuthenticated = true;
        state.error = null;
        state.successMessage = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.successMessage = null;
      });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.user?.role || null;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;

        // Clear authentication only for missing or invalid/expired tokens.
        const errorMessage = String(action.payload || "").toLowerCase();

        if (
          errorMessage === "no token found" ||
          errorMessage.includes("invalid") ||
          errorMessage.includes("expired") ||
          errorMessage.includes("unauthorized")
        ) {
          state.user = null;
          state.token = null;
          state.role = null;
          state.isAuthenticated = false;

          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      });
  },
});

export const {
  clearAuthError,
  resetAuthStatus,
  logoutUser,
  syncFromLocalStorage,
} = authSlice.actions;

export default authSlice.reducer;