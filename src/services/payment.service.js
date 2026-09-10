import { api } from './api.js';

export const paymentApi = {
  list: (params) => api.get('/payments', { params }),
  getOne: (id) => api.get(`/payments/${id}`),
  create: (payload) => api.post('/payments', payload),
  updateDate: (id, paymentDate) => api.patch(`/payments/${id}/date`, { paymentDate }),
  cancel: (id, reason) => api.post(`/payments/${id}/cancel`, { reason }),
  reverse: (id, reason) => api.post(`/payments/${id}/reverse`, { reason }),
};
