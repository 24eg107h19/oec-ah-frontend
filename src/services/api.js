import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem('ecommerce_access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Auth API
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
};

// Products API
export const productService = {
  getAll: (search = '', category = '') => {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    return api.get('/products', { params });
  },
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
};

// Cart API
export const cartService = {
  getCart: (userId) => api.get(`/cart/${userId}`),
  addToCart: (userId, productId, quantity = 1) =>
    api.post('/cart/add', { userId, productId, quantity }),
  updateQuantity: (cartItemId, quantity) =>
    api.put(`/cart/${cartItemId}`, { quantity }),
  removeItem: (cartItemId) => api.delete(`/cart/${cartItemId}`),
  clearCart: (userId) => api.delete(`/cart/user/${userId}`),
};

// Orders API
export const orderService = {
  placeOrder: (userId, shippingAddress, phoneNumber) =>
    api.post('/orders', { userId, shippingAddress, phoneNumber }),
  getOrdersByUser: (userId) => api.get(`/orders/user/${userId}`),
  getAllOrders: () => api.get('/orders'),
  updateStatus: (orderId, status) =>
    api.put(`/orders/${orderId}/status`, { status }),
};

export default api;
