import { api } from './api.js';

export const settingsApi = {
  getAll: () => api.get('/settings'),
  update: (key, value) => api.put('/settings', { key, value }),
};
