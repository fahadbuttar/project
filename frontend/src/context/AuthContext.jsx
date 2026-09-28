import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../api/authService.js';
import { setAccessToken } from '../api/axiosClient.js';
import { getErrorMessage } from '../utils/formatters.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('volt_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync user state with localStorage
  const saveUser = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('volt_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('volt_user');
      setAccessToken(null);
    }
  }, []);

  // Validate session on app initialization
  const initAuth = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      const currentUser = response?.data?.user || response?.data;
      if (currentUser) {
        saveUser(currentUser);
      }
    } catch (err) {
      // If session check fails and we have no valid cookie/token, clear local stale user
      console.warn('Session verification failed:', err.message);
      // If unauthorized, reset
      if (err.response?.status === 401 || err.response?.status === 400) {
        saveUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [saveUser]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  /**
   * Login action
   */
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const loggedUser = response?.data?.user;
      if (loggedUser) {
        saveUser(loggedUser);
      }
      return { success: true, user: loggedUser, message: response?.messege || 'Logged in successfully' };
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Failed to log in');
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Register Owner and Shop action
   */
  const register = async (formData) => {
    try {
      const response = await authService.register(formData);
      // In registerUser: apiResponse(201, createdUser, ...)
      const newUser = response?.data?.createdUser || response?.data;
      if (newUser) {
        saveUser(newUser);
      }
      return { success: true, user: newUser, message: response?.messege || 'Account registered successfully' };
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Registration failed');
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Logout action
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout error ignored:', err);
    } finally {
      saveUser(null);
      localStorage.removeItem('volt_token');
      localStorage.removeItem('volt_orders');
      localStorage.removeItem('volt_quotations');
    }
  };

  /**
   * Refresh current profile
   */
  const refreshProfile = async () => {
    try {
      const response = await authService.getCurrentUser();
      const refreshed = response?.data?.user || response?.data;
      if (refreshed) {
        saveUser(refreshed);
      }
      return refreshed;
    } catch (err) {
      console.error('Refresh profile error:', err);
      return null;
    }
  };

  const isOwner = user?.role === 'OWNER';
  const isAdmin = user?.role === 'ADMIN';
  const isCashier = user?.role === 'CASHIER';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isOwner,
        isAdmin,
        isCashier,
        login,
        register,
        logout,
        refreshProfile,
        saveUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
