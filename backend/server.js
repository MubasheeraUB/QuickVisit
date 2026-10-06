// QuickVisit - Main Server Entry Point

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const https = require('https');

const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destinations');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Address phones use to reach this server (encoded into destination QR codes).
// Set PUBLIC_URL in .env to override, e.g. PUBLIC_URL=http://192.168.1.20:5000
function getLanIp() {
  const skip = /vethernet|virtual|vmware|vbox|docker|wsl|loopback|bluetooth/i;
  const nets = os.networkInterfaces();
  let fallback = null;
  for (const name of Object.keys(nets)) {
    for (const n of nets[name] || []) {
      if (n.family !== 'IPv4' && n.family !== 4) continue;
      if (n.internal) continue;
      if (!skip.test(name)) return n.address;
      fallback = fallback || n.address;
    }
  }
  return fallback || 'localhost';
}
const LAN_IP = getLanIp();
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
// On Render, RENDER_EXTERNAL_URL is set automatically (e.g. https://quickvisit.onrender.com)
const IS_HOSTED = !!(process.env.RENDER || process.env.RENDER_EXTERNAL_URL);
const PUBLIC_URL = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || `http://${LAN_IP}:${PORT}`).replace(/\/+$/, '');
const SECURE_URL = IS_HOSTED ? PUBLIC_URL : `https://${LAN_IP}:${HTTPS_PORT}`;
app.set('publicUrl', PUBLIC_URL);

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

// Make the public URL available to every EJS view
app.use((req, res, next) => {
  res.locals.publicUrl = PUBLIC_URL;
  res.locals.secureUrl = SECURE_URL;
  next();
});

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
    navType: 'login',
    guard: 'guest'
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
    guard: 'admin',
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

app.listen(PORT, '0.0.0.0', () => {

  console.log('=====================================');
  console.log('QuickVisit API Server Running');
  console.log(`Port: ${PORT}`);
  console.log(`URL:    http://localhost:${PORT}`);
  console.log(`Mobile: ${PUBLIC_URL}/tourist  (same Wi-Fi)`);
  console.log(`Date: ${new Date().toLocaleString()}`);
  console.log('=====================================');

});

// HTTPS server (self-signed) -- phone browsers only allow camera access on HTTPS,
// so the in-page QR scanner needs this. Visitors scanning with their camera app can use HTTP.
// Not needed when hosted: the platform already serves HTTPS.
if (!IS_HOSTED) try {
  const selfsigned = require('selfsigned');
  const pems = selfsigned.generate([{ name: 'commonName', value: 'QuickVisit Dev' }], {
    days: 825, keySize: 2048, algorithm: 'sha256',
    extensions: [{
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '127.0.0.1' },
        { type: 7, ip: LAN_IP }
      ]
    }]
  });
  https.createServer({ key: pems.private, cert: pems.cert }, app)
    .listen(HTTPS_PORT, '0.0.0.0', () => {
      console.log(`HTTPS:  ${SECURE_URL}/tourist  (for in-page camera scanner)`);
    });
} catch (err) {
  console.warn('HTTPS disabled (run: npm install selfsigned):', err.message);
}

module.exports = app;