import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include token
axiosClient.interceptors.request.use(
  (config) => {
    // Check if this is a visitor API route
    const isVisitorRoute = config.url?.includes('/api/visitor/');
    
    if (isVisitorRoute) {
      // For visitor routes, prioritize visitor token
      const visitorToken = localStorage.getItem('visitor_token');
      if (visitorToken) {
        config.headers.Authorization = `Bearer ${visitorToken}`;
      }
    } else {
      // For admin routes, use admin token
      const adminToken = localStorage.getItem('token');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      } else {
        // Fallback to visitor token if no admin token
        const visitorToken = localStorage.getItem('visitor_token');
        if (visitorToken) {
          config.headers.Authorization = `Bearer ${visitorToken}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if it's a visitor token that failed
      const visitorToken = localStorage.getItem('visitor_token');
      if (visitorToken) {
        localStorage.removeItem('visitor_token');
        localStorage.removeItem('visitor');
        window.location.href = '/visitor/login';
      } else {
        // Admin token failed
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

