import axiosClient from './axiosClient.js';

export const categoryService = {
  /**
   * Create a new category
   * @param {{ name: string, description?: string }} payload
   */
  async createCategory(payload) {
    const response = await axiosClient.post('/categories/create-category', payload);
    const category = response.data?.data?.category || response.data?.data;

    // Cache locally for convenient UI dropdowns
    if (category) {
      try {
        const cached = JSON.parse(localStorage.getItem('volt_categories') || '[]');
        const exists = cached.some((c) => c._id === category._id || c.name.toLowerCase() === category.name.toLowerCase());
        if (!exists) {
          cached.push(category);
          localStorage.setItem('volt_categories', JSON.stringify(cached));
        }
      } catch (e) {
        console.error('Failed to cache category:', e);
      }
    }

    return response.data;
  },

  /**
   * Get cached categories from local storage
   */
  getCachedCategories() {
    try {
      return JSON.parse(localStorage.getItem('volt_categories') || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Update cached categories
   * @param {Array} categories
   */
  setCachedCategories(categories) {
    try {
      localStorage.setItem('volt_categories', JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }
};

export default categoryService;
