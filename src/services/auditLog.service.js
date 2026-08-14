import { api } from './api.js';

export const auditLogApi = {
  list: (params) => api.get('/audit-logs', { params }),
};
