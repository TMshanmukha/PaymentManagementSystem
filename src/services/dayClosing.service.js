import { api } from './api.js';

export const dayClosingApi = {
  list: (params) => api.get('/day-closings', { params }),
  expected: (date) => api.get('/day-closings/expected', { params: { date } }),
  submit: (payload) => api.post('/day-closings', payload),
  approve: (id) => api.post(`/day-closings/${id}/approve`),
  reopen: (id, reason) => api.post(`/day-closings/${id}/reopen`, { reason }),
};
