import { api } from './api.js';

export const userApi = {
  list: () => api.get('/users'),
  create: (payload) => api.post('/users', payload),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  resetPassword: (id, newPassword) => api.post(`/users/${id}/reset-password`, { newPassword }),
};
