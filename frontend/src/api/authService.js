import axiosClient from './axiosClient.js';

export const authService = {
  /**
   * Register a new Owner and their Shop
   * @param {FormData} formData
   */
  async register(formData) {
    const response = await axiosClient.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Create a new Cashier staff member (Owner only)
   * @param {FormData} formData
   */
  async registerStaff(formData) {
    const response = await axiosClient.post('/users/register-staff', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * User login (Cashier, Owner, or Admin)
   * @param {{ username?: string, email?: string, password: string }} credentials
   */
  async login(credentials) {
    const response = await axiosClient.post('/users/login', credentials);
    return response.data;
  },

  /**
   * Logout user and invalidate refresh token
   */
  async logout() {
    const response = await axiosClient.post('/users/logout');
    return response.data;
  },

  /**
   * Explicitly refresh access token
   * @param {string} [refreshToken]
   */
  async refreshToken(refreshToken) {
    const response = await axiosClient.post('/users/refresh-token', {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getCurrentUser() {
    const response = await axiosClient.post('/users/current-user');
    return response.data;
  },

  /**
   * Change current user's password
   * @param {{ oldPassword: string, newPassword: string }} payload
   */
  async changePassword(payload) {
    const response = await axiosClient.post('/users/change-password', payload);
    return response.data;
  },
};

export default authService;
