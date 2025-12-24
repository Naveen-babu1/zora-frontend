import api from './api';

export const categoryService = {
  getCategories: async () => (await api.get('/categories')).data,
  getAdminCategories: async () => (await api.get('/categories/admin/all')).data,
  createCategory: async (data) => (await api.post('/categories', data)).data,
  updateCategory: async (id, data) => (await api.put(`/categories/${id}`, data)).data,
  deleteCategory: async (id) => (await api.delete(`/categories/${id}`)).data,
  toggleCategoryStatus: async (id) => (await api.patch(`/categories/${id}/toggle`)).data,
};