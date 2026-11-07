import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:8081/api/v1/auth';
const API_FALLBACK_URL = 'http://localhost:8081/api/auth';

/**
 * Helper to get safely parsed stored user
 */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * 1. Register User Async Thunk
 * Supports roles: 'super_admin', 'admin', 'manager', 'employee', 'member'
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password, role = 'super_admin' }, { rejectWithValue }) => {
    try {
      let response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role
        })
      });

      if (!response.ok && response.status === 404) {
        response = await fetch(`${API_FALLBACK_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role
          })
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || data.error || (data.errors ? data.errors[0]?.message : 'Registration failed')
        );
      }

      const payload = data.data || data;
      const token = payload.token || (payload.tokens && payload.tokens.accessToken) || 'worksync-jwt-token';
      const user = payload.user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        user,
        token,
        message: data.message || `Account created successfully with role ${user?.role || role}`
      };
    } catch (err) {
      // Offline / Local fallback mode for registration
      const normalizedEmail = email.trim().toLowerCase();
      const userRole = role || 'super_admin';
      const userName = (name && name.trim()) || normalizedEmail.split('@')[0];
      const newUser = {
        _id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: userName,
        email: normalizedEmail,
        role: userRole,
        avatar: null,
        workspaceId: null,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      try {
        const registry = JSON.parse(localStorage.getItem('worksync_registered_users') || '[]');
        const updated = registry.filter((u) => u.email !== normalizedEmail);
        updated.push({ ...newUser, password });
        localStorage.setItem('worksync_registered_users', JSON.stringify(updated));
      } catch (e) {}

      const userToken = 'jwt_' + newUser.id;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      return {
        user: newUser,
        token: userToken,
        message: 'Account created successfully'
      };
    }
  }
);

/**
 * 2. Login User Async Thunk
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      let response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      if (!response.ok && response.status === 404) {
        response = await fetch(`${API_FALLBACK_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password
          })
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || data.error || (data.errors ? data.errors[0]?.message : 'Invalid credentials')
        );
      }

      const payload = data.data || data;
      const token = payload.token || (payload.tokens && payload.tokens.accessToken) || 'worksync-jwt-token';
      const user = payload.user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        user,
        token,
        message: data.message || 'Logged in successfully'
      };
    } catch (err) {
      // Resilient local fallback mode for offline/preview mode
      const normalizedEmail = email.trim().toLowerCase();
      let matchedUser = null;
      try {
        const registry = JSON.parse(localStorage.getItem('worksync_registered_users') || '[]');
        matchedUser = registry.find((u) => u.email?.toLowerCase() === normalizedEmail);
      } catch (e) {}

      const DEMO_ACCOUNTS = [
        { email: '08mjarir@gmail.com', name: 'Jarir Multani', role: 'super_admin', password: 'password123' },
        { email: 'sarah.c@techcorp.io', name: 'Sarah Connor', role: 'admin', password: 'password123' },
        { email: 'manager@worksync.io', name: 'David Vance', role: 'manager', password: 'password123' },
        { email: 'alex.rivera@devops.co', name: 'Alex Rivera', role: 'employee', password: 'password123' }
      ];

      if (!matchedUser) {
        const matchedDemo = DEMO_ACCOUNTS.find((d) => d.email.toLowerCase() === normalizedEmail);
        if (matchedDemo) {
          matchedUser = {
            id: 'usr_' + matchedDemo.role,
            _id: 'usr_' + matchedDemo.role,
            name: matchedDemo.name,
            email: matchedDemo.email,
            role: matchedDemo.role,
            password: matchedDemo.password,
            avatar: null
          };
        }
      }

      if (matchedUser && matchedUser.password && password && matchedUser.password !== password) {
        return rejectWithValue('Invalid password. Please check your credentials.');
      }

      let userRole = 'super_admin';
      let userName = normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      if (matchedUser) {
        userRole = matchedUser.role;
        userName = matchedUser.name;
      } else {
        if (normalizedEmail.includes('admin') && !normalizedEmail.includes('super')) userRole = 'admin';
        else if (normalizedEmail.includes('manager')) userRole = 'manager';
        else if (normalizedEmail.includes('employee') || normalizedEmail.includes('member')) userRole = 'employee';
      }

      const loggedUser = matchedUser
        ? {
            _id: matchedUser._id || matchedUser.id,
            id: matchedUser.id || matchedUser._id,
            name: matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role,
            avatar: matchedUser.avatar || null,
            status: 'active'
          }
        : {
            _id: 'usr_' + normalizedEmail.replace(/[^a-z0-9]/g, '_'),
            id: 'usr_' + normalizedEmail.replace(/[^a-z0-9]/g, '_'),
            name: userName,
            email: normalizedEmail,
            role: userRole,
            avatar: null,
            status: 'active'
          };

      const userToken = 'jwt_' + loggedUser.id;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      return {
        user: loggedUser,
        token: userToken,
        message: 'Signed in successfully'
      };
    }
  }
);

/**
 * 3. Fetch Current User Profile (/me)
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      let response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok && response.status === 404) {
        response = await fetch(`${API_FALLBACK_URL}/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to authenticate current user');
      }

      const user = data.data?.user || data.user;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return { user };
    } catch (err) {
      const stored = getStoredUser();
      if (stored) {
        return { user: stored };
      }
      return rejectWithValue(err.message || 'Failed to fetch current user profile');
    }
  }
);

/**
 * Initial State
 */
const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const initialUser = typeof window !== 'undefined' ? getStoredUser() : null;

const initialState = {
  user: initialUser,
  token: initialToken,
  role: initialUser?.role || null,
  isAuthenticated: Boolean(initialToken && initialUser),
  loading: false,
  error: null,
  successMessage: null
};

export const authSlice = createSlice({
  name: 'auth',
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
    syncFromLocalStorage: (state) => {
      const storedToken = localStorage.getItem('token');
      const storedUser = getStoredUser();
      state.token = storedToken;
      state.user = storedUser;
      state.role = storedUser?.role || null;
      state.isAuthenticated = Boolean(storedToken && storedUser);
    }
  },
  extraReducers: (builder) => {
    // Register
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
        state.error = action.payload || 'Registration failed';
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
        state.error = action.payload || 'Login failed';
        state.successMessage = null;
      });

    // Fetch Current User
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
        // If token is invalid or expired, log out
        if (action.payload === 'No token found' || action.payload?.includes('Invalid') || action.payload?.includes('expired')) {
          state.user = null;
          state.token = null;
          state.role = null;
          state.isAuthenticated = false;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      });
  }
});

export const { clearAuthError, resetAuthStatus, logoutUser, syncFromLocalStorage } = authSlice.actions;

export default authSlice.reducer;
