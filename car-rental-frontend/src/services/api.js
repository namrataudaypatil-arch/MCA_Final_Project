import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Auth ───────────────────────────────────────────
export const loginUser     = (data) => api.post('/auth/login', data);
export const registerUser  = (data) => api.post('/auth/register', data);

// ─── Cars (public) ──────────────────────────────────
export const getCars            = ()       => api.get('/cars');
export const getCarById         = (id)     => api.get(`/cars/${id}`);
export const checkCarAvailability = (id, params) => api.get(`/cars/${id}/availability`, { params });

// ─── Bookings (authenticated) ───────────────────────
export const createBooking   = (data) => api.post('/bookings', data);
export const getUserBookings  = ()     => api.get('/bookings/my-bookings');
export const cancelBooking   = (id)   => api.put(`/bookings/${id}/cancel`);

// ─── Payments (authenticated) ───────────────────────
export const createPayment   = (data) => api.post('/payments', data);

// ─── Admin (authenticated + admin role) ─────────────
export const getAdminStats    = ()     => api.get('/admin/stats');
export const getAdminBookings = ()     => api.get('/admin/bookings');
export const approveBooking   = (id)   => api.put(`/admin/bookings/${id}/approve`);
export const declineBooking   = (id)   => api.put(`/admin/bookings/${id}/decline`);
export const getAdminUsers    = ()     => api.get('/admin/users');
export const deleteUser       = (id)   => api.delete(`/admin/users/${id}`);
export const addCar           = (data) => api.post('/admin/cars', data);
export const updateCar        = (id, data) => api.put(`/admin/cars/${id}`, data);
export const deleteCar        = (id)   => api.delete(`/admin/cars/${id}`);

export default api;