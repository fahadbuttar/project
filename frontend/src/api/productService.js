import axiosClient from './axiosClient.js';
import categoryService from './categoryService.js';

export const productService = {
  /**
   * Create a new inventory product
   * @param {{
   *   name: string,
   *   description?: string,
   *   brand: string,
   *   category: string,
   *   unit: string,
   *   costPrice: number,
   *   retailPrice: number,
   *   wholesalePrice?: number,
   *   stockQuantity: number,
   *   minStockThreshold: number
   * }} payload
   */
  async createProduct(payload) {
    const response = await axiosClient.post('/products/create-product', payload);
    return response.data;
  },

  /**
   * Search and filter products by text query and category
   * Also extracts populated categories to keep local category catalog fresh
   * @param {{ search?: string, category?: string }} params
   */
  async searchProducts(params = {}) {
    const cleanParams = {};
    if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
    if (params.category && params.category.trim()) cleanParams.category = params.category.trim();

    const response = await axiosClient.get('/products/search-product', {
      params: cleanParams,
    });

    const products = response.data?.data?.product || [];

    // Harvest categories populated in products into local cache
    try {
      const cached = categoryService.getCachedCategories();
      const catMap = new Map(cached.map((c) => [c._id, c]));

      products.forEach((p) => {
        if (p.category && typeof p.category === 'object' && p.category._id) {
          catMap.set(p.category._id, p.category);
        }
      });

      categoryService.setCachedCategories(Array.from(catMap.values()));
    } catch (e) {
      console.error('Failed to sync categories from products:', e);
    }

    return {
      raw: response.data,
      products,
    };
  },

  /**
   * Update product prices and stock thresholds
   * @param {string} id
   * @param {{
   *   retailPrice?: number,
   *   stockQuantity?: number,
   *   minStockThreshold?: number,
   *   costPrice?: number,
   *   wholesalePrice?: number
   * }} payload
   */
  async updateProduct(id, payload) {
    const response = await axiosClient.patch(`/products/${id}`, payload);
    return response.data;
  },

  /**
   * Adjust stock delta with reason (atomic transaction)
   * @param {string} id
   * @param {{ quantityDelta: number, reason: string }} payload
   */
  async adjustStock(id, payload) {
    const response = await axiosClient.patch(`/products/${id}/adjust-stock`, payload);
    return response.data;
  },

  /**
   * Fetch products running below minimum threshold
   */
  async getLowStock() {
    const response = await axiosClient.get('/products/low-stock');
    const data = response.data?.data || {};
    return {
      count: data.counts || 0,
      products: data.Products || [],
      raw: response.data,
    };
  },
};

export default productService;
