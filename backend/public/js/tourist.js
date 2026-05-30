// Tourist Booking Flow Logic

// State
var currentDestination = null;
var counts = { adult: 2, child: 1, senior: 0 };
var prices = { adult: 50, child: 25, senior: 30 };
var currentPaymentMethod = 'UPI';
var currentBooking = null;
var DEMO_DEST_ID = 1;

// Step Navigation
function goToStep(step) {
  document.querySelectorAll('.step').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('step-' + step).classList.add('active');
  if (step === 'destination' && !currentDestination) {
    loadDestination(DEMO_DEST_ID);
  }
}

// QR Scan simulation
function simulateScan() {
  var scanner = document.querySelector('.qr-scanner');
  if (scanner) scanner.style.opacity = '0.5';
  setTimeout(function() {
    if (scanner) scanner.style.opacity = '1';
    goToStep('destination');
  }, 800);
}

// Destination Load
async function loadDestination(id) {
  document.getElementById('dest-name').textContent = 'Loading...';
  document.getElementById('dest-description').textContent = 'Fetching destination details...';
  try {
    var result = await api.destinations.get(id);
    currentDestination = result.destination;
    applyDestinationToUI(currentDestination);
  } catch (err) {
    console.warn('Backend unavailable, using demo data:', err.message);
    currentDestination = getDemoDestination();
    applyDestinationToUI(currentDestination);
  }
}

function getDemoDestination() {
  return {
    id: 1,
    name: 'Taj Mahal',
    description: 'A UNESCO World Heritage Site and one of the Seven Wonders of the World, located in Agra, India.',
    adult_price: 50,
    child_price: 25,
    senior_price: 30,
    opening_time: '06:00:00',
    closing_time: '18:30:00',
    rating: 4.8
  };
}

function applyDestinationToUI(dest) {
  prices = {
    adult:  parseFloat(dest.adult_price)  || 50,
    child:  parseFloat(dest.child_price)  || 25,
    senior: parseFloat(dest.senior_price) || 30
  };

  document.getElementById('dest-name').textContent        = dest.name;
  document.getElementById('dest-description').textContent = dest.description || 'A wonderful tourist destination.';
  document.getElementById('dest-rating').textContent      = (dest.rating || '4.5') + ' / 5';
  document.getElementById('dest-price').textContent       = 'Rs. ' + dest.adult_price;

  var hours = document.getElementById('dest-hours');
  if (hours) {
    if (dest.opening_time && dest.closing_time) {
      hours.textContent = dest.opening_time.substring(0, 5) + ' - ' + dest.closing_time.substring(0, 5);
    } else {
      hours.textContent = '9:00 - 18:00';
    }
  }

  var cap = document.getElementById('dest-capacity');
  if (cap) cap.textContent = 'Moderate (available)';

  var initials = dest.name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 3).toUpperCase();
  document.getElementById('dest-image').textContent = initials;

  updatePriceLabels();
  updateTotal();
}

// Price Labels
function updatePriceLabels() {
  var al = document.getElementById('adult-price-label');
  var cl = document.getElementById('child-price-label');
  var sl = document.getElementById('senior-price-label');
  if (al) al.textContent = 'Rs. ' + prices.adult  + ' per person';
  if (cl) cl.textContent = 'Rs. ' + prices.child  + ' per person';
  if (sl) sl.textContent = 'Rs. ' + prices.senior + ' per person';
}

// Visitor Counter
function updateCount(type, delta) {
  counts[type] = Math.max(0, counts[type] + delta);
  document.getElementById(type + '-count').textContent = counts[type];
  updateTotal();
}

function updateTotal() {
  var subtotal = counts.adult * prices.adult + counts.child * prices.child + counts.senior * prices.senior;
  var total = subtotal + 5;
  var sub = document.getElementById('subtotal');
  var tot = document.getElementById('total');
  var pay = document.getElementById('pay-amount');
  if (sub) sub.textContent = 'Rs. ' + subtotal.toFixed(0);
  if (tot) tot.textContent = 'Rs. ' + total.toFixed(0);
  if (pay) pay.textContent = 'Rs. ' + total.toFixed(0);
}

// Payment Method
function selectPayment(el) {
  document.querySelectorAll('.payment-method').forEach(function(p) { p.classList.remove('selected'); });
  el.classList.add('selected');
  currentPaymentMethod = el.dataset.method;
}

// Process Payment
async function processPayment() {
  var totalVisitors = counts.adult + counts.child + counts.senior;
  if (totalVisitors < 1) { alert('Please select at least one visitor.'); return; }

  var visitDate = document.getElementById('visit-date').value;
  if (!visitDate) { alert('Please select a visit date.'); return; }

  var timeSlot = document.getElementById('time-slot').value;
  var payBtn   = document.querySelector('#step-payment .btn-primary');
  var origText = payBtn ? payBtn.textContent : '';
  if (payBtn) { payBtn.disabled = true; payBtn.textContent = 'Processing...'; }

  try {
    var bookingData = {
      destination_id: currentDestination ? currentDestination.id : DEMO_DEST_ID,
      adult_count:    counts.adult,
      child_count:    counts.child,
      senior_count:   counts.senior,
      visit_date:     visitDate,
      time_slot:      timeSlot
    };
    var bookingResult = await api.bookings.create(bookingData);
    currentBooking = bookingResult.booking;
    await api.payments.process({
      booking_id:      currentBooking.booking_id,
      payment_method:  currentPaymentMethod,
      payment_gateway: 'TestGateway'
    });
    showTicket(currentBooking, bookingResult.qr_image);
  } catch (err) {
    console.warn('Backend unavailable, using demo mode:', err.message);
    showDemoTicket(visitDate, timeSlot);
  } finally {
    if (payBtn) { payBtn.disabled = false; payBtn.textContent = origText; }
  }
}

// Show Ticket (live backend)
function showTicket(booking, qrImage) {
  goToStep('ticket');
  var destName = currentDestination ? currentDestination.name : 'Tourist Destination';
  document.getElementById('ticket-id').textContent       = booking.booking_id;
  document.getElementById('ticket-dest').textContent     = destName;
  document.getElementById('ticket-date').textContent     = formatDate(booking.visit_date);
  document.getElementById('ticket-slot').textContent     = booking.time_slot;
  document.getElementById('ticket-visitors').textContent = booking.total_visitors;
  document.getElementById('ticket-paid').textContent     = 'Rs. ' + booking.total_amount;
  renderTicketQR(qrImage || null, booking.qr_ticket_data || booking.booking_id);
}

// Show Ticket (demo / offline)
function showDemoTicket(visitDate, timeSlot) {
  goToStep('ticket');
  var destName      = currentDestination ? currentDestination.name : 'Taj Mahal';
  var shortCode     = destName.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().substring(0, 3);
  var totalVisitors = counts.adult + counts.child + counts.senior;
  var total         = counts.adult * prices.adult + counts.child * prices.child + counts.senior * prices.senior + 5;
  var ticketId      = 'QV-' + shortCode + '-' + Date.now().toString(36).toUpperCase().slice(-6);

  document.getElementById('ticket-id').textContent       = ticketId;
  document.getElementById('ticket-dest').textContent     = destName;
  document.getElementById('ticket-date').textContent     = formatDate(visitDate);
  document.getElementById('ticket-slot').textContent     = timeSlot;
  document.getElementById('ticket-visitors').textContent = totalVisitors;
  document.getElementById('ticket-paid').textContent     = 'Rs. ' + total;
  renderTicketQR(null, 'QUICKVISIT|' + ticketId + '|' + shortCode + '|' + totalVisitors + '|VALID');
}

function renderTicketQR(imageUrl, qrText) {
  var qrDiv = document.getElementById('ticket-qr');
  qrDiv.innerHTML = '';
  if (imageUrl) {
    var img = document.createElement('img');
    img.src = imageUrl;
    img.style.width = '140px';
    qrDiv.appendChild(img);
  } else {
    new QRCode(qrDiv, { text: qrText, width: 140, height: 140, colorDark: '#1565c0', colorLight: '#ffffff' });
  }
}

// Utilities
function formatDate(dateStr) {
  if (!dateStr) return '--';
  var d = new Date(dateStr.indexOf('T') >= 0 ? dateStr : dateStr + 'T00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function downloadTicket() {
  var ticketId = document.getElementById('ticket-id').textContent;
  alert('Downloading ticket ' + ticketId + ' (demo mode - PDF generation available in production).');
}

function resetTourist() {
  currentDestination = null;
  currentBooking     = null;
  counts  = { adult: 2, child: 1, senior: 0 };
  prices  = { adult: 50, child: 25, senior: 30 };
  document.getElementById('adult-count').textContent  = 2;
  document.getElementById('child-count').textContent  = 1;
  document.getElementById('senior-count').textContent = 0;
  updatePriceLabels();
  updateTotal();
  goToStep('scan');
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var dateInput = document.getElementById('visit-date');
  if (dateInput) {
    dateInput.value = tomorrow.toISOString().split('T')[0];
    dateInput.min   = tomorrow.toISOString().split('T')[0];
  }
  updatePriceLabels();
  updateTotal();
});
