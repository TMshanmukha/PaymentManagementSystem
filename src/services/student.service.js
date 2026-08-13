import { api } from './api.js';

export const studentApi = {
  list: (params) => api.get('/students', { params }),
  getOne: (id) => api.get(`/students/${id}`),
  paymentHistory: (id) => api.get(`/students/${id}/payments`),
  create: (payload) => api.post('/students', payload),
  update: (id, payload) => api.put(`/students/${id}`, payload),
  updateStatus: (id, status) => api.patch(`/students/${id}/status`, { status }),
};
