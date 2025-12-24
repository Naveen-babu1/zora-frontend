import api from './api';

export const authService = {
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  login: async (data) => {
    const res = await api.post('/auth/login', data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  adminLogin: async (data) => {
    const res = await api.post('/auth/admin/login', data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },
};