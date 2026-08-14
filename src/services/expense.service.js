import { api } from './api.js';

export const expenseApi = {
  list: (params) => api.get('/expenses', { params }),
  categories: () => api.get('/expenses/categories'),
  create: (payload) => api.post('/expenses', payload),
  update: (id, payload) => api.put(`/expenses/${id}`, payload),
};
