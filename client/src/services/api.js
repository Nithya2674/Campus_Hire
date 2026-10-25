import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('campushire_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const responseData = error.response?.data;
    const message = responseData?.message || error.message || 'An unexpected error occurred';
    
    // Create an enhanced error object
    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.data = responseData?.data;
    enhancedError.errors = responseData?.errors;
    
    return Promise.reject(enhancedError);
  }
);

export default api;
