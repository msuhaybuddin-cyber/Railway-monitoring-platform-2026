import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT Authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('railway_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear storage and allow app to redirect if needed
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('railway_token');
        localStorage.removeItem('railway_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
};

// Equipment Service
export const equipmentService = {
  getAll: (params) => API.get('/equipment', { params }),
  getById: (id) => API.get(`/equipment/${id}`),
  create: (data) => API.post('/equipment', data),
  update: (id, data) => API.put(`/equipment/${id}`, data),
  delete: (id) => API.delete(`/equipment/${id}`),
};

// Fault Reporting Service
export const faultService = {
  getAll: (params) => API.get('/faults', { params }),
  getById: (id) => API.get(`/faults/${id}`),
  create: (data) => API.post('/faults', data),
  update: (id, data) => API.put(`/faults/${id}`, data),
  delete: (id) => API.delete(`/faults/${id}`),
};

// Maintenance Service
export const maintenanceService = {
  getAll: (params) => API.get('/maintenance', { params }),
  getById: (id) => API.get(`/maintenance/${id}`),
  create: (data) => API.post('/maintenance', data),
  update: (id, data) => API.put(`/maintenance/${id}`, data),
  delete: (id) => API.delete(`/maintenance/${id}`),
};

// Compliance Service
export const complianceService = {
  getMetrics: () => API.get('/compliance'),
};

// Dashboard Service
export const dashboardService = {
  getData: () => API.get('/dashboard'),
};

// Notification Service
export const notificationService = {
  getAll: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/mark-all-read'),
  delete: (id) => API.delete(`/notifications/${id}`),
};

// Reports Service
export const reportService = {
  getData: (params) => API.get('/reports', { params }),
  getDownloadUrl: (params) => {
    const query = new URLSearchParams(params).toString();
    return `/api/reports/csv?${query}`;
  },
};

export default API;
