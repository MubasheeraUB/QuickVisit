// Admin Dashboard Logic

var DEMO_DATA = {
  stats: { bookings_today: 1284, revenue_today: 184000, active_destinations: 24, registered_users: 8547 },
  recentBookings: [
    { booking_id: 'QV-TAJ-A8K2P9', user_name: 'Mubasheera U B', destination_name: 'Taj Mahal',        total_visitors: 3, total_amount: 130, payment_method: 'UPI',    status: 'confirmed', created_at: '2026-05-18' },
    { booking_id: 'QV-GAT-B5M3Q1', user_name: 'Rahul Sharma',   destination_name: 'Gateway of India', total_visitors: 5, total_amount: 250, payment_method: 'Card',   status: 'confirmed', created_at: '2026-05-18' },
    { booking_id: 'QV-RFT-C2N7R4', user_name: 'Priya Menon',    destination_name: 'Red Fort',         total_visitors: 2, total_amount: 100, payment_method: 'UPI',    status: 'pending',   created_at: '2026-05-18' },
    { booking_id: 'QV-MUS-D9L4S6', user_name: 'Ahmed Khan',     destination_name: 'National Museum',  total_visitors: 4, total_amount: 200, payment_method: 'Wallet', status: 'confirmed', created_at: '2026-05-18' },
    { booking_id: 'QV-BCH-E1P8T2', user_name: 'Sarah Joseph',   destination_name: 'Kovalam Beach',    total_visitors: 6, total_amount: 180, payment_method: 'UPI',    status: 'cancelled', created_at: '2026-05-17' }
  ],
  destinations: [
    { id: 1, name: 'Taj Mahal',             location: 'Agra, UP',       adult_price: 50, bookings: 4832, status: 'active' },
    { id: 2, name: 'Gateway of India',       location: 'Mumbai, MH',     adult_price: 50, bookings: 3217, status: 'active' },
    { id: 3, name: 'Red Fort',               location: 'Delhi',          adult_price: 50, bookings: 2945, status: 'active' },
    { id: 4, name: 'National Museum',        location: 'New Delhi',      adult_price: 50, bookings: 1823, status: 'active' },
    { id: 5, name: 'Kovalam Beach',          location: 'Trivandrum, KL', adult_price: 30, bookings: 2156, status: 'active' },
    { id: 6, name: 'Padmanabhaswamy Temple', location: 'Trivandrum, KL', adult_price: 40, bookings: 1567, status: 'active' }
  ],
  users: [
    { id: 1, name: 'Mubasheera U B', email: 'mubasheera2002@gmail.com', phone: '+91 7025014923', total_bookings: 12, created_at: '2026-01-15', status: 'active'   },
    { id: 2, name: 'Rahul Sharma',   email: 'rahul.sh@gmail.com',       phone: '+91 9876543210', total_bookings: 8,  created_at: '2026-02-20', status: 'active'   },
    { id: 3, name: 'Priya Menon',    email: 'priya.m@gmail.com',        phone: '+91 9988776655', total_bookings: 5,  created_at: '2026-03-05', status: 'active'   },
    { id: 4, name: 'Ahmed Khan',     email: 'ahmed.k@gmail.com',        phone: '+91 9812345678', total_bookings: 15, created_at: '2026-01-10', status: 'active'   },
    { id: 5, name: 'Sarah Joseph',   email: 'sarah.j@gmail.com',        phone: '+91 8877665544', total_bookings: 3,  created_at: '2026-04-12', status: 'inactive' }
  ],
  payments: [
    { transaction_id: 'TXN-89234561', booking_ref: 'QV-TAJ-A8K2P9', payment_method: 'UPI (PhonePe)',  amount: 130, status: 'success',  created_at: '2026-05-18 10:23' },
    { transaction_id: 'TXN-89234562', booking_ref: 'QV-GAT-B5M3Q1', payment_method: 'Card (Visa)',    amount: 250, status: 'success',  created_at: '2026-05-18 10:15' },
    { transaction_id: 'TXN-89234563', booking_ref: 'QV-RFT-C2N7R4', payment_method: 'UPI (GPay)',     amount: 100, status: 'pending',  created_at: '2026-05-18 09:58' },
    { transaction_id: 'TXN-89234564', booking_ref: 'QV-MUS-D9L4S6', payment_method: 'Wallet (Paytm)', amount: 200, status: 'success',  created_at: '2026-05-18 09:42' },
    { transaction_id: 'TXN-89234565', booking_ref: 'QV-BCH-E1P8T2', payment_method: 'UPI (BHIM)',     amount: 180, status: 'refunded', created_at: '2026-05-17 16:30' }
  ],
  feedback: [
    { user_name: 'Rahul Sharma', destination_name: 'Gateway of India', rating: 5, comments: 'Excellent service! The QR scan booking saved us almost 45 minutes of waiting.', created_at: '2026-05-18' },
    { user_name: 'Priya Menon',  destination_name: 'Red Fort',         rating: 4, comments: 'Very smooth booking experience. The digital ticket worked perfectly at the gate.', created_at: '2026-05-17' },
    { user_name: 'Ahmed Khan',   destination_name: 'National Museum',  rating: 5, comments: 'No more queues! This is exactly what tourist places needed.', created_at: '2026-05-17' }
  ],
  reports: [
    { name: 'Daily Booking Summary',   type: 'Operational', frequency: 'Daily',   last: 'Today'       },
    { name: 'Monthly Revenue Report',  type: 'Financial',   frequency: 'Monthly', last: '30 Apr 2026' },
    { name: 'Destination Performance', type: 'Analytics',   frequency: 'Weekly',  last: '18 May 2026' },
    { name: 'User Activity Report',    type: 'Behavioral',  frequency: 'Monthly', last: '30 Apr 2026' }
  ]
};

var chartsInitialized       = false;
var reportChartsInitialized = false;
var allBookings = [];

// Badge class helper
function badgeClass(status) {
  var map = {
    confirmed: 'badge-success',
    success:   'badge-success',
    active:    'badge-active',
    pending:   'badge-pending',
    cancelled: 'badge-cancelled',
    failed:    'badge-failed',
    refunded:  'badge-refunded',
    inactive:  'badge-inactive'
  };
  return map[status] || 'badge-pending';
}

// Section switching
function switchSection(section) {
  document.querySelectorAll('.sidebar-menu li').forEach(function(li) { li.classList.remove('active'); });
  var menuItem = document.querySelector('[data-section="' + section + '"]');
  if (menuItem) menuItem.classList.add('active');

  document.querySelectorAll('.admin-section').forEach(function(s) { s.classList.remove('active'); });
  var sectionEl = document.getElementById('section-' + section);
  if (sectionEl) sectionEl.classList.add('active');

  if (section === 'reports')      { initReportCharts(); loadReports(); }
  if (section === 'destinations') loadDestinations();
  if (section === 'bookings')     loadBookings();
  if (section === 'users')        loadUsers();
  if (section === 'payments')     loadPayments();
  if (section === 'feedback')     loadFeedback();
  if (section === 'qrcodes')      populateQRDestinations();
}

// Dashboard
async function loadDashboard() {
  try {
    var stats = await api.admin.stats();
    document.getElementById('stat-bookings').textContent     = stats.bookings_today.toLocaleString();
    document.getElementById('stat-revenue').textContent      = 'Rs. ' + formatMoney(stats.revenue_today);
    document.getElementById('stat-destinations').textContent = stats.active_destinations;
    document.getElementById('stat-users').textContent        = stats.registered_users.toLocaleString();
  } catch (e) {
    var s = DEMO_DATA.stats;
    document.getElementById('stat-bookings').textContent     = s.bookings_today.toLocaleString();
    document.getElementById('stat-revenue').textContent      = 'Rs. ' + formatMoney(s.revenue_today);
    document.getElementById('stat-destinations').textContent = s.active_destinations;
    document.getElementById('stat-users').textContent        = s.registered_users.toLocaleString();
  }
  setStatChange('stat-bookings-change',     '+12.5% from yesterday', true);
  setStatChange('stat-revenue-change',      '+18.2% from yesterday', true);
  setStatChange('stat-destinations-change', '+2 this month',         true);
  setStatChange('stat-users-change',        '+342 this week',        true);
  loadRecentBookings();
  initCharts();
}

function setStatChange(id, text, isUp) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className   = 'stat-change ' + (isUp ? 'up' : 'down');
}

async function loadRecentBookings() {
  var tbody = document.getElementById('recent-bookings-body');
  try {
    var result = await api.admin.bookings('?limit=5');
    renderBookingsTable(tbody, result.bookings, false);
  } catch (e) {
    renderBookingsTable(tbody, DEMO_DATA.recentBookings, false);
  }
}

// Bookings table renderer
function renderBookingsTable(tbody, bookings, withActions) {
  if (!bookings || bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="' + (withActions ? 8 : 7) + '" style="text-align:center;color:#999;padding:20px;">No bookings found.</td></tr>';
    return;
  }
  tbody.innerHTML = bookings.map(function(b) {
    return '<tr>' +
      '<td><strong>' + escHtml(b.booking_id) + '</strong></td>' +
      '<td>' + escHtml(b.user_name || 'Guest') + '</td>' +
      '<td>' + escHtml(b.destination_name) + '</td>' +
      '<td>' + b.total_visitors + '</td>' +
      '<td>Rs. ' + b.total_amount + '</td>' +
      (withActions ? '<td>' + escHtml(b.payment_method || '--') + '</td>' : '') +
      '<td><span class="badge ' + badgeClass(b.status) + '">' + b.status + '</span></td>' +
      (withActions
        ? '<td><button class="action-btn btn-view" onclick="viewBooking(\'' + escAttr(b.booking_id) + '\')">View</button></td>'
        : '<td>' + formatDate(b.created_at) + '</td>') +
      '</tr>';
  }).join('');
}

function viewBooking(bookingId) {
  alert('Booking: ' + bookingId + '\n(Full detail view coming soon)');
}

function filterBookings() {
  var q = (document.getElementById('bookings-search').value || '').toLowerCase();
  if (!q) {
    renderBookingsTable(document.getElementById('bookings-body'), allBookings, true);
    return;
  }
  var filtered = allBookings.filter(function(b) {
    return (b.booking_id       || '').toLowerCase().indexOf(q) >= 0 ||
           (b.user_name        || '').toLowerCase().indexOf(q) >= 0 ||
           (b.destination_name || '').toLowerCase().indexOf(q) >= 0 ||
           (b.status           || '').toLowerCase().indexOf(q) >= 0;
  });
  renderBookingsTable(document.getElementById('bookings-body'), filtered, true);
}

// Destinations
async function loadDestinations() {
  var grid = document.getElementById('dest-grid');
  grid.innerHTML = '<p style="color:#999;padding:20px;">Loading destinations...</p>';
  var destinations;
  try {
    var result = await api.destinations.list();
    destinations = result.destinations;
  } catch (e) {
    destinations = DEMO_DATA.destinations;
  }
  if (!destinations || destinations.length === 0) {
    grid.innerHTML = '<p style="color:#999;padding:20px;">No destinations found. Add one to get started!</p>';
    return;
  }
  grid.innerHTML = destinations.map(function(d) {
    var initials    = d.name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 3).toUpperCase();
    var statusClass = d.status === 'active' ? 'badge-active' : 'badge-inactive';
    return '<div class="dest-card">' +
      '<div class="dest-img">' + initials + '</div>' +
      '<div class="dest-info">' +
        '<h4>' + escHtml(d.name) + ' <span class="badge ' + statusClass + '">' + (d.status || 'active') + '</span></h4>' +
        '<p>' + escHtml(d.location) + '</p>' +
        '<div class="dest-stats">' +
          '<span><strong>' + (d.bookings != null ? d.bookings.toLocaleString() : '--') + '</strong> bookings</span>' +
          '<span style="color:#4caf50;"><strong>Rs. ' + d.adult_price + '</strong>/ticket</span>' +
        '</div>' +
        '<div style="margin-top:12px;">' +
          '<button class="action-btn btn-view" onclick="showQRModal(\'' + escAttr(d.name) + '\',' + d.id + ')">View QR</button>' +
          '<button class="action-btn btn-edit" onclick="editDestination(' + d.id + ')">Edit</button>' +
          '<button class="action-btn btn-delete" onclick="deleteDestination(' + d.id + ',\'' + escAttr(d.name) + '\')">Delete</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function editDestination(id) {
  alert('Edit destination #' + id + ' (coming soon)');
}

async function deleteDestination(id, name) {
  if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
  try {
    await api.destinations.delete(id);
    loadDestinations();
  } catch (err) {
    alert('Could not delete: ' + err.message);
  }
}

// Bookings
async function loadBookings() {
  var tbody = document.getElementById('bookings-body');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#999;padding:20px;">Loading...</td></tr>';
  try {
    var result = await api.admin.bookings();
    allBookings = result.bookings || [];
  } catch (e) {
    allBookings = DEMO_DATA.recentBookings;
  }
  renderBookingsTable(tbody, allBookings, true);
}

// Users
async function loadUsers() {
  var tbody = document.getElementById('users-body');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px;">Loading...</td></tr>';
  var users;
  try {
    var result = await api.admin.users();
    users = result.users;
  } catch (e) {
    users = DEMO_DATA.users;
  }
  tbody.innerHTML = users.map(function(u) {
    return '<tr>' +
      '<td>U-' + String(u.id).padStart(5, '0') + '</td>' +
      '<td>' + escHtml(u.name) + '</td>' +
      '<td>' + escHtml(u.email) + '</td>' +
      '<td>' + (u.phone || '--') + '</td>' +
      '<td><strong>' + (u.total_bookings || 0) + '</strong></td>' +
      '<td>' + formatDate(u.created_at) + '</td>' +
      '<td><span class="badge ' + badgeClass(u.status) + '">' + u.status + '</span></td>' +
      '</tr>';
  }).join('');
}

// Payments
async function loadPayments() {
  var tbody = document.getElementById('payments-body');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">Loading...</td></tr>';
  var payments;
  try {
    var result = await api.admin.payments();
    payments = result.payments;
  } catch (e) {
    payments = DEMO_DATA.payments;
  }
  tbody.innerHTML = payments.map(function(p) {
    return '<tr>' +
      '<td><code>' + escHtml(p.transaction_id) + '</code></td>' +
      '<td>' + (p.booking_ref || '--') + '</td>' +
      '<td>' + escHtml(p.payment_method) + '</td>' +
      '<td><strong>Rs. ' + p.amount + '</strong></td>' +
      '<td><span class="badge ' + badgeClass(p.status) + '">' + p.status + '</span></td>' +
      '<td>' + p.created_at + '</td>' +
      '</tr>';
  }).join('');
}

// Feedback
async function loadFeedback() {
  var container = document.getElementById('feedback-list');
  var feedback;
  try {
    var result = await api.admin.feedback();
    feedback = result.feedback;
  } catch (e) {
    feedback = DEMO_DATA.feedback;
  }
  function stars(n) {
    var s = '';
    for (var i = 0; i < 5; i++) s += (i < n ? '★' : '☆');
    return s;
  }
  container.innerHTML = '<h3 style="margin-bottom:15px;">Recent Feedback</h3>' +
    feedback.map(function(f) {
      return '<div style="border-bottom:1px solid #f0f0f0;padding:15px 0;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<strong>' + escHtml(f.user_name || 'Anonymous') + '</strong>' +
          '<span style="color:#ff9800;font-size:16px;" title="' + f.rating + '/5">' + stars(f.rating) + '</span>' +
        '</div>' +
        '<small style="color:#999;">' + escHtml(f.destination_name) + ' &nbsp;&middot;&nbsp; ' + formatDate(f.created_at) + '</small>' +
        '<p style="margin-top:8px;color:#444;">' + escHtml(f.comments) + '</p>' +
      '</div>';
    }).join('');
}

// QR Codes
async function populateQRDestinations() {
  var select = document.getElementById('qr-dest');
  if (select.children.length > 0) return;
  var dests = DEMO_DATA.destinations;
  try {
    var result = await api.destinations.list();
    if (result.destinations && result.destinations.length) dests = result.destinations;
  } catch (e) { /* use demo */ }
  dests.forEach(function(d) {
    var opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.name;
    select.appendChild(opt);
  });
}

function generateAdminQR() {
  var select = document.getElementById('qr-dest');
  var dest   = select.options[select.selectedIndex].text;
  document.getElementById('qr-print-area').style.display = 'block';
  document.getElementById('qr-dest-name').textContent    = dest;
  var qrDiv = document.getElementById('generated-qr');
  qrDiv.innerHTML = '';
  qrDiv.style.cssText = 'display:flex;justify-content:center;';
  new QRCode(qrDiv, {
    text: 'https://quickvisit.app/book/' + dest.replace(/\s+/g, '-').toLowerCase(),
    width: 180, height: 180, colorDark: '#1565c0', colorLight: '#ffffff'
  });
}

function showQRModal(destName, destId) {
  document.getElementById('qrModalTitle').textContent  = 'QR Code - ' + destName;
  document.getElementById('modalDestName').textContent = destName;
  var qrDiv = document.getElementById('modalQR');
  qrDiv.innerHTML = '';
  new QRCode(qrDiv, {
    text: 'https://quickvisit.app/book/' + String(destId),
    width: 200, height: 200, colorDark: '#1565c0', colorLight: '#ffffff'
  });
  document.getElementById('qrModal').classList.add('show');
}

function closeQRModal() {
  document.getElementById('qrModal').classList.remove('show');
}

// Reports
function loadReports() {
  var tbody = document.getElementById('reports-body');
  if (!tbody) return;
  tbody.innerHTML = DEMO_DATA.reports.map(function(r) {
    return '<tr>' +
      '<td><strong>' + r.name + '</strong></td>' +
      '<td>' + r.type + '</td>' +
      '<td>' + r.frequency + '</td>' +
      '<td>' + r.last + '</td>' +
      '<td><button class="action-btn btn-view" onclick="downloadReport(\'' + escAttr(r.name) + '\')">Download</button></td>' +
      '</tr>';
  }).join('');
}

function downloadReport(name) {
  alert('Downloading "' + name + '" (PDF export available in production).');
}

// Charts
function initCharts() {
  if (chartsInitialized) return;
  chartsInitialized = true;
  new Chart(document.getElementById('bookingsChart'), {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Bookings',
        data: [820, 932, 745, 1024, 1320, 1580, 1284],
        borderColor: '#1e88e5',
        backgroundColor: 'rgba(30,136,229,0.08)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#1e88e5'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
  new Chart(document.getElementById('revenueChart'), {
    type: 'doughnut',
    data: {
      labels: ['Taj Mahal', 'Gateway', 'Red Fort', 'Museum', 'Others'],
      datasets: [{
        data: [35, 22, 18, 12, 13],
        backgroundColor: ['#1e88e5', '#ff9800', '#f44336', '#9c27b0', '#4caf50'],
        borderWidth: 2, borderColor: '#fff'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function initReportCharts() {
  if (reportChartsInitialized) return;
  reportChartsInitialized = true;
  new Chart(document.getElementById('monthlyChart'), {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [{
        label: 'Bookings',
        data: [12500, 15200, 18700, 22100, 28500],
        backgroundColor: 'rgba(30,136,229,0.8)',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
  new Chart(document.getElementById('categoryChart'), {
    type: 'pie',
    data: {
      labels: ['Adult', 'Child', 'Senior', 'Student'],
      datasets: [{
        data: [58, 22, 12, 8],
        backgroundColor: ['#1e88e5', '#ff9800', '#9c27b0', '#4caf50'],
        borderWidth: 2, borderColor: '#fff'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// Utilities
function formatMoney(val) {
  val = parseFloat(val) || 0;
  if (val >= 10000000) return (val / 10000000).toFixed(2) + ' Cr';
  if (val >= 100000)   return (val / 100000).toFixed(2) + ' L';
  if (val >= 1000)     return (val / 1000).toFixed(1) + 'K';
  return val.toFixed(0);
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function escHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  var user = api.getUser();
  if (user) {
    var name    = user.name  || 'Admin';
    var role    = user.role  || 'administrator';
    var initial = name.charAt(0).toUpperCase();
    var navName = document.getElementById('admin-name');
    if (navName) navName.textContent = 'Welcome, ' + name;
    var sidebarName = document.getElementById('sidebar-admin-name');
    if (sidebarName) sidebarName.textContent = name;
    var sidebarRole = document.getElementById('sidebar-admin-role');
    if (sidebarRole) sidebarRole.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    var avatar = document.getElementById('sidebar-avatar');
    if (avatar) avatar.textContent = initial;
  }

  document.querySelectorAll('.sidebar-menu li').forEach(function(li) {
    li.addEventListener('click', function() { switchSection(li.dataset.section); });
  });

  var searchBox = document.getElementById('bookings-search');
  if (searchBox) searchBox.addEventListener('input', filterBookings);

  var qrModal = document.getElementById('qrModal');
  if (qrModal) qrModal.addEventListener('click', function(e) { if (e.target === qrModal) closeQRModal(); });

  loadDashboard();
});
