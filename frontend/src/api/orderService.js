import axiosClient from './axiosClient.js';

export const orderService = {
  /**
   * Create POS sales order / invoice
   * @param {{
   *   items: Array<{ productId: string, quantity: number }>,
   *   saleType: 'WHOLESALE' | 'RETAIL',
   *   discountType: 'PERCENTAGE' | 'FIXED' | 'NONE',
   *   discountValue: number,
   *   paidAmount: number,
   *   customerId?: string
   * }} payload
   */
  async createOrder(payload) {
    const response = await axiosClient.post('/orders/create-order', payload);
    const order = response.data?.data || response.data;
    
    // Save to local recent orders cache for viewing in Orders screen
    if (order) {
      try {
        const cached = JSON.parse(localStorage.getItem('volt_orders') || '[]');
        cached.unshift(order);
        localStorage.setItem('volt_orders', JSON.stringify(cached.slice(0, 100)));
      } catch (e) {
        console.error('Failed to cache order:', e);
      }
    }

    return response.data;
  },

  /**
   * Cancel an order in PENDING status (safely restocks items)
   * @param {string} orderId
   */
  async cancelOrder(orderId) {
    const response = await axiosClient.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },

  /**
   * Mark an order as DELIVERED
   * @param {string} orderId
   */
  async updateOrderStatus(orderId) {
    const response = await axiosClient.patch(`/orders/${orderId}/status`);
    return response.data;
  },

  /**
   * Create an estimation / quotation (does not deduct stock)
   * @param {{
   *   items: Array<{ productId: string, quantity: number }>,
   *   saleType: 'WHOLESALE' | 'RETAIL',
   *   discountType?: 'PERCENTAGE' | 'FIXED' | 'NONE',
   *   discountValue?: number
   * }} payload
   */
  async createQuotation(payload) {
    const response = await axiosClient.post('/orders/quotation', payload);
    const quotation = response.data?.data?.quotation || response.data?.data;

    // Cache quotations
    if (quotation) {
      try {
        const cached = JSON.parse(localStorage.getItem('volt_quotations') || '[]');
        cached.unshift(quotation);
        localStorage.setItem('volt_quotations', JSON.stringify(cached.slice(0, 100)));
      } catch (e) {
        console.error('Failed to cache quotation:', e);
      }
    }

    return response.data;
  },

  /**
   * Convert draft quotation into official order/invoice (deducts stock)
   * @param {string} quotationId
   * @param {{ paidAmount: number, customerId?: string }} payload
   */
  async convertQuotationToInvoice(quotationId, payload) {
    const response = await axiosClient.patch(`/orders/${quotationId}`, payload);
    return response.data;
  },

  /**
   * View paginated stock audit log history
   * @param {{
   *   productId?: string,
   *   reason?: string,
   *   startDate?: string,
   *   endDate?: string,
   *   page?: number,
   *   limit?: number
   * }} params
   */
  async getStockLogs(params = {}) {
    const cleanParams = {};
    if (params.productId) cleanParams.productId = params.productId;
    if (params.reason) cleanParams.reason = params.reason;
    if (params.startDate) cleanParams.startDate = params.startDate;
    if (params.endDate) cleanParams.endDate = params.endDate;
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    const response = await axiosClient.get('/orders/stocklogs', {
      params: cleanParams,
    });

    const data = response.data?.data || {};
    return {
      logs: data.logs || [],
      pagination: data.pagination || {
        logCount: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
      },
      raw: response.data,
    };
  },

  /**
   * Get cached recent orders
   */
  getCachedOrders() {
    try {
      return JSON.parse(localStorage.getItem('volt_orders') || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Update cached orders
   * @param {Array} orders
   */
  setCachedOrders(orders) {
    try {
      localStorage.setItem('volt_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Get cached quotations
   */
  getCachedQuotations() {
    try {
      return JSON.parse(localStorage.getItem('volt_quotations') || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Update cached quotations
   * @param {Array} quotations
   */
  setCachedQuotations(quotations) {
    try {
      localStorage.setItem('volt_quotations', JSON.stringify(quotations));
    } catch (e) {
      console.error(e);
    }
  },
};

export default orderService;
