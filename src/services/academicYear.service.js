import { api } from './api.js';

export const academicYearApi = {
  list: () => api.get('/academic-years'),
  current: () => api.get('/academic-years/current'),
  create: (payload) => api.post('/academic-years', payload),
  setCurrent: (id) => api.patch(`/academic-years/${id}/set-current`),
  activate: (id) => api.patch(`/academic-years/${id}/activate`),
};
