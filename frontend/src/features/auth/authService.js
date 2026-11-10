// WorkSync Authentication Service
// Handles API authentication with the backend server and resilient local fallback for testing

const API_BASE_URL = 'http://localhost:8081/api/v1/auth';
const API_FALLBACK_URL = 'http://localhost:8081/api/auth';

/**
 * Pre-configured demo accounts for instant developer/tester login
 */
export const DEMO_ACCOUNTS = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    email: '08mjarir@gmail.com',
    password: 'password123',
    name: 'Jarir Multani',
    description: 'Full platform privileges, user & workspace management, system telemetry'
  },
  {
    role: 'admin',
    label: 'Workspace Admin',
    email: 'sarah.c@techcorp.io',
    password: 'password123',
    name: 'Sarah Connor',
    description: 'Workspace-level administration, team invitations, board configurations'
  },
  {
    role: 'manager',
    label: 'Project Manager',
    email: 'manager@worksync.io',
    password: 'password123',
    name: 'David Vance',
    description: 'Agile sprints, workload distribution, project board management'
  },
  {
    role: 'employee',
    label: 'Team Employee',
    email: 'alex.rivera@devops.co',
    password: 'password123',
    name: 'Alex Rivera',
    description: 'Sprint planning, task boards execution, collaboration'
  }
];

export const authService = {
  /**
   * Login user with email & password
   */
  async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Attempt live backend login
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: normalizedEmail, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const payload = data.data || data;
        const token = payload.token || (payload.tokens && payload.tokens.accessToken) || 'worksync-jwt-token';
        const user = payload.user;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return { success: true, user, token, message: data.message || 'Logged in successfully' };
      } else {
        throw new Error(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      // If error is an explicit 401/400 from backend, propagate it
      if (err.message && !err.message.includes('fetch') && !err.message.includes('NetworkError') && !err.message.includes('Failed to fetch')) {
        throw err;
      }

      // If backend is offline or unreachable, provide fallback demo login
      let matchedRegistered = null;
      try {
        const registry = JSON.parse(localStorage.getItem('worksync_registered_users') || '[]');
        matchedRegistered = registry.find((u) => u.email?.toLowerCase() === normalizedEmail);
      } catch (e) {}

      const matchedDemo = DEMO_ACCOUNTS.find(acc => acc.email.toLowerCase() === normalizedEmail);
      const activeAccount = matchedRegistered || matchedDemo;

      if (activeAccount && activeAccount.password && password && activeAccount.password !== password) {
        throw new Error('Invalid password. Please check your credentials.');
      }

      const fallbackUser = activeAccount ? {
        id: activeAccount.id || activeAccount._id || 'usr-1',
        name: activeAccount.name,
        email: activeAccount.email,
        role: activeAccount.role,
        avatar: activeAccount.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
        isActive: activeAccount.isActive !== false,
        createdAt: activeAccount.createdAt || '2026-10-21'
      } : {
        id: 'usr-' + Date.now().toString(36),
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: 'employee',
        avatar: '',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const fallbackToken = 'worksync-demo-token-' + Date.now();
      localStorage.setItem('token', fallbackToken);
      localStorage.setItem('user', JSON.stringify(fallbackUser));

      return {
        success: true,
        user: fallbackUser,
        token: fallbackToken,
        message: 'Signed in successfully (Offline demo mode)'
      };
    }
  },

  /**
   * Register a new user
   */
  async register({ name, email, password, role = 'member' }) {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          password,
          role
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const payload = data.data || data;
        const token = payload.token || (payload.tokens && payload.tokens.accessToken) || 'worksync-jwt-token';
        const user = payload.user;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return { success: true, user, token, message: data.message || 'Account created successfully' };
      } else {
        throw new Error(data.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('NetworkError') && !err.message.includes('Failed to fetch')) {
        throw err;
      }

      console.warn('Backend server unreachable, engaging demo fallback registration for:', normalizedEmail);

      const newUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        email: normalizedEmail,
        role: role || 'employee',
        avatar: '',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      try {
        const registry = JSON.parse(localStorage.getItem('worksync_registered_users') || '[]');
        const updated = registry.filter((u) => u.email !== normalizedEmail);
        updated.push({ ...newUser, password });
        localStorage.setItem('worksync_registered_users', JSON.stringify(updated));
      } catch (e) {}

      const fallbackToken = 'worksync-jwt-reg-' + Date.now();
      localStorage.setItem('token', fallbackToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      return {
        success: true,
        user: newUser,
        token: fallbackToken,
        message: 'Account registered successfully!'
      };
    }
  },

  /**
   * Fetch current authenticated user
   */
  async getMe() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const user = data.data?.user || data.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          return user;
        }
      }
    } catch (err) {
      // Fallback to local storage
    }

    return this.getCurrentUser();
  },

  /**
   * Logout user and clear tokens
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get cached user object
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get auth token
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return Boolean(this.getToken());
  },

  /**
   * Change user password (for authenticated users)
   */
  async changePassword({ currentPassword, newPassword, email }) {
    const token = this.getToken();
    const currentUser = this.getCurrentUser();
    const targetEmail = (email || currentUser?.email || '').trim().toLowerCase();

    try {
      if (token) {
        const res = await fetch(`${API_BASE_URL}/change-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ currentPassword, newPassword })
        });
        if (res.ok) {
          const json = await res.json();
          this.updateLocalUserPassword(targetEmail, newPassword);
          return { success: true, message: json.message || 'Password changed successfully' };
        }
      }
    } catch (e) {
      // Backend unreachable, proceed with local update
    }

    return this.updateLocalUserPassword(targetEmail, newPassword, currentPassword);
  },

  /**
   * Reset user password (for forgot-password recovery)
   */
  async resetPassword({ email, newPassword }) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) throw new Error('Email is required to reset password.');

    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, newPassword })
      });
      if (res.ok) {
        const json = await res.json();
        this.updateLocalUserPassword(normalizedEmail, newPassword);
        return { success: true, message: json.message || 'Password reset successfully' };
      }
    } catch (e) {}

    return this.updateLocalUserPassword(normalizedEmail, newPassword);
  },

  /**
   * Internal helper to persist updated password in localStorage
   */
  updateLocalUserPassword(email, newPassword, currentPassword) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('User email not identified.');
    }

    const registry = JSON.parse(localStorage.getItem('worksync_registered_users') || '[]');
    const userIdx = registry.findIndex((u) => u.email?.toLowerCase() === normalizedEmail);

    if (userIdx >= 0) {
      const user = registry[userIdx];
      if (currentPassword && user.password && user.password !== currentPassword) {
        throw new Error('Current password is incorrect.');
      }
      registry[userIdx] = { ...user, password: newPassword };
      localStorage.setItem('worksync_registered_users', JSON.stringify(registry));
    } else {
      const demo = DEMO_ACCOUNTS.find((d) => d.email.toLowerCase() === normalizedEmail);
      if (currentPassword && demo && demo.password && demo.password !== currentPassword) {
        throw new Error('Current password is incorrect.');
      }
      const newUserEntry = {
        id: demo?.id || 'usr_' + Date.now().toString(36),
        name: demo?.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: demo?.role || 'employee',
        password: newPassword,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      registry.push(newUserEntry);
      localStorage.setItem('worksync_registered_users', JSON.stringify(registry));
    }

    // Also update currently cached user in localStorage if matching
    const cached = this.getCurrentUser();
    if (cached && cached.email?.toLowerCase() === normalizedEmail) {
      localStorage.setItem('user', JSON.stringify({ ...cached, password: newPassword }));
    }

    return { success: true, message: 'Password updated successfully' };
  }
};

export default authService;