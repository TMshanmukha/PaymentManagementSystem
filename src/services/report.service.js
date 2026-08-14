import { api } from './api.js';

export const reportApi = {
  dashboard: () => api.get('/reports/dashboard'),
  daily: (date) => api.get('/reports/daily', { params: { date } }),
  monthly: (year, month) => api.get('/reports/monthly', { params: { year, month } }),
  dateRange: (fromDate, toDate) => api.get('/reports/date-range', { params: { fromDate, toDate } }),
  accountant: (params) => api.get('/reports/accountant', { params }),
  due: (params) => api.get('/reports/due', { params }),
};
