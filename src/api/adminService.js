import axiosClient from './axiosClient.js';

export const adminService = {
  /**
   * Fetch all registered shops and their owners
   */
  async getShops() {
    const response = await axiosClient.get('/admin/shops');
    return response.data?.data?.shops || [];
  },

  /**
   * Activate shop subscription for 30 days
   * @param {string} id
   */
  async activateShop(id) {
    const response = await axiosClient.patch(`/admin/shops/${id}/activate`);
    return response.data?.data?.shop || response.data?.data;
  },

  /**
   * Extend shop subscription by 30 days
   * @param {string} id
   */
  async extendSubscription(id) {
    const response = await axiosClient.patch(`/admin/shops/${id}/extend`);
    return response.data?.data?.shop || response.data?.data;
  },
};

export default adminService;
