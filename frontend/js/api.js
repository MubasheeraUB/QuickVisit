// QuickVisit API Helper
// Handles all communication with the backend

const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  // Get auth token from local storage
  getToken() {
    return localStorage.getItem('qv_token');
  },

  // Set auth token
  setToken(token) {
    if (token) localStorage.setItem('qv_token', token);
    else localStorage.removeItem('qv_token');
  },

  // Get current user
  getUser() {
    const u = localStorage.getItem('qv_user');
    return u ? JSON.parse(u) : null;
  },

  setUser(user) {
    if (user) localStorage.setItem('qv_user', JSON.stringify(user));
    else localStorage.removeItem('qv_user');
  },

  // Core request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  },

  // Convenience methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // ============ AUTH ============
  auth: {
    register(data) { return api.post('/auth/register', data); },
    login(email, password) { return api.post('/auth/login', { email, password }); },
    getProfile() { return api.get('/auth/profile'); }
  },

  // ============ DESTINATIONS ============
  destinations: {
    list() { return api.get('/destinations'); },
    get(id) { return api.get(`/destinations/${id}`); },
    getQR(id) { return api.get(`/destinations/${id}/qr`); },
    create(data) { return api.post('/destinations', data); },
    update(id, data) { return api.put(`/destinations/${id}`, data); },
    delete(id) { return api.delete(`/destinations/${id}`); }
  },

  // ============ BOOKINGS ============
  bookings: {
    create(data) { return api.post('/bookings', data); },
    myBookings() { return api.get('/bookings/my'); },
    get(id) { return api.get(`/bookings/${id}`); },
    verify(id) { return api.post(`/bookings/${id}/verify`, {}); },
    cancel(id) { return api.post(`/bookings/${id}/cancel`, {}); }
  },

  // ============ PAYMENTS ============
  payments: {
    process(data) { return api.post('/payments/process', data); },
    get(id) { return api.get(`/payments/${id}`); }
  },

  // ============ ADMIN ============
  admin: {
    stats() { return api.get('/admin/stats'); },
    trend() { return api.get('/admin/trend'); },
    revenueByDestination() { return api.get('/admin/revenue-by-destination'); },
    bookings(params = '') { return api.get(`/admin/bookings${params}`); },
    users() { return api.get('/admin/users'); },
    payments() { return api.get('/admin/payments'); },
    feedback() { return api.get('/admin/feedback'); }
  }
};

// Expose globally
window.api = api;
