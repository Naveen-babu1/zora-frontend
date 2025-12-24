import api from './api';

export const cartService = {
  getCart: async () => (await api.get('/cart')).data,
  addToCart: async (productId, quantity = 1) => (await api.post('/cart/add', { productId, quantity })).data,
  updateCartItem: async (productId, quantity) => (await api.put('/cart/update', { productId, quantity })).data,
  removeFromCart: async (productId) => (await api.delete(`/cart/remove/${productId}`)).data,
  clearCart: async () => (await api.delete('/cart/clear')).data,
};