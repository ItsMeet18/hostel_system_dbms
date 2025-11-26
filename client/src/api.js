import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  residentLogin: (payload) => api.post('/auth/resident', payload),
  adminLogin: (payload) => api.post('/auth/admin', payload),
};

export const residentPortalAPI = {
  getDashboard: (residentId) => api.get(`/resident-portal/${residentId}/dashboard`),
  createMaintenance: (residentId, data) => api.post(`/resident-portal/${residentId}/maintenance`, data),
  createLaundry: (residentId, data) => api.post(`/resident-portal/${residentId}/laundry`, data),
  updateProfile: (residentId, data) => api.put(`/resident-portal/${residentId}/profile`, data),
  selectRoom: (residentId, data) => api.post(`/resident-portal/${residentId}/room-selection`, data),
};

export const adminAPI = {
  residents: {
    getAll: () => api.get('/residents'),
    create: (data) => api.post('/residents', data),
    update: (id, data) => api.put(`/residents/${id}`, data),
    delete: (id) => api.delete(`/residents/${id}`),
  },
  hostels: {
    getAll: () => api.get('/hostels'),
    create: (data) => api.post('/hostels', data),
  },
  rooms: {
    getAll: () => api.get('/rooms'),
    create: (data) => api.post('/rooms', data),
  },
  allotments: {
    getAll: () => api.get('/allotments'),
    create: (data) => api.post('/allotments', data),
  },
  messPlans: {
    getAll: () => api.get('/mess-plans'),
    create: (data) => api.post('/mess-plans', data),
    update: (id, data) => api.put(`/mess-plans/${id}`, data),
    delete: (id) => api.delete(`/mess-plans/${id}`),
  },
  bills: {
    getAll: () => api.get('/bills'),
    create: (data) => api.post('/bills', data),
    update: (id, data) => api.put(`/bills/${id}`, data),
  },
  maintenance: {
    getAll: () => api.get('/maintenance'),
    update: (id, data) => api.put(`/maintenance/${id}`, data),
  },
  views: {
    getResidentRoomDetails: () => api.get('/views/resident-room-details'),
    getMaintenanceDashboard: () => api.get('/views/maintenance-dashboard'),
    getRoomOccupancy: () => api.get('/views/room-occupancy'),
    getFinancialSummary: () => api.get('/views/financial-summary'),
  },
  laundry: {
    getAll: () => api.get('/laundry'),
  },
};

export default api;

