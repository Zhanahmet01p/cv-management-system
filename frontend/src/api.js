import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchMe       = ()              => api.get('/api/auth/me');
export const devLogin      = (role)          => api.post('/api/auth/dev-login', { role });
export const socialMock    = (provider, em)  => api.post('/api/auth/social-mock', { provider, email: em });

export const fetchStats    = ()              => api.get('/api/stats');

export const fetchAttributes     = ()              => api.get('/api/attributes');
export const createAttribute     = (payload)       => api.post('/api/attributes', payload);
export const updateAttribute     = (id, payload)   => api.put(`/api/attributes/${id}`, payload);
export const deleteAttribute     = (id)            => api.delete(`/api/attributes/${id}`);

export const fetchPositions      = ()              => api.get('/api/positions');
export const fetchPosition       = (id)            => api.get(`/api/positions/${id}`);
export const createPosition      = (payload)       => api.post('/api/positions', payload);
export const updatePosition      = (id, payload)   => api.put(`/api/positions/${id}`, payload);
export const duplicatePosition   = (id)            => api.post(`/api/positions/${id}/duplicate`);
export const deletePosition      = (id)            => api.delete(`/api/positions/${id}`);
export const createComment       = (posId, text)   => api.post(`/api/positions/${posId}/comments`, { text });

export const fetchProfile        = ()              => api.get('/api/profile');
export const saveProfile         = (payload)       => api.patch('/api/profile/me', payload);
export const saveAttributeValue  = (payload)       => api.post('/api/profile/info', payload);
export const createProject       = (payload)       => api.post('/api/profile/projects', payload);
export const updateProject       = (id, payload)   => api.put(`/api/profile/projects/${id}`, payload);
export const deleteProject       = (id, version)   => api.delete(`/api/profile/projects/${id}`, { params: { version } });

export const createCV            = (positionId)    => api.post('/api/cvs', { positionId });
export const fetchCV             = (id)            => api.get(`/api/cvs/${id}`);
export const publishCV           = (id, payload)   => api.patch(`/api/cvs/${id}/publish`, payload);
export const toggleLike          = (cvId)          => api.post(`/api/cvs/${cvId}/like`);

export const fetchUsers          = ()              => api.get('/api/users');
export const updateUserRole      = (id, role, version) => api.patch(`/api/users/${id}/role`, { role, version });
export const toggleBlockUser     = (id, version)   => api.post(`/api/users/${id}/toggle-block`, { version });
export const deleteUser          = (id)            => api.delete(`/api/users/${id}`);

export const apiUrl = API_BASE;
export default api;
