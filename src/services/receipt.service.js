import { api } from './api.js';

export const receiptApi = {
  getOne: (id) => api.get(`/receipts/${id}`),
};
