import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchPositions = () => api.get('/api/positions');
export const createCV = (positionId) => api.post('/api/cvs', { positionId });
export const fetchProfile = () => api.get('/api/profile');
export const fetchAttributes = () => api.get('/api/attributes');
export const saveProfile = (payload) => api.patch('/api/profile/me', payload);
export const saveAttributeValue = (payload) => api.post('/api/profile/info', payload);
export const createProject = (payload) => api.post('/api/profile/projects', payload);
export const updateProject = (id, payload) => api.put(`/api/profile/projects/${id}`, payload);
export const deleteProject = (id, version) => api.delete(`/api/profile/projects/${id}`, { params: { version } });
export const fetchCV = (id) => api.get(`/api/cvs/${id}`);
export const publishCV = (id, payload) => api.patch(`/api/cvs/${id}/publish`, payload);
export const apiUrl = API_BASE;
export default api;
