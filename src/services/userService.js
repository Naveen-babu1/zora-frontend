import api from './api';

export const userService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete avatar
  deleteAvatar: async () => {
    const response = await api.delete('/users/avatar');
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },

  // Update notification preferences
  updateNotifications: async (preferences) => {
    const response = await api.put('/users/notifications', preferences);
    return response.data;
  },

  // Get notification preferences
  getNotifications: async () => {
    const response = await api.get('/users/notifications');
    return response.data;
  },

  // Add new address
  addAddress: async (addressData) => {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data;
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    const response = await api.put(`/users/addresses/${addressId}/default`);
    return response.data;
  },

  // Get all addresses
  getAddresses: async () => {
    const response = await api.get('/users/addresses');
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  },

  // Get user orders summary (for dashboard)
  getOrdersSummary: async () => {
    const response = await api.get('/users/orders-summary');
    return response.data;
  },

  // Get wishlist
  getWishlist: async () => {
    const response = await api.get('/users/wishlist');
    return response.data;
  },

  // Add to wishlist
  addToWishlist: async (productId) => {
    const response = await api.post('/users/wishlist', { productId });
    return response.data;
  },

  // Remove from wishlist
  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/users/wishlist/${productId}`);
    return response.data;
  },

  // Check if product is in wishlist
  isInWishlist: async (productId) => {
    const response = await api.get(`/users/wishlist/check/${productId}`);
    return response.data;
  },

  // ============ ADMIN FUNCTIONS ============

  // Get all users (Admin)
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users/admin/all', { params });
    return response.data;
  },

  // Get user by ID (Admin)
  getUserById: async (userId) => {
    const response = await api.get(`/users/admin/${userId}`);
    return response.data;
  },

  // Update user (Admin)
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/admin/${userId}`, userData);
    return response.data;
  },

  // Delete user (Admin)
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/admin/${userId}`);
    return response.data;
  },

  // Toggle user status (Admin)
  toggleUserStatus: async (userId) => {
    const response = await api.patch(`/users/admin/${userId}/toggle-status`);
    return response.data;
  },

  // Change user role (Admin)
  changeUserRole: async (userId, role) => {
    const response = await api.patch(`/users/admin/${userId}/role`, { role });
    return response.data;
  },

  // Get user stats (Admin)
  getUserStats: async () => {
    const response = await api.get('/users/admin/stats');
    return response.data;
  },
};

export default userService;