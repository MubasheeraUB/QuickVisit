// QuickVisit - Main Server Entry Point

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destinations');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// EJS Configuration
// =====================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =====================================
// Middleware
// =====================================

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// Static Files
// =====================================

app.use(express.static(path.join(__dirname, 'public')));

// =====================================
// Frontend Routes
// =====================================

app.get('/', (req, res) => {
  res.render('index', {
    title: 'QuickVisit - Home'
  });
});

app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login - QuickVisit',
    navType: 'login'
  });
});

app.get('/tourist', (req, res) => {
  res.render('tourist', {
    title: 'Book Tickets - QuickVisit',
    navType: 'tourist',
    extraCSS: ['/css/tourist.css'],
    headScripts: [
      'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    ]
  });
});

app.get('/admin', (req, res) => {
  res.render('admin', {
    title: 'Admin Dashboard - QuickVisit',
    navType: 'admin',
    navBrand: 'QuickVisit Admin',
    extraCSS: ['/css/admin.css'],
    headScripts: [
      'https://cdn.jsdelivr.net/npm/chart.js',
      'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    ]
  });
});

// =====================================
// API Health Check
// =====================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'QuickVisit API',
    timestamp: new Date().toISOString()
  });
});

// =====================================
// API Routes
// =====================================

app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// =====================================
// 404 Handler
// =====================================

app.use((req, res) => {

  // If browser request → render page
  if (req.accepts('html')) {
    return res.status(404).send('<h1>404 - Page Not Found</h1>');
  }

  // API request → return JSON
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

// =====================================
// Error Handler
// =====================================

app.use((err, req, res, next) => {

  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// =====================================
// Start Server
// =====================================

app.listen(PORT, () => {

  console.log('=====================================');
  console.log('QuickVisit API Server Running');
  console.log(`Port: ${PORT}`);
  console.log(`URL:  http://localhost:${PORT}`);
  console.log(`Date: ${new Date().toLocaleString()}`);
  console.log('=====================================');

});

module.exports = app;