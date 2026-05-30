// Tourist Booking Flow Logic

// State
let currentDestination = null;
let counts = { adult: 2, child: 1, senior: 0 };
let prices = { adult: 50, child: 25, senior: 30 };
let currentPaymentMethod = 'UPI';
let currentBooking = null;

// Default destination ID for demo (Taj Mahal)
const DEMO_DEST_ID = 3;

// ===== Step Navigation =====
function goToStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + step).classList.add('active');

  if (step === 'destination' && !currentDestination) {
    loadDestination(DEMO_DEST_ID);
  }
}

// ===== QR Scan simulation =====
function simulateScan() {
  setTimeout(() => goToStep('destination'), 800);
}

// ===== Destination Load =====
async function loadDestination(id) {
  try {
    const result = await api.destinations.get(id);
    currentDestination = result.destination;
    prices = {
      adult: parseFloat(currentDestination.adult_price),
      child: parseFloat(currentDestination.child_price),
      senior: parseFloat(currentDestination.senior_price)
    };

    document.getElementById('dest-name').textContent = currentDestination.name;
    document.getElementById('dest-description').textContent = currentDestination.description;
    document.getElementById('dest-rating').textContent = currentDestination.rating + ' / 5';
    document.getElementById('dest-price').textContent = 'Rs. ' + currentDestination.adult_price;

    if (currentDestination.opening_time && currentDestination.closing_time) {
      document.getElementById('dest-hours').textContent =
        currentDestination.opening_time.substring(0, 5) + ' - ' + currentDestination.closing_time.substring(0, 5);
    }

    // Show destination initials in the image placeholder
    const initials = currentDestination.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
    document.getElementById('dest-image').textContent = initials;

    updateTotal();
  } catch (err) {
    console.warn('Backend unavailable, using demo data:', err.message);
    // Use demo data when backend is offline
    currentDestination = {
      id: 1,
      name: 'Taj Mahal',
      description: 'A UNESCO World Heritage Site and one of the Seven Wonders of the World.',
      adult_price: 50,
      child_price: 25,
      senior_price: 30
    };
  }
}

// ===== Visitor count controls =====
function updateCount(type, delta) {
  counts[type] = Math.max(0, counts[type] + delta);
  document.getElementById(type + '-count').textContent = counts[type];
  updateTotal();
}

function updateTotal() {
  const subtotal =
    counts.adult * prices.adult +
    counts.child * prices.child +
    counts.senior * prices.senior;
  const total = subtotal + 5;
  document.getElementById('subtotal').textContent = 'Rs. ' + subtotal.toFixed(0);
  document.getElementById('total').textContent = 'Rs. ' + total.toFixed(0);
  document.getElementById('pay-amount').textContent = 'Rs. ' + total.toFixed(0);
}

// ===== Payment method selection =====
function selectPayment(el) {
  document.querySelectorAll('.payment-method').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  currentPaymentMethod = el.dataset.method;
}

// ===== Process Payment =====
async function processPayment() {
  const totalVisitors = counts.adult + counts.child + counts.senior;
  if (totalVisitors < 1) {
    alert('Please select at least one visitor');
    return;
  }

  const visitDate = document.getElementById('visit-date').value;
  const timeSlot = document.getElementById('time-slot').value;

  try {
    // Step 1: Create booking
    const bookingData = {
      destination_id: currentDestination ? currentDestination.id : DEMO_DEST_ID,
      adult_count: counts.adult,
      child_count: counts.child,
      senior_count: counts.senior,
      visit_date: visitDate,
      time_slot: timeSlot
    };

    const bookingResult = await api.bookings.create(bookingData);
    currentBooking = bookingResult.booking;

    // Step 2: Process payment
    await api.payments.process({
      booking_id: currentBooking.booking_id,
      payment_method: currentPaymentMethod,
      payment_gateway: 'TestGateway'
    });

    // Show ticket
    showTicket(currentBooking, bookingResult.qr_image);
  } catch (err) {
    console.warn('Backend unavailable, using demo mode:', err.message);
    // Demo mode - generate offline ticket
    showDemoTicket(visitDate, timeSlot);
  }
}

// ===== Show ticket =====
function showTicket(booking, qrImage) {
  goToStep('ticket');
  document.getElementById('ticket-id').textContent = booking.booking_id;
  document.getElementById('ticket-dest').textContent = currentDestination ? currentDestination.name : 'Taj Mahal';
  document.getElementById('ticket-date').textContent = formatDate(booking.visit_date);
  document.getElementById('ticket-slot').textContent = booking.time_slot;
  document.getElementById('ticket-visitors').textContent = booking.total_visitors;
  document.getElementById('ticket-paid').textContent = 'Rs. ' + booking.total_amount;

  const qrDiv = document.getElementById('ticket-qr');
  qrDiv.innerHTML = '';
  if (qrImage) {
    const img = document.createElement('img');
    img.src = qrImage;
    img.style.width = '140px';
    qrDiv.appendChild(img);
  } else {
    new QRCode(qrDiv, {
      text: booking.qr_ticket_data || booking.booking_id,
      width: 140, height: 140,
      colorDark: '#1565c0', colorLight: '#ffffff'
    });
  }
}

function showDemoTicket(visitDate, timeSlot) {
  goToStep('ticket');
  const totalVisitors = counts.adult + counts.child + counts.senior;
  const total = counts.adult * prices.adult + counts.child * prices.child + counts.senior * prices.senior + 5;
  const ticketId = 'QV-TAJ-' + Date.now().toString(36).toUpperCase().slice(-6);

  document.getElementById('ticket-id').textContent = ticketId;
  document.getElementById('ticket-dest').textContent = 'Taj Mahal';
  document.getElementById('ticket-date').textContent = formatDate(visitDate);
  document.getElementById('ticket-slot').textContent = timeSlot;
  document.getElementById('ticket-visitors').textContent = totalVisitors;
  document.getElementById('ticket-paid').textContent = 'Rs. ' + total;

  const qrDiv = document.getElementById('ticket-qr');
  qrDiv.innerHTML = '';
  new QRCode(qrDiv, {
    text: 'QUICKVISIT|' + ticketId + '|TAJ|' + totalVisitors + '|VALID',
    width: 140, height: 140,
    colorDark: '#1565c0', colorLight: '#ffffff'
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function downloadTicket() {
  alert('Ticket downloaded (demo). In production, this would save a PDF.');
}

function resetTourist() {
  counts = { adult: 2, child: 1, senior: 0 };
  document.getElementById('adult-count').textContent = 2;
  document.getElementById('child-count').textContent = 1;
  document.getElementById('senior-count').textContent = 0;
  updateTotal();
  goToStep('scan');
}

// Set default date to tomorrow
document.addEventListener('DOMContentLoaded', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('visit-date').value = tomorrow.toISOString().split('T')[0];
  updateTotal();
});
