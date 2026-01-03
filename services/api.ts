import axios from 'axios';
import axiosInstance from './axiosInstance';
import {
  LoginCredentials,
  SignupCredentials
} from '../types';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// --- Auth ---
export const login = async (credentials: LoginCredentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const signup = async (credentials: SignupCredentials) => {
  const { data } = await api.post('/auth/register', credentials);
  return data;
};

export const googleLogin = async (idToken: string) => {
  const { data } = await api.post('/auth/google', { idToken });
  return data;
};


export const getProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};

export const updateProfile = async (userData: { name?: string; avatar?: string }) => {
  const { data } = await api.put('/auth/profile', userData);
  return data;
};

export const verifyEmail = async (token: string) => {
  const { data } = await api.post('/auth/verify-email', { token });
  return data;
};

export const forgotPassword = async (email: string) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (data: { email: string; otp: string; password: string }) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

export const resendVerification = async (email: string) => {
  const response = await axiosInstance.post('/auth/resend-verification', { email });
  return response.data;
};


export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unknown error occurred';
    return Promise.reject(new Error(message));
  }
);

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