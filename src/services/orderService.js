import api from './api';

export const orderService = {
  createOrder: async (data) => (await api.post('/orders', data)).data,
  getMyOrders: async () => (await api.get('/orders/my-orders')).data,
  getAllOrders: async () => (await api.get('/orders/admin/all')).data,
  updateOrderStatus: async (id, data) => (await api.put(`/orders/${id}/status`, data)).data,
};