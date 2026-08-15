import { api } from './api.js';

export const reportApi = {
  dashboard: () => api.get('/reports/dashboard'),
  daily: (date, studentType) => api.get('/reports/daily', { params: { date, studentType } }),
  monthly: (year, month, studentType) => api.get('/reports/monthly', { params: { year, month, studentType } }),
  dateRange: (fromDate, toDate, studentType) => api.get('/reports/date-range', { params: { fromDate, toDate, studentType } }),
  accountant: (params) => api.get('/reports/accountant', { params }),
  due: (params) => api.get('/reports/due', { params }),
};
