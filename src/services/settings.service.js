import { api } from './api.js';

export const settingsApi = {
  getAll: (config) => api.get('/settings', config),
  update: (key, value) => api.put('/settings', { key, value }),
};
