import api from './api';

export const productService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product by slug OR id
  getProduct: async (slugOrId) => {
    const response = await api.get(`/products/${slugOrId}`);
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/id/${id}`);
    return response.data;
  },

  // Get product by slug
  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get('/products', { 
      params: { featured: true, limit } 
    });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await api.get('/products', { 
      params: { category: categoryId, ...params } 
    });
    return response.data;
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    const response = await api.get('/products', { 
      params: { search: query, ...params } 
    });
    return response.data;
  },

  // Get related products
  getRelatedProducts: async (productId, limit = 4) => {
    const response = await api.get(`/products/${productId}/related`, {
      params: { limit }
    });
    return response.data;
  },

  // ============ ADMIN FUNCTIONS ============

  // Get all products for admin (including inactive)
  getAdminProducts: async (params = {}) => {
    const response = await api.get('/products/admin/all', { params });
    return response.data;
  },

  // Create product (Admin)
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (Admin)
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Toggle product status (Admin)
  toggleProductStatus: async (id) => {
    const response = await api.patch(`/products/${id}/toggle`);
    return response.data;
  },

  // Upload product images (Admin)
  uploadImages: async (formData) => {
    const response = await api.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default productService;