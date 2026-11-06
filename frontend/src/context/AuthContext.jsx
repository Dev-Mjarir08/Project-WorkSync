import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  logoutUser,
  clearAuthError
} from '../features/auth/authSlice.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, role, isAuthenticated, loading, error, successMessage } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, user]);

  const login = async ({ email, password }) => {
    const action = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(action)) {
      return action.payload;
    } else {
      throw new Error(action.payload || 'Login failed');
    }
  };

  const register = async ({ name, email, password, role }) => {
    const action = await dispatch(registerUser({ name, email, password, role }));
    if (registerUser.fulfilled.match(action)) {
      return action.payload;
    } else {
      throw new Error(action.payload || 'Registration failed');
    }
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  const value = {
    user,
    token,
    role: role || user?.role || null,
    isAuthenticated,
    loading,
    error,
    successMessage,
    login,
    register,
    logout,
    clearError: () => dispatch(clearAuthError())
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;