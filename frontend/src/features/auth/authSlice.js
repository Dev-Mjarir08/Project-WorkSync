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
      return rejectWithValue(err.message || 'Network error: could not connect to backend server');
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
      return rejectWithValue(err.message || 'Network error: could not connect to backend server');
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
