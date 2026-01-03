import axios from 'axios';

// Backend URL (matches your backend PORT 8080)
const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  signup: (data: any) => api.post('/auth/signup', data),
  getMe: () => api.get('/auth/me'),
};

export const pairingApi = {
  generateCode: () => api.post('/pairing/generate-code'),
  linkPartner: (inviteCode: string) => api.post('/pairing/link-partner', { inviteCode }),
};

export default api;