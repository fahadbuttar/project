import axiosClient from './axiosClient.js';

export const customerService = {
  /**
   * Create a new customer record
   * @param {{ name: string, phoneNo: string, address?: string }} payload
   */
  async createCustomer(payload) {
    const response = await axiosClient.post('/customers/create-customer', payload);
    const customer = response.data?.data?.customer || response.data?.data;

    // Cache locally for convenient UI dropdowns
    if (customer) {
      try {
        const cached = JSON.parse(localStorage.getItem('volt_customers') || '[]');
        const exists = cached.some((c) => c._id === customer._id || c.phoneNo === customer.phoneNo);
        if (!exists) {
          cached.unshift(customer);
          localStorage.setItem('volt_customers', JSON.stringify(cached));
        }
      } catch (e) {
        console.error('Failed to cache customer:', e);
      }
    }

    return response.data;
  },

  /**
   * Get cached customers
   */
  getCachedCustomers() {
    try {
      return JSON.parse(localStorage.getItem('volt_customers') || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Update cached customers
   * @param {Array} customers
   */
  setCachedCustomers(customers) {
    try {
      localStorage.setItem('volt_customers', JSON.stringify(customers));
    } catch (e) {
      console.error(e);
    }
  },
};

export default customerService;
