import { api } from './api.js';

export const academicYearApi = {
  list: () => api.get('/academic-years'),
  create: (payload) => api.post('/academic-years', payload),
  setCurrent: (id) => api.patch(`/academic-years/${id}/set-current`),
};
