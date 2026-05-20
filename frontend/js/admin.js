// Admin Dashboard Logic

// Demo data (used when backend is unavailable)
const DEMO_DATA = {
  stats: { bookings_today: 1284, revenue_today: 184000, active_destinations: 24, registered_users: 8547 },
  recentBookings: [
    { booking_id: 'QV-TAJ-A8K2P9', user_name: 'Mubasheera U B', destination_name: 'Taj Mahal', total_visitors: 3, total_amount: 130, status: 'confirmed', created_at: '2026-05-18' },
    { booking_id: 'QV-GAT-B5M3Q1', user_name: 'Rahul Sharma', destination_name: 'Gateway of India', total_visitors: 5, total_amount: 250, status: 'confirmed', created_at: '2026-05-18' },
    { booking_id: 'QV-RFT-C2N7R4', user_name: 'Priya Menon', destination_name: 'Red Fort', total_visitors: 2, total_amount: 100, status: 'pending', created_at: '2026-05-18' },
    { booking_id: 'QV-MUS-D9L4S6', user_name: 'Ahmed Khan', destination_name: 'National Museum', total_visitors: 4, total_amount: 200, status: 'confirmed', created_at: '2026-05-18' },
    { booking_id: 'QV-BCH-E1P8T2', user_name: 'Sarah Joseph', destination_name: 'Kovalam Beach', total_visitors: 6, total_amount: 180, status: 'cancelled', created_at: '2026-05-17' }
  ],
  destinations: [
    { id: 1, name: 'Taj Mahal', location: 'Agra, UP', adult_price: 50, bookings: 4832 },
    { id: 2, name: 'Gateway of India', location: 'Mumbai, MH', adult_price: 50, bookings: 3217 },
    { id: 3, name: 'Red Fort', location: 'Delhi', adult_price: 50, bookings: 2945 },
    { id: 4, name: 'National Museum', location: 'New Delhi', adult_price: 50, bookings: 1823 },
    { id: 5, name: 'Kovalam Beach', location: 'Trivandrum, KL', adult_price: 30, bookings: 2156 },
    { id: 6, name: 'Padmanabhaswamy Temple', location: 'Trivandrum, KL', adult_price: 40, bookings: 1567 }
  ],
  users: [
    { id: 1, name: 'Mubasheera U B', email: 'mubasheera2002@gmail.com', phone: '+91 7025014923', total_bookings: 12, created_at: '2026-01-15', status: 'active' },
    { id: 2, name: 'Rahul Sharma', email: 'rahul.sh@gmail.com', phone: '+91 9876543210', total_bookings: 8, created_at: '2026-02-20', status: 'active' },
    { id: 3, name: 'Priya Menon', email: 'priya.m@gmail.com', phone: '+91 9988776655', total_bookings: 5, created_at: '2026-03-05', status: 'active' },
    { id: 4, name: 'Ahmed Khan', email: 'ahmed.k@gmail.com', phone: '+91 9812345678', total_bookings: 15, created_at: '2026-01-10', status: 'active' },
    { id: 5, name: 'Sarah Joseph', email: 'sarah.j@gmail.com', phone: '+91 8877665544', total_bookings: 3, created_at: '2026-04-12', status: 'inactive' }
  ],
  payments: [
    { transaction_id: 'TXN-89234561', booking_ref: 'QV-TAJ-A8K2P9', payment_method: 'UPI (PhonePe)', amount: 130, status: 'success', created_at: '2026-05-18 10:23' },
    { transaction_id: 'TXN-89234562', booking_ref: 'QV-GAT-B5M3Q1', payment_method: 'Card (Visa)', amount: 250, status: 'success', created_at: '2026-05-18 10:15' },
    { transaction_id: 'TXN-89234563', booking_ref: 'QV-RFT-C2N7R4', payment_method: 'UPI (GPay)', amount: 100, status: 'pending', created_at: '2026-05-18 09:58' },
    { transaction_id: 'TXN-89234564', booking_ref: 'QV-MUS-D9L4S6', payment_method: 'Wallet (Paytm)', amount: 200, status: 'success', created_at: '2026-05-18 09:42' },
    { transaction_id: 'TXN-89234565', booking_ref: 'QV-BCH-E1P8T2', payment_method: 'UPI (BHIM)', amount: 180, status: 'refunded', created_at: '2026-05-17 16:30' }
  ],
  feedback: [
    { user_name: 'Rahul Sharma', destination_name: 'Gateway of India', rating: 5, comments: 'Excellent service! The QR scan booking saved us almost 45 minutes of waiting.', created_at: '2026-05-18' },
    { user_name: 'Priya Menon', destination_name: 'Red Fort', rating: 4, comments: 'Very smooth booking experience. The digital ticket worked perfectly at the gate.', created_at: '2026-05-17' },
    { user_name: 'Ahmed Khan', destination_name: 'National Museum', rating: 5, comments: 'No more queues! This is exactly what tourist places needed.', created_at: '2026-05-17' }
  ]
};

let chartsInitialized = false;
let reportChartsInitialized = false;
let useDemoData = false;

// ===== Section switching =====
function switchSection(section) {
  document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
  document.querySelector(`[data-section="${section}"]`).classList.add('active');
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.getElementById('section-' + section).classList.add('active');

  // Load data for specific sections
  if (section === 'reports') initReportCharts();
  if (section === 'destinations') loadDestinations();
  if (section === 'bookings') loadBookings();
  if (section === 'users') loadUsers();
  if (section === 'payments') loadPayments();
  if (section === 'feedback') loadFeedback();
  if (section === 'qrcodes') populateQRDestinations();
}

// ===== Dashboard =====
async function loadDashboard() {
  try {
    const stats = await api.admin.stats();
    document.getElementById('stat-bookings').textContent = stats.bookings_today.toLocaleString();
    document.getElementById('stat-revenue').textContent = 'Rs. ' + formatMoney(stats.revenue_today);
    document.getElementById('stat-destinations').textContent = stats.active_destinations;
    document.getElementById('stat-users').textContent = stats.registered_users.toLocaleString();
  } catch (err) {
    console.warn('Using demo stats');
    useDemoData = true;
    const s = DEMO_DATA.stats;
    document.getElementById('stat-bookings').textContent = s.bookings_today.toLocaleString();
    document.getElementById('stat-revenue').textContent = 'Rs. ' + formatMoney(s.revenue_today);
    document.getElementById('stat-destinations').textContent = s.active_destinations;
    document.getElementById('stat-users').textContent = s.registered_users.toLocaleString();
  }

  loadRecentBookings();
  initCharts();
}

async function loadRecentBookings() {
  const tbody = document.getElementById('recent-bookings-body');
  try {
    const result = await api.admin.bookings('?limit=5');
    renderBookingsTable(tbody, result.bookings, false);
  } catch (err) {
    renderBookingsTable(tbody, DEMO_DATA.recentBookings, false);
  }
}

function renderBookingsTable(tbody, bookings, withActions = true) {
  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td><strong>${b.booking_id}</strong></td>
      <td>${b.user_name || 'Guest'}</td>
      <td>${b.destination_name}</td>
      <td>${b.total_visitors}</td>
      <td>Rs. ${b.total_amount}</td>
      ${withActions ? `<td>${b.payment_method || '--'}</td>` : ''}
      <td><span class="badge badge-${b.status}">${b.status}</span></td>
      ${withActions ? `<td><button class="action-btn btn-view">View</button></td>` : `<td>${formatDate(b.created_at)}</td>`}
    </tr>
  `).join('');
}

function formatMoney(val) {
  if (val >= 100000) return (val / 100000).toFixed(2) + 'L';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
  return val.toFixed(0);
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ===== Destinations =====
async function loadDestinations() {
  const grid = document.getElementById('dest-grid');
  let destinations;

  try {
    const result = await api.destinations.list();
    destinations = result.destinations;
  } catch {
    destinations = DEMO_DATA.destinations;
  }

  grid.innerHTML = destinations.map(d => {
    const initials = d.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
    return `
      <div class="dest-card">
        <div class="dest-img">${initials}</div>
        <div class="dest-info">
          <h4>${d.name} <span class="badge badge-active">Active</span></h4>
          <p>${d.location}</p>
          <div class="dest-stats">
            <span><strong>${d.bookings || '--'}</strong> bookings</span>
            <span style="color: #4caf50;"><strong>Rs. ${d.adult_price}</strong>/ticket</span>
          </div>
          <div style="margin-top: 12px;">
            <button class="action-btn btn-view" onclick="showQRModal('${d.name}', ${d.id})">View QR</button>
            <button class="action-btn btn-edit">Edit</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ===== Bookings =====
async function loadBookings() {
  const tbody = document.getElementById('bookings-body');
  try {
    const result = await api.admin.bookings();
    renderBookingsTable(tbody, result.bookings, true);
  } catch {
    renderBookingsTable(tbody, DEMO_DATA.recentBookings, true);
  }
}

// ===== Users =====
async function loadUsers() {
  const tbody = document.getElementById('users-body');
  let users;
  try {
    const result = await api.admin.users();
    users = result.users;
  } catch {
    users = DEMO_DATA.users;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>U-${String(u.id).padStart(5, '0')}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.phone || '--'}</td>
      <td>${u.total_bookings || 0}</td>
      <td>${formatDate(u.created_at)}</td>
      <td><span class="badge badge-${u.status === 'active' ? 'success' : 'pending'}">${u.status}</span></td>
    </tr>
  `).join('');
}

// ===== Payments =====
async function loadPayments() {
  const tbody = document.getElementById('payments-body');
  let payments;
  try {
    const result = await api.admin.payments();
    payments = result.payments;
  } catch {
    payments = DEMO_DATA.payments;
  }

  tbody.innerHTML = payments.map(p => `
    <tr>
      <td>${p.transaction_id}</td>
      <td>${p.booking_ref || '--'}</td>
      <td>${p.payment_method}</td>
      <td>Rs. ${p.amount}</td>
      <td><span class="badge badge-${p.status === 'success' ? 'success' : (p.status === 'refunded' ? 'cancelled' : 'pending')}">${p.status}</span></td>
      <td>${p.created_at}</td>
    </tr>
  `).join('');
}

// ===== Feedback =====
async function loadFeedback() {
  const container = document.getElementById('feedback-list');
  let feedback;
  try {
    const result = await api.admin.feedback();
    feedback = result.feedback;
  } catch {
    feedback = DEMO_DATA.feedback;
  }

  container.innerHTML = '<h3 style="margin-bottom: 15px;">Recent Feedback</h3>' +
    feedback.map(f => `
      <div style="border-bottom: 1px solid #f0f0f0; padding: 15px 0;">
        <div style="display: flex; justify-content: space-between;">
          <strong>${f.user_name || 'Anonymous'}</strong>
          <span style="color: #ff9800; font-weight: bold;">[${'*'.repeat(f.rating)}${'-'.repeat(5 - f.rating)}]</span>
        </div>
        <small style="color: #999;">${f.destination_name} | ${formatDate(f.created_at)}</small>
        <p style="margin-top: 8px;">${f.comments}</p>
      </div>
    `).join('');
}

// ===== QR Codes =====
function populateQRDestinations() {
  const select = document.getElementById('qr-dest');
  if (select.children.length > 0) return;
  DEMO_DATA.destinations.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.name;
    select.appendChild(opt);
  });
}

function generateAdminQR() {
  const select = document.getElementById('qr-dest');
  const dest = select.options[select.selectedIndex].text;
  document.getElementById('qr-print-area').style.display = 'block';
  document.getElementById('qr-dest-name').textContent = dest;

  const qrDiv = document.getElementById('generated-qr');
  qrDiv.innerHTML = '';
  qrDiv.style.display = 'flex';
  qrDiv.style.justifyContent = 'center';
  new QRCode(qrDiv, {
    text: 'https://quickvisit.app/book/' + dest.replace(/\s/g, '-').toLowerCase(),
    width: 180, height: 180,
    colorDark: '#1565c0', colorLight: '#ffffff'
  });
}

function showQRModal(destName, destId) {
  document.getElementById('qrModalTitle').textContent = 'QR Code - ' + destName;
  document.getElementById('modalDestName').textContent = destName;
  const qrDiv = document.getElementById('modalQR');
  qrDiv.innerHTML = '';
  new QRCode(qrDiv, {
    text: 'https://quickvisit.app/book/' + destName.replace(/\s/g, '-').toLowerCase(),
    width: 200, height: 200,
    colorDark: '#1565c0', colorLight: '#ffffff'
  });
  document.getElementById('qrModal').classList.add('show');
}

function closeQRModal() {
  document.getElementById('qrModal').classList.remove('show');
}

// ===== Charts =====
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
        backgroundColor: 'rgba(30, 136, 229, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });

  new Chart(document.getElementById('revenueChart'), {
    type: 'doughnut',
    data: {
      labels: ['Taj Mahal', 'Gateway', 'Red Fort', 'Museum', 'Others'],
      datasets: [{
        data: [35, 22, 18, 12, 13],
        backgroundColor: ['#1e88e5', '#ff9800', '#f44336', '#9c27b0', '#4caf50']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
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
        backgroundColor: '#1e88e5'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  new Chart(document.getElementById('categoryChart'), {
    type: 'pie',
    data: {
      labels: ['Adult', 'Child', 'Senior', 'Student'],
      datasets: [{
        data: [58, 22, 12, 8],
        backgroundColor: ['#1e88e5', '#ff9800', '#9c27b0', '#4caf50']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  // Show name from logged-in user if available
  const user = api.getUser();
  if (user) {
    document.getElementById('admin-name').textContent = 'Welcome, ' + user.name;
  }

  // Sidebar click handlers
  document.querySelectorAll('.sidebar-menu li').forEach(li => {
    li.addEventListener('click', () => switchSection(li.dataset.section));
  });

  // Initial load
  loadDashboard();
});
